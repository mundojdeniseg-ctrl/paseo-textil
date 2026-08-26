import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getUnreadMessageCount } from "@/lib/data/messages";
import { MobileBottomNavClient } from "@/components/mobile-bottom-nav-client";

// Barra fija abajo, solo mobile (md:hidden en el componente cliente): hoy
// en mobile el header no muestra ni el nav ni el boton de cuenta, asi que
// esta barra es la unica forma de llegar a anuncios/publicar/cuenta.
export async function MobileBottomNav() {
  let isLoggedIn = false;
  let unreadCount = 0;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = Boolean(user);
    if (user) unreadCount = await getUnreadMessageCount();
  }

  return <MobileBottomNavClient isLoggedIn={isLoggedIn} unreadCount={unreadCount} />;
}
