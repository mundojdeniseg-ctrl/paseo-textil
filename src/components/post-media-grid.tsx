"use client";

import { useEffect, useState } from "react";
import { PostMedia } from "@/lib/types/domain";
import { getPostMediaUrl } from "@/lib/format";

// Grilla de fotos/videos de una publicacion. Click abre un visor a pantalla
// completa con flechas para pasar entre todas las fotos de esa publicacion
// (galeria), en vez de no hacer nada como antes.
export function PostMediaGrid({ media, size = "large" }: { media: PostMedia[]; size?: "large" | "medium" }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const sorted = [...media].sort((a, b) => a.position - b.position);

  if (sorted.length === 0) return null;

  return (
    <>
      <div
        className={
          size === "medium"
            ? "mt-3 flex flex-wrap gap-2"
            : `mt-3 grid gap-2 ${sorted.length > 1 ? "grid-cols-2" : "grid-cols-1"}`
        }
      >
        {sorted.map((m, i) => {
          const url = getPostMediaUrl(m.storagePath);
          if (!url) return null;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setOpenIndex(i)}
              className={`overflow-hidden rounded-xl bg-muted ${
                size === "medium" ? "h-28 w-28 shrink-0 sm:h-32 sm:w-32" : "block w-full"
              }`}
            >
              {m.mediaType === "video" ? (
                <video
                  src={url}
                  muted
                  className={size === "medium" ? "h-full w-full object-cover" : "max-h-96 w-full object-cover"}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt=""
                  className={size === "medium" ? "h-full w-full object-cover" : "max-h-96 w-full object-cover"}
                />
              )}
            </button>
          );
        })}
      </div>
      {openIndex !== null && (
        <MediaLightbox media={sorted} initialIndex={openIndex} onClose={() => setOpenIndex(null)} />
      )}
    </>
  );
}

function MediaLightbox({
  media,
  initialIndex,
  onClose,
}: {
  media: PostMedia[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + media.length) % media.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % media.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [media.length, onClose]);

  const current = media[index];
  const url = getPostMediaUrl(current.storagePath);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
      >
        ×
      </button>

      {media.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => (i - 1 + media.length) % media.length);
          }}
          aria-label="Foto anterior"
          className="absolute left-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
        >
          ‹
        </button>
      )}

      <div onClick={(e) => e.stopPropagation()}>
        {current.mediaType === "video" ? (
          <video src={url ?? undefined} controls autoPlay className="max-h-[90vh] max-w-[90vw]" />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url ?? undefined} alt="" className="max-h-[90vh] max-w-[90vw] object-contain" />
        )}
      </div>

      {media.length > 1 && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIndex((i) => (i + 1) % media.length);
          }}
          aria-label="Foto siguiente"
          className="absolute right-4 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-2xl text-white hover:bg-white/20"
        >
          ›
        </button>
      )}

      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/80">
          {index + 1} / {media.length}
        </div>
      )}
    </div>
  );
}
