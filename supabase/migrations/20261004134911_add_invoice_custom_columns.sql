-- 1. Columns on invoices (same shape as quotations)
alter table public.invoices
  add column if not exists custom_columns jsonb not null default '[]'::jsonb;

alter table public.invoice_items
  add column if not exists custom_values jsonb not null default '{}'::jsonb;

-- 2. When an invoice is created from a quotation, copy the column definitions
create or replace function public.copy_quotation_custom_columns()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.quotation_id is not null
     and (new.custom_columns is null or new.custom_columns = '[]'::jsonb) then
    select coalesce(q.custom_columns, '[]'::jsonb)
      into new.custom_columns
      from public.quotations q
     where q.id = new.quotation_id;
  end if;

  new.custom_columns := coalesce(new.custom_columns, '[]'::jsonb);
  return new;
end;
$$;

drop trigger if exists invoices_copy_custom_columns on public.invoices;
create trigger invoices_copy_custom_columns
  before insert on public.invoices
  for each row execute function public.copy_quotation_custom_columns();

-- 3. When invoice items are inserted, copy the matching quotation item's values
create or replace function public.copy_quotation_item_custom_values()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  v_quotation_id uuid;
begin
  if new.custom_values is null or new.custom_values = '{}'::jsonb then
    select i.quotation_id into v_quotation_id
      from public.invoices i
     where i.id = new.invoice_id;

    if v_quotation_id is not null then
      select qi.custom_values into new.custom_values
        from public.quotation_items qi
       where qi.quotation_id = v_quotation_id
         and qi.description = new.description
         and qi.quantity = new.quantity
         and qi.unit_price = new.unit_price
       limit 1;
    end if;
  end if;

  new.custom_values := coalesce(new.custom_values, '{}'::jsonb);
  return new;
end;
$$;

drop trigger if exists invoice_items_copy_custom_values on public.invoice_items;
create trigger invoice_items_copy_custom_values
  before insert on public.invoice_items
  for each row execute function public.copy_quotation_item_custom_values();

-- 4. Backfill invoices that were already converted
update public.invoices i
   set custom_columns = q.custom_columns
  from public.quotations q
 where i.quotation_id = q.id
   and i.custom_columns = '[]'::jsonb
   and q.custom_columns <> '[]'::jsonb;

update public.invoice_items ii
   set custom_values = qi.custom_values
  from public.invoices i
  join public.quotation_items qi on qi.quotation_id = i.quotation_id
 where ii.invoice_id = i.id
   and ii.custom_values = '{}'::jsonb
   and qi.custom_values <> '{}'::jsonb
   and qi.description = ii.description
   and qi.quantity = ii.quantity
   and qi.unit_price = ii.unit_price;

notify pgrst, 'reload schema';