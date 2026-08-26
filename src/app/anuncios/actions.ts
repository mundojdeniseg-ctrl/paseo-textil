"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCategories, mapListing } from "@/lib/data/listings";
import * as mock from "@/lib/data/listings-mock";
import { Listing } from "@/lib/types/domain";

const LIVE_SEARCH_LIMIT = 6;

// Busqueda en vivo para el buscador global del header: por titulo,
// descripcion, ciudad, provincia o nombre de categoria. Se separa de
// getListings (que usa full-text search en español, pensado para el
// catalogo completo) porque acá conviene un ilike parcial para que
// funcione bien mientras el usuario todavia esta escribiendo.
export async function searchListingsLiveAction(rawQuery: string): Promise<Listing[]> {
  const query = rawQuery.trim();
  if (!query) return [];

  if (!isSupabaseConfigured()) {
    const q = query.toLowerCase();
    const all = await mock.getListings({});
    return all
      .filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.province.toLowerCase().includes(q) ||
          l.category?.name.toLowerCase().includes(q)
      )
      .slice(0, LIVE_SEARCH_LIMIT);
  }

  const supabase = await createClient();
  const categories = await getCategories();
  const lowerQuery = query.toLowerCase();
  const matchedCategoryIds = categories.filter((c) => c.name.toLowerCase().includes(lowerQuery)).map((c) => c.id);

  // Comas y parentesis rompen la sintaxis del .or() de PostgREST -- se
  // sacan porque tampoco aportan nada a una busqueda de texto libre.
  const safeQuery = query.replace(/[,()]/g, " ").trim();
  if (!safeQuery) return [];

  const orParts = [
    `title.ilike.%${safeQuery}%`,
    `description.ilike.%${safeQuery}%`,
    `city.ilike.%${safeQuery}%`,
    `province.ilike.%${safeQuery}%`,
  ];
  if (matchedCategoryIds.length > 0) {
    orParts.push(`category_id.in.(${matchedCategoryIds.join(",")})`);
  }

  const { data, error } = await supabase
    .from("listings")
    .select("*, category:categories(*), business_profile:business_profiles(*), images:listing_images(*)")
    .eq("status", "activo")
    .or(orParts.join(","))
    .order("created_at", { ascending: false })
    .limit(LIVE_SEARCH_LIMIT);

  if (error) {
    console.error("searchListingsLiveAction error:", error.message);
    return [];
  }
  return (data ?? []).map(mapListing);
}
