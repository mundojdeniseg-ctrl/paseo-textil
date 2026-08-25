-- Foto de portada opcional en el perfil.
alter table public.users add column if not exists cover_url text;

-- Multiples negocios/marcas por cuenta: hasta ahora un usuario solo podia
-- tener UN perfil de negocio (unique en user_id). Se saca esa restriccion
-- para que alguien con varias marcas pueda cargarlas todas.
alter table public.business_profiles drop constraint if exists business_profiles_user_id_key;
