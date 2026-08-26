import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { BusinessReview } from "@/lib/types/domain";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapReview(row: any): BusinessReview {
  return {
    id: row.id,
    businessProfileId: row.business_profile_id,
    reviewerId: row.reviewer_id,
    reviewerName: row.reviewer?.display_name || "Usuario de Paseo Textil",
    reviewerAvatarUrl: row.reviewer?.avatar_url ?? null,
    rating: row.rating,
    body: row.body,
    createdAt: row.created_at,
  };
}

export async function getReviewsForBusiness(businessProfileId: string): Promise<BusinessReview[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_reviews")
    .select("*, reviewer:users(display_name, avatar_url)")
    .eq("business_profile_id", businessProfileId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getReviewsForBusiness error:", error.message);
    return [];
  }
  return (data ?? []).map(mapReview);
}

export async function getMyReviewForBusiness(
  businessProfileId: string,
  userId: string
): Promise<BusinessReview | null> {
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_reviews")
    .select("*, reviewer:users(display_name, avatar_url)")
    .eq("business_profile_id", businessProfileId)
    .eq("reviewer_id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return mapReview(data);
}

export type ReviewStats = { average: number; count: number };

// Se computa en JS (no via agregacion SQL) para mantener el mismo estilo
// simple que el resto de la capa de datos.
export async function getReviewStatsMap(businessProfileIds: string[]): Promise<Record<string, ReviewStats>> {
  if (!isSupabaseConfigured() || businessProfileIds.length === 0) return {};

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("business_reviews")
    .select("business_profile_id, rating")
    .in("business_profile_id", businessProfileIds);

  if (error) {
    console.error("getReviewStatsMap error:", error.message);
    return {};
  }

  const totals: Record<string, { sum: number; count: number }> = {};
  for (const row of data ?? []) {
    const id = row.business_profile_id as string;
    if (!totals[id]) totals[id] = { sum: 0, count: 0 };
    totals[id].sum += row.rating as number;
    totals[id].count += 1;
  }

  const result: Record<string, ReviewStats> = {};
  for (const [id, { sum, count }] of Object.entries(totals)) {
    result[id] = { average: Math.round((sum / count) * 10) / 10, count };
  }
  return result;
}

export async function getReviewStatsForBusiness(businessProfileId: string): Promise<ReviewStats> {
  const map = await getReviewStatsMap([businessProfileId]);
  return map[businessProfileId] ?? { average: 0, count: 0 };
}

export async function getTotalReviewsCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;
  const supabase = await createClient();
  const { count, error } = await supabase.from("business_reviews").select("*", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}
