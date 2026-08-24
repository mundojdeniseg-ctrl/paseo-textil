import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConversations } from "@/lib/data/messages";
import { getAvatarUrl, formatRelativeDate } from "@/lib/format";

export default async function MensajesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar");

  const threads = await getConversations();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mensajes</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Tus conversaciones</h1>

      <div className="mt-8 flex flex-col gap-2">
        {threads.length === 0 ? (
          <p className="text-muted-foreground">
            Todavía no tenés mensajes. Escribile a alguien desde su perfil o desde un anuncio.
          </p>
        ) : (
          threads.map((thread) => {
            const avatarUrl = getAvatarUrl(thread.otherUserAvatarUrl);
            return (
              <Link
                key={thread.otherUserId}
                href={`/mensajes/${thread.otherUserId}`}
                className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary"
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {thread.otherUserName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold leading-tight">{thread.otherUserName}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatRelativeDate(thread.lastMessageAt)}
                    </span>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">{thread.lastMessageBody}</p>
                </div>
                {thread.unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                    {thread.unreadCount}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}
