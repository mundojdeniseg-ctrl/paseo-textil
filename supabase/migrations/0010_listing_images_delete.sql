-- Faltaba la policy de DELETE en listing_images: el dueno del anuncio
-- necesita poder sacar una foto al editarlo.

create policy "dueno borra fotos de su anuncio" on public.listing_images
  for delete
  using (
    exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );
