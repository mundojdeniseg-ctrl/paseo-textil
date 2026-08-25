"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { addStoreListing, getStoreCategories } from "@/lib/data/store";
import { Listing } from "@/lib/types/domain";

export type PublishActionState = { ok: false; message: string } | null;

const MAX_PHOTOS = 8;

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
  const isBusiness = formData.get("isBusiness") === "on";
  const businessName = String(formData.get("businessName") ?? "").trim();
  const businessId = String(formData.get("businessId") ?? "").trim();
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
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    if (categoryError || !category) {
      return { ok: false, message: "Elegí una categoría válida." };
    }

    // Un usuario logueado puede tener varios negocios: si eligió uno
    // existente del selector, lo reutiliza (validando que sea suyo). Si no,
    // crea uno nuevo -- tanto para el usuario logueado como para invitados.
    let businessProfileId: string | null = null;
    if (businessId && businessId !== "new" && user) {
      const { data: existing } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (existing) businessProfileId = existing.id;
    } else if (businessName) {
      const { data: bp, error: bpError } = await supabase
        .from("business_profiles")
        .insert({
          user_id: user?.id ?? null,
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

    // El usuario tildó "Publico como negocio" pero no se pudo resolver un
    // negocio (nombre vacío, o el elegido ya no existe/no es suyo): mejor
    // avisar que publicar en silencio como anuncio personal.
    if (isBusiness && !businessProfileId) {
      return {
        ok: false,
        message: "No pudimos asociar tu negocio al anuncio. Elegí uno de la lista o escribí un nombre.",
      };
    }

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .insert({
        user_id: user?.id ?? null,
        guest_edit_token: user ? null : crypto.randomUUID(),
        business_profile_id: businessProfileId,
        category_id: category.id,
        title,
        description,
        price_wholesale: priceWholesale,
        price_retail: priceRetail,
        price_on_request: priceOnRequest,
        city,
        province,
        // Se guardan siempre, tenga o no perfil de negocio: son el unico
        // canal de contacto para un anuncio de invitado sin negocio, que
        // antes se perdian por completo.
        contact_name: contactName,
        contact_phone: contactPhone,
      })
      .select("id")
      .single();

    if (listingError || !listing) {
      return { ok: false, message: `No se pudo publicar el anuncio: ${listingError?.message}` };
    }
    newListingId = listing.id;

    const photos = formData
      .getAll("photos")
      .filter((f): f is File => f instanceof File && f.size > 0)
      .slice(0, MAX_PHOTOS);

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
      contactName,
      contactPhone,
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
            addressText: null,
            contactPhone,
            socialLinks: {},
            logoUrl: null,
            isFeatured: false,
          }
        : null,
    };
    addStoreListing(listing);
    newListingId = id;
  }

  redirect(`/anuncios/${newListingId}?publicado=1`);
}

export type UpdateListingActionState = { ok: false; message: string } | null;

export async function updateListingAction(
  _prevState: UpdateListingActionState,
  formData: FormData
): Promise<UpdateListingActionState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "No disponible en este entorno." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Tu sesión expiró, volvé a ingresar." };
  }

  const listingId = String(formData.get("listingId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categorySlug = String(formData.get("category") ?? "");
  const city = String(formData.get("city") ?? "").trim();
  const province = String(formData.get("province") ?? "").trim();
  const priceMode = String(formData.get("priceMode") ?? "consultar");
  const priceRetailRaw = String(formData.get("priceRetail") ?? "");
  const priceWholesaleRaw = String(formData.get("priceWholesale") ?? "");

  if (!listingId || !title || !description || !categorySlug || !city || !province) {
    return { ok: false, message: "Completá título, descripción, categoría y ubicación." };
  }

  const { data: category, error: categoryError } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .maybeSingle();
  if (categoryError || !category) {
    return { ok: false, message: "Elegí una categoría válida." };
  }

  const priceWholesale = priceMode === "precio" && priceWholesaleRaw ? Number(priceWholesaleRaw) : null;
  const priceRetail = priceMode === "precio" && priceRetailRaw ? Number(priceRetailRaw) : null;
  const priceOnRequest = priceMode === "consultar";

  const updatePayload: {
    category_id: string;
    title: string;
    description: string;
    price_wholesale: number | null;
    price_retail: number | null;
    price_on_request: boolean;
    city: string;
    province: string;
    business_profile_id?: string | null;
  } = {
    category_id: category.id,
    title,
    description,
    price_wholesale: priceWholesale,
    price_retail: priceRetail,
    price_on_request: priceOnRequest,
    city,
    province,
  };

  // El selector de negocio solo se renderiza si el usuario tiene alguno; si
  // el campo no vino en el form, se deja business_profile_id como estaba.
  const businessIdRaw = formData.get("businessId");
  if (businessIdRaw !== null) {
    const businessId = String(businessIdRaw);
    if (businessId === "none") {
      updatePayload.business_profile_id = null;
    } else {
      const { data: existing } = await supabase
        .from("business_profiles")
        .select("id")
        .eq("id", businessId)
        .eq("user_id", user.id)
        .maybeSingle();
      if (!existing) {
        return { ok: false, message: "Ese negocio no es válido." };
      }
      updatePayload.business_profile_id = existing.id;
    }
  }

  const { data: updated, error: updateError } = await supabase
    .from("listings")
    .update(updatePayload)
    .eq("id", listingId)
    .eq("user_id", user.id)
    .select("id")
    .maybeSingle();

  if (updateError || !updated) {
    return { ok: false, message: "No se pudo guardar el anuncio." };
  }

  const { count: existingCount } = await supabase
    .from("listing_images")
    .select("id", { count: "exact", head: true })
    .eq("listing_id", listingId);

  let position = existingCount ?? 0;
  const remainingSlots = Math.max(0, MAX_PHOTOS - position);
  const photos = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, remainingSlots);

  for (const file of photos) {
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storagePath = `${listingId}/${position}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(storagePath, file, { contentType: file.type, upsert: false });
    if (!uploadError) {
      await supabase.from("listing_images").insert({ listing_id: listingId, storage_path: storagePath, position });
      position++;
    }
  }

  redirect(`/anuncios/${listingId}?actualizado=1`);
}

export async function deleteListingImageAction(
  imageId: string,
  storagePath: string,
  listingId: string
): Promise<{ ok: boolean }> {
  if (!isSupabaseConfigured()) return { ok: false };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  // Chequeo de propiedad propio ademas de la RLS: la accion no debe confiar
  // solo en la policy de la base para saber si el que pide el borrado es el
  // dueno del anuncio.
  const { data: listing } = await supabase
    .from("listings")
    .select("id")
    .eq("id", listingId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!listing) return { ok: false };

  const { error } = await supabase.from("listing_images").delete().eq("id", imageId);
  if (error) return { ok: false };

  await supabase.storage.from("listing-images").remove([storagePath]);
  revalidatePath(`/anuncios/${listingId}/editar`);
  return { ok: true };
}

export type ListingStatus = "activo" | "pausado" | "eliminado";

export async function setListingStatusAction(
  listingId: string,
  status: ListingStatus
): Promise<{ ok: boolean; message?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, message: "No disponible en este entorno." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Tu sesión expiró." };

  const { error } = await supabase
    .from("listings")
    .update({ status })
    .eq("id", listingId)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/mis-anuncios");
  return { ok: true };
}
