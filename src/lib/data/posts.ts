import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Post, PostComment, PostMedia } from "@/lib/types/domain";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapComment(row: any): PostComment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    body: row.body,
    createdAt: row.created_at,
    authorName: row.author?.display_name || "Usuario de Paseo Textil",
    authorAvatarUrl: row.author?.avatar_url ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(row: any, currentUserId: string | null): Post {
  const likes: { user_id: string }[] = row.likes ?? [];
  return {
    id: row.id,
    userId: row.user_id,
    body: row.body,
    createdAt: row.created_at,
    authorName: row.author?.display_name || "Usuario de Paseo Textil",
    authorAvatarUrl: row.author?.avatar_url ?? null,
    media: (row.media ?? [])
      .sort((a: PostMedia, b: PostMedia) => a.position - b.position)
      .map(
        (m: { id: string; post_id: string; storage_path: string; media_type: "image" | "video"; position: number }): PostMedia => ({
          id: m.id,
          postId: m.post_id,
          storagePath: m.storage_path,
          mediaType: m.media_type,
          position: m.position,
        })
      ),
    likesCount: likes.length,
    likedByMe: currentUserId ? likes.some((l) => l.user_id === currentUserId) : false,
    comments: (row.comments ?? [])
      .sort(
        (a: { created_at: string }, b: { created_at: string }) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      )
      .map(mapComment),
  };
}

export async function getPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, author:users!posts_user_id_fkey(display_name, avatar_url, is_profile_public), media:post_media(*), likes:post_likes(user_id), comments:post_comments(*, author:users!post_comments_user_id_fkey(display_name, avatar_url))"
    )
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPosts error:", error.message);
    return [];
  }

  // El muro es publico, pero un perfil marcado como privado no deberia
  // mostrar sus publicaciones aca tampoco (solo en /usuarios/{id}, que ya
  // respeta ese flag) -- salvo que sean las propias del que esta mirando.
  const visible = (data ?? []).filter(
    (row) => row.author?.is_profile_public !== false || row.user_id === user?.id
  );
  return visible.map((row) => mapPost(row, user?.id ?? null));
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("posts")
    .select(
      "*, author:users!posts_user_id_fkey(display_name, avatar_url), media:post_media(*), likes:post_likes(user_id), comments:post_comments(*, author:users!post_comments_user_id_fkey(display_name, avatar_url))"
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPostsByUser error:", error.message);
    return [];
  }
  return (data ?? []).map((row) => mapPost(row, user?.id ?? null));
}
