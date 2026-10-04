-- This project does not grant table access by default, so the new
-- credit note tables need explicit grants. Read-only for signed-in users
-- (RLS limits rows to their workspace); writes go through create_credit_note().
grant select on public.credit_notes to authenticated;
grant select on public.credit_note_items to authenticated;

grant select, insert, update, delete on public.credit_notes to service_role;
grant select, insert, update, delete on public.credit_note_items to service_role;

notify pgrst, 'reload schema';
