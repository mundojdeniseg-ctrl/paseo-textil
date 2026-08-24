"use server";

import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Sube a bucket "avatars" bajo "{userId}/{kind}.ext" con upsert, asi una
// nueva foto siempre reemplaza a la anterior en vez de acumular archivos.
async function uploadProfileImage(
  supabase: SupabaseServerClient,
  userId: string,
  file: File,
  kind: "avatar" | "logo"
): Promise<string | null> {
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const storagePath = `${userId}/${kind}.${ext}`;
  const { error } = await supabase.storage
    .from("avatars")
    .upload(storagePath, file, { contentType: file.type, upsert: true });
  if (error) return null;
  return storagePath;
}

export type AuthActionState = { ok: false; message: string } | null;

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Las cuentas todavía no están disponibles en este entorno." };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const avatar = formData.get("avatar");

  if (!displayName || !phone || !email || !password) {
    return { ok: false, message: "Completá todos los campos para crear tu cuenta." };
  }
  if (password.length < 6) {
    return { ok: false, message: "La contraseña tiene que tener al menos 6 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { display_name: displayName, phone } },
  });

  if (error) {
    return { ok: false, message: `No se pudo crear la cuenta: ${error.message}` };
  }

  // Si la confirmacion de mail esta desactivada, signUp ya deja la sesion
  // activa y se puede subir la foto de una. Si no, el usuario la agrega
  // despues desde "Mi cuenta" (todavia no hay sesion para subir a storage).
  if (data.session && data.user && avatar instanceof File && avatar.size > 0) {
    const storagePath = await uploadProfileImage(supabase, data.user.id, avatar, "avatar");
    if (storagePath) {
      await supabase.from("users").update({ avatar_url: storagePath }).eq("id", data.user.id);
    }
  }

  redirect("/cuenta?bienvenido=1");
}

export async function signInAction(
  _prevState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Las cuentas todavía no están disponibles en este entorno." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { ok: false, message: "Completá tu email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, message: "Email o contraseña incorrectos." };
  }

  redirect("/cuenta");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export type ProfileActionState = { ok: boolean; message: string } | null;

export async function updateProfileAction(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Tu sesión expiró, volvé a ingresar." };
  }

  const displayName = String(formData.get("displayName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const avatar = formData.get("avatar");
  const isProfilePublic = formData.get("isProfilePublic") === "on";
  const hasBusiness = formData.get("hasBusiness") === "on";
  const businessName = String(formData.get("businessName") ?? "").trim();
  const businessPhone = String(formData.get("businessPhone") ?? "").trim();
  const businessEmail = String(formData.get("businessEmail") ?? "").trim();
  const businessAddress = String(formData.get("businessAddress") ?? "").trim();
  const logo = formData.get("logo");

  if (!displayName || !phone) {
    return { ok: false, message: "Completá tu nombre y teléfono." };
  }

  const userUpdate: {
    id: string;
    display_name: string;
    phone: string;
    is_profile_public: boolean;
    avatar_url?: string;
  } = {
    id: user.id,
    display_name: displayName,
    phone,
    is_profile_public: isProfilePublic,
  };
  if (avatar instanceof File && avatar.size > 0) {
    const storagePath = await uploadProfileImage(supabase, user.id, avatar, "avatar");
    if (storagePath) userUpdate.avatar_url = storagePath;
  }

  // Upsert en vez de update: si la fila no existe todavia (por ejemplo cuentas
  // creadas antes de que existiera el trigger de alta automatica) esto la crea
  // en vez de actualizar 0 filas en silencio.
  const { error: userError } = await supabase.from("users").upsert(userUpdate, { onConflict: "id" });
  if (userError) {
    return { ok: false, message: `No se pudo guardar tu perfil: ${userError.message}` };
  }

  if (hasBusiness) {
    if (!businessName || !businessPhone) {
      return { ok: false, message: "Para el perfil de negocio, el nombre y el WhatsApp son obligatorios." };
    }
    const businessUpdate: {
      user_id: string;
      business_name: string;
      contact_phone: string;
      social_links: Record<string, string>;
      address_text: string | null;
      logo_url?: string;
    } = {
      user_id: user.id,
      business_name: businessName,
      contact_phone: businessPhone,
      social_links: businessEmail ? { email: businessEmail } : {},
      address_text: businessAddress || null,
    };
    if (logo instanceof File && logo.size > 0) {
      const storagePath = await uploadProfileImage(supabase, user.id, logo, "logo");
      if (storagePath) businessUpdate.logo_url = storagePath;
    }
    const { error: bpError } = await supabase
      .from("business_profiles")
      .upsert(businessUpdate, { onConflict: "user_id" });
    if (bpError) {
      return { ok: false, message: `No se pudo guardar el perfil de negocio: ${bpError.message}` };
    }
  }

  return { ok: true, message: "Perfil actualizado." };
}
