import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Post, PostMedia } from "@/lib/types/domain";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPost(row: any): Post {
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
  };
}

export async function getPosts(): Promise<Post[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("posts")
    .select("*, author:users(display_name, avatar_url), media:post_media(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getPosts error:", error.message);
    return [];
  }
  return (data ?? []).map(mapPost);
}
