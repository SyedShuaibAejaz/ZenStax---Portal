-- =========================================================
-- ZenStax portal: role-based access (owner, admin, finance, member, viewer)
-- =========================================================

-- 1. Fix the broken overload. Two versions of can_manage_workspace exist,
--    so every call with one argument fails with "function is not unique".
--    This breaks update_workspace_member_role, replace_member_permissions
--    and remove_workspace_member.
drop function if exists public.can_manage_workspace(uuid);

-- 2. One helper for every role check
create or replace function public.has_workspace_role(
  p_workspace_id uuid,
  p_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.user_id = (select auth.uid())
      and wm.role = any (p_roles)
  );
$$;

create or replace function public.shares_workspace_with(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members me
    join public.workspace_members other
      on other.workspace_id = me.workspace_id
    where me.user_id = (select auth.uid())
      and other.user_id = p_user_id
  );
$$;

create or replace function public.is_any_workspace_role(p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.user_id = (select auth.uid())
      and wm.role = any (p_roles)
  );
$$;

-- 3. Role column must only hold known roles
alter table public.workspace_members
  drop constraint if exists workspace_members_role_check;

alter table public.workspace_members
  add constraint workspace_members_role_check
  check (role in ('owner', 'admin', 'finance', 'member', 'viewer'));

-- 4. Remove every existing policy on the business tables.
--    Most of them are "using (true)", which lets ANY signed-in user
--    read, edit and delete everything, whatever their role.
do $$
declare
  r record;
begin
  for r in
    select policyname, tablename
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'clients', 'quotations', 'quotation_items',
        'invoices', 'invoice_items',
        'company_settings', 'business_settings', 'profiles'
      )
  loop
    execute format('drop policy %I on public.%I', r.policyname, r.tablename);
  end loop;
end;
$$;

-- 5. Clients
create policy "clients_select" on public.clients for select to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin','finance','member','viewer']));
create policy "clients_insert" on public.clients for insert to authenticated
  with check (public.has_workspace_role(workspace_id, array['owner','admin','finance','member']));
create policy "clients_update" on public.clients for update to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin','finance','member']))
  with check (public.has_workspace_role(workspace_id, array['owner','admin','finance','member']));
create policy "clients_delete" on public.clients for delete to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin']));

-- 6. Quotations
create policy "quotations_select" on public.quotations for select to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin','finance','member','viewer']));
create policy "quotations_insert" on public.quotations for insert to authenticated
  with check (public.has_workspace_role(workspace_id, array['owner','admin','finance','member']));
create policy "quotations_update" on public.quotations for update to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin','finance','member']))
  with check (public.has_workspace_role(workspace_id, array['owner','admin','finance','member']));
create policy "quotations_delete" on public.quotations for delete to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin']));

-- 7. Quotation items follow their quotation
create policy "quotation_items_select" on public.quotation_items for select to authenticated
  using (exists (select 1 from public.quotations q where q.id = quotation_id
    and public.has_workspace_role(q.workspace_id, array['owner','admin','finance','member','viewer'])));
create policy "quotation_items_insert" on public.quotation_items for insert to authenticated
  with check (exists (select 1 from public.quotations q where q.id = quotation_id
    and public.has_workspace_role(q.workspace_id, array['owner','admin','finance','member'])));
create policy "quotation_items_update" on public.quotation_items for update to authenticated
  using (exists (select 1 from public.quotations q where q.id = quotation_id
    and public.has_workspace_role(q.workspace_id, array['owner','admin','finance','member'])))
  with check (exists (select 1 from public.quotations q where q.id = quotation_id
    and public.has_workspace_role(q.workspace_id, array['owner','admin','finance','member'])));
create policy "quotation_items_delete" on public.quotation_items for delete to authenticated
  using (exists (select 1 from public.quotations q where q.id = quotation_id
    and public.has_workspace_role(q.workspace_id, array['owner','admin','finance','member'])));

-- 8. Invoices (finance and above can create/edit; owner/admin delete)
create policy "invoices_select" on public.invoices for select to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin','finance','member','viewer']));
create policy "invoices_insert" on public.invoices for insert to authenticated
  with check (public.has_workspace_role(workspace_id, array['owner','admin','finance']));
create policy "invoices_update" on public.invoices for update to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin','finance']))
  with check (public.has_workspace_role(workspace_id, array['owner','admin','finance']));
create policy "invoices_delete" on public.invoices for delete to authenticated
  using (public.has_workspace_role(workspace_id, array['owner','admin']));

-- 9. Invoice items follow their invoice
create policy "invoice_items_select" on public.invoice_items for select to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_id
    and public.has_workspace_role(i.workspace_id, array['owner','admin','finance','member','viewer'])));
create policy "invoice_items_insert" on public.invoice_items for insert to authenticated
  with check (exists (select 1 from public.invoices i where i.id = invoice_id
    and public.has_workspace_role(i.workspace_id, array['owner','admin','finance'])));
create policy "invoice_items_update" on public.invoice_items for update to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_id
    and public.has_workspace_role(i.workspace_id, array['owner','admin','finance'])))
  with check (exists (select 1 from public.invoices i where i.id = invoice_id
    and public.has_workspace_role(i.workspace_id, array['owner','admin','finance'])));
create policy "invoice_items_delete" on public.invoice_items for delete to authenticated
  using (exists (select 1 from public.invoices i where i.id = invoice_id
    and public.has_workspace_role(i.workspace_id, array['owner','admin'])));

