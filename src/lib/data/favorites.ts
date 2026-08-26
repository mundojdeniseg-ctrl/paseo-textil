import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Listing, BusinessProfile, SavedItemType } from "@/lib/types/domain";
import { mapBusinessProfileRow } from "@/lib/data/profiles";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapListingRow(row: any): Listing {
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
      (img: { id: string; listing_id: string; storage_path: string; position: number }) => ({
        id: img.id,
        listingId: img.listing_id,
        storagePath: img.storage_path,
        position: img.position,
      })
    ),
    category: row.category ?? undefined,
    businessProfile: row.business_profile ? mapBusinessProfileRow(row.business_profile) : null,
  };
}

// Ids guardados por el usuario para un tipo, en bloque -- para que las
// paginas que listan muchas cards puedan marcar "guardado" sin N consultas.
export async function getSavedIds(userId: string, targetType: SavedItemType): Promise<Set<string>> {
  if (!isSupabaseConfigured()) return new Set();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("saved_items")
    .select("target_id")
    .eq("user_id", userId)
    .eq("target_type", targetType);

  if (error) return new Set();
  return new Set((data ?? []).map((r) => r.target_id as string));
}

export async function getSavedListings(userId: string): Promise<Listing[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data: saved, error: savedError } = await supabase
    .from("saved_items")
    .select("target_id, created_at")
    .eq("user_id", userId)
    .eq("target_type", "listing")
    .order("created_at", { ascending: false });

  if (savedError || !saved || saved.length === 0) return [];

  const ids = saved.map((s) => s.target_id);
  const { data, error } = await supabase
    .from("listings")
    .select("*, category:categories(*), business_profile:business_profiles(*), images:listing_images(*)")
    .in("id", ids);

  if (error) return [];
  const listingsById = new Map((data ?? []).map((row) => [row.id, mapListingRow(row)]));
  // Se preserva el orden de guardado (mas reciente primero), no el orden de la query IN.
  return ids.map((id) => listingsById.get(id)).filter((l): l is Listing => Boolean(l));
}

export async function getSavedBusinesses(userId: string): Promise<BusinessProfile[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data: saved, error: savedError } = await supabase
    .from("saved_items")
    .select("target_id, created_at")
    .eq("user_id", userId)
    .eq("target_type", "business")
    .order("created_at", { ascending: false });

  if (savedError || !saved || saved.length === 0) return [];

  const ids = saved.map((s) => s.target_id);
  const { data, error } = await supabase.from("business_profiles").select("*").in("id", ids);
  if (error) return [];

  const businessesById = new Map((data ?? []).map((row) => [row.id, mapBusinessProfileRow(row)]));
  return ids.map((id) => businessesById.get(id)).filter((b): b is BusinessProfile => Boolean(b));
}
