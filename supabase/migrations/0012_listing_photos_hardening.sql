-- Cierra huecos encontrados en una auditoria completa del proyecto:
--
-- 1. El bucket "listing-images" nunca quedo en una migracion (se creo a mano
--    por SQL Editor en su momento) -- si alguien reconstruye la base desde
--    cero corriendo las migraciones en orden, el bucket no existiria. Ademas,
--    probando en vivo, el bucket YA tenia una policy de insert demasiado
--    abierta: cualquiera con la anon key podia subir un archivo a CUALQUIER
--    carpeta, sin que exista siquiera el anuncio. Se reemplaza todo por
--    policies que exigen que la carpeta (primer segmento del path) sea el id
--    de un anuncio real, del dueño logueado o -- para invitados -- dentro de
--    una ventana de 30 minutos desde que se creo el anuncio (asi el publicar
--    inicial con fotos sigue funcionando, pero ya no queda abierto para
--    siempre a que un tercero le llene de fotos ajenas a un anuncio viejo).
--
-- 2. La misma apertura existia en la tabla public.listing_images (policy de
--    insert de la migracion 0004): se corrige con el mismo criterio.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

drop policy if exists "cualquiera puede ver fotos de anuncios" on storage.objects;
drop policy if exists "insertar fotos solo en anuncios propios o recientes de invitado" on storage.objects;
drop policy if exists "el dueno del anuncio borra sus fotos del storage" on storage.objects;

create policy "cualquiera puede ver fotos de anuncios"
on storage.objects for select
using (bucket_id = 'listing-images');

create policy "insertar fotos solo en anuncios propios o recientes de invitado"
on storage.objects for insert
with check (
  bucket_id = 'listing-images'
  and exists (
    select 1 from public.listings l
    where l.id::text = (storage.foldername(name))[1]
      and (
        l.user_id = auth.uid()
        or (l.user_id is null and l.created_at > now() - interval '30 minutes')
      )
  )
);

create policy "el dueno del anuncio borra sus fotos del storage"
on storage.objects for delete
using (
  bucket_id = 'listing-images'
  and exists (
    select 1 from public.listings l
    where l.id::text = (storage.foldername(name))[1] and l.user_id = auth.uid()
  )
);

-- Mismo endurecimiento en la tabla public.listing_images.
drop policy if exists "se pueden agregar fotos a un listing propio o de invitado" on public.listing_images;

create policy "se pueden agregar fotos a un listing propio o de invitado reciente"
on public.listing_images
for insert
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_id
      and (
        l.user_id = auth.uid()
        or (l.user_id is null and l.created_at > now() - interval '30 minutes')
      )
  )
);

-- Contacto directo del anuncio: hasta ahora el nombre y telefono que el
-- publicador tipeaba solo se guardaban si tildaba "Publico como negocio";
-- si no, se perdian y el anuncio quedaba sin forma de contactar al vendedor.
alter table public.listings add column if not exists contact_name text;
alter table public.listings add column if not exists contact_phone text;
