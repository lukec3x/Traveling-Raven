-- When the row was stored. enviar omits this column and the default fills it.

alter table public.dados
  add column created_at timestamptz not null default now();
