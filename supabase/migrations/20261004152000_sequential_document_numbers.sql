-- Sequential quotation and invoice numbers, plus quotation status repair.
--
-- Before: numbers came from Postgres sequences. A sequence never goes back,
-- so every deleted or failed document left a permanent gap.
-- After: the number is assigned inside the INSERT as (highest existing + 1).
-- Deleting the newest document frees its number for the next one.
-- Deleting an older document still leaves a gap, because renumbering
-- documents that may already have been sent to clients is not safe.

-- 1. Highest number currently used for a prefix, e.g. 'ZEN-QUO-'
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
      into v_max
      from public.quotations;
  elsif p_table = 'invoices' then
    select max(substring(invoice_number from '^' || p_prefix || '(\d+)$')::integer)
      into v_max
      from public.invoices;
  else
    raise exception 'Unknown table %', p_table;
  end if;

  return coalesce(v_max, 0);
end;
$$;

revoke all on function public.max_document_number(text, text) from public, anon, authenticated;

-- 2. Assign the number at insert time. The advisory lock makes two
--    simultaneous inserts wait for each other instead of taking the same number.
create or replace function public.assign_quotation_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('zenstax_quotation_number'));

  new.quotation_number := 'ZEN-QUO-' || lpad(
    (public.max_document_number('quotations', 'ZEN-QUO-') + 1)::text, 4, '0');

  return new;
end;
$$;

create or replace function public.assign_invoice_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('zenstax_invoice_number'));

  new.invoice_number := 'ZEN-INV-' || lpad(
    (public.max_document_number('invoices', 'ZEN-INV-') + 1)::text, 4, '0');

  return new;
end;
$$;

revoke all on function public.assign_quotation_number() from public, anon, authenticated;
revoke all on function public.assign_invoice_number() from public, anon, authenticated;

drop trigger if exists quotations_assign_number on public.quotations;
create trigger quotations_assign_number
  before insert on public.quotations
  for each row execute function public.assign_quotation_number();

drop trigger if exists invoices_assign_number on public.invoices;
create trigger invoices_assign_number
  before insert on public.invoices
  for each row execute function public.assign_invoice_number();

-- 3. The app still calls these before saving. They now only preview the
--    next number and no longer consume one; the trigger sets the real value.
create or replace function public.next_quotation_number()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select 'ZEN-QUO-' || lpad(
    (public.max_document_number('quotations', 'ZEN-QUO-') + 1)::text, 4, '0');
$$;

create or replace function public.next_invoice_number()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select 'ZEN-INV-' || lpad(
    (public.max_document_number('invoices', 'ZEN-INV-') + 1)::text, 4, '0');
$$;

revoke execute on function public.next_quotation_number() from public, anon;
revoke execute on function public.next_invoice_number() from public, anon;
grant execute on function public.next_quotation_number() to authenticated;
grant execute on function public.next_invoice_number() to authenticated;

drop sequence if exists public.quotation_number_seq;
drop sequence if exists public.invoice_number_seq;

-- 4. Deleting an invoice puts its quotation back to "accepted",
--    so it can be converted again or deleted.
create or replace function public.reopen_quotation_after_invoice_delete()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.quotation_id is not null
     and not exists (
       select 1 from public.invoices i where i.quotation_id = old.quotation_id
     )
  then
    update public.quotations
       set status = 'accepted'
     where id = old.quotation_id
       and status = 'converted';
  end if;

  return old;
end;
$$;

revoke all on function public.reopen_quotation_after_invoice_delete() from public, anon, authenticated;

drop trigger if exists invoices_reopen_quotation on public.invoices;
create trigger invoices_reopen_quotation
  after delete on public.invoices
  for each row execute function public.reopen_quotation_after_invoice_delete();

-- 5. Repair quotations whose invoice was already deleted
update public.quotations q
   set status = 'accepted'
 where q.status = 'converted'
   and not exists (select 1 from public.invoices i where i.quotation_id = q.id);
