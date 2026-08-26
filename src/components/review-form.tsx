"use client";

import { useActionState, useState } from "react";
import { ReviewActionState, submitReviewAction } from "@/app/usuarios/[id]/actions";
import { BusinessReview } from "@/lib/types/domain";

export function ReviewForm({
  businessProfileId,
  profilePath,
  myReview,
}: {
  businessProfileId: string;
  profilePath: string;
  myReview: BusinessReview | null;
}) {
  const [state, formAction, pending] = useActionState<ReviewActionState, FormData>(submitReviewAction, null);
  const [rating, setRating] = useState(myReview?.rating ?? 5);
  const [hover, setHover] = useState(0);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4">
      <input type="hidden" name="businessProfileId" value={businessProfileId} />
      <input type="hidden" name="profilePath" value={profilePath} />
      <input type="hidden" name="rating" value={rating} />

      <p className="text-sm font-semibold">{myReview ? "Editar tu reseña" : "Dejar una reseña"}</p>

      <div className="flex gap-1" role="radiogroup" aria-label="Calificación">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(n)}
            className={`text-2xl leading-none transition-colors ${
              n <= (hover || rating) ? "text-amber-500" : "text-muted-foreground/40"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      <textarea
        name="body"
        rows={3}
        defaultValue={myReview?.body ?? ""}
        placeholder="Contá cómo te fue (opcional): cumplimiento, calidad, tiempos de entrega..."
        className="resize-none rounded-xl border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
      />

      {state && !state.ok && <p className="text-xs text-destructive">{state.message}</p>}
      {state && state.ok && <p className="text-xs text-primary">¡Gracias! Tu reseña quedó publicada.</p>}

      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
      >
        {pending ? "Guardando..." : myReview ? "Actualizar reseña" : "Publicar reseña"}
      </button>
    </form>
  );
}
