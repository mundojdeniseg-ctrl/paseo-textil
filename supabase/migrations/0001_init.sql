-- Paseo Textil — esquema inicial (Fase 1 MVP)
-- Verificación de negocio DESACTIVADA por decisión de producto: registro liviano,
-- sin pedir documentación para vender mientras no haya tráfico (ver INFORME-COMPLETO.md, Parte 4).

create extension if not exists postgis;
create extension if not exists pg_trgm;

-- ============================================================
-- users: perfil público sobre auth.users. Nullable en listings
-- para soportar publicación de invitados sin cuenta.
-- ============================================================
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  phone text,
  role text not null default 'individual' check (role in ('individual', 'negocio', 'admin')),
  country_code text not null default 'AR',
  locale text not null default 'es-AR',
  created_at timestamptz not null default now()
);

-- ============================================================
-- business_profiles: perfil de negocio LIVIANO.
-- verification_status queda en el schema para la Fase 2 (insignia
-- opcional), pero no bloquea nada en la Fase 1.
-- ============================================================
create table public.business_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  business_name text not null,
  description text,
  tax_id text, -- CUIT, opcional, nunca obligatorio en la Fase 1
  verification_status text not null default 'sin_verificar'
    check (verification_status in ('sin_verificar', 'pendiente', 'verificado', 'rechazado')),
  location geography(point, 4326),
  address_text text,
  city text,
  province text,
  country_code text not null default 'AR',
  contact_phone text,
  social_links jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id)
);

-- ============================================================
-- categories: jerárquicas, name en jsonb para futura traducción
-- ============================================================
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete set null,
  slug text not null unique,
  name jsonb not null, -- {"es": "Moldería", "en": "Patternmaking"}
  sort_order int not null default 0
);

-- ============================================================
-- listings: el corazon del sitio
-- ============================================================
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users (id) on delete set null,
  guest_edit_token uuid, -- para invitados sin cuenta; se genera al publicar
  business_profile_id uuid references public.business_profiles (id) on delete set null,
  category_id uuid not null references public.categories (id),
  title text not null,
  description text,
  attributes jsonb not null default '{}'::jsonb, -- metraje, tipo de tejido, marca de maquina, etc.
  price_wholesale numeric(12, 2),
  price_retail numeric(12, 2),
  price_on_request boolean not null default false,
  currency_code text not null default 'ARS',
  location geography(point, 4326),
  city text,
  province text,
  country_code text not null default 'AR',
  status text not null default 'activo' check (status in ('activo', 'pausado', 'vencido', 'eliminado')),
  search_vector tsvector generated always as (
    to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '60 days')
);

create index listings_search_idx on public.listings using gin (search_vector);
create index listings_category_idx on public.listings (category_id);
create index listings_status_idx on public.listings (status);
create index listings_location_idx on public.listings using gist (location);
create index listings_title_trgm_idx on public.listings using gin (title gin_trgm_ops);

-- ============================================================
-- listing_images
-- ============================================================
create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  storage_path text not null,
  position int not null default 0
);

-- ============================================================
-- quotes: cotizaciones sin registro (patron iMotriz)
-- ============================================================
create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  requester_name text not null,
  requester_email text,
  requester_phone text,
  message text not null,
  status text not null default 'pendiente' check (status in ('pendiente', 'respondida', 'cerrada')),
  created_at timestamptz not null default now()
);

-- ============================================================
-- RLS: lectura publica de catalogo, escritura acotada
-- ============================================================
alter table public.users enable row level security;
alter table public.business_profiles enable row level security;
alter table public.categories enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.quotes enable row level security;

create policy "categories publicas" on public.categories for select using (true);

create policy "listings activos son publicos" on public.listings
  for select using (status = 'activo' or auth.uid() = user_id);

create policy "cualquiera autenticado puede crear listing propio" on public.listings
  for insert with check (auth.uid() = user_id or user_id is null);

create policy "dueno edita su listing" on public.listings
  for update using (auth.uid() = user_id);

create policy "fotos de listings activos son publicas" on public.listing_images
  for select using (
    exists (select 1 from public.listings l where l.id = listing_id and (l.status = 'activo' or l.user_id = auth.uid()))
  );

create policy "perfiles de negocio son publicos" on public.business_profiles
  for select using (true);

create policy "dueno gestiona su perfil de negocio" on public.business_profiles
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "usuario ve y edita su propio perfil" on public.users
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "cualquiera puede pedir cotizacion" on public.quotes
  for insert with check (true);

create policy "dueno del listing ve sus cotizaciones" on public.quotes
  for select using (
    exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );

-- ============================================================
-- Seed: categorias textiles iniciales
-- ============================================================
insert into public.categories (slug, name, sort_order) values
  ('molderia', '{"es": "Moldería"}', 1),
  ('confeccion', '{"es": "Confección"}', 2),
  ('tejido', '{"es": "Tejido plano y de punto"}', 3),
  ('estampado', '{"es": "Estampado"}', 4),
  ('bordado', '{"es": "Bordado"}', 5),
  ('insumos', '{"es": "Insumos y avíos"}', 6),
  ('maquinaria', '{"es": "Maquinaria"}', 7),
  ('servicios', '{"es": "Servicios"}', 8),
  ('indumentaria-mayor', '{"es": "Indumentaria por mayor"}', 9),
  ('indumentaria-menor', '{"es": "Indumentaria por menor"}', 10);
