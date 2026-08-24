"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setListingStatusAction, ListingStatus as SettableStatus } from "@/app/publicar/actions";
import { ListingStatus } from "@/lib/types/domain";

export function ListingStatusActions({ listingId, status }: { listingId: string; status: ListingStatus }) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  function changeStatus(next: SettableStatus) {
    if (next === "eliminado" && !confirm("¿Eliminar este anuncio? No se puede deshacer.")) return;
    setMessage(null);
    startTransition(async () => {
      const result = await setListingStatusAction(listingId, next);
      if (result.ok) {
        router.refresh();
      } else {
        setMessage(result.message ?? "No se pudo actualizar.");
      }
    });
  }

  return (
    <div className="flex items-center gap-2">
      {status === "activo" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => changeStatus("pausado")}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary disabled:opacity-50"
        >
          Pausar
        </button>
      )}
      {status === "pausado" && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => changeStatus("activo")}
          className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary disabled:opacity-50"
        >
          Reactivar
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => changeStatus("eliminado")}
        className="rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold text-destructive hover:bg-destructive/10 disabled:opacity-50"
      >
        Eliminar
      </button>
      {message && <span className="text-xs text-destructive">{message}</span>}
    </div>
  );
}
