"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import { updateListingAction, deleteListingImageAction, UpdateListingActionState } from "@/app/publicar/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Category, Listing } from "@/lib/types/domain";
import { getImageUrl } from "@/lib/format";
import { cn } from "@/lib/utils";

const MAX_PHOTOS = 8;

function ExistingPhoto({ listingId, imageId, storagePath }: { listingId: string; imageId: string; storagePath: string }) {
  const [removed, setRemoved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const url = getImageUrl(storagePath);

  if (removed) return null;

  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-muted">
      {url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await deleteListingImageAction(imageId, storagePath, listingId);
            if (result.ok) setRemoved(true);
          })
        }
        aria-label="Quitar foto"
        className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-xs font-bold text-foreground shadow disabled:opacity-50"
      >
        ×
      </button>
    </div>
  );
}

export function EditListingForm({ listing, categories }: { listing: Listing; categories: Category[] }) {
  const [state, formAction, pending] = useActionState<UpdateListingActionState, FormData>(
    updateListingAction,
    null
  );
  const [priceMode, setPriceMode] = useState<"consultar" | "precio">(
    listing.priceOnRequest ? "consultar" : "precio"
  );
  const [hasWholesale, setHasWholesale] = useState(Boolean(listing.priceWholesale && listing.priceRetail));
  const [newPhotos, setNewPhotos] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const remainingSlots = Math.max(0, MAX_PHOTOS - listing.images.length - newPhotos.length);

  function syncInputFiles(files: File[]) {
    const dt = new DataTransfer();
    files.forEach((f) => dt.items.add(f));
    if (fileInputRef.current) fileInputRef.current.files = dt.files;
  }

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const combined = [...newPhotos, ...picked].slice(0, MAX_PHOTOS - listing.images.length);
    setNewPhotos(combined);
    syncInputFiles(combined);
  }

  function removeNewPhoto(index: number) {
    const updated = newPhotos.filter((_, i) => i !== index);
    setNewPhotos(updated);
    syncInputFiles(updated);
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      <input type="hidden" name="listingId" value={listing.id} />

      <section>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Categoría</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {categories.map((c) => (
            <label key={c.id} className="cursor-pointer">
              <input
                type="radio"
                name="category"
                value={c.slug}
                required
                defaultChecked={c.slug === listing.category?.slug}
                className="peer sr-only"
              />
              <span className="inline-block rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground">
                {c.name}
              </span>
            </label>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Fotos</h2>
        <div className="flex flex-wrap gap-3">
          {listing.images.map((img) => (
            <ExistingPhoto key={img.id} listingId={listing.id} imageId={img.id} storagePath={img.storagePath} />
          ))}
          {newPhotos.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative h-24 w-24 overflow-hidden rounded-xl border border-border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(file)} alt={`Foto nueva ${i + 1}`} className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewPhoto(i)}
                aria-label="Quitar foto"
                className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-background/90 text-xs font-bold text-foreground shadow"
              >
                ×
              </button>
            </div>
          ))}
          {remainingSlots > 0 && (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary">
              <span className="text-2xl leading-none">+</span>
              <span className="text-xs">Agregar</span>
              <input type="file" accept="image/*" multiple className="sr-only" onChange={handleFilesSelected} />
            </label>
          )}
        </div>
        <input ref={fileInputRef} type="file" name="photos" multiple className="hidden" />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Detalle</h2>
        <div>
          <Label htmlFor="title">Título</Label>
          <Input id="title" name="title" required defaultValue={listing.title} />
        </div>
        <div>
          <Label htmlFor="description">Descripción</Label>
          <Textarea id="description" name="description" required rows={4} defaultValue={listing.description} />
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Precio</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPriceMode("consultar")}
            className={cn(
              "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
              priceMode === "consultar" ? "border-primary bg-primary text-primary-foreground" : "border-border"
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
              <Input
                id="priceRetail"
                name="priceRetail"
                type="number"
                min="0"
                defaultValue={listing.priceRetail ?? listing.priceWholesale ?? undefined}
              />
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
                <Input
                  id="priceWholesale"
                  name="priceWholesale"
                  type="number"
                  min="0"
                  defaultValue={listing.priceWholesale ?? undefined}
                />
              </div>
            )}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Ubicación</h2>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="city">Localidad</Label>
            <Input id="city" name="city" required defaultValue={listing.city} />
          </div>
          <div>
            <Label htmlFor="province">Provincia</Label>
            <Input id="province" name="province" required defaultValue={listing.province} />
          </div>
        </div>
      </section>

      {state && !state.ok && (
        <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} size="lg" className="rounded-full font-semibold">
        {pending ? "Guardando..." : "Guardar cambios"}
      </Button>
    </form>
  );
}
