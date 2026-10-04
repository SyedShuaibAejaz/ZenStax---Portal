-- Tax credit notes
-- A credit note reverses all or part of an issued invoice. It is the only
-- way to cancel an issued invoice. Credit notes are permanent: no edits,
-- no deletes. Numbering: ZEN-CN-0001, 0002, ...
-- Run AFTER lock_issued_invoices.

-- 1. Credit note header: add what the existing table is missing
alter table public.credit_notes
  add column if not exists workspace_id uuid references public.workspaces(id) on delete cascade,
  add column if not exists currency text not null default 'AED',
  add column if not exists discount numeric not null default 0,
  add column if not exists custom_columns jsonb not null default '[]'::jsonb;

alter table public.credit_notes alter column status set default 'issued';

create index if not exists credit_notes_invoice_id_idx on public.credit_notes (invoice_id);
create index if not exists credit_notes_workspace_id_idx on public.credit_notes (workspace_id);

-- 2. Credit note lines, each tied to the invoice line it reverses
create table if not exists public.credit_note_items (
  id uuid primary key default gen_random_uuid(),
  credit_note_id uuid not null references public.credit_notes(id) on delete cascade,
  invoice_item_id uuid not null references public.invoice_items(id) on delete restrict,
  description text not null,
  quantity numeric not null check (quantity > 0),
  unit_price numeric not null,
  vat_rate numeric not null default 0,
  line_total numeric not null,
  custom_values jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists credit_note_items_credit_note_id_idx on public.credit_note_items (credit_note_id);
create index if not exists credit_note_items_invoice_item_id_idx on public.credit_note_items (invoice_item_id);

alter table public.credit_note_items enable row level security;

-- 3. Running credited total on the invoice
alter table public.invoices
  add column if not exists credited_amount numeric not null default 0;

-- 4. Numbering (extends the helper from sequential_document_numbers)
create or replace function public.max_document_number(p_table text, p_prefix text)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_max integer;
begin
  if p_table = 'quotations' then
    select max(substring(quotation_number from '^' || p_prefix || '(\d+)$')::integer)
      into v_max from public.quotations;
  elsif p_table = 'invoices' then
    select max(substring(invoice_number from '^' || p_prefix || '(\d+)$')::integer)
      into v_max from public.invoices;
  elsif p_table = 'credit_notes' then
    select max(substring(credit_note_number from '^' || p_prefix || '(\d+)$')::integer)
      into v_max from public.credit_notes;
  else
    raise exception 'Unknown table %', p_table;
  end if;

  return coalesce(v_max, 0);
end;
$$;

revoke all on function public.max_document_number(text, text) from public, anon, authenticated;

create or replace function public.assign_credit_note_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('zenstax_credit_note_number'));

  new.credit_note_number := 'ZEN-CN-' || lpad(
    (public.max_document_number('credit_notes', 'ZEN-CN-') + 1)::text, 4, '0');

  return new;
end;
$$;

revoke all on function public.assign_credit_note_number() from public, anon, authenticated;

drop trigger if exists credit_notes_assign_number on public.credit_notes;
create trigger credit_notes_assign_number
  before insert on public.credit_notes
  for each row execute function public.assign_credit_note_number();

-- 5. Credit notes are permanent
create or replace function public.protect_credit_notes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Credit notes are permanent and cannot be changed or deleted.'
    using errcode = 'P0001';
end;
$$;

drop trigger if exists credit_notes_protect on public.credit_notes;
create trigger credit_notes_protect
  before update or delete on public.credit_notes
  for each row execute function public.protect_credit_notes();

drop trigger if exists credit_note_items_protect on public.credit_note_items;
create trigger credit_note_items_protect
  before update or delete on public.credit_note_items
  for each row execute function public.protect_credit_notes();

