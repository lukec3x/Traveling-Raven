-- One-shot notes. anon may execute the two functions and nothing else on the table.

create table public.dados (
  "ID" text primary key,
  "Mensagem" text not null,
  constraint dados_id_format check ("ID" ~ '^[A-Z0-9]{4}$'),
  constraint dados_mensagem_present check (length(btrim("Mensagem")) > 0)
);

alter table public.dados enable row level security;

revoke all on table public.dados from public;
revoke all on table public.dados from anon;
revoke all on table public.dados from authenticated;

grant select, insert, update, delete on table public.dados to service_role;

create or replace function public.enviar(codigo text, mensagem text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if codigo is null
    or codigo !~ '^[A-Z0-9]{4}$'
    or mensagem is null
    or length(btrim(mensagem)) = 0 then
    return false;
  end if;

  insert into public.dados ("ID", "Mensagem")
  values (codigo, mensagem);
  return true;
exception
  when unique_violation then
    return false;
end;
$$;

create or replace function public.receber(codigo text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  texto text;
begin
  if codigo is null or codigo !~ '^[A-Z0-9]{4}$' then
    return null;
  end if;

  delete from public.dados
  where "ID" = codigo
  returning "Mensagem" into texto;

  return texto;
end;
$$;

revoke all on function public.enviar(text, text) from public;
revoke all on function public.enviar(text, text) from anon;
revoke all on function public.enviar(text, text) from authenticated;
revoke all on function public.receber(text) from public;
revoke all on function public.receber(text) from anon;
revoke all on function public.receber(text) from authenticated;

grant execute on function public.enviar(text, text) to anon;
grant execute on function public.receber(text) to anon;
