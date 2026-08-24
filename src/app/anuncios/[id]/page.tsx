import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { QuoteForm } from "@/components/quote-form";
import { getListingById } from "@/lib/data/listings";
import { formatPrice, formatRelativeDate } from "@/lib/format";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  const attributeEntries = Object.entries(listing.attributes);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Link href="/anuncios" className="text-sm text-muted-foreground hover:text-foreground">
        ← Volver a anuncios
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="aspect-[4/3] w-full rounded-2xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
            {listing.category?.name} — foto de referencia
          </div>

          <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
            {listing.category?.name}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            {listing.title}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {listing.city}, {listing.province} · publicado {formatRelativeDate(listing.createdAt)}
          </p>

          <p className="mt-6 whitespace-pre-line leading-relaxed">{listing.description}</p>

          {attributeEntries.length > 0 && (
            <div className="mt-6">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Detalles
              </h2>
              <dl className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {attributeEntries.map(([key, value]) => (
                  <div key={key} className="rounded-xl border border-border bg-card p-3">
                    <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                      {key.replaceAll("_", " ")}
                    </dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>

        <aside className="flex flex-col gap-5">
          <div className="rounded-2xl border border-border bg-card p-5">
            {listing.priceOnRequest ? (
              <p className="text-2xl font-black">Consultar precio</p>
            ) : (
              <div className="space-y-1">
                {listing.priceRetail && (
                  <p className="text-2xl font-black">
                    {formatPrice(listing.priceRetail, listing.currencyCode)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">x menor</span>
                  </p>
                )}
                {listing.priceWholesale && (
                  <p className="text-lg font-bold text-primary">
                    {formatPrice(listing.priceWholesale, listing.currencyCode)}
                    <span className="ml-1 text-sm font-normal text-muted-foreground">x mayor</span>
                  </p>
                )}
              </div>
            )}

            {listing.businessProfile && (
              <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                  {listing.businessProfile.businessName.charAt(0)}
                </span>
                <div>
                  <p className="font-semibold leading-tight">{listing.businessProfile.businessName}</p>
                  {listing.businessProfile.verificationStatus === "verificado" ? (
                    <Badge className="mt-0.5">Negocio verificado</Badge>
                  ) : (
                    <p className="text-xs text-muted-foreground">Perfil de negocio</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border bg-card p-5">
            <h2 className="font-semibold">Pedir cotización</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Contale al vendedor qué necesitás. Te responde directo.
            </p>
            <div className="mt-4">
              <QuoteForm listingId={listing.id} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
