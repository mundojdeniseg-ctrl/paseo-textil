import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Message, MessageThread } from "@/lib/types/domain";

type MessageRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  listing_id: string | null;
  body: string;
  created_at: string;
  read_at: string | null;
  sender: { display_name: string | null; avatar_url: string | null } | null;
  recipient: { display_name: string | null; avatar_url: string | null } | null;
};

function mapMessage(row: MessageRow): Message {
  return {
    id: row.id,
    senderId: row.sender_id,
    recipientId: row.recipient_id,
    listingId: row.listing_id,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
  };
}

const MESSAGE_SELECT =
  "*, sender:users!messages_sender_id_fkey(display_name, avatar_url), recipient:users!messages_recipient_id_fkey(display_name, avatar_url)";

export async function getConversations(): Promise<MessageThread[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("messages")
    .select(MESSAGE_SELECT)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getConversations error:", error.message);
    return [];
  }

  const threads = new Map<string, MessageThread>();
  for (const row of (data ?? []) as MessageRow[]) {
    const isSender = row.sender_id === user.id;
    const otherId = isSender ? row.recipient_id : row.sender_id;
    const otherProfile = isSender ? row.recipient : row.sender;
    const isUnread = !isSender && !row.read_at;

    const existing = threads.get(otherId);
    if (existing) {
      if (isUnread) existing.unreadCount += 1;
      continue;
    }
    threads.set(otherId, {
      otherUserId: otherId,
      otherUserName: otherProfile?.display_name || "Usuario de Paseo Textil",
      otherUserAvatarUrl: otherProfile?.avatar_url ?? null,
      lastMessageBody: row.body,
      lastMessageAt: row.created_at,
      unreadCount: isUnread ? 1 : 0,
    });
  }

  return Array.from(threads.values());
}

export async function getUnreadMessageCount(): Promise<number> {
  if (!isSupabaseConfigured()) return 0;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", user.id)
    .is("read_at", null);

  if (error) return 0;
  return count ?? 0;
}

export async function getThread(otherUserId: string): Promise<Message[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from("messages")
    .select(MESSAGE_SELECT)
    .or(
      `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getThread error:", error.message);
    return [];
  }

  // Marca como leidos los mensajes que me mandaron en este hilo.
  await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("sender_id", otherUserId)
    .eq("recipient_id", user.id)
    .is("read_at", null);

  return (data ?? []).map(mapMessage);
}
