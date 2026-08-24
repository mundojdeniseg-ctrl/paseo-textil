-- Foto de perfil personal y logo de negocio, mas el bucket para subirlas.
-- Se guardan en storage bajo "{user_id}/avatar.ext" y "{user_id}/logo.ext"
-- para que las policies puedan validar dueno por carpeta.

alter table public.users add column if not exists avatar_url text;
alter table public.business_profiles add column if not exists logo_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

create policy "cualquiera puede ver avatares y logos"
on storage.objects for select
using (bucket_id = 'avatars');

create policy "cada usuario sube su propio avatar o logo"
on storage.objects for insert
with check (
  bucket_id = 'avatars'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "cada usuario reemplaza su propio avatar o logo"
on storage.objects for update
using (
  bucket_id = 'avatars'
  and auth.uid() is not null
  and (storage.foldername(name))[1] = auth.uid()::text
);
