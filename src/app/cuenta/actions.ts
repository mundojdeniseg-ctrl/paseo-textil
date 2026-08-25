"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

async function siteOrigin() {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host");
  return `${proto}://${host}`;
}

// Sube a bucket "avatars" bajo "{userId}/{kind}.ext" con upsert, asi una
// nueva foto siempre reemplaza a la anterior en vez de acumular archivos.
async function uploadProfileImage(
  supabase: SupabaseServerClient,
  userId: string,
  file: File,
  kind: "avatar" | "logo" | "cover"
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
  // La cuenta ya quedo creada en este punto -- si la foto falla no hay que
  // tirar abajo el signup, pero tampoco redirigir como si nada avisando de
  // que la foto no se guardo.
  let avatarFailed = false;
  if (data.session && data.user && avatar instanceof File && avatar.size > 0) {
    const storagePath = await uploadProfileImage(supabase, data.user.id, avatar, "avatar");
    if (storagePath) {
      const { error: avatarError } = await supabase
        .from("users")
        .update({ avatar_url: storagePath })
        .eq("id", data.user.id);
      avatarFailed = Boolean(avatarError);
    } else {
      avatarFailed = true;
    }
  }

  redirect(avatarFailed ? "/cuenta?bienvenido=1&avatarError=1" : "/cuenta?bienvenido=1");
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

export type PasswordResetActionState = { ok: boolean; message: string } | null;

export async function requestPasswordResetAction(
  _prevState: PasswordResetActionState,
  formData: FormData
): Promise<PasswordResetActionState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Las cuentas todavía no están disponibles en este entorno." };
  }

  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { ok: false, message: "Ingresá tu email." };
  }

  const origin = await siteOrigin();
  const supabase = await createClient();
  // No se distingue error de "no existe esa cuenta" a proposito: evita que
  // alguien use este formulario para averiguar que emails estan registrados.
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/confirm?next=/cuenta/restablecer`,
  });

  return {
    ok: true,
    message: "Si ese email tiene una cuenta, te mandamos un link para elegir una contraseña nueva.",
  };
}

export async function updatePasswordAction(
  _prevState: PasswordResetActionState,
  formData: FormData
): Promise<PasswordResetActionState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "Las cuentas todavía no están disponibles en este entorno." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "El link venció o ya se usó. Pedí uno nuevo." };
  }

  const password = String(formData.get("password") ?? "");
  if (password.length < 6) {
    return { ok: false, message: "La contraseña tiene que tener al menos 6 caracteres." };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { ok: false, message: `No se pudo actualizar: ${error.message}` };
  }

  redirect("/cuenta?password=actualizada");
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
  const cover = formData.get("cover");
  const removeCover = formData.get("removeCover") === "on";
  const isProfilePublic = formData.get("isProfilePublic") === "on";

  if (!displayName || !phone) {
    return { ok: false, message: "Completá tu nombre y teléfono." };
  }

  const userUpdate: {
    id: string;
    display_name: string;
    phone: string;
    is_profile_public: boolean;
    avatar_url?: string;
    cover_url?: string | null;
  } = {
    id: user.id,
    display_name: displayName,
    phone,
    is_profile_public: isProfilePublic,
  };

  let avatarFailed = false;
  let coverFailed = false;
  if (avatar instanceof File && avatar.size > 0) {
    const storagePath = await uploadProfileImage(supabase, user.id, avatar, "avatar");
    if (storagePath) userUpdate.avatar_url = storagePath;
    else avatarFailed = true;
  }
  if (removeCover) {
    userUpdate.cover_url = null;
  } else if (cover instanceof File && cover.size > 0) {
    const storagePath = await uploadProfileImage(supabase, user.id, cover, "cover");
    if (storagePath) userUpdate.cover_url = storagePath;
    else coverFailed = true;
  }

  // Upsert en vez de update: si la fila no existe todavia (por ejemplo cuentas
  // creadas antes de que existiera el trigger de alta automatica) esto la crea
  // en vez de actualizar 0 filas en silencio.
  const { error: userError } = await supabase.from("users").upsert(userUpdate, { onConflict: "id" });
  if (userError) {
    return { ok: false, message: `No se pudo guardar tu perfil: ${userError.message}` };
  }

  if (avatarFailed || coverFailed) {
    const failedParts = [avatarFailed && "la foto de perfil", coverFailed && "la portada"].filter(Boolean);
    return {
      ok: false,
      message: `Guardamos el resto de tus datos, pero no se pudo subir ${failedParts.join(" ni ")}. Probá con otra imagen.`,
    };
  }

  return { ok: true, message: "Perfil actualizado." };
}
