import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BusinessProfile, PublicProfile } from "@/lib/types/domain";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapBusinessProfileRow(row: any): BusinessProfile {
  return {
    id: row.id,
    userId: row.user_id,
    businessName: row.business_name,
    description: row.description,
    verificationStatus: row.verification_status,
    city: row.city,
    province: row.province,
    addressText: row.address_text,
    contactPhone: row.contact_phone,
    socialLinks: row.social_links ?? {},
    logoUrl: row.logo_url,
    isFeatured: row.is_featured ?? false,
    updatedAt: row.updated_at ?? undefined,
    hoursText: row.hours_text ?? null,
    minProduction: row.min_production ?? null,
    leadTime: row.lead_time ?? null,
    fabricTypes: row.fabric_types ?? null,
    acceptsOwnPatterns: row.accepts_own_patterns ?? null,
    acceptsOrders: row.accepts_orders ?? true,
  };
}

export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const [{ data: profile }, { data: businessRows }] = await Promise.all([
    supabase
      .from("users")
      .select("id, display_name, phone, avatar_url, cover_url, is_profile_public")
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("business_profiles")
      .select("*")
      .eq("user_id", userId)
      .order("is_featured", { ascending: false })
      .order("created_at"),
  ]);

  if (!profile) return null;

  return {
    id: profile.id,
    displayName: profile.display_name || "Usuario de Paseo Textil",
    phone: profile.phone || null,
    avatarUrl: profile.avatar_url,
    coverUrl: profile.cover_url,
    isProfilePublic: profile.is_profile_public,
    businessProfiles: (businessRows ?? []).map(mapBusinessProfileRow),
  };
}

export async function getMyBusinesses(userId: string): Promise<BusinessProfile[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", userId)
    .order("is_featured", { ascending: false })
    .order("created_at");

  if (error) {
    console.error("getMyBusinesses error:", error.message);
    return [];
  }
  return (data ?? []).map(mapBusinessProfileRow);
}

export async function getBusinessById(id: string): Promise<BusinessProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("business_profiles").select("*").eq("id", id).maybeSingle();
  if (error || !data) return null;
  return mapBusinessProfileRow(data);
}

// "Negocios similares": primero busca otros negocios con anuncios activos en
// las mismas categorias que el negocio dado; si no encuentra nada (negocio
// sin anuncios, o categoria sin mas oferta), cae a otros negocios de la
// misma provincia. Nunca rompe si no hay datos -- devuelve lista vacia.
export async function getSimilarBusinesses(businessId: string, limit = 4): Promise<BusinessProfile[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data: self } = await supabase
    .from("business_profiles")
    .select("id, province")
    .eq("id", businessId)
    .maybeSingle();
  if (!self) return [];

  const { data: ownListings } = await supabase
    .from("listings")
    .select("category_id")
    .eq("business_profile_id", businessId)
    .eq("status", "activo");
  const categoryIds = Array.from(new Set((ownListings ?? []).map((l) => l.category_id).filter(Boolean)));

  let candidateIds: string[] = [];
  if (categoryIds.length > 0) {
    const { data: peers } = await supabase
      .from("listings")
      .select("business_profile_id")
      .in("category_id", categoryIds)
      .eq("status", "activo")
      .not("business_profile_id", "is", null)
      .neq("business_profile_id", businessId);
    candidateIds = Array.from(new Set((peers ?? []).map((p) => p.business_profile_id as string)));
  }

  let query = supabase.from("business_profiles").select("*").neq("id", businessId);
  if (candidateIds.length > 0) {
    query = query.in("id", candidateIds);
  } else if (self.province) {
    query = query.eq("province", self.province);
  } else {
    return [];
  }

  const { data, error } = await query
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getSimilarBusinesses error:", error.message);
    return [];
  }
  return (data ?? []).map(mapBusinessProfileRow);
}
