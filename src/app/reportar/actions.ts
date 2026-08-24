"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export async function reportContentAction(
  targetType: "post" | "listing",
  targetId: string,
  reason: string
): Promise<{ ok: boolean; message?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "No disponible en este entorno." };
  }
  if (!reason.trim()) {
    return { ok: false, message: "Contanos brevemente qué está mal." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("reports").insert({
    target_type: targetType,
    target_id: targetId,
    reason: reason.trim(),
    reporter_id: user?.id ?? null,
  });

  if (error) {
    return { ok: false, message: "No se pudo enviar el reporte." };
  }
  return { ok: true };
}
