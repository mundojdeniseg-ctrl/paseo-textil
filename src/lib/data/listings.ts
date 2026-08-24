import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import * as mock from "@/lib/data/listings-mock";
import { BusinessProfile, Category, Listing, ListingImage } from "@/lib/types/domain";

// Capa de datos: si hay credenciales reales de Supabase configuradas (.env.local),
// consulta la base real. Si no, sigue funcionando con datos de prueba en memoria
// (lib/data/listings-mock.ts) para que el sitio nunca se rompa en desarrollo.

export type ListingFilters = {
  categorySlug?: string;
  query?: string;
  province?: string;
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
    contactPhone: row.contact_phone,
    socialLinks: row.social_links ?? {},
    logoUrl: row.logo_url ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListing(row: any): Listing {
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
  if (filters.query) query = query.textSearch("search_vector", filters.query, { type: "websearch" });

  const { data, error } = await query;
  if (error) {
    console.error("getListings error:", error.message);
    return [];
  }
  return (data ?? []).map(mapListing);
}

export async function getListingById(id: string): Promise<Listing | null> {
  if (!isSupabaseConfigured()) return mock.getListingById(id);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, category:categories(*), business_profile:business_profiles(*), images:listing_images(*)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapListing(data);
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
