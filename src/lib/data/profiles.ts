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
