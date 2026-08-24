import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { getCategories, getListings } from "@/lib/data/listings";
import { cn } from "@/lib/utils";

export default async function AnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const { categoria, q } = await searchParams;
  const [listings, categories] = await Promise.all([
    getListings({ categorySlug: categoria, query: q }),
    getCategories(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
        {categoria
          ? categories.find((c) => c.slug === categoria)?.name ?? "Anuncios"
          : "Todos los anuncios"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {listings.length} anuncio{listings.length === 1 ? "" : "s"} activo{listings.length === 1 ? "" : "s"}
        {q ? ` para "${q}"` : ""}
      </p>

      <form action="/anuncios" className="mt-6 flex gap-2">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por título o descripción..."
          className="h-11 flex-1 rounded-full border border-border bg-background px-5 text-sm outline-none ring-primary/30 focus:ring-2"
        />
        <button
          type="submit"
          className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          Buscar
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={q ? `/anuncios?q=${encodeURIComponent(q)}` : "/anuncios"}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
            !categoria ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary"
          )}
        >
          Todas
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/anuncios?categoria=${c.slug}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              categoria === c.slug
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border hover:border-primary"
            )}
          >
            {c.name}
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <div className="mt-16 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="font-semibold">No hay anuncios que coincidan con esta búsqueda todavía.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sé el primero en publicar en esta categoría.
          </p>
          <Link
            href="/publicar"
            className="mt-4 inline-block rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Publicar anuncio
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
