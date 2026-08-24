-- Reportar contenido inapropiado (publicaciones del muro o anuncios).
-- No hay panel de moderacion todavia -- el dueno del sitio revisa esta
-- tabla directamente por SQL Editor, asi que no hace falta una policy
-- de select (el SQL Editor corre como postgres y evade RLS igual).

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  target_type text not null check (target_type in ('post', 'listing')),
  target_id uuid not null,
  reason text not null,
  reporter_id uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "cualquiera puede reportar" on public.reports for insert with check (true);
