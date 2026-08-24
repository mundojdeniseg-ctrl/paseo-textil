"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { addStoreQuote } from "@/lib/data/store";

export type QuoteActionState = { ok: boolean; message: string } | null;

export async function submitQuoteAction(
  listingId: string,
  _prevState: QuoteActionState,
  formData: FormData
): Promise<QuoteActionState> {
  const requesterName = String(formData.get("requesterName") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  const requesterEmail = String(formData.get("requesterEmail") ?? "").trim();
  const requesterPhone = String(formData.get("requesterPhone") ?? "").trim();

  if (!requesterName || !message) {
    return { ok: false, message: "Completá tu nombre y el mensaje para poder enviar la cotización." };
  }
  if (!requesterEmail && !requesterPhone) {
    return { ok: false, message: "Dejanos un email o un teléfono para que te puedan responder." };
  }

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("quotes").insert({
      listing_id: listingId,
      requester_name: requesterName,
      requester_email: requesterEmail || null,
      requester_phone: requesterPhone || null,
      message,
    });
    if (error) {
      return { ok: false, message: `No se pudo enviar la cotización: ${error.message}` };
    }
  } else {
    addStoreQuote({
      listingId,
      requesterName,
      requesterEmail: requesterEmail || undefined,
      requesterPhone: requesterPhone || undefined,
      message,
    });
  }

  return { ok: true, message: "¡Listo! Le avisamos al publicador. Te va a contactar directamente." };
}
