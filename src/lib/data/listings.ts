import { getStoreCategories, getStoreListings } from "@/lib/data/store";
import { Listing } from "@/lib/types/domain";

// Capa de datos: hoy lee del store en memoria (lib/data/store.ts), mañana estas
// mismas firmas van a consultar Supabase. El resto de la app no deberia importar
// mock-data.ts ni store.ts directamente, solo estas funciones.

export type ListingFilters = {
  categorySlug?: string;
  query?: string;
  province?: string;
};

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  let results = getStoreListings().filter((l) => l.status === "activo");

  if (filters.categorySlug) {
    results = results.filter((l) => l.category?.slug === filters.categorySlug);
  }

  if (filters.province) {
    results = results.filter((l) => l.province === filters.province);
  }

  if (filters.query) {
    const q = filters.query.toLowerCase();
    results = results.filter(
      (l) => l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q)
    );
  }

  return [...results].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getListingById(id: string): Promise<Listing | null> {
  return getStoreListings().find((l) => l.id === id) ?? null;
}

export async function getCategories() {
  return [...getStoreCategories()].sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getCategoryBySlug(slug: string) {
  return getStoreCategories().find((c) => c.slug === slug) ?? null;
}
