alter table public.quotations
  add column if not exists custom_columns jsonb not null default '[]'::jsonb;

alter table public.quotation_items
  add column if not exists custom_values jsonb not null default '{}'::jsonb;

notify pgrst, 'reload schema';