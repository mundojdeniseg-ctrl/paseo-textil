"use client";

import { useActionState, useState } from "react";
import { publishListingAction, PublishActionState } from "@/app/publicar/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Category } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

export function PublishForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState<PublishActionState, FormData>(
    publishListingAction,
    null
  );
  const [priceMode, setPriceMode] = useState<"consultar" | "precio">("consultar");
  const [isBusiness, setIsBusiness] = useState(false);

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {/* Categoría */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          1. Categoría
        </h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <label key={c.id} className="cursor-pointer">
              <input type="radio" name="category" value={c.slug} required className="peer sr-only" />
              <span className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                {c.name}
              </span>
            </label>
          ))}
        </div>
      </section>

      {/* Detalle */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          2. Detalle del anuncio
        </h2>
        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" required placeholder="Ej: Gabardina elastizada, rollo completo" />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea
            id="description"
            name="description"
            required
            rows={4}
            placeholder="Contá el detalle: cantidad disponible, condición, mínimos, lo que un comprador necesita saber."
          />
        </div>
      </section>

      {/* Precio */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          3. Precio
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPriceMode("consultar")}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              priceMode === "consultar"
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border"
            )}
          >
            Consultar precio
          </button>
          <button
            type="button"
            onClick={() => setPriceMode("precio")}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              priceMode === "precio" ? "border-primary bg-primary text-primary-foreground" : "border-border"
            )}
          >
            Poner precio
          </button>
        </div>
        <input type="hidden" name="priceMode" value={priceMode} />
        {priceMode === "precio" && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="priceRetail">Precio por menor (ARS)</Label>
              <Input id="priceRetail" name="priceRetail" type="number" min="0" placeholder="opcional" />
            </div>
            <div>
              <Label htmlFor="priceWholesale">Precio por mayor (ARS)</Label>
              <Input id="priceWholesale" name="priceWholesale" type="number" min="0" placeholder="opcional" />
            </div>
          </div>
        )}
      </section>

      {/* Ubicación */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          4. Ubicación
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city">Localidad</Label>
            <Input id="city" name="city" required placeholder="Ej: Avellaneda" />
          </div>
          <div>
            <Label htmlFor="province">Provincia</Label>
            <Input id="province" name="province" required placeholder="Ej: Buenos Aires" />
          </div>
        </div>
      </section>

      {/* Contacto */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          5. Tus datos de contacto
        </h2>
        <p className="text-xs text-muted-foreground -mt-1">
          No hace falta crear una cuenta para publicar. Solo necesitamos cómo contactarte.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="contactName">Nombre</Label>
            <Input id="contactName" name="contactName" required placeholder="Nombre y apellido" />
          </div>
          <div>
            <Label htmlFor="contactPhone">WhatsApp / teléfono</Label>
            <Input id="contactPhone" name="contactPhone" required placeholder="+54 9 ..." />
          </div>
        </div>

        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isBusiness}
            onChange={(e) => setIsBusiness(e.target.checked)}
            className="h-4 w-4 rounded border-border"
          />
          Publico como negocio (taller, fábrica, proveedor)
        </label>
        {isBusiness && (
          <div>
            <Label htmlFor="businessName">Nombre del negocio</Label>
            <Input id="businessName" name="businessName" placeholder="Ej: Textiles Riachuelo" />
            <p className="mt-1 text-xs text-muted-foreground">
              No pedimos CUIT ni documentación para arrancar — más adelante vas a poder activar la
              insignia de &quot;negocio verificado&quot; si querés.
            </p>
          </div>
        )}
      </section>

      {state && !state.ok && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} size="lg" className="rounded-full font-semibold">
        {pending ? "Publicando..." : "Publicar anuncio"}
      </Button>
    </form>
  );
}
