"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type MessageActionState = { ok: boolean; message: string } | null;

export async function sendMessageAction(
  _prevState: MessageActionState,
  formData: FormData
): Promise<MessageActionState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Los mensajes todavía no están disponibles en este entorno." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Tenés que ingresar a tu cuenta para mandar mensajes." };
  }

  const recipientId = String(formData.get("recipientId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const listingId = String(formData.get("listingId") ?? "") || null;

  if (!recipientId || recipientId === user.id) {
    return { ok: false, message: "No se pudo enviar el mensaje." };
  }
  if (!body) {
    return { ok: false, message: "Escribí algo antes de enviar." };
  }

  const { error } = await supabase
    .from("messages")
    .insert({ sender_id: user.id, recipient_id: recipientId, body, listing_id: listingId });

  if (error) {
    return { ok: false, message: `No se pudo enviar: ${error.message}` };
  }

  revalidatePath(`/mensajes/${recipientId}`);
  revalidatePath("/mensajes");
  return { ok: true, message: "" };
}
