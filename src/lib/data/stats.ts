import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type PlatformStats = {
  businessesCount: number;
  reviewsCount: number;
  newBusinessesThisWeek: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  if (!isSupabaseConfigured()) {
    return { businessesCount: 0, reviewsCount: 0, newBusinessesThisWeek: 0 };
  }

  const supabase = await createClient();
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [{ count: businessesCount }, { count: reviewsCount }, { count: newBusinessesThisWeek }] = await Promise.all([
    supabase.from("business_profiles").select("*", { count: "exact", head: true }),
    supabase.from("business_reviews").select("*", { count: "exact", head: true }),
    supabase.from("business_profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo),
  ]);

  return {
    businessesCount: businessesCount ?? 0,
    reviewsCount: reviewsCount ?? 0,
    newBusinessesThisWeek: newBusinessesThisWeek ?? 0,
  };
}
