"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleLikeAction } from "@/app/muro/actions";

export function LikeButton({
  postId,
  path,
  initialLiked,
  initialCount,
  isLoggedIn,
}: {
  postId: string;
  path: string;
  initialLiked: boolean;
  initialCount: number;
  isLoggedIn: boolean;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link
        href="/cuenta/ingresar"
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <span>♡</span>
        {count > 0 && <span>{count}</span>}
      </Link>
    );
  }

  function handleClick() {
    const prevLiked = liked;
    const prevCount = count;
    const nextLiked = !liked;
    setLiked(nextLiked);
    setCount(prevCount + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLikeAction(postId, path);
      if (!result.ok) {
        setLiked(prevLiked);
        setCount(prevCount);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center gap-1.5 text-sm transition-colors ${
        liked ? "text-primary" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>{liked ? "♥" : "♡"}</span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
