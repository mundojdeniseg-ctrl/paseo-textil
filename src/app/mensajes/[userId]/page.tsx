import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getThread } from "@/lib/data/messages";
import { getAvatarUrl, formatRelativeDate } from "@/lib/format";
import { MessageForm } from "@/components/message-form";

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
        <div className="flex flex-col gap-2 p-4">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">
              Todavía no hay mensajes. Escribí el primero.
            </p>
          ) : (
            messages.map((m) => {
              const isMine = m.senderId === user.id;
              return (
                <div key={m.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                      isMine ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <p className="whitespace-pre-line leading-snug">{m.body}</p>
                    <p
                      className={`mt-1 text-right text-[10px] ${
                        isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatRelativeDate(m.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <MessageForm recipientId={otherUser.id} />
      </div>
    </div>
  );
}
