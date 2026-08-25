"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteBusinessAction } from "@/app/cuenta/negocios/actions";

export function BusinessDeleteButton({ businessId }: { businessId: string }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  function handleDelete() {
    if (!confirm("¿Eliminar este negocio? No se puede deshacer.")) return;
    setMessage(null);
    startTransition(async () => {
      const result = await deleteBusinessAction(businessId);
      if (result.ok) {
        router.refresh();
      } else {
        setMessage(result.message ?? "No se pudo eliminar.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={handleDelete}
        className="rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
      >
        Eliminar
      </button>
      {message && <span className="text-xs text-destructive">{message}</span>}
    </div>
  );
}
