import { createBrowserClient } from "@supabase/ssr";

// Cliente de Supabase para uso en Client Components.
// No se usa todavia en ninguna pantalla (la app corre sobre datos de prueba
// en src/lib/data/store.ts) — queda listo para cuando existan credenciales reales.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
