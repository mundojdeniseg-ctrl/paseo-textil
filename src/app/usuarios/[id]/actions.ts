"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type ReviewActionState = { ok: true } | { ok: false; message: string } | null;

// Upsert: si ya dejaste una reseña para este negocio, la actualiza en vez de
// duplicarla (hay un unique(business_profile_id, reviewer_id) en la base).
export async function submitReviewAction(
  _prevState: ReviewActionState,
  formData: FormData
): Promise<ReviewActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "No disponible en este entorno." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Iniciá sesión para dejar una reseña." };

  const businessProfileId = String(formData.get("businessProfileId") ?? "");
  const profilePath = String(formData.get("profilePath") ?? "");
  const rating = Number(formData.get("rating"));
  const body = String(formData.get("body") ?? "").trim();

  if (!businessProfileId || !rating || rating < 1 || rating > 5) {
    return { ok: false, message: "Elegí una calificación de 1 a 5 estrellas." };
  }

  const { error } = await supabase.from("business_reviews").upsert(
    { business_profile_id: businessProfileId, reviewer_id: user.id, rating, body: body || null },
    { onConflict: "business_profile_id,reviewer_id" }
  );

  if (error) {
    const message = error.message.includes("row-level security")
      ? "No podés dejar una reseña en tu propio negocio."
      : "No se pudo guardar tu reseña.";
    return { ok: false, message };
  }

  if (profilePath) revalidatePath(profilePath);
  return { ok: true };
}

export async function deleteReviewAction(reviewId: string, profilePath: string): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase.from("business_reviews").delete().eq("id", reviewId).eq("reviewer_id", user.id);
  if (error) return { ok: false };

  if (profilePath) revalidatePath(profilePath);
  return { ok: true };
}
