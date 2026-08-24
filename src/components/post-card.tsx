import { Post } from "@/lib/types/domain";
import { formatRelativeDate, getAvatarUrl, getPostMediaUrl } from "@/lib/format";

export function PostCard({ post }: { post: Post }) {
  const avatarUrl = getAvatarUrl(post.authorAvatarUrl);

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={post.authorName} className="h-9 w-9 rounded-full object-cover" />
        ) : (
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
            {post.authorName.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <p className="font-semibold leading-tight">{post.authorName}</p>
          <p className="text-xs text-muted-foreground">{formatRelativeDate(post.createdAt)}</p>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line leading-relaxed">{post.body}</p>

      {post.media.length > 0 && (
        <div className={`mt-3 grid gap-2 ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.media.map((m) => {
            const url = getPostMediaUrl(m.storagePath);
            if (!url) return null;
            return (
              <div key={m.id} className="overflow-hidden rounded-xl bg-muted">
                {m.mediaType === "video" ? (
                  <video src={url} controls className="max-h-96 w-full" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={url} alt="" className="max-h-96 w-full object-cover" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}
