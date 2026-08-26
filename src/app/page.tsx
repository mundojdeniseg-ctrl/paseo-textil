import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listing-card";
import { NecesidadForm } from "@/components/necesidad-form";
import { getCategories, getListings } from "@/lib/data/listings";
import { getPlatformStats } from "@/lib/data/stats";
import { getSavedIds } from "@/lib/data/favorites";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function HomePage() {
  const [listings, categories, stats] = await Promise.all([getListings(), getCategories(), getPlatformStats()]);
  const recent = listings.slice(0, 6);

  let isLoggedIn = false;
  let savedIds = new Set<string>();
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = Boolean(user);
    if (user) savedIds = await getSavedIds(user.id, "listing");
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="border-b border-border/70 bg-secondary/40">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            La plaza textil argentina
          </p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-[1.05] tracking-tight sm:text-6xl">
            publicá y{" "}
            <span className="text-primary">encontrá</span>
            <br />
            lo que el rubro textil necesita
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            Moldería, confección, telas, insumos, maquinaria y servicios — publicá gratis,
            sin cuenta obligatoria, y cotizá directo con talleres y proveedores de todo el país.
          </p>

          <form action="/anuncios" className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
            <input
              type="text"
              name="q"
              placeholder="Buscar telas, maquinaria, servicios..."
              className="h-12 flex-1 rounded-full border border-border bg-background px-5 text-sm outline-none ring-primary/30 focus:ring-2"
            />
            <Button type="submit" size="lg" className="h-12 rounded-full font-semibold">
              Buscar
            </Button>
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              render={<Link href="/publicar" />}
              nativeButton={false}
              size="lg"
              className="rounded-full font-semibold"
            >
              Publicar anuncio gratis
            </Button>
            <Button
              render={<Link href="/anuncios" />}
              nativeButton={false}
              size="lg"
              variant="outline"
              className="rounded-full font-semibold"
            >
              Ver categorías
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-4">
            <Stat value={String(listings.length)} label="anuncios activos" />
            <Stat value={String(categories.length)} label="categorías" />
            <Stat value="$0" label="para publicar" />
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="mx-auto w-full max-w-6xl px-4 py-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Categorías
        </h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/anuncios?categoria=${c.slug}`}
              className="rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Anuncios recientes */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-16 pt-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Anuncios recientes
          </h2>
          <Link href="/anuncios" className="text-sm font-medium text-primary hover:underline">
            Ver todos →
          </Link>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isLoggedIn={isLoggedIn} saved={savedIds.has(listing.id)} />
          ))}
        </div>
      </section>

      {/* Numeros de escala: prueba social inmediata, se muestran solo si hay
          algo real que mostrar (no "0 negocios · 0 reseñas" apenas arranca). */}
      {(stats.businessesCount > 0 || stats.reviewsCount > 0) && (
        <section className="border-t border-border/70 bg-secondary/30">
          <div className="mx-auto flex max-w-6xl flex-wrap gap-x-12 gap-y-4 px-4 py-10">
            <Stat value={String(stats.businessesCount)} label="negocios en Paseo Textil" />
            <Stat value={String(stats.reviewsCount)} label="reseñas de clientes reales" />
            <Stat value={String(categories.length)} label="categorías" />
            {stats.newBusinessesThisWeek > 0 && (
              <Stat value={String(stats.newBusinessesThisWeek)} label="negocios nuevos esta semana" />
            )}
          </div>
        </section>
      )}

      {/* Contanos que necesitas: formulario general, independiente del de
          cotizacion de cada anuncio. Muestra hasta 5 resultados al toque. */}
      <section className="border-t border-border/70">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">¿No encontrás lo que buscás?</p>
          <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl">Contanos qué necesitás</h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Describilo en pocas palabras y te mostramos al toque los anuncios que más se acercan.
          </p>
          <div className="mt-6 max-w-2xl">
            <NecesidadForm categories={categories} />
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-black tracking-tight">{value}</p>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  );
}
