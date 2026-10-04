-- Company settings: only owner/admin can read or change the table.
-- Everyone else gets the fields printed on documents through a function.
-- Run AFTER enforce_workspace_roles (it uses public.has_workspace_role).

-- 1. Remove every existing policy on company_settings
do $$
declare
  r record;
begin
  for r in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'company_settings'
  loop
    execute format('drop policy %I on public.company_settings', r.policyname);
  end loop;
end;
$$;

alter table public.company_settings enable row level security;

-- 2. Owner/admin only
create policy "company_settings_select" on public.company_settings
  for select to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin']));

create policy "company_settings_insert" on public.company_settings
  for insert to authenticated
  with check (public.has_workspace_role(workspace_id, array['owner','admin']));

create policy "company_settings_update" on public.company_settings
  for update to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin']))
  with check (public.has_workspace_role(workspace_id, array['owner','admin']));

-- 3. Document fields for any workspace member (PDFs, new quotation defaults)
create or replace function public.get_document_business_details(p_workspace_id uuid)
returns table (
  legal_name text,
  trading_name text,
  email text,
  phone text,
  website text,
  address_line_1 text,
  address_line_2 text,
  city text,
  emirate text,
  postal_code text,
  country text,
  trn text,
  default_currency text,
  default_vat_rate numeric,
  quotation_validity_days integer,
  bank_name text,
  bank_account_name text,
  bank_account_number text,
  iban text,
  swift_code text,
  payment_terms text,
  invoice_footer text,
  quotation_footer text,
  authorized_signatory_name text,
  authorized_signatory_title text,
  logo_path text,
  brand_primary_color text,
  brand_secondary_color text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    cs.legal_name, cs.trading_name, cs.email, cs.phone, cs.website,
    cs.address_line_1, cs.address_line_2, cs.city, cs.emirate,
    cs.postal_code, cs.country, cs.trn,
    cs.default_currency, cs.default_vat_rate, cs.quotation_validity_days,
    cs.bank_name, cs.bank_account_name, cs.bank_account_number,
    cs.iban, cs.swift_code,
    cs.payment_terms, cs.invoice_footer, cs.quotation_footer,
    cs.authorized_signatory_name, cs.authorized_signatory_title,
    cs.logo_path, cs.brand_primary_color, cs.brand_secondary_color
  from public.company_settings cs
  where cs.workspace_id = p_workspace_id
    and exists (
      select 1
      from public.workspace_members wm
      where wm.workspace_id = p_workspace_id
        and wm.user_id = (select auth.uid())
    )
  limit 1;
$$;

revoke all on function public.get_document_business_details(uuid) from public, anon;
grant execute on function public.get_document_business_details(uuid) to authenticated;