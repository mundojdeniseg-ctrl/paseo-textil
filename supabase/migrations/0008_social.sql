-- Paquete "mini red social": likes, comentarios, perfil publico opcional
-- y mensajeria directa entre usuarios.

-- ============================================================
-- likes en publicaciones del muro
-- ============================================================
create table public.post_likes (
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

create policy "likes publicos" on public.post_likes for select using (true);
create policy "usuario da like" on public.post_likes for insert with check (auth.uid() = user_id);
create policy "usuario saca su like" on public.post_likes for delete using (auth.uid() = user_id);

-- ============================================================
-- comentarios en publicaciones del muro
-- ============================================================
create table public.post_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create index post_comments_post_idx on public.post_comments (post_id, created_at);

alter table public.post_comments enable row level security;

create policy "comentarios publicos" on public.post_comments for select using (true);
create policy "usuario comenta" on public.post_comments for insert with check (auth.uid() = user_id);
create policy "usuario borra su comentario" on public.post_comments for delete using (auth.uid() = user_id);

-- ============================================================
-- perfil publico opcional: cada usuario decide si su perfil
-- (publicaciones + anuncios) se puede ver desde /usuarios/{id}
-- ============================================================
alter table public.users add column if not exists is_profile_public boolean not null default true;

-- ============================================================
-- Fix RLS de public.users: la policy original ("for all using
-- auth.uid() = id") bloqueaba tambien el SELECT, asi que nadie
-- podia ver el nombre/foto de OTRO usuario -- rompia el autor de
-- posts ajenos en el muro y hacia imposible el perfil publico.
-- Igual que en business_profiles (migracion 0002): se separa
-- select (publico) de escritura (solo dueno).
-- ============================================================
drop policy if exists "usuario ve y edita su propio perfil" on public.users;

create policy "perfiles de usuario son publicos" on public.users for select using (true);
create policy "usuario crea su propio perfil" on public.users for insert with check (auth.uid() = id);
create policy "usuario edita su propio perfil" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "usuario borra su propio perfil" on public.users for delete using (auth.uid() = id);

-- ============================================================
-- mensajeria directa entre usuarios (para consultar por productos)
-- ============================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.users (id) on delete cascade,
  recipient_id uuid not null references public.users (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_participants_idx on public.messages (sender_id, recipient_id, created_at);
create index messages_recipient_idx on public.messages (recipient_id, created_at);

alter table public.messages enable row level security;

create policy "participantes ven sus mensajes" on public.messages
  for select using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "usuario envia mensaje" on public.messages
  for insert with check (auth.uid() = sender_id and sender_id <> recipient_id);

create policy "receptor marca como leido" on public.messages
  for update using (auth.uid() = recipient_id) with check (auth.uid() = recipient_id);
