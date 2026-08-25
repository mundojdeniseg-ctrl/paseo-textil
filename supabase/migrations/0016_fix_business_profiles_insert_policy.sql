-- Fix critico de seguridad: la policy de INSERT en business_profiles
-- quedo con "with check (true)" desde la Fase 1 (para permitir publicar
-- sin cuenta), pero eso permite que CUALQUIERA inserte una fila con el
-- user_id de OTRA persona -- antes del paquete de multiples negocios esto
-- era de impacto acotado porque el unique(user_id) lo bloqueaba al segundo
-- intento; al sacar esa restriccion (migracion 0015) un atacante puede
-- plantar negocios falsos ilimitados en la cuenta de cualquier usuario,
-- que ademas se muestran con protagonismo (logo + titulo) en su perfil
-- publico. Se seguye permitiendo el alta sin cuenta (user_id null, usada
-- por publicar/actions.ts para invitados) pero ya no se permite suplantar
-- el user_id de otra persona.

drop policy if exists "cualquiera puede crear un perfil de negocio" on public.business_profiles;

create policy "crear perfil de negocio propio o de invitado" on public.business_profiles
  for insert with check (user_id is null or auth.uid() = user_id);
