-- Issued invoices are permanent records.
--   draft      : can be edited and deleted
--   sent+      : cannot be deleted, cannot go back to draft, amounts locked
--   cancelled  : final; keeps its number so the sequence has no gaps
-- Run AFTER sequential_document_numbers.

-- 1. Cancellation details
alter table public.invoices
  add column if not exists cancelled_at timestamptz,
  add column if not exists cancelled_by uuid references public.profiles(id),
  add column if not exists cancellation_reason text;

-- 2. Rules on the invoice row
create or replace function public.protect_issued_invoice()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    if old.status <> 'draft' then
      raise exception 'Invoice % is issued and cannot be deleted. Cancel it instead.', old.invoice_number
        using errcode = 'P0001';
    end if;
    return old;
  end if;

  -- UPDATE
  if old.status = 'cancelled' then
    if new.status is distinct from old.status
       or new.amount_paid is distinct from old.amount_paid
       or new.total is distinct from old.total then
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
  end if;

  if new.status = 'cancelled' then
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

drop trigger if exists invoices_protect_issued on public.invoices;
create trigger invoices_protect_issued
  before update or delete on public.invoices
  for each row execute function public.protect_issued_invoice();

-- 3. Line items of an issued invoice are locked too
create or replace function public.protect_issued_invoice_items()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_status text;
  v_invoice_id uuid := coalesce(new.invoice_id, old.invoice_id);
begin
  select status into v_status from public.invoices where id = v_invoice_id;

  -- Parent already gone (cascade) or still a draft: allowed
  if v_status is not null and v_status <> 'draft' then
    raise exception 'Line items of an issued invoice cannot be changed.'
      using errcode = 'P0001';
  end if;

  return coalesce(new, old);
end;
$$;

revoke all on function public.protect_issued_invoice_items() from public, anon, authenticated;

drop trigger if exists invoice_items_protect_issued on public.invoice_items;
create trigger invoice_items_protect_issued
  before insert or update or delete on public.invoice_items
  for each row execute function public.protect_issued_invoice_items();

-- 4. Cancelling an invoice reopens its quotation (status "accepted"),
--    so a corrected invoice can be created from it.
create or replace function public.reopen_quotation_after_invoice_cancel()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'cancelled'
     and old.status <> 'cancelled'
     and new.quotation_id is not null
     and not exists (
       select 1 from public.invoices i
       where i.quotation_id = new.quotation_id
         and i.id <> new.id
         and i.status <> 'cancelled'
     )
  then
    update public.quotations
       set status = 'accepted'
     where id = new.quotation_id
       and status = 'converted';
  end if;

  return new;
end;
$$;

revoke all on function public.reopen_quotation_after_invoice_cancel() from public, anon, authenticated;

drop trigger if exists invoices_reopen_quotation_on_cancel on public.invoices;
create trigger invoices_reopen_quotation_on_cancel
  after update of status on public.invoices
  for each row execute function public.reopen_quotation_after_invoice_cancel();

notify pgrst, 'reload schema';
