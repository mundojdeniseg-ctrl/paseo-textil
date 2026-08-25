-- Con multiples negocios por cuenta, el que se mostraba con protagonismo
-- en el perfil publico (logo grande, H1) era simplemente el mas antiguo
-- por created_at -- sin forma de elegirlo. Se agrega un flag para que el
-- usuario marque cual es su marca principal.
alter table public.business_profiles add column if not exists is_featured boolean not null default false;
