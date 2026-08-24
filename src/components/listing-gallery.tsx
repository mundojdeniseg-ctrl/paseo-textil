"use client";

import { useState } from "react";
import Image from "next/image";
import { ListingImage } from "@/lib/types/domain";
import { getImageUrl } from "@/lib/format";

export function ListingGallery({
  images,
  categoryName,
}: {
  images: ListingImage[];
  categoryName?: string;
}) {
  const [active, setActive] = useState(0);
  const sorted = [...images].sort((a, b) => a.position - b.position);
  const activeImage = sorted[active];
  const activeUrl = activeImage ? getImageUrl(activeImage.storagePath) : null;

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-muted">
        {activeUrl ? (
          <Image
            src={activeUrl}
            alt={categoryName ?? "Foto del anuncio"}
            fill
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
            {categoryName} — sin foto todavía
          </div>
        )}
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {sorted.map((img, i) => {
            const url = getImageUrl(img.storagePath);
            if (!url) return null;
            return (
              <button
                key={img.id}
                type="button"
                onClick={() => setActive(i)}
                className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                  i === active ? "border-primary" : "border-transparent"
                }`}
              >
                <Image src={url} alt={`Foto ${i + 1}`} fill sizes="64px" className="object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
