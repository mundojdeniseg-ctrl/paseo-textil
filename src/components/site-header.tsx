import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getAvatarUrl } from "@/lib/format";
import { getUnreadMessageCount } from "@/lib/data/messages";
import { GlobalSearch } from "@/components/global-search";

export async function SiteHeader() {
  let isLoggedIn = false;
  let isAdmin = false;
  let avatarUrl: string | null = null;
  let unreadCount = 0;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = Boolean(user);
    if (user) {
      const [{ data: profile }, unread] = await Promise.all([
        supabase.from("users").select("avatar_url, role").eq("id", user.id).maybeSingle(),
        getUnreadMessageCount(),
      ]);
      avatarUrl = getAvatarUrl(profile?.avatar_url);
      unreadCount = unread;
      isAdmin = profile?.role === "admin";
    }
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-black">
            PT
          </span>
          <span className="text-lg font-black tracking-tight lowercase">
            paseo textil
          </span>
        </Link>

        <nav className="hidden shrink-0 items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <Link href="/anuncios" className="hover:text-foreground transition-colors">
            anuncios
          </Link>
          <Link href="/muro" className="hover:text-foreground transition-colors">
            muro
          </Link>
          <Link href="/anuncios?categoria=molderia" className="hover:text-foreground transition-colors">
            categorías
          </Link>
          {isLoggedIn && (
            <>
              <Link href="/mis-anuncios" className="hover:text-foreground transition-colors">
                mis anuncios
              </Link>
              <Link href="/guardados" className="hover:text-foreground transition-colors">
                guardados
              </Link>
              <Link href="/mensajes" className="relative hover:text-foreground transition-colors">
                mensajes
                {unreadCount > 0 && (
                  <span className="absolute -right-3 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unreadCount}
                  </span>
                )}
              </Link>
            </>
          )}
          {isAdmin && (
            <Link href="/admin" className="hover:text-foreground transition-colors">
              admin
            </Link>
          )}
        </nav>

        <div className="hidden flex-1 md:block md:max-w-xs lg:max-w-sm">
          <GlobalSearch />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2">
          <Button
            render={<Link href={isLoggedIn ? "/cuenta" : "/cuenta/ingresar"} />}
            nativeButton={false}
            variant="ghost"
            className="hidden sm:inline-flex items-center gap-2 rounded-full"
          >
            {avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-6 w-6 rounded-full object-cover" />
            )}
            {isLoggedIn ? "Mi cuenta" : "Ingresar"}
          </Button>
          <Button
            render={<Link href="/publicar" />}
            nativeButton={false}
            className="rounded-full font-semibold"
          >
            Publicar gratis
          </Button>
        </div>
      </div>

      {/* En mobile el buscador no entra en la fila principal: va en su
          propia fila, siempre visible, dentro del mismo header sticky. */}
      <div className="border-t border-border/70 px-4 py-2 md:hidden">
        <GlobalSearch />
      </div>
    </header>
  );
}