-- 6. Issued invoices can only become "cancelled" through a full credit note
create or replace function public.protect_issued_invoice()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status <> 'draft' then
      raise exception 'Invoice % is issued and cannot be deleted. Issue a credit note instead.', old.invoice_number
        using errcode = 'P0001';
    end if;
    return old;
  end if;

  if old.status = 'cancelled' then
    if new.status is distinct from old.status
       or new.amount_paid is distinct from old.amount_paid
       or new.total is distinct from old.total
       or new.credited_amount is distinct from old.credited_amount then
      raise exception 'Invoice % is cancelled and cannot be changed.', old.invoice_number
        using errcode = 'P0001';
    end if;
    return new;
  end if;

  if old.status <> 'draft' then
    if new.status = 'draft' then
      raise exception 'An issued invoice cannot go back to draft.'
        using errcode = 'P0001';
    end if;

    if new.invoice_number is distinct from old.invoice_number
       or new.client_id is distinct from old.client_id
       or new.workspace_id is distinct from old.workspace_id
       or new.quotation_id is distinct from old.quotation_id
       or new.issue_date is distinct from old.issue_date
       or new.currency is distinct from old.currency
       or new.subtotal is distinct from old.subtotal
       or new.discount is distinct from old.discount
       or new.vat_amount is distinct from old.vat_amount
       or new.total is distinct from old.total
       or new.custom_columns is distinct from old.custom_columns then
      raise exception 'Invoice % is issued; its amounts and details are locked.', old.invoice_number
        using errcode = 'P0001';
    end if;

    if new.credited_amount < old.credited_amount then
      raise exception 'Credited amount cannot go down.'
        using errcode = 'P0001';
    end if;
  end if;

  if new.status = 'cancelled' and old.status <> 'cancelled' then
    if old.status <> 'draft' and new.credited_amount < new.total - 0.01 then
      raise exception 'Issued invoices are cancelled by issuing a full credit note.'
        using errcode = 'P0001';
    end if;

    if coalesce(new.amount_paid, 0) > 0 then
      raise exception 'Invoice % has payments recorded and cannot be cancelled.', old.invoice_number
        using errcode = 'P0001';
    end if;

    if coalesce(btrim(new.cancellation_reason), '') = '' then
      raise exception 'A cancellation reason is required.'
        using errcode = 'P0001';
    end if;

    new.cancelled_at := coalesce(new.cancelled_at, now());
    new.cancelled_by := coalesce(new.cancelled_by, (select auth.uid()));
  end if;

  return new;
end;
$$;

