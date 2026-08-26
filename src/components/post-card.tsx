import Link from "next/link";
import { Post } from "@/lib/types/domain";
import { formatRelativeDate, getAvatarUrl } from "@/lib/format";
import { LikeButton } from "@/components/like-button";
import { CommentsSection } from "@/components/comments-section";
import { ReportButton } from "@/components/report-button";
import { PostMediaGrid } from "@/components/post-media-grid";

export function PostCard({
  post,
  path,
  isLoggedIn,
  compact,
}: {
  post: Post;
  path: string;
  isLoggedIn: boolean;
  /** En el perfil publico las fotos van mas chicas; en el muro van grandes. */
  compact?: boolean;
}) {
  const avatarUrl = getAvatarUrl(post.authorAvatarUrl);

  return (
    <article className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-3">
        <Link href={`/usuarios/${post.userId}`}>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={avatarUrl} alt={post.authorName} loading="lazy" className="h-9 w-9 rounded-full object-cover" />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
              {post.authorName.charAt(0).toUpperCase()}
            </span>
          )}
        </Link>
        <div>
          <Link href={`/usuarios/${post.userId}`} className="font-semibold leading-tight hover:underline">
            {post.authorName}
          </Link>
          <p className="text-xs text-muted-foreground">{formatRelativeDate(post.createdAt)}</p>
        </div>
      </div>

      <p className="mt-3 whitespace-pre-line leading-relaxed">{post.body}</p>

      <PostMediaGrid media={post.media} size={compact ? "medium" : "large"} />

      <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <LikeButton
              postId={post.id}
              path={path}
              initialLiked={post.likedByMe}
              initialCount={post.likesCount}
              isLoggedIn={isLoggedIn}
            />
            <span className="text-sm text-muted-foreground">
              {post.comments.length > 0 &&
                `${post.comments.length} comentario${post.comments.length > 1 ? "s" : ""}`}
            </span>
          </div>
          <ReportButton targetType="post" targetId={post.id} />
        </div>
      </div>

      <CommentsSection postId={post.id} path={path} comments={post.comments} isLoggedIn={isLoggedIn} />
    </article>
  );
}
