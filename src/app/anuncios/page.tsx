import Link from "next/link";
import { ListingCard } from "@/components/listing-card";
import { getCategories, getListings, getCategoryBySlug, ListingSort } from "@/lib/data/listings";
import { getSavedIds } from "@/lib/data/favorites";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { FilterPanel } from "@/components/filter-panel";

const FILTERS_FORM_ID = "anuncios-filtros";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; q?: string }>;
}) {
  const { categoria, q } = await searchParams;
  const category = categoria ? await getCategoryBySlug(categoria) : null;
  const title = category
    ? `${category.name} — anuncios en Paseo Textil`
    : q
      ? `Anuncios para "${q}" — Paseo Textil`
      : "Todos los anuncios — Paseo Textil";
  return {
    title,
    description: category
      ? `Anuncios de ${category.name.toLowerCase()} publicados por talleres, proveedores y fabricantes textiles en Argentina.`
      : "Catálogo de anuncios textiles: moldería, confección, telas, insumos, maquinaria y servicios en toda Argentina.",
  };
}

export default async function AnunciosPage({
  searchParams,
}: {
  searchParams: Promise<{
    categoria?: string;
    q?: string;
    ciudad?: string;
    verificados?: string;
    orden?: string;
    precioMin?: string;
    precioMax?: string;
  }>;
}) {
  const { categoria, q, ciudad, verificados, orden, precioMin, precioMax } = await searchParams;
  const sort: ListingSort | undefined =
    orden === "destacados" || orden === "mejor_puntuados" ? orden : undefined;
  const verifiedOnly = verificados === "1";
  const minPrice = precioMin && !Number.isNaN(Number(precioMin)) ? Number(precioMin) : undefined;
  const maxPrice = precioMax && !Number.isNaN(Number(precioMax)) ? Number(precioMax) : undefined;

  const [listings, categories] = await Promise.all([
    getListings({ categorySlug: categoria, query: q, city: ciudad, verifiedOnly, sort, minPrice, maxPrice }),
    getCategories(),
  ]);

  // Para el contador del boton "Filtros" y para saber si mostrar "Limpiar filtros".
  const extraFiltersCount = [ciudad, verifiedOnly, sort, minPrice != null || maxPrice != null].filter(
    Boolean
  ).length;
  const hasAnyFilter = Boolean(categoria || q || extraFiltersCount > 0);

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

  // Los filtros extra (ciudad, orden, categoria, texto, precio) viajan como
  // hidden inputs en cada form/link para no perderse entre si.
  const baseParams: Record<string, string> = {};
  if (categoria) baseParams.categoria = categoria;
  if (q) baseParams.q = q;
  if (ciudad) baseParams.ciudad = ciudad;
  if (verifiedOnly) baseParams.verificados = "1";
  if (sort) baseParams.orden = sort;
  if (minPrice != null) baseParams.precioMin = String(minPrice);
  if (maxPrice != null) baseParams.precioMax = String(maxPrice);

  function hrefWith(overrides: Record<string, string | undefined>) {
    const params = { ...baseParams, ...overrides };
    const qs = Object.entries(params)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}=${encodeURIComponent(v!)}`)
      .join("&");
    return qs ? `/anuncios?${qs}` : "/anuncios";
  }

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

      <form id={FILTERS_FORM_ID} action="/anuncios" className="mt-6 flex flex-wrap items-center gap-2">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por título o descripción..."
          className="h-11 flex-1 min-w-[180px] rounded-full border border-border bg-background px-5 text-sm outline-none ring-primary/30 focus:ring-2"
        />

        <FilterPanel activeCount={extraFiltersCount} formId={FILTERS_FORM_ID}>
          <div>
            <label htmlFor="ciudad" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ciudad
            </label>
            <input
              id="ciudad"
              type="text"
              name="ciudad"
              form={FILTERS_FORM_ID}
              defaultValue={ciudad}
              placeholder="Ej: Rosario"
              className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Precio</span>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                name="precioMin"
                form={FILTERS_FORM_ID}
                defaultValue={minPrice ?? ""}
                placeholder="Mín."
                min={0}
                aria-label="Precio mínimo"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <span className="text-muted-foreground">–</span>
              <input
                type="number"
                name="precioMax"
                form={FILTERS_FORM_ID}
                defaultValue={maxPrice ?? ""}
                placeholder="Máx."
                min={0}
                aria-label="Precio máximo"
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label htmlFor="orden" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Ordenar por
            </label>
            <select
              id="orden"
              name="orden"
              form={FILTERS_FORM_ID}
              defaultValue={sort ?? "recientes"}
              className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            >
              <option value="recientes">Más nuevos</option>
              <option value="destacados">Destacados</option>
              <option value="mejor_puntuados">Mejor puntuados</option>
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="verificados"
              value="1"
              form={FILTERS_FORM_ID}
              defaultChecked={verifiedOnly}
              className="h-4 w-4 rounded"
            />
            Solo negocios verificados
          </label>
        </FilterPanel>

        {hasAnyFilter && (
          <Link href="/anuncios" className="text-sm text-muted-foreground underline hover:text-foreground">
            Limpiar filtros
          </Link>
        )}

        <button
          type="submit"
          className="h-11 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground"
        >
          Buscar
        </button>
      </form>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href={hrefWith({ categoria: undefined })}
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
            href={hrefWith({ categoria: c.slug })}
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
            <ListingCard key={listing.id} listing={listing} isLoggedIn={isLoggedIn} saved={savedIds.has(listing.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
