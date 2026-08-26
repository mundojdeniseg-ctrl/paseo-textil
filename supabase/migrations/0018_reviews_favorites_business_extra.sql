-- Mejoras inspiradas en el relevamiento de Semillero Textil (agosto 2026):
-- reseñas, guardados/favoritos, ficha de negocio más completa y verificación
-- manual por admin. 100% aditivo: no modifica ni borra nada existente.

-- ============================================================
-- business_reviews: reseñas con estrellas + texto, una por usuario y negocio
-- ============================================================
create table public.business_reviews (
  id uuid primary key default gen_random_uuid(),
  business_profile_id uuid not null references public.business_profiles (id) on delete cascade,
  reviewer_id uuid not null references public.users (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  unique (business_profile_id, reviewer_id)
);

create index business_reviews_business_idx on public.business_reviews (business_profile_id);

alter table public.business_reviews enable row level security;

create policy "reseñas publicas" on public.business_reviews for select using (true);

create policy "usuario autenticado deja su reseña" on public.business_reviews
  for insert
  with check (
    auth.uid() = reviewer_id
    and not exists (
      select 1 from public.business_profiles bp
      where bp.id = business_profile_id and bp.user_id = auth.uid()
    )
  );

create policy "autor edita su reseña" on public.business_reviews
  for update using (auth.uid() = reviewer_id);

create policy "autor borra su reseña" on public.business_reviews
  for delete using (auth.uid() = reviewer_id);

-- ============================================================
-- saved_items: guardados/favoritos de anuncios y negocios (mismo patron
-- polimorfico que public.reports: target_type + target_id, sin FK directa)
-- ============================================================
create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  target_type text not null check (target_type in ('listing', 'business')),
  target_id uuid not null,
  created_at timestamptz not null default now(),
  unique (user_id, target_type, target_id)
);

alter table public.saved_items enable row level security;

create policy "usuario ve sus guardados" on public.saved_items
  for select using (auth.uid() = user_id);

create policy "usuario guarda" on public.saved_items
  for insert with check (auth.uid() = user_id);

create policy "usuario borra su guardado" on public.saved_items
  for delete using (auth.uid() = user_id);

-- ============================================================
-- business_profiles: ficha mas completa (todo opcional, no rompe fichas
-- existentes) + updated_at para mostrar "actualizado hace..."
-- ============================================================
alter table public.business_profiles
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists hours_text text,
  add column if not exists min_production text,
  add column if not exists lead_time text,
  add column if not exists fabric_types text,
  add column if not exists accepts_own_patterns boolean,
  add column if not exists accepts_orders boolean not null default true;

-- ============================================================
-- Verificacion manual: reutiliza el rol 'admin' que ya existe en
-- public.users (definido desde 0001, nunca usado hasta ahora). Se suma
-- como policy adicional -- no reemplaza "dueno gestiona su perfil de
-- negocio", ambas quedan activas en OR.
-- ============================================================
create policy "admin gestiona cualquier perfil de negocio" on public.business_profiles
  for update
  using (exists (select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'));
