-- 0012 agrego policies nuevas y mas estrictas para el bucket listing-images,
-- pero no tocaba estas dos policies viejas (creadas a mano por SQL Editor
-- mucho antes, con nombres con mayuscula que 0012 no conocia) -- como RLS
-- combina policies permisivas con OR, la vieja de INSERT sin ninguna
-- restriccion seguia dejando pasar cualquier subida a cualquier carpeta,
-- anulando el endurecimiento de 0012 en la practica.

drop policy if exists "Cualquiera puede subir fotos de anuncios" on storage.objects;
drop policy if exists "Cualquiera puede ver las fotos de anuncios" on storage.objects;
