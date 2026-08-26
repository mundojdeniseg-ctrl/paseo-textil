"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SavedItemType } from "@/lib/types/domain";

export type ToggleSavedResult = { ok: boolean; saved: boolean; message?: string };

export async function toggleSavedAction(targetType: SavedItemType, targetId: string): Promise<ToggleSavedResult> {
  if (!isSupabaseConfigured()) return { ok: false, saved: false, message: "No disponible en este entorno." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, saved: false, message: "Iniciá sesión para guardar." };

  const { data: existing } = await supabase
    .from("saved_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase.from("saved_items").delete().eq("id", existing.id);
    if (error) return { ok: false, saved: true, message: error.message };
    revalidatePath("/guardados");
    return { ok: true, saved: false };
  }

  const { error } = await supabase
    .from("saved_items")
    .insert({ user_id: user.id, target_type: targetType, target_id: targetId });
  if (error) return { ok: false, saved: false, message: error.message };
  revalidatePath("/guardados");
  return { ok: true, saved: true };
}
