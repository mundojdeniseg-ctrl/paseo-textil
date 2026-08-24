-- Fix: la politica original de business_profiles exigia auth.uid() = user_id
-- para CUALQUIER operacion (incluido el alta), pero en la Fase 1 se publica
-- sin cuenta -- no hay auth.uid() todavia. Se separa en 3 politicas:
-- crear (abierto, sin cuenta), editar/borrar (solo el dueno autenticado,
-- para cuando existan cuentas reales en Fase 2).

drop policy if exists "dueno gestiona su perfil de negocio" on public.business_profiles;

create policy "cualquiera puede crear un perfil de negocio" on public.business_profiles
  for insert with check (true);

create policy "dueno edita su perfil de negocio" on public.business_profiles
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "dueno elimina su perfil de negocio" on public.business_profiles
  for delete using (auth.uid() = user_id);
