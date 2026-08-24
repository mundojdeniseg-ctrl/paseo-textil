import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyListings } from "@/lib/data/listings";
import { getImageUrl, formatPrice, formatRelativeDate } from "@/lib/format";
import { ListingStatusActions } from "@/components/listing-status-actions";
import { Button } from "@/components/ui/button";

const STATUS_LABEL: Record<string, string> = {
  activo: "Activo",
  pausado: "Pausado",
  vencido: "Vencido",
};

export default async function MisAnunciosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar");

  const listings = await getMyListings(user.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mis anuncios</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Tus publicaciones</h1>
        </div>
        <Button render={<Link href="/publicar" />} nativeButton={false} className="rounded-full font-semibold">
          Publicar nuevo
        </Button>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {listings.length === 0 ? (
          <p className="text-muted-foreground">
            Todavía no publicaste ningún anuncio.{" "}
            <Link href="/publicar" className="text-primary underline">
              Publicá el primero
            </Link>
            .
          </p>
        ) : (
          listings.map((listing) => {
            const imageUrl = listing.images[0] ? getImageUrl(listing.images[0].storagePath) : null;
            const price = listing.priceOnRequest
              ? "Consultar precio"
              : formatPrice((listing.priceRetail ?? listing.priceWholesale)!, listing.currencyCode);

            return (
              <div key={listing.id} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                      {listing.category?.name}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <Link href={`/anuncios/${listing.id}`} className="font-semibold leading-tight hover:underline">
                      {listing.title}
                    </Link>
                    <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                      {STATUS_LABEL[listing.status] ?? listing.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {price} · {formatRelativeDate(listing.createdAt)}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/anuncios/${listing.id}/editar`}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary"
                    >
                      Editar
                    </Link>
                    <ListingStatusActions listingId={listing.id} status={listing.status} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
