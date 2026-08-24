"use client";

import { useState, useTransition } from "react";
import { reportContentAction } from "@/app/reportar/actions";

export function ReportButton({ targetType, targetId }: { targetType: "post" | "listing"; targetId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (sent) {
    return <span className="text-xs text-muted-foreground">Gracias, lo vamos a revisar.</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-muted-foreground hover:text-destructive"
      >
        Reportar
      </button>
    );
  }

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await reportContentAction(targetType, targetId, reason);
      if (result.ok) {
        setSent(true);
      } else {
        setError(result.message ?? "No se pudo enviar.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/50 p-2">
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        placeholder="¿Qué está mal con esta publicación?"
        className="w-full resize-none rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-primary"
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={submit}
          className="rounded-full bg-destructive px-3 py-1 text-xs font-semibold text-white disabled:opacity-50"
        >
          {isPending ? "Enviando..." : "Enviar reporte"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-border px-3 py-1 text-xs"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
