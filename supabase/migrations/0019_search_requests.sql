-- "Contanos que necesitas": formulario general (no atado a un anuncio
-- puntual) para que alguien describa lo que busca. Se guarda cada consulta
-- -- Denis la revisa por SQL Editor, mismo patron que public.reports.

create table public.search_requests (
  id uuid primary key default gen_random_uuid(),
  description text not null,
  category_id uuid references public.categories (id) on delete set null,
  zone text,
  requester_name text,
  requester_contact text,
  created_at timestamptz not null default now()
);

alter table public.search_requests enable row level security;

create policy "cualquiera puede enviar una consulta" on public.search_requests
  for insert with check (true);
