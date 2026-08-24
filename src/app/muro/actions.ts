"use server";

import { revalidatePath } from "next/cache";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export type PostActionState = { ok: boolean; message: string } | null;

function mediaTypeFor(file: File): "image" | "video" | null {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
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

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const type = mediaTypeFor(file);
    if (!type) continue;

    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const storagePath = `${post.id}/${i}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("post-media")
      .upload(storagePath, file, { contentType: file.type, upsert: false });

    if (!uploadError) {
      await supabase
        .from("post_media")
        .insert({ post_id: post.id, storage_path: storagePath, media_type: type, position: i });
    }
  }

  revalidatePath("/muro");
  return { ok: true, message: "¡Publicado!" };
}