-- 7. Create a credit note in one transaction.
--    p_items: [{"invoice_item_id": "...", "quantity": 2}, ...]
--    p_items = null credits everything that has not been credited yet.
create or replace function public.create_credit_note(
  p_invoice_id uuid,
  p_reason text,
  p_items jsonb default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_invoice public.invoices%rowtype;
  v_credit_id uuid;
  v_number text;
  v_line record;
  v_lines jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
  v_discount numeric := 0;
  v_vat numeric := 0;
  v_total numeric;
  v_base numeric;
  v_line_discount numeric;
  v_left_after integer := 0;
  v_full boolean;
begin
  if coalesce(btrim(p_reason), '') = '' then
    raise exception 'A reason is required for a credit note.' using errcode = 'P0001';
  end if;

  select * into v_invoice from public.invoices where id = p_invoice_id for update;

  if not found then
    raise exception 'Invoice not found.' using errcode = 'P0001';
  end if;

  if not public.has_workspace_role(v_invoice.workspace_id, array['owner','admin','finance']) then
    raise exception 'You do not have permission to issue credit notes.' using errcode = '42501';
  end if;

  if v_invoice.status = 'draft' then
    raise exception 'Draft invoices can be edited or deleted; a credit note is not needed.' using errcode = 'P0001';
  end if;

  if v_invoice.status = 'cancelled' then
    raise exception 'This invoice is already cancelled.' using errcode = 'P0001';
  end if;

  -- Pass 1: validate and price every invoice line
  for v_line in
    with remaining as (
      select
        ii.*,
        ii.quantity - coalesce((
          select sum(cni.quantity) from public.credit_note_items cni
          where cni.invoice_item_id = ii.id
        ), 0) as remaining_qty
      from public.invoice_items ii
      where ii.invoice_id = v_invoice.id
    ),
    requested as (
      select
        (e->>'invoice_item_id')::uuid as invoice_item_id,
        (e->>'quantity')::numeric as quantity
      from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) e
    )
    select
      r.*,
      case
        when p_items is null then r.remaining_qty
        else coalesce(q.quantity, 0)
      end as credit_qty
    from remaining r
    left join requested q on q.invoice_item_id = r.id
  loop
    if v_line.credit_qty < 0 then
      raise exception 'Quantities cannot be negative.' using errcode = 'P0001';
    end if;

    if v_line.credit_qty > v_line.remaining_qty + 0.0001 then
      raise exception 'Line "%" can be credited for at most % more.', v_line.description, v_line.remaining_qty
        using errcode = 'P0001';
    end if;

    if v_line.remaining_qty - v_line.credit_qty > 0.0001 then
      v_left_after := v_left_after + 1;
    end if;

    continue when v_line.credit_qty <= 0;

    v_base := round(v_line.credit_qty * v_line.unit_price, 2);
    v_line_discount := case when coalesce(v_invoice.subtotal, 0) > 0
      then round(coalesce(v_invoice.discount, 0) * v_base / v_invoice.subtotal, 2)
      else 0 end;

    v_subtotal := v_subtotal + v_base;
    v_discount := v_discount + v_line_discount;
    v_vat := v_vat + round((v_base - v_line_discount) * coalesce(v_line.vat_rate, 0) / 100, 2);

    v_lines := v_lines || jsonb_build_object(
      'invoice_item_id', v_line.id,
      'description', v_line.description,
      'quantity', v_line.credit_qty,
      'unit_price', v_line.unit_price,
      'vat_rate', coalesce(v_line.vat_rate, 0),
      'line_total', v_base,
      'custom_values', coalesce(v_line.custom_values, '{}'::jsonb)
    );
  end loop;

  if jsonb_array_length(v_lines) = 0 then
    raise exception 'Select at least one line to credit.' using errcode = 'P0001';
  end if;

  v_full := v_left_after = 0;
  v_total := v_subtotal - v_discount + v_vat;

  -- A full credit settles rounding against what is left on the invoice
  if v_full then
    v_total := v_invoice.total - v_invoice.credited_amount;
    v_vat := v_total - (v_subtotal - v_discount);
  end if;

  if v_invoice.credited_amount + v_total > v_invoice.total + 0.01 then
    raise exception 'Credit notes cannot exceed the invoice total.' using errcode = 'P0001';
  end if;

  -- Pass 2: write the credit note and its lines
  insert into public.credit_notes (
    credit_note_number, workspace_id, invoice_id, client_id, issue_date,
    reason, currency, custom_columns, status, created_by,
    subtotal, discount, vat_amount, total
  ) values (
    'pending', v_invoice.workspace_id, v_invoice.id, v_invoice.client_id, current_date,
    btrim(p_reason), v_invoice.currency, coalesce(v_invoice.custom_columns, '[]'::jsonb),
    'issued', (select auth.uid()),
    v_subtotal, v_discount, v_vat, v_total
  )
  returning id, credit_note_number into v_credit_id, v_number;

  insert into public.credit_note_items (
    credit_note_id, invoice_item_id, description, quantity,
    unit_price, vat_rate, line_total, custom_values
  )
  select
    v_credit_id,
    (l->>'invoice_item_id')::uuid,
    l->>'description',
    (l->>'quantity')::numeric,
    (l->>'unit_price')::numeric,
    (l->>'vat_rate')::numeric,
    (l->>'line_total')::numeric,
    l->'custom_values'
  from jsonb_array_elements(v_lines) l;

  update public.invoices
     set credited_amount = credited_amount + v_total,
         status = case
           when v_full and coalesce(amount_paid, 0) = 0 then 'cancelled'
           else status end,
         cancellation_reason = case
           when v_full and coalesce(amount_paid, 0) = 0
             then 'Credited in full by ' || v_number || ': ' || btrim(p_reason)
           else cancellation_reason end
   where id = v_invoice.id;

  return v_credit_id;
end;
$$;

revoke all on function public.create_credit_note(uuid, text, jsonb) from public, anon;
grant execute on function public.create_credit_note(uuid, text, jsonb) to authenticated;

-- 8. Access: everyone in the workspace can read; writes only via create_credit_note
do $$
declare r record;
begin
  for r in select policyname, tablename from pg_policies
           where schemaname = 'public' and tablename in ('credit_notes', 'credit_note_items')
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end;
$$;

create policy "credit_notes_select" on public.credit_notes for select to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin','finance','member','viewer']));

create policy "credit_note_items_select" on public.credit_note_items for select to authenticated
  using (exists (
    select 1 from public.credit_notes cn
    where cn.id = credit_note_id
      and public.has_workspace_role(cn.workspace_id, array['owner','admin','finance','member','viewer'])
  ));

notify pgrst, 'reload schema';
