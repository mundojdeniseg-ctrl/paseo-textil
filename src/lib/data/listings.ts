import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import * as mock from "@/lib/data/listings-mock";
import { BusinessProfile, Category, Listing, ListingImage } from "@/lib/types/domain";
import { getReviewStatsMap } from "@/lib/data/reviews";

// Capa de datos: si hay credenciales reales de Supabase configuradas (.env.local),
// consulta la base real. Si no, sigue funcionando con datos de prueba en memoria
// (lib/data/listings-mock.ts) para que el sitio nunca se rompa en desarrollo.

export type ListingSort = "recientes" | "destacados" | "mejor_puntuados";

export type ListingFilters = {
  categorySlug?: string;
  query?: string;
  province?: string;
  city?: string;
  verifiedOnly?: boolean;
  sort?: ListingSort;
  minPrice?: number;
  maxPrice?: number;
};

function categoryName(name: unknown): string {
  if (name && typeof name === "object" && "es" in (name as Record<string, string>)) {
    return (name as Record<string, string>).es;
  }
  return String(name ?? "");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCategory(row: any): Category {
  return {
    id: row.id,
    slug: row.slug,
    name: categoryName(row.name),
    parentId: row.parent_id,
    sortOrder: row.sort_order,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapBusinessProfile(row: any): BusinessProfile | null {
  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    description: row.description,
    verificationStatus: row.verification_status,
    city: row.city,
    province: row.province,
    addressText: row.address_text ?? null,
    contactPhone: row.contact_phone,
    socialLinks: row.social_links ?? {},
    logoUrl: row.logo_url ?? null,
    isFeatured: row.is_featured ?? false,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapListing(row: any): Listing {
  return {
    id: row.id,
    userId: row.user_id,
    businessProfileId: row.business_profile_id,
    categoryId: row.category_id,
    title: row.title,
    description: row.description ?? "",
    attributes: row.attributes ?? {},
    priceWholesale: row.price_wholesale !== null ? Number(row.price_wholesale) : null,
    priceRetail: row.price_retail !== null ? Number(row.price_retail) : null,
    priceOnRequest: row.price_on_request,
    currencyCode: row.currency_code,
    city: row.city ?? "",
    province: row.province ?? "",
    countryCode: row.country_code,
    status: row.status,
    contactName: row.contact_name ?? null,
    contactPhone: row.contact_phone ?? null,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    images: (row.images ?? []).map(
      (img: { id: string; listing_id: string; storage_path: string; position: number }): ListingImage => ({
        id: img.id,
        listingId: img.listing_id,
        storagePath: img.storage_path,
        position: img.position,
      })
    ),
    category: row.category ? mapCategory(row.category) : undefined,
    businessProfile: mapBusinessProfile(row.business_profile),
    seller: row.seller
      ? { id: row.user_id, displayName: row.seller.display_name || "Usuario de Paseo Textil", avatarUrl: row.seller.avatar_url }
      : null,
  };
}

export async function getListings(filters: ListingFilters = {}): Promise<Listing[]> {
  if (!isSupabaseConfigured()) return mock.getListings(filters);

  const supabase = await createClient();
  let query = supabase
    .from("listings")
    .select("*, category:categories(*), business_profile:business_profiles(*), images:listing_images(*)")
    .eq("status", "activo")
    .order("created_at", { ascending: false });

  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (filters.province) query = query.eq("province", filters.province);
  if (filters.city) query = query.ilike("city", `%${filters.city}%`);
  if (filters.query) query = query.textSearch("search_vector", filters.query, { type: "websearch" });

  const { data, error } = await query;
  if (error) {
    console.error("getListings error:", error.message);
    return [];
  }

  let listings = (data ?? []).map(mapListing);

  // "Solo verificados" se filtra en JS (no via el join embebido de Supabase,
  // que con relaciones opcionales puede comportarse como inner join).
  if (filters.verifiedOnly) {
    listings = listings.filter((l) => l.businessProfile?.verificationStatus === "verificado");
  }

  // Precio (CUANTO): se compara contra el precio "efectivo" que ve el
  // usuario en la tarjeta (minorista si hay, si no mayorista). Un anuncio
  // a consultar o sin ningun precio cargado no puede matchear un rango.
  if (filters.minPrice != null || filters.maxPrice != null) {
    listings = listings.filter((l) => {
      if (l.priceOnRequest) return false;
      const price = l.priceRetail ?? l.priceWholesale;
      if (price == null) return false;
      if (filters.minPrice != null && price < filters.minPrice) return false;
      if (filters.maxPrice != null && price > filters.maxPrice) return false;
      return true;
    });
  }

  // Reseñas: se calculan aparte (no vienen del join) y se pegan al
  // businessProfile de cada anuncio, para mostrar estrellas en la card y
  // habilitar el orden "mejor puntuados".
  const businessIds = Array.from(
    new Set(listings.map((l) => l.businessProfile?.id).filter((id): id is string => Boolean(id)))
  );
  if (businessIds.length > 0) {
    const stats = await getReviewStatsMap(businessIds);
    listings = listings.map((l) =>
      l.businessProfile
        ? {
            ...l,
            businessProfile: {
              ...l.businessProfile,
              reviewsAverage: stats[l.businessProfile.id]?.average ?? null,
              reviewsCount: stats[l.businessProfile.id]?.count ?? 0,
            },
          }
        : l
    );
  }

  if (filters.sort === "destacados") {
    listings.sort((a, b) => Number(b.businessProfile?.isFeatured ?? false) - Number(a.businessProfile?.isFeatured ?? false));
  } else if (filters.sort === "mejor_puntuados") {
    listings.sort((a, b) => (b.businessProfile?.reviewsAverage ?? 0) - (a.businessProfile?.reviewsAverage ?? 0));
  }

  return listings;
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (!isSupabaseConfigured()) return mock.getListingById(id);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select(
      "*, category:categories(*), business_profile:business_profiles(*), images:listing_images(*), seller:users(display_name, avatar_url)"
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapListing(data);
}

export async function getListingsByUser(userId: string): Promise<Listing[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, category:categories(*), business_profile:business_profiles(*), images:listing_images(*)")
    .eq("user_id", userId)
    .eq("status", "activo")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getListingsByUser error:", error.message);
    return [];
  }
  return (data ?? []).map(mapListing);
}

// A diferencia de getListingsByUser (perfil publico, solo activos), esta
// trae TODOS los estados -- es para el propio dueno en "Mis anuncios".
export async function getMyListings(userId: string): Promise<Listing[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, category:categories(*), business_profile:business_profiles(*), images:listing_images(*)")
    .eq("user_id", userId)
    .neq("status", "eliminado")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyListings error:", error.message);
    return [];
  }
  return (data ?? []).map(mapListing);
}

export async function getCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured()) return mock.getCategories();

  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) {
    console.error("getCategories error:", error.message);
    return [];
  }
  return (data ?? []).map(mapCategory);
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  if (!isSupabaseConfigured()) return mock.getCategoryBySlug(slug);

  const supabase = await createClient();
  const { data, error } = await supabase.from("categories").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return mapCategory(data);
}
