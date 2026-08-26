import { BusinessReview } from "@/lib/types/domain";
import { formatRelativeDate } from "@/lib/format";

export function ReviewsList({ reviews }: { reviews: BusinessReview[] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">Todavía no tiene reseñas. ¡Sé el primero!</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {reviews.map((review) => (
        <div key={review.id} className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm">{review.reviewerName}</p>
            <span className="text-amber-500 text-sm" aria-hidden>
              {"★".repeat(review.rating)}
              <span className="text-muted-foreground/40">{"★".repeat(5 - review.rating)}</span>
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{formatRelativeDate(review.createdAt)}</p>
          {review.body && <p className="mt-2 text-sm leading-relaxed">{review.body}</p>}
        </div>
      ))}
    </div>
  );
}
