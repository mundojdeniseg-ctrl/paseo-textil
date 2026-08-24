"use client";

import { useActionState, useRef, useState } from "react";
import { publishListingAction, PublishActionState } from "@/app/publicar/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Category } from "@/lib/types/domain";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 8;

export function PublishForm({ categories }: { categories: Category[] }) {
  const [state, formAction, pending] = useActionState<PublishActionState, FormData>(
    publishListingAction,
    null
  );
  const [priceMode, setPriceMode] = useState<"consultar" | "precio">("consultar");
  const [hasWholesale, setHasWholesale] = useState(false);
  const [isBusiness, setIsBusiness] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function syncInputFiles(files: File[]) {
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const combined = [...photos, ...picked].slice(0, MAX_PHOTOS);
    setPhotos(combined);
    syncInputFiles(combined);
  }

  function removePhoto(index: number) {
    const updated = photos.filter((_, i) => i !== index);
    setPhotos(updated);
    syncInputFiles(updated);
  }

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

      {/* Fotos */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          2. Fotos
        </h2>
        <p className="text-xs text-muted-foreground -mt-1">
          Hasta {MAX_PHOTOS} fotos. La primera va a ser la foto principal del anuncio.
        </p>
        <div className="flex flex-wrap gap-3">
          {photos.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`Foto ${i + 1}`}
                className="h-full w-full object-cover"
              />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label="Quitar foto"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-xs font-bold text-foreground shadow"
              >
                ×
              </button>
              {i === 0 && (
                <span className="absolute bottom-1 left-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                  Principal
                </span>
              )}
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <span className="text-2xl leading-none">+</span>
              <span className="text-xs">Agregar</span>
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={handleFilesSelected}
              />
            </label>
          )}
        </div>
        {/* Input real que viaja con el form; su FileList se mantiene sincronizado a mano */}
        <input ref={fileInputRef} type="file" name="photos" multiple className="hidden" />
      </section>

      {/* Detalle */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          3. Detalle del anuncio
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
          4. Precio
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
          <div className="flex flex-col gap-3">
            <div>
              <Label htmlFor="priceRetail">{hasWholesale ? "Precio por menor (ARS)" : "Precio (ARS)"}</Label>
              <Input id="priceRetail" name="priceRetail" type="number" min="0" placeholder="Ej: 15000" />
            </div>

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={hasWholesale}
                onChange={(e) => setHasWholesale(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Tengo un precio distinto por mayor
            </label>

            {hasWholesale && (
              <div>
                <Label htmlFor="priceWholesale">Precio por mayor (ARS)</Label>
                <Input id="priceWholesale" name="priceWholesale" type="number" min="0" placeholder="Ej: 12000" />
              </div>
            )}
          </div>
        )}
      </section>

      {/* Ubicación */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          5. Ubicación
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
          6. Tus datos de contacto
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
