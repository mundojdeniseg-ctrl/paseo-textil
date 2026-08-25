import { notFound } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { QuoteForm } from "@/components/quote-form";
import { ListingGallery } from "@/components/listing-gallery";
import { ReportButton } from "@/components/report-button";
import { getListingById } from "@/lib/data/listings";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { formatPrice, formatRelativeDate, getAvatarUrl } from "@/lib/format";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getListingById(id);
  if (!listing) notFound();

  let isOwner = false;
  let isLoggedIn = false;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isLoggedIn = Boolean(user);
    isOwner = Boolean(user && listing.userId === user.id);
  }

  const attributeEntries = Object.entries(listing.attributes);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <Link href="/anuncios" className="text-sm text-muted-foreground hover:text-foreground">
        ← Volver a anuncios
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <ListingGallery images={listing.images} categoryName={listing.category?.name} />

          <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
            {listing.category?.name}
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
            {listing.title}
          </h1>
          <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
            <span>
              {listing.city}, {listing.province} · publicado {formatRelativeDate(listing.createdAt)}
            </span>
            {isOwner ? (
              <Link href={`/anuncios/${listing.id}/editar`} className="text-primary underline">
                Editar
              </Link>
            ) : (
              <ReportButton targetType="listing" targetId={listing.id} />
            )}
          </div>

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
            ) : listing.priceRetail && listing.priceWholesale ? (
              <div className="space-y-1">
                <p className="text-2xl font-black">
                  {formatPrice(listing.priceRetail, listing.currencyCode)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">x menor</span>
                </p>
                <p className="text-lg font-bold text-primary">
                  {formatPrice(listing.priceWholesale, listing.currencyCode)}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">x mayor</span>
                </p>
              </div>
            ) : (
              <p className="text-2xl font-black">
                {formatPrice((listing.priceRetail ?? listing.priceWholesale)!, listing.currencyCode)}
              </p>
            )}

            {listing.businessProfile && (
              <Link
                href={listing.userId ? `/usuarios/${listing.userId}` : "#"}
                className={`mt-4 flex items-center gap-3 border-t border-border pt-4 ${
                  listing.userId ? "hover:opacity-80" : "pointer-events-none"
                }`}
              >
                {getAvatarUrl(listing.businessProfile.logoUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getAvatarUrl(listing.businessProfile.logoUrl)!}
                    alt={listing.businessProfile.businessName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {listing.businessProfile.businessName.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="font-semibold leading-tight">{listing.businessProfile.businessName}</p>
                  {listing.businessProfile.verificationStatus === "verificado" ? (
                    <Badge className="mt-0.5">Negocio verificado</Badge>
                  ) : (
                    <p className="text-xs text-muted-foreground">Perfil de negocio</p>
                  )}
                </div>
              </Link>
            )}

            {!listing.businessProfile && listing.seller && (
              <Link
                href={`/usuarios/${listing.seller.id}`}
                className="mt-4 flex items-center gap-3 border-t border-border pt-4 hover:opacity-80"
              >
                {getAvatarUrl(listing.seller.avatarUrl) ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={getAvatarUrl(listing.seller.avatarUrl)!}
                    alt={listing.seller.displayName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-bold text-primary">
                    {listing.seller.displayName.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="font-semibold leading-tight">{listing.seller.displayName}</p>
                  <p className="text-xs text-muted-foreground">Ver perfil</p>
                </div>
              </Link>
            )}

            {!listing.businessProfile && !listing.seller && (listing.contactName || listing.contactPhone) && (
              <div className="mt-4 border-t border-border pt-4">
                {listing.contactName && <p className="font-semibold leading-tight">{listing.contactName}</p>}
                {listing.contactPhone && (
                  <a
                    href={`https://wa.me/${listing.contactPhone.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center justify-center rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1FBE5A]"
                  >
                    Escribir por WhatsApp
                  </a>
                )}
              </div>
            )}

            {listing.userId && !isOwner && (
              <Button
                render={<Link href={isLoggedIn ? `/mensajes/${listing.userId}` : "/cuenta/ingresar"} />}
                nativeButton={false}
                variant="outline"
                className="mt-4 w-full rounded-full font-semibold"
              >
                {isLoggedIn ? "Enviar mensaje directo" : "Iniciá sesión para escribir"}
              </Button>
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
