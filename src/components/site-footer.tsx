import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 mt-16">
      <div className="mx-auto max-w-6xl px-4 py-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-black lowercase tracking-tight">paseo textil</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            La plaza textil argentina online: publicá, cotizá y conectá con talleres,
            proveedores y fabricantes de todo el país — gratis y sin vueltas.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <Link href="/anuncios" className="hover:text-foreground transition-colors">
            Ver anuncios
          </Link>
          <Link href="/publicar" className="hover:text-foreground transition-colors">
            Publicar anuncio
          </Link>
        </nav>
      </div>
      <div className="border-t border-border/70">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()} Paseo Textil — paseotextil.com
        </p>
      </div>
    </footer>
  );
}
