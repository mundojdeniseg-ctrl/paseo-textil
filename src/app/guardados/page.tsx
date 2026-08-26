import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getSavedListings, getSavedBusinesses } from "@/lib/data/favorites";
import { ListingCard } from "@/components/listing-card";
import { SaveButton } from "@/components/save-button";
import { Badge } from "@/components/ui/badge";
import { getAvatarUrl } from "@/lib/format";

export const metadata = {
  title: "Mis guardados — Paseo Textil",
};

export default async function GuardadosPage() {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar");

  const [listings, businesses] = await Promise.all([getSavedListings(user.id), getSavedBusinesses(user.id)]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight sm:text-3xl">Mis guardados</h1>
      <p className="mt-1 text-sm text-muted-foreground">Anuncios y negocios que guardaste para volver después.</p>

      <section className="mt-8">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Anuncios · {listings.length}
        </h2>
        {listings.length === 0 ? (
          <p className="mt-3 text-muted-foreground">
            Todavía no guardaste ningún anuncio. Tocá el ☆ en cualquier anuncio para guardarlo.
          </p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} isLoggedIn saved />
            ))}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Negocios · {businesses.length}
        </h2>
        {businesses.length === 0 ? (
          <p className="mt-3 text-muted-foreground">Todavía no guardaste ningún negocio.</p>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {businesses.map((b) => {
              const logo = getAvatarUrl(b.logoUrl);
              const location = [b.city, b.province].filter(Boolean).join(", ");
              return (
                <div
                  key={b.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
                >
                  <Link href={`/usuarios/${b.userId}`} className="flex min-w-0 items-center gap-3">
                    {logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo}
                        alt={b.businessName}
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                        {b.businessName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="truncate font-semibold text-sm">{b.businessName}</p>
                        {b.verificationStatus === "verificado" && <Badge>Verificado</Badge>}
                      </div>
                      {location && <p className="text-xs text-muted-foreground">{location}</p>}
                    </div>
                  </Link>
                  <SaveButton targetType="business" targetId={b.id} initialSaved isLoggedIn variant="icon" />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
