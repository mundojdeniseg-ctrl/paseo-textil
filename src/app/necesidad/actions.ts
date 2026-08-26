"use server";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getCategoryBySlug, getListings } from "@/lib/data/listings";
import { Listing } from "@/lib/types/domain";

export type SearchRequestState =
  | { ok: true; results: Listing[] }
  | { ok: false; message: string }
  | null;

const MAX_RESULTS = 5;

export async function submitSearchRequestAction(
  _prevState: SearchRequestState,
  formData: FormData
): Promise<SearchRequestState> {
  const description = String(formData.get("description") ?? "").trim();
  const categorySlug = String(formData.get("category") ?? "").trim();
  const zone = String(formData.get("zone") ?? "").trim();
  const requesterName = String(formData.get("requesterName") ?? "").trim();
  const requesterContact = String(formData.get("requesterContact") ?? "").trim();

  if (!description) {
    return { ok: false, message: "Contanos brevemente qué necesitás." };
  }

  const category = categorySlug ? await getCategoryBySlug(categorySlug) : null;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.from("search_requests").insert({
      description,
      category_id: category?.id ?? null,
      zone: zone || null,
      requester_name: requesterName || null,
      requester_contact: requesterContact || null,
    });
    if (error) {
      console.error("submitSearchRequestAction insert error:", error.message);
    }
  }

  // Matchea por categoria + zona; si no hay resultado, afloja el filtro en
  // vez de devolver la pantalla vacia -- primero sin zona, despues sin nada.
  let results = await getListings({ categorySlug: categorySlug || undefined, city: zone || undefined });
  if (results.length === 0 && categorySlug) {
    results = await getListings({ categorySlug });
  }
  if (results.length === 0) {
    results = await getListings({});
  }

  return { ok: true, results: results.slice(0, MAX_RESULTS) };
}
