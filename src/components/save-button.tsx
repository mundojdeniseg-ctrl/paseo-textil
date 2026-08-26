"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleSavedAction } from "@/app/guardados/actions";
import { SavedItemType } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

export function SaveButton({
  targetType,
  targetId,
  initialSaved = false,
  isLoggedIn,
  variant = "icon",
}: {
  targetType: SavedItemType;
  targetId: string;
  initialSaved?: boolean;
  isLoggedIn: boolean;
  variant?: "icon" | "full";
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  if (!isLoggedIn) {
    return (
      <Link
        href="/cuenta/ingresar"
        onClick={(e) => e.stopPropagation()}
        className={variant === "icon" ? iconClass(false) : fullClass(false)}
        title="Iniciá sesión para guardar"
      >
        {variant === "icon" ? "☆" : "Guardar"}
      </Link>
    );
  }

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !saved;
    setSaved(next);
    startTransition(async () => {
      const result = await toggleSavedAction(targetType, targetId);
      if (!result.ok) setSaved(!next);
      else setSaved(result.saved);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending}
      className={variant === "icon" ? iconClass(saved) : fullClass(saved)}
      title={saved ? "Quitar de guardados" : "Guardar"}
    >
      {variant === "icon" ? (saved ? "★" : "☆") : saved ? "Guardado ✓" : "Guardar"}
    </button>
  );
}

function iconClass(saved: boolean) {
  return cn(
    "flex h-8 w-8 items-center justify-center rounded-full text-base leading-none transition-colors",
    saved
      ? "bg-primary text-primary-foreground"
      : "border border-border bg-background/90 text-foreground hover:border-primary"
  );
}

function fullClass(saved: boolean) {
  return cn(
    "inline-flex items-center justify-center gap-1.5 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
    saved ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"
  );
}
