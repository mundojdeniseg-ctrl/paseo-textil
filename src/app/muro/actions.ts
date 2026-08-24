"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type PostActionState = { ok: boolean; message: string } | null;

// Coincide exacto con allowed_mime_types del bucket post-media (migracion
// 0006): antes solo se chequeaba el prefijo "image/"/"video/", asi que un
// formato no soportado (.avi, .svg) pasaba el filtro del cliente y del
// server action pero Storage lo rechazaba en silencio.
const IMAGE_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_MIME_TYPES = new Set(["video/mp4", "video/quicktime", "video/webm"]);

function mediaTypeFor(file: File): "image" | "video" | null {
  if (IMAGE_MIME_TYPES.has(file.type)) return "image";
  if (VIDEO_MIME_TYPES.has(file.type)) return "video";
  return null;
}

export async function createPostAction(
  _prevState: PostActionState,
  formData: FormData
): Promise<PostActionState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "El muro todavía no está disponible en este entorno." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Tenés que ingresar a tu cuenta para publicar en el muro." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { ok: false, message: "Escribí algo antes de publicar." };
  }

  const { data: post, error: postError } = await supabase
    .from("posts")
    .insert({ user_id: user.id, body })
    .select("id")
    .single();

  if (postError || !post) {
    return { ok: false, message: `No se pudo publicar: ${postError?.message}` };
  }

  const files = formData.getAll("media").filter((f): f is File => f instanceof File && f.size > 0);
  let failedCount = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const type = mediaTypeFor(file);
    if (!type) {
      failedCount++;
      continue;
    }

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storagePath = `${post.id}/${i}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("post-media")
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (!uploadError) {
      await supabase
        .from("post_media")
        .insert({ post_id: post.id, storage_path: storagePath, media_type: type, position: i });
    } else {
      failedCount++;
    }
  }

  revalidatePath("/muro");
  const message =
    failedCount > 0
      ? `¡Publicado! ${failedCount} archivo${failedCount > 1 ? "s" : ""} no se pudo subir (formato no soportado).`
      : "¡Publicado!";
  return { ok: true, message };
}

export async function toggleLikeAction(
  postId: string,
  path: string
): Promise<{ ok: boolean; message?: string }> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "El muro todavía no está disponible en este entorno." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Tenés que ingresar a tu cuenta para dar like." };
  }

  // Insertar primero (no leer-y-despues-decidir): si ya existe el like, este
  // insert falla por la primary key (post_id, user_id) y eso se interpreta
  // como "sacar el like". Asi se evita la condicion de carrera de un doble
  // click rapido, y se revisa el error en vez de ignorarlo en silencio.
  const { error: insertError } = await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });

  if (insertError) {
    if (insertError.code !== "23505") {
      return { ok: false, message: "No se pudo actualizar el like." };
    }
    const { error: deleteError } = await supabase
      .from("post_likes")
      .delete()
      .eq("post_id", postId)
      .eq("user_id", user.id);
    if (deleteError) {
      return { ok: false, message: "No se pudo actualizar el like." };
    }
  }

  revalidatePath(path);
  return { ok: true };
}

export type CommentActionState = { ok: boolean; message: string } | null;

export async function addCommentAction(
  _prevState: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  if (!isSupabaseConfigured()) {
    return { ok: false, message: "El muro todavía no está disponible en este entorno." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Tenés que ingresar a tu cuenta para comentar." };
  }

  const postId = String(formData.get("postId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const path = String(formData.get("path") ?? "/muro");

  if (!postId || !body) {
    return { ok: false, message: "Escribí algo antes de comentar." };
  }

  const { error } = await supabase.from("post_comments").insert({ post_id: postId, user_id: user.id, body });
  if (error) {
    return { ok: false, message: `No se pudo comentar: ${error.message}` };
  }

  revalidatePath(path);
  return { ok: true, message: "" };
}
