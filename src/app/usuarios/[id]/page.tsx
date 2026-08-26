import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicProfile, getSimilarBusinesses } from "@/lib/data/profiles";
import { getPostsByUser } from "@/lib/data/posts";
import { getListingsByUser } from "@/lib/data/listings";
import { getReviewsForBusiness, getReviewStatsForBusiness, getMyReviewForBusiness } from "@/lib/data/reviews";
import { getSavedIds } from "@/lib/data/favorites";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getAvatarUrl, formatRelativeDate } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { ListingCard } from "@/components/listing-card";
import { StarRatingDisplay } from "@/components/star-rating";
import { ReviewForm } from "@/components/review-form";
import { ReviewsList } from "@/components/reviews-list";
import { SimilarBusinesses } from "@/components/similar-businesses";
import { BusinessActionsBar } from "@/components/business-actions-bar";
import { SaveButton } from "@/components/save-button";
import { localBusinessJsonLd, jsonLdScript } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) return { title: "Perfil no encontrado — Paseo Textil" };

  const business = profile.businessProfiles[0] ?? null;
  const name = business?.businessName ?? profile.displayName;
  const location = business ? [business.city, business.province].filter(Boolean).join(", ") : null;
  const description = business
    ? business.description || `${name}${location ? ` — ${location}` : ""}. Perfil en Paseo Textil.`
    : `Perfil de ${name} en Paseo Textil.`;

  return {
    title: `${name} — Paseo Textil`,
    description,
    openGraph: { title: name, description, type: "profile" },
  };
}

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;
}

