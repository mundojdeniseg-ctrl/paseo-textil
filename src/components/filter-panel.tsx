"use client";

import type { ReactNode } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { SlidersHorizontalIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

// Panel de filtros secundarios (ciudad, precio, orden, verificados).
// En mobile se abre como hoja desde abajo; en desktop, como un dialogo
// centrado. Los campos de adentro usan form={formId} para seguir
// mandando su valor al <form> de la pagina aunque el dialog los porte
// a otro lugar del DOM.
export function FilterPanel({
  children,
  activeCount,
  formId,
}: {
  children: ReactNode;
  activeCount: number;
  formId: string;
}) {
  return (
    <DialogPrimitive.Root>
      <DialogPrimitive.Trigger
        render={
          <button
            type="button"
            className="flex h-11 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium transition-colors hover:border-primary"
          />
        }
      >
        <SlidersHorizontalIcon className="h-4 w-4" />
        Filtros
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
            {activeCount}
          </span>
        )}
      </DialogPrimitive.Trigger>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/30 opacity-0 transition-opacity duration-150 data-open:opacity-100" />
        {/* Wrapper de posicionamiento puro (flex): abajo del todo en mobile,
            centrado en desktop. El transform de Popup queda libre para la
            animacion de entrada, sin pelearse con el centrado. */}
        <div className="pointer-events-none fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <DialogPrimitive.Popup
            className="pointer-events-auto max-h-[85vh] w-full translate-y-full overflow-y-auto rounded-t-3xl bg-card p-5 shadow-2xl outline-none transition-transform duration-200 data-open:translate-y-0 sm:max-w-sm sm:translate-y-0 sm:rounded-2xl sm:opacity-0 sm:transition-opacity sm:data-open:opacity-100"
            style={{ paddingBottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-border sm:hidden" />
            <div className="flex items-center justify-between">
              <DialogPrimitive.Title className="text-lg font-bold">Filtros</DialogPrimitive.Title>
              <DialogPrimitive.Close render={<Button variant="ghost" size="icon-sm" />}>
                <XIcon className="h-4 w-4" />
              </DialogPrimitive.Close>
            </div>
            <div className="mt-4 flex flex-col gap-4">{children}</div>
            <DialogPrimitive.Close
              render={<Button type="submit" form={formId} className="mt-5 w-full rounded-full font-semibold" />}
            >
              Ver resultados
            </DialogPrimitive.Close>
          </DialogPrimitive.Popup>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
