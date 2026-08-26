"use client";

import { useActionState } from "react";
import { submitSearchRequestAction, SearchRequestState } from "@/app/necesidad/actions";
import { Category } from "@/lib/types/domain";
import { ListingCard } from "@/components/listing-card";

export function NecesidadForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState<SearchRequestState, FormData>(submitSearchRequestAction, null);

  return (
    <div>
      <form action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            ¿Qué necesitás?
          </label>
          <textarea
            id="description"
            name="description"
            required
            rows={3}
            placeholder="Ej: busco un taller que confeccione remeras por mayor en Rosario"
            className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="category" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Categoría
          </label>
          <select
            id="category"
            name="category"
            defaultValue=""
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            <option value="">Cualquiera</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="zone" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Zona
          </label>
          <input
            id="zone"
            name="zone"
            type="text"
            placeholder="Ciudad o provincia (opcional)"
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="requesterName" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Tu nombre (opcional)
          </label>
          <input
            id="requesterName"
            name="requesterName"
            type="text"
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="requesterContact"
            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            WhatsApp o mail (opcional)
          </label>
          <input
            id="requesterContact"
            name="requesterContact"
            type="text"
            placeholder="Para que te puedan contactar"
            className="mt-1 h-11 w-full rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
        </div>

        <div className="sm:col-span-2">
          {state && !state.ok && <p className="mb-2 text-sm text-destructive">{state.message}</p>}
          <button
            type="submit"
            disabled={pending}
            className="h-11 w-full rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground disabled:opacity-50 sm:w-auto"
          >
            {pending ? "Buscando..." : "Enviar y ver resultados"}
          </button>
        </div>
      </form>

      {state?.ok && (
        <div className="mt-6">
          {state.results.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Por ahora no hay anuncios que coincidan, pero guardamos tu consulta.
            </p>
          ) : (
            <>
              <p className="text-sm font-semibold">Esto encontramos para vos:</p>
              <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {state.results.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