// Ficha estandarizada: el campo siempre ocupa su lugar en el mismo orden,
// vacio o no -- si no hay dato muestra "Sin datos" en gris en vez de
// desaparecer y correr el resto del layout.
function SpecItem({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: string | null | undefined;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "sm:col-span-2" : undefined}>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={value ? "text-sm font-medium" : "text-sm text-muted-foreground/70 italic"}>
        {value || "Sin datos"}
      </p>
    </div>
  );
}

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await getPublicProfile(id);
  if (!profile) notFound();

  let viewerId: string | null = null;
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    viewerId = user?.id ?? null;
  }
  const isOwnProfile = viewerId === profile.id;
  const isLoggedIn = Boolean(viewerId);
  const canViewContent = profile.isProfilePublic || isOwnProfile;

  const avatarUrl = getAvatarUrl(profile.avatarUrl);
  const coverUrl = getAvatarUrl(profile.coverUrl);
  const businesses = profile.businessProfiles;
  const business = businesses[0] ?? null;
  const otherBusinesses = businesses.slice(1);
  const logoUrl = getAvatarUrl(business?.logoUrl);
  const email = (business?.socialLinks as { email?: string } | undefined)?.email;
  const whatsapp = business?.contactPhone || profile.phone;
  // Si el negocio tiene su propio WhatsApp distinto al personal, el numero
  // personal no debe desaparecer del todo -- se muestra aparte.
  const personalWhatsapp =
    business?.contactPhone && profile.phone && business.contactPhone !== profile.phone ? profile.phone : null;
  const location = business && (business.city || business.province) ? [business.city, business.province].filter(Boolean).join(", ") : null;

  const [posts, listings] = canViewContent
    ? await Promise.all([getPostsByUser(profile.id), getListingsByUser(profile.id)])
    : [[], []];
  const savedListingIds = viewerId ? await getSavedIds(viewerId, "listing") : new Set<string>();

  // Reseñas, negocios similares y guardado: van atadas al negocio, no al
  // muro/perfil privado, asi que se muestran aunque el perfil sea privado.
  const [reviewStats, reviews, myReview, similarBusinesses, businessSavedIds] = business
    ? await Promise.all([
        getReviewStatsForBusiness(business.id),
        getReviewsForBusiness(business.id),
        viewerId ? getMyReviewForBusiness(business.id, viewerId) : Promise.resolve(null),
        getSimilarBusinesses(business.id),
        viewerId ? getSavedIds(viewerId, "business") : Promise.resolve(new Set<string>()),
      ])
    : [null, [], null, [], new Set<string>()];
  const canReview = business && isLoggedIn && !isOwnProfile;
  const businessSaved = business ? businessSavedIds.has(business.id) : false;
  const lastUpdatedLabel = business?.updatedAt ? formatRelativeDate(business.updatedAt) : null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      {business && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={jsonLdScript(localBusinessJsonLd(business, reviewStats))}
        />
      )}
      {/* Header estilo perfil de red social: fondo destacado, avatar grande,
          datos de contacto visibles para cualquiera sin necesidad de cuenta. */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="relative h-32 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent">
          {coverUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coverUrl} alt="" className="h-full w-full object-cover" />
          )}
        </div>
        <div className="px-6 pb-6">
          <div className="-mt-14 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:text-left">
            {business ? (
              logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={logoUrl}
                  alt={business.businessName}
                  className="h-28 w-28 shrink-0 rounded-2xl border-4 border-card bg-card object-cover shadow-md"
                />
              ) : (
                <span className="flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl border-4 border-card bg-primary/10 text-4xl font-bold text-primary shadow-md">
                  {business.businessName.charAt(0).toUpperCase()}
                </span>
              )
            ) : avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarUrl}
                alt={profile.displayName}
                className="h-24 w-24 shrink-0 rounded-full border-4 border-card object-cover shadow-sm"
              />
            ) : (
              <span className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-4 border-card bg-primary/10 text-3xl font-bold text-primary shadow-sm">
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            )}
            <div className="sm:pb-1">
              {business ? (
                <>
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h1 className="text-2xl font-black tracking-tight">{business.businessName}</h1>
                    {business.verificationStatus === "verificado" && <Badge>Negocio verificado</Badge>}
                    {business.acceptsOrders === false && (
                      <Badge className="bg-muted text-muted-foreground">No toma pedidos por ahora</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5 text-sm text-muted-foreground sm:justify-start">
                    {reviewStats && reviewStats.count > 0 && (
                      <StarRatingDisplay average={reviewStats.average} count={reviewStats.count} size="md" />
                    )}
                    {location && <span>{location}</span>}
                    {lastUpdatedLabel && <span>· actualizado {lastUpdatedLabel}</span>}
                  </div>
                  <div className="mt-1.5 flex items-center justify-center gap-1.5 text-sm text-muted-foreground sm:justify-start">
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
                    ) : (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {profile.displayName.charAt(0).toUpperCase()}
                      </span>
                    )}
                    Perfil de {profile.displayName}
                  </div>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-black tracking-tight">{profile.displayName}</h1>
                  {location && <p className="mt-0.5 text-sm text-muted-foreground">{location}</p>}
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:ml-auto sm:justify-end sm:pb-1">
              {business && <BusinessActionsBar businessId={business.id} businessName={business.businessName} />}
              {business && !isOwnProfile && (
                <SaveButton
                  targetType="business"
                  targetId={business.id}
                  initialSaved={businessSaved}
                  isLoggedIn={isLoggedIn}
                  variant="full"
                />
              )}
              {!isOwnProfile &&
                (isLoggedIn ? (
                  <Button
                    render={<Link href={`/mensajes/${profile.id}`} />}
                    nativeButton={false}
                    variant="outline"
                    className="rounded-full font-semibold"
                  >
                    Mensaje
                  </Button>
                ) : (
                  <Button
                    render={<Link href="/cuenta/ingresar" />}
                    nativeButton={false}
                    variant="outline"
                    className="rounded-full"
                  >
                    Iniciá sesión para escribirle
                  </Button>
                ))}
            </div>
          </div>

          {/* Contacto directo: siempre visible, no hace falta cuenta ni
              mensaje interno para conseguir un WhatsApp o mail. */}
          {(whatsapp || email) && (
            <div className="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
              {whatsapp && (
                <a
                  href={waLink(whatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#1FBE5A]"
                >
                  WhatsApp: {whatsapp}
                </a>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-primary"
                >
                  {email}
                </a>
              )}
              {personalWhatsapp && (
                <a
                  href={waLink(personalWhatsapp)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-primary"
                >
                  WhatsApp personal: {personalWhatsapp}
                </a>
              )}
            </div>
          )}

          {/* Ficha estandarizada: mismos campos, mismo orden, siempre --
              "Sin datos" en gris en vez de esconder la fila. */}
          {business && (
            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-border pt-5 sm:grid-cols-2">
              <SpecItem label="Descripción" value={business.description} fullWidth />
              <SpecItem label="Dirección" value={business.addressText} />
              <SpecItem label="Horario de atención" value={business.hoursText} />
              <SpecItem label="Mínimo de producción" value={business.minProduction} />
              <SpecItem label="Tiempo de entrega estimado" value={business.leadTime} />
              <SpecItem label="Tipos de tela" value={business.fabricTypes} />
              <SpecItem
                label="Moldes propios"
                value={
                  business.acceptsOwnPatterns == null
                    ? null
                    : business.acceptsOwnPatterns
                      ? "Acepta moldes del cliente"
                      : "No acepta moldes del cliente"
                }
              />
            </div>
          )}
        </div>
      </div>

      {otherBusinesses.length > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Otras marcas · {otherBusinesses.length}
          </h2>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {otherBusinesses.map((biz) => {
              const bizLogo = getAvatarUrl(biz.logoUrl);
              const bizEmail = (biz.socialLinks as { email?: string } | undefined)?.email;
              const bizWhatsapp = biz.contactPhone;
              const bizLocation = biz.city || biz.province ? [biz.city, biz.province].filter(Boolean).join(", ") : null;
              return (
                <div key={biz.id} className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4">
                  {bizLogo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={bizLogo} alt={biz.businessName} className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-xl font-bold text-primary">
                      {biz.businessName.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="truncate font-semibold text-foreground">{biz.businessName}</p>
                      {biz.verificationStatus === "verificado" && <Badge>Verificado</Badge>}
                    </div>
                    {bizLocation && <p className="text-xs text-muted-foreground">{bizLocation}</p>}
                    <div className="mt-1 flex flex-wrap gap-2">
                      {bizWhatsapp && (
                        <a
                          href={waLink(bizWhatsapp)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-[#1FBE5A] hover:underline"
                        >
                          WhatsApp: {bizWhatsapp}
                        </a>
                      )}
                      {bizEmail && (
                        <a href={`mailto:${bizEmail}`} className="text-xs font-semibold text-primary hover:underline">
                          {bizEmail}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!canViewContent ? (
        <p className="mt-10 text-center text-muted-foreground">Este perfil es privado.</p>
      ) : (
        <>
          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Anuncios · {listings.length}
            </h2>
            {listings.length === 0 ? (
              <p className="mt-3 text-muted-foreground">Todavía no publicó ningún anuncio.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    isLoggedIn={isLoggedIn}
                    saved={savedListingIds.has(listing.id)}
                  />
                ))}
              </div>
            )}
          </section>

          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Publicaciones · {posts.length}
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              {posts.length === 0 ? (
                <p className="text-muted-foreground">Todavía no publicó nada en el muro.</p>
              ) : (
                posts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    path={`/usuarios/${profile.id}`}
                    isLoggedIn={isLoggedIn}
                    compact
                  />
                ))
              )}
            </div>
          </section>
        </>
      )}

      {business && (
        <section className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Reseñas · {reviewStats?.count ?? 0}
          </h2>
          <div className="mt-4 flex flex-col gap-4">
            {canReview && (
              <ReviewForm businessProfileId={business.id} profilePath={`/usuarios/${profile.id}`} myReview={myReview} />
            )}
            {!isLoggedIn && (
              <p className="text-sm text-muted-foreground">
                <Link href="/cuenta/ingresar" className="text-primary underline">
                  Iniciá sesión
                </Link>{" "}
                para dejar tu reseña sobre este negocio.
              </p>
            )}
            <ReviewsList reviews={reviews} />
          </div>
        </section>
      )}

      {business && <SimilarBusinesses businesses={similarBusinesses} />}
    </div>
  );
}
