"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type VerificationStatus = "verificado" | "rechazado" | "sin_verificar";

export async function setVerificationAction(businessId: string, status: VerificationStatus): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  // Doble chequeo: ademas de esto, la policy RLS "admin gestiona cualquier
  // perfil de negocio" es la que realmente bloquea el update si no sos admin.
  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") return { ok: false };

  const { error } = await supabase
    .from("business_profiles")
    .update({ verification_status: status })
    .eq("id", businessId);
  if (error) return { ok: false };

  revalidatePath("/admin");
  return { ok: true };
}
