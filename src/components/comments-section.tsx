"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { addCommentAction, CommentActionState } from "@/app/muro/actions";
import { PostComment } from "@/lib/types/domain";
import { getAvatarUrl } from "@/lib/format";

export function CommentsSection({
  postId,
  path,
  comments,
  isLoggedIn,
}: {
  postId: string;
  path: string;
  comments: PostComment[];
  isLoggedIn: boolean;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? comments : comments.slice(-2);
  const hidden = comments.length - visible.length;

  return (
    <div className="mt-3 border-t border-border pt-3">
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => setShowAll(true)}
          className="mb-2 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          Ver {hidden} comentario{hidden > 1 ? "s" : ""} más
        </button>
      )}

      {visible.length > 0 && (
        <div className="flex flex-col gap-2">
          {visible.map((comment) => {
            const avatarUrl = getAvatarUrl(comment.authorAvatarUrl);
            return (
              <div key={comment.id} className="flex items-start gap-2 text-sm">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" loading="lazy" className="h-6 w-6 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {comment.authorName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="rounded-2xl bg-muted px-3 py-1.5">
                  <p className="font-semibold leading-tight">{comment.authorName}</p>
                  <p className="leading-snug whitespace-pre-line">{comment.body}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isLoggedIn ? (
        <CommentForm postId={postId} path={path} />
      ) : (
        <Link href="/cuenta/ingresar" className="mt-2 inline-block text-xs text-primary underline">
          Iniciá sesión para comentar
        </Link>
      )}
    </div>
  );
}

function CommentForm({ postId, path }: { postId: string; path: string }) {
  const [state, formAction, pending] = useActionState<CommentActionState, FormData>(addCommentAction, null);

  // Mismo patron que PostComposer: cambiar la key remonta el formulario
  // de cero (limpia el input) sin usar setState dentro de un efecto.
  const [formKey, setFormKey] = useState(0);
  const [lastHandledState, setLastHandledState] = useState(state);
  if (state !== lastHandledState) {
    setLastHandledState(state);
    if (state?.ok) setFormKey((k) => k + 1);
  }

  return (
    <CommentFormFields
      key={formKey}
      postId={postId}
      path={path}
      formAction={formAction}
      pending={pending}
      state={state}
    />
  );
}

function CommentFormFields({
  postId,
  path,
  formAction,
  pending,
  state,
}: {
  postId: string;
  path: string;
  formAction: (formData: FormData) => void;
  pending: boolean;
  state: CommentActionState;
}) {
  return (
    <form action={formAction} className="mt-2 flex items-start gap-2">
      <input type="hidden" name="postId" value={postId} />
      <input type="hidden" name="path" value={path} />
      <div className="flex-1">
        <input
          name="body"
          required
          placeholder="Escribí un comentario..."
          className="w-full rounded-full border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
        />
        {state && !state.ok && <p className="mt-1 text-xs text-destructive">{state.message}</p>}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {pending ? "..." : "Enviar"}
      </button>
    </form>
  );
}
