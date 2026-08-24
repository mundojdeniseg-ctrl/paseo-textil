import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { PublicProfile } from "@/lib/types/domain";

export async function getPublicProfile(userId: string): Promise<PublicProfile | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const [{ data: profile }, { data: businessProfile }] = await Promise.all([
    supabase
      .from("users")
      .select("id, display_name, phone, avatar_url, is_profile_public")
      .eq("id", userId)
      .maybeSingle(),
    supabase.from("business_profiles").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  if (!profile) return null;

  return {
    id: profile.id,
    displayName: profile.display_name || "Usuario de Paseo Textil",
    phone: profile.phone || null,
    avatarUrl: profile.avatar_url,
    isProfilePublic: profile.is_profile_public,
    businessProfile: businessProfile
      ? {
          id: businessProfile.id,
          userId: businessProfile.user_id,
          businessName: businessProfile.business_name,
          description: businessProfile.description,
          verificationStatus: businessProfile.verification_status,
          city: businessProfile.city,
          province: businessProfile.province,
          contactPhone: businessProfile.contact_phone,
          socialLinks: businessProfile.social_links ?? {},
          logoUrl: businessProfile.logo_url,
        }
      : null,
  };
}
