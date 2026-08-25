import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getThread } from "@/lib/data/messages";
import { getAvatarUrl } from "@/lib/format";
import { MessageForm } from "@/components/message-form";
import { MessageThread } from "@/components/message-thread";

export default async function ThreadPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar");
  if (userId === user.id) redirect("/mensajes");

  const { data: otherUser } = await supabase
    .from("users")
    .select("id, display_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (!otherUser) notFound();

  const messages = await getThread(userId);
  const avatarUrl = getAvatarUrl(otherUser.avatar_url);
  const displayName = otherUser.display_name || "Usuario de Paseo Textil";

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col px-4 py-10">
      <Link href="/mensajes" className="text-sm text-muted-foreground hover:text-foreground">
        ← Todas las conversaciones
      </Link>

      <div className="mt-4 flex items-center gap-3">
        <Link href={`/usuarios/${otherUser.id}`}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={displayName} className="h-11 w-11 rounded-full object-cover" />
          ) : (
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              {displayName.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
        <Link href={`/usuarios/${otherUser.id}`} className="font-semibold hover:underline">
          {displayName}
        </Link>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card">
        <MessageThread initialMessages={messages} currentUserId={user.id} otherUserId={otherUser.id} />
        <MessageForm recipientId={otherUser.id} />
      </div>
    </div>
  );
}
