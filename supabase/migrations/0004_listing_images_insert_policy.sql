-- Fix (adelantado, mismo patron que los bugs anteriores): listing_images tenia
-- politica de SELECT pero ninguna de INSERT, así que subir una foto a un
-- anuncio de invitado (sin cuenta) habria fallado por RLS. Se permite insertar
-- fotos para cualquier anuncio propio (dueño autenticado) o de invitado
-- (user_id null en el listing), igual que el resto del flujo sin cuenta.

create policy "se pueden agregar fotos a un listing propio o de invitado"
on public.listing_images
for insert
with check (
  exists (
    select 1 from public.listings l
    where l.id = listing_id and (l.user_id is null or l.user_id = auth.uid())
  )
);
