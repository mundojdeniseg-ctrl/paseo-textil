// Estrellas de solo lectura para mostrar un promedio (catálogo, ficha,
// comparador). Para el input de calificación al dejar una reseña, ver
// review-form.tsx (necesita estado interactivo, así que vive aparte).
export function StarRatingDisplay({
  average,
  count,
  size = "sm",
}: {
  average: number;
  count: number;
  size?: "sm" | "md";
}) {
  if (count === 0) return null;
  const rounded = Math.round(average);
  const starSize = size === "md" ? "text-base" : "text-xs";

  return (
    <span className={`inline-flex items-center gap-1 ${starSize}`}>
      <span className="text-amber-500" aria-hidden>
        {"★".repeat(rounded)}
        <span className="text-muted-foreground/40">{"★".repeat(5 - rounded)}</span>
      </span>
      <span className="text-muted-foreground">
        {average.toFixed(1)} ({count})
      </span>
    </span>
  );
}
