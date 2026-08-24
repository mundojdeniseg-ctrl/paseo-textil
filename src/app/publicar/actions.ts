"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { addStoreListing, getStoreCategories } from "@/lib/data/store";
import { Listing } from "@/lib/types/domain";

export type PublishActionState = { ok: false; message: string } | null;

function newId() {
  return `l-${Math.random().toString(36).slice(2, 10)}`;
}

export async function publishListingAction(
  _prevState: PublishActionState,
  formData: FormData
): Promise<PublishActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categorySlug = String(formData.get("category") ?? "");
  const city = String(formData.get("city") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const priceMode = String(formData.get("priceMode") ?? "consultar");
  const priceRetailRaw = String(formData.get("priceRetail") ?? "");
  const priceWholesaleRaw = String(formData.get("priceWholesale") ?? "");
  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const contactPhone = String(formData.get("contactPhone") ?? "").trim();

  if (!title || !description || !categorySlug || !city || !province) {
    return { ok: false, message: "Completá título, descripción, categoría y ubicación para publicar." };
  }
  if (!contactName || !contactPhone) {
    return { ok: false, message: "Dejanos tu nombre y un WhatsApp/teléfono de contacto." };
  }

  const priceWholesale = priceMode === "precio" && priceWholesaleRaw ? Number(priceWholesaleRaw) : null;
  const priceRetail = priceMode === "precio" && priceRetailRaw ? Number(priceRetailRaw) : null;
  const priceOnRequest = priceMode === "consultar";

  let newListingId: string;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    if (categoryError || !category) {
      return { ok: false, message: "Elegí una categoría válida." };
    }

    let businessProfileId: string | null = null;
    if (businessName) {
      const { data: bp, error: bpError } = await supabase
        .from("business_profiles")
        // user_id queda null: un negocio publicado como invitado (sin cuenta)
        // no tiene un usuario real al que enlazar todavía.
        .insert({
          user_id: null,
          business_name: businessName,
          city,
          province,
          contact_phone: contactPhone,
        })
        .select("id")
        .single();
      if (bpError) {
        return { ok: false, message: `No se pudo crear el perfil de negocio: ${bpError.message}` };
      }
      businessProfileId = bp.id;
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        user_id: null,
        guest_edit_token: crypto.randomUUID(),
        business_profile_id: businessProfileId,
        category_id: category.id,
        title,
        description,
        price_wholesale: priceWholesale,
        price_retail: priceRetail,
        price_on_request: priceOnRequest,
        city,
        province,
      })
      .select("id")
      .single();

    if (listingError || !listing) {
      return { ok: false, message: `No se pudo publicar el anuncio: ${listingError?.message}` };
    }
    newListingId = listing.id;

    const photos = formData
      .getAll("photos")
      .filter((f): f is File => f instanceof File && f.size > 0);

    for (let i = 0; i < photos.length; i++) {
      const file = photos[i];
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const storagePath = `${newListingId}/${i}-${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("listing-images")
        .upload(storagePath, file, { contentType: file.type, upsert: false });

      // Una foto que falla no debe tirar abajo la publicación del anuncio;
      // se ignora esa foto puntual y se sigue con las demás.
      if (!uploadError) {
        await supabase
          .from("listing_images")
          .insert({ listing_id: newListingId, storage_path: storagePath, position: i });
      }
    }
  } else {
    const category = getStoreCategories().find((c) => c.slug === categorySlug);
    if (!category) {
      return { ok: false, message: "Elegí una categoría válida." };
    }
    const id = newId();
    const now = new Date().toISOString();
    const listing: Listing = {
      id,
      userId: null,
      businessProfileId: businessName ? `bp-${id}` : null,
      categoryId: category.id,
      title,
      description,
      attributes: {},
      priceWholesale,
      priceRetail,
      priceOnRequest,
      currencyCode: "ARS",
      city,
      province,
      countryCode: "AR",
      status: "activo",
      createdAt: now,
      expiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      images: [],
      category,
      businessProfile: businessName
        ? {
            id: `bp-${id}`,
            userId: `u-${id}`,
            businessName,
            description: null,
            verificationStatus: "sin_verificar",
            city,
            province,
            contactPhone,
            socialLinks: {},
          }
        : null,
    };
    addStoreListing(listing);
    newListingId = id;
  }

  redirect(`/anuncios/${newListingId}?publicado=1`);
}
