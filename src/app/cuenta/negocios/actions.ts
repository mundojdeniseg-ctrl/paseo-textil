"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type BusinessActionState = { ok: false; message: string } | null;

async function uploadLogo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  businessId: string,
  file: File
): Promise<string | null> {
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const storagePath = `${userId}/business-${businessId}.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(storagePath, file, { contentType: file.type, upsert: true });
  if (error) return null;
  return storagePath;
}

function readForm(formData: FormData) {
  const acceptsOwnPatternsRaw = String(formData.get("acceptsOwnPatterns") ?? "no_especifica");
  return {
    businessName: String(formData.get("businessName") ?? "").trim(),
    businessPhone: String(formData.get("businessPhone") ?? "").trim(),
    businessEmail: String(formData.get("businessEmail") ?? "").trim(),
    businessAddress: String(formData.get("businessAddress") ?? "").trim(),
    isFeatured: formData.get("isFeatured") === "on",
    logo: formData.get("logo"),
    hoursText: String(formData.get("hoursText") ?? "").trim(),
    minProduction: String(formData.get("minProduction") ?? "").trim(),
    leadTime: String(formData.get("leadTime") ?? "").trim(),
    fabricTypes: String(formData.get("fabricTypes") ?? "").trim(),
    acceptsOwnPatterns: acceptsOwnPatternsRaw === "no_especifica" ? null : acceptsOwnPatternsRaw === "si",
    acceptsOrders: formData.get("acceptsOrders") === "on",
  };
}

// Solo un negocio puede ser "principal" por cuenta: al marcar uno, se
// desmarcan todos los demas del mismo usuario.
async function unfeatureOtherBusinesses(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  exceptBusinessId: string
) {
  await supabase
    .from("business_profiles")
    .update({ is_featured: false })
    .eq("user_id", userId)
    .neq("id", exceptBusinessId);
}

export async function createBusinessAction(
  _prevState: BusinessActionState,
  formData: FormData
): Promise<BusinessActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "No disponible en este entorno." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Tu sesión expiró, volvé a ingresar." };

  const {
    businessName,
    businessPhone,
    businessEmail,
    businessAddress,
    isFeatured,
    logo,
    hoursText,
    minProduction,
    leadTime,
    fabricTypes,
    acceptsOwnPatterns,
    acceptsOrders,
  } = readForm(formData);
  if (!businessName || !businessPhone) {
    return { ok: false, message: "El nombre y el WhatsApp del negocio son obligatorios." };
  }

  const { data: business, error } = await supabase
    .from("business_profiles")
    .insert({
      user_id: user.id,
      business_name: businessName,
      contact_phone: businessPhone,
      social_links: businessEmail ? { email: businessEmail } : {},
      address_text: businessAddress || null,
      is_featured: isFeatured,
      hours_text: hoursText || null,
      min_production: minProduction || null,
      lead_time: leadTime || null,
      fabric_types: fabricTypes || null,
      accepts_own_patterns: acceptsOwnPatterns,
      accepts_orders: acceptsOrders,
    })
    .select("id")
    .single();

  if (error || !business) {
    return { ok: false, message: `No se pudo crear el negocio: ${error?.message}` };
  }

  if (isFeatured) {
    await unfeatureOtherBusinesses(supabase, user.id, business.id);
  }

  if (logo instanceof File && logo.size > 0) {
    const storagePath = await uploadLogo(supabase, user.id, business.id, logo);
    if (storagePath) {
      await supabase.from("business_profiles").update({ logo_url: storagePath }).eq("id", business.id);
    }
  }

  revalidatePath("/cuenta/negocios");
  redirect("/cuenta/negocios");
}

export async function updateBusinessAction(
  _prevState: BusinessActionState,
  formData: FormData
): Promise<BusinessActionState> {
  if (!isSupabaseConfigured()) return { ok: false, message: "No disponible en este entorno." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Tu sesión expiró, volvé a ingresar." };

  const businessId = String(formData.get("businessId") ?? "");
  const {
    businessName,
    businessPhone,
    businessEmail,
    businessAddress,
    isFeatured,
    logo,
    hoursText,
    minProduction,
    leadTime,
    fabricTypes,
    acceptsOwnPatterns,
    acceptsOrders,
  } = readForm(formData);
  if (!businessId || !businessName || !businessPhone) {
    return { ok: false, message: "El nombre y el WhatsApp del negocio son obligatorios." };
  }

  const update: {
    business_name: string;
    contact_phone: string;
    social_links: Record<string, string>;
    address_text: string | null;
    is_featured: boolean;
    logo_url?: string;
    hours_text: string | null;
    min_production: string | null;
    lead_time: string | null;
    fabric_types: string | null;
    accepts_own_patterns: boolean | null;
    accepts_orders: boolean;
    updated_at: string;
  } = {
    business_name: businessName,
    contact_phone: businessPhone,
    social_links: businessEmail ? { email: businessEmail } : {},
    address_text: businessAddress || null,
    is_featured: isFeatured,
    hours_text: hoursText || null,
    min_production: minProduction || null,
    lead_time: leadTime || null,
    fabric_types: fabricTypes || null,
    accepts_own_patterns: acceptsOwnPatterns,
    accepts_orders: acceptsOrders,
    updated_at: new Date().toISOString(),
  };

  if (logo instanceof File && logo.size > 0) {
    const storagePath = await uploadLogo(supabase, user.id, businessId, logo);
    if (storagePath) update.logo_url = storagePath;
  }

  const { error } = await supabase
    .from("business_profiles")
    .update(update)
    .eq("id", businessId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: `No se pudo guardar: ${error.message}` };
  }

  if (isFeatured) {
    await unfeatureOtherBusinesses(supabase, user.id, businessId);
  }

  revalidatePath("/cuenta/negocios");
  redirect("/cuenta/negocios");
}

export async function deleteBusinessAction(businessId: string): Promise<{ ok: boolean; message?: string }> {
  if (!isSupabaseConfigured()) return { ok: false, message: "No disponible en este entorno." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "Tu sesión expiró." };

  const { error } = await supabase
    .from("business_profiles")
    .delete()
    .eq("id", businessId)
    .eq("user_id", user.id);

  if (error) return { ok: false, message: error.message };

  revalidatePath("/cuenta/negocios");
  return { ok: true };
}
