import Link from "next/link";
import { Button } from "@/components/ui/button";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function SiteHeader() {
  let isLoggedIn = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = Boolean(user);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-black">
            PT
          </span>
          <span className="text-lg font-black tracking-tight lowercase">
            paseo textil
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
          <Link href="/anuncios" className="hover:text-foreground transition-colors">
            anuncios
          </Link>
          <Link href="/muro" className="hover:text-foreground transition-colors">
            muro
          </Link>
          <Link href="/anuncios?categoria=molderia" className="hover:text-foreground transition-colors">
            categorías
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            render={<Link href={isLoggedIn ? "/cuenta" : "/cuenta/ingresar"} />}
            nativeButton={false}
            variant="ghost"
            className="hidden sm:inline-flex rounded-full"
          >
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
    </header>
  );
}
