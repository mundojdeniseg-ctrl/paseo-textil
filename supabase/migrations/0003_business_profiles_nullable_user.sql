-- Fix: business_profiles.user_id era NOT NULL con FK a public.users, pero un
-- perfil de negocio creado por un invitado (sin cuenta, Fase 1) no tiene un
-- usuario real al que enlazar. Se permite NULL, igual que ya hace
-- listings.user_id para el mismo escenario de invitado. Un UNIQUE constraint
-- sobre una columna nullable no genera conflicto entre múltiples NULLs, así
-- que esto no rompe la unicidad para negocios que sí tengan cuenta a futuro.

alter table public.business_profiles alter column user_id drop not null;
