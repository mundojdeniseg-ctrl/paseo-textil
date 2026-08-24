import { NextRequest, NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

// Intercambia el "code" que manda Supabase por email (recuperar contraseña,
// confirmar cuenta) por una sesion real, dejando las cookies puestas antes
// de mandar al usuario a la pagina final. Esto SI puede escribir cookies
// porque es un Route Handler, a diferencia de un Server Component.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/cuenta";

  if (code && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/cuenta/ingresar?error=link_invalido`);
}
