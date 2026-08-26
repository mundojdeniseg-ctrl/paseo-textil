"use client";

import { useTransition } from "react";
import { setVerificationAction, VerificationStatus } from "@/app/admin/actions";

export function VerifyButtons({ businessId, currentStatus }: { businessId: string; currentStatus: string }) {
  const [isPending, startTransition] = useTransition();

  function set(status: VerificationStatus) {
    startTransition(() => {
      setVerificationAction(businessId, status);
    });
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isPending || currentStatus === "verificado"}
        onClick={() => set("verificado")}
        className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground disabled:opacity-40"
      >
        Verificar
      </button>
      <button
        type="button"
        disabled={isPending || currentStatus === "rechazado"}
        onClick={() => set("rechazado")}
        className="rounded-full border border-destructive px-3 py-1.5 text-xs font-semibold text-destructive disabled:opacity-40"
      >
        Rechazar
      </button>
      <button
        type="button"
        disabled={isPending || currentStatus === "sin_verificar"}
        onClick={() => set("sin_verificar")}
        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
      >
        Quitar
      </button>
    </div>
  );
}
