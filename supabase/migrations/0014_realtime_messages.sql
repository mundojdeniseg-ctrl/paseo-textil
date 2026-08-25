-- Habilita Realtime (Postgres Changes) en la tabla de mensajes para que un
-- chat abierto reciba los mensajes nuevos al instante, sin que la otra
-- persona tenga que recargar la pagina (F5) para verlos.

alter publication supabase_realtime add table public.messages;