-- 10. Company settings: policies are set in the next migration
--     (restrict_company_settings): owner/admin only, plus a document function.

-- business_settings is empty and unused (no workspace_id). Left with no
-- policies, so it is locked. Settings live in company_settings.

-- 11. Profiles: see yourself and people in your workspace; edit only yourself
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = (select auth.uid()) or public.shares_workspace_with(id));
create policy "profiles_insert" on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));
create policy "profiles_update" on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- 11b. Activity logs: was readable by every signed-in user
drop policy if exists "authenticated users can read activity logs" on public.activity_logs;
create policy "activity_logs_select" on public.activity_logs for select to authenticated
  using (user_id = (select auth.uid()) or public.is_any_workspace_role(array['owner','admin']));

-- 12. Fix replace_member_permissions: its filter compared the column to
--     itself, so any permission string was accepted.
create or replace function public.replace_member_permissions(
  p_workspace_id uuid,
  p_user_id uuid,
  p_permissions text[]
)
returns setof public.member_permissions
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.can_manage_workspace(p_workspace_id) then
    raise exception 'Only workspace owners or admins can manage permissions';
  end if;

  if not exists (
    select 1 from public.workspace_members
    where workspace_id = p_workspace_id and user_id = p_user_id
  ) then
    raise exception 'Member not found';
  end if;

  delete from public.member_permissions
  where workspace_id = p_workspace_id and user_id = p_user_id;

  insert into public.member_permissions (workspace_id, user_id, permission_key)
  select distinct p_workspace_id, p_user_id, k.key
  from unnest(p_permissions) as k(key)
  where exists (
    select 1 from public.workspace_permissions wp
    where wp.workspace_id = p_workspace_id
      and wp.permission_key = k.key
  );

  return query
  select * from public.member_permissions
  where workspace_id = p_workspace_id and user_id = p_user_id
  order by permission_key;
end;
$$;

-- 13. Storage: zenstax-private was open to every signed-in user
drop policy if exists "Authenticated users can delete ZenStax files" on storage.objects;
drop policy if exists "Authenticated users can upload company logo" on storage.objects;
drop policy if exists "Authenticated users can upload portal files" on storage.objects;
drop policy if exists "Authenticated users can upload ZenStax files" on storage.objects;
drop policy if exists "Authenticated users can view ZenStax files" on storage.objects;
drop policy if exists "Authenticated users can read portal files" on storage.objects;
drop policy if exists "Authenticated users can update portal files" on storage.objects;
drop policy if exists "Authenticated users can update company logo" on storage.objects;
drop policy if exists "Authenticated users can update ZenStax files" on storage.objects;

create or replace function public.can_access_private_file(p_name text, p_write boolean)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case (storage.foldername(p_name))[1]
    when 'quotations' then exists (
      select 1 from public.quotations q
      where q.id::text = (storage.foldername(p_name))[2]
        and public.has_workspace_role(
          q.workspace_id,
          case when p_write
            then array['owner','admin','finance','member']
            else array['owner','admin','finance','member','viewer'] end))
    when 'invoices' then exists (
      select 1 from public.invoices i
      where i.id::text = (storage.foldername(p_name))[2]
        and public.has_workspace_role(
          i.workspace_id,
          case when p_write
            then array['owner','admin','finance']
            else array['owner','admin','finance','member','viewer'] end))
    when 'company' then public.is_any_workspace_role(
      case when p_write
        then array['owner','admin']
        else array['owner','admin','finance','member','viewer'] end)
    else public.is_any_workspace_role(array['owner','admin'])
  end;
$$;

create policy "zenstax_private_select" on storage.objects for select to authenticated
  using (bucket_id = 'zenstax-private' and public.can_access_private_file(name, false));
create policy "zenstax_private_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'zenstax-private' and public.can_access_private_file(name, true));
create policy "zenstax_private_update" on storage.objects for update to authenticated
  using (bucket_id = 'zenstax-private' and public.can_access_private_file(name, true))
  with check (bucket_id = 'zenstax-private' and public.can_access_private_file(name, true));
-- Owner/admin can delete any file (covers files whose record was deleted first)
create policy "zenstax_private_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'zenstax-private' and public.is_any_workspace_role(array['owner','admin']));

-- 14. Logged-out visitors must not call internal functions.
--     next_invoice_number from anon would burn tax-invoice numbers.
revoke execute on function public.next_invoice_number() from anon, public;
revoke execute on function public.next_quotation_number() from anon, public;
revoke execute on function public.handle_new_user() from anon, authenticated, public;
revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
revoke execute on function public.has_workspace_role(uuid, text[]) from anon, public;
revoke execute on function public.shares_workspace_with(uuid) from anon, public;
revoke execute on function public.is_any_workspace_role(text[]) from anon, public;
revoke execute on function public.can_access_private_file(text, boolean) from anon, public;
grant execute on function public.has_workspace_role(uuid, text[]) to authenticated;
grant execute on function public.shares_workspace_with(uuid) to authenticated;
grant execute on function public.is_any_workspace_role(text[]) to authenticated;
grant execute on function public.can_access_private_file(text, boolean) to authenticated;
grant execute on function public.next_invoice_number() to authenticated;
grant execute on function public.next_quotation_number() to authenticated;

alter function public.set_updated_at() set search_path = public;

notify pgrst, 'reload schema';
