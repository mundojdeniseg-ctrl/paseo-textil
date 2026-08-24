"use server";

import { redirect } from "next/navigation";
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
    priceWholesale: priceMode === "precio" && priceWholesaleRaw ? Number(priceWholesaleRaw) : null,
    priceRetail: priceMode === "precio" && priceRetailRaw ? Number(priceRetailRaw) : null,
    priceOnRequest: priceMode === "consultar",
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
  redirect(`/anuncios/${id}?publicado=1`);
}
