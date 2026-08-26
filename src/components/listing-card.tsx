import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Listing } from "@/lib/types/domain";
import { formatPrice, formatRelativeDate, getImageUrl } from "@/lib/format";
import { SaveButton } from "@/components/save-button";
import { StarRatingDisplay } from "@/components/star-rating";

function PriceLine({ listing }: { listing: Listing }) {
  if (listing.priceOnRequest) {
    return <span className="font-semibold text-foreground">Consultar precio</span>;
  }
  // Si solo hay un precio cargado (lo más común: servicios, promos variables),
  // se muestra simple, sin la etiqueta "x mayor/x menor" que no aplica.
  if (listing.priceRetail && listing.priceWholesale) {
    return (
      <span className="font-semibold text-foreground">
        {formatPrice(listing.priceRetail, listing.currencyCode)} x menor ·{" "}
        {formatPrice(listing.priceWholesale, listing.currencyCode)} x mayor
      </span>
    );
  }
  const singlePrice = listing.priceRetail ?? listing.priceWholesale;
  if (singlePrice) {
    return (
      <span className="font-semibold text-foreground">
        {formatPrice(singlePrice, listing.currencyCode)}
      </span>
    );
  }
  return <span className="font-semibold text-foreground">Consultar precio</span>;
}

export function ListingCard({
  listing,
  isLoggedIn = false,
  saved = false,
}: {
  listing: Listing;
  isLoggedIn?: boolean;
  saved?: boolean;
}) {
  const mainImage = listing.images[0];
  const imageUrl = mainImage ? getImageUrl(mainImage.storagePath) : null;
  const reviewsAverage = listing.businessProfile?.reviewsAverage;
  const reviewsCount = listing.businessProfile?.reviewsCount;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-md">
      {/* Link con display:contents: el card entero sigue siendo clickeable
          sin anidar el boton de guardar dentro de un <a> (HTML invalido). */}
      <Link href={`/anuncios/${listing.id}`} className="contents">
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={listing.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
              {listing.category?.name}
            </div>
          )}
          {listing.businessProfile && (
            <Badge className="absolute left-2 top-2 rounded-full bg-background/90 text-foreground border border-border">
              {listing.businessProfile.businessName}
            </Badge>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {listing.category?.name}
          </p>
          <h3 className="line-clamp-2 font-semibold leading-snug group-hover:text-primary transition-colors">
            {listing.title}
          </h3>
          <div className="mt-auto pt-2 flex items-center justify-between gap-2">
            <PriceLine listing={listing} />
          </div>
          {Boolean(reviewsCount) && reviewsAverage != null && (
            <StarRatingDisplay average={reviewsAverage} count={reviewsCount!} />
          )}
          <p className="text-xs text-muted-foreground">
            {listing.city}, {listing.province} · {formatRelativeDate(listing.createdAt)}
          </p>
        </div>
      </Link>
      <div className="absolute right-2 top-2 z-10">
        <SaveButton targetType="listing" targetId={listing.id} initialSaved={saved} isLoggedIn={isLoggedIn} />
      </div>
    </div>
  );
}
