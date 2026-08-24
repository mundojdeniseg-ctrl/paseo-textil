-- Muro social: publicaciones tipo Facebook, atadas al perfil del usuario
-- (a diferencia de los anuncios, esto SI requiere cuenta real).

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts (id) on delete cascade,
  storage_path text not null,
  media_type text not null check (media_type in ('image', 'video')),
  position int not null default 0
);

create index posts_created_at_idx on public.posts (created_at desc);

alter table public.posts enable row level security;
alter table public.post_media enable row level security;

create policy "posts publicos" on public.posts for select using (true);
create policy "dueno crea sus posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "dueno edita sus posts" on public.posts for update using (auth.uid() = user_id);
create policy "dueno borra sus posts" on public.posts for delete using (auth.uid() = user_id);

create policy "post_media publica" on public.post_media for select using (true);
create policy "dueno del post agrega su media" on public.post_media
  for insert
  with check (
    exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid())
  );
create policy "dueno del post borra su media" on public.post_media
  for delete
  using (
    exists (select 1 from public.posts p where p.id = post_id and p.user_id = auth.uid())
  );

-- Bucket para fotos y videos del muro (separado de listing-images).
-- Requiere estar logueado para subir (a diferencia de las fotos de anuncios,
-- que son de invitados) -- 50MB de limite por archivo, alcanza para videos cortos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'post-media',
  'post-media',
  true,
  52428800,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/quicktime', 'video/webm']
)
on conflict (id) do nothing;

create policy "cualquiera puede ver la media del muro"
on storage.objects for select
using (bucket_id = 'post-media');

create policy "solo usuarios logueados suben media al muro"
on storage.objects for insert
with check (bucket_id = 'post-media' and auth.uid() is not null);
