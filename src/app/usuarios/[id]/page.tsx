import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicProfile } from "@/lib/data/profiles";
import { getPostsByUser } from "@/lib/data/posts";
import { getListingsByUser } from "@/lib/data/listings";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getAvatarUrl } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { ListingCard } from "@/components/listing-card";

function waLink(phone: string) {
  return `https://wa.me/${phone.replace(/[^0-9]/g, "")}`;
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
  const business = profile.businessProfile;
  const logoUrl = getAvatarUrl(business?.logoUrl);
  const email = (business?.socialLinks as { email?: string } | undefined)?.email;
  const whatsapp = business?.contactPhone || profile.phone;
  const location = business && (business.city || business.province) ? [business.city, business.province].filter(Boolean).join(", ") : null;

  const [posts, listings] = canViewContent
    ? await Promise.all([getPostsByUser(profile.id), getListingsByUser(profile.id)])
    : [[], []];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      {/* Header estilo perfil de red social: fondo destacado, avatar grande,
          datos de contacto visibles para cualquiera sin necesidad de cuenta. */}
      <div className="overflow-hidden rounded-3xl border border-border bg-card">
        <div className="h-24 bg-gradient-to-r from-primary/25 via-primary/10 to-transparent" />
        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-end sm:text-left">
            {avatarUrl ? (
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
              <h1 className="text-2xl font-black tracking-tight">{profile.displayName}</h1>
              {business && (
                <div className="mt-1 flex items-center justify-center gap-2 text-muted-foreground sm:justify-start">
                  {logoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
                  )}
                  <span className="font-medium text-foreground">{business.businessName}</span>
                  {business.verificationStatus === "verificado" && <Badge>Negocio verificado</Badge>}
                </div>
              )}
              {location && <p className="mt-0.5 text-sm text-muted-foreground">{location}</p>}
            </div>

            {!isOwnProfile && (
              <div className="flex gap-2 sm:ml-auto sm:pb-1">
                {isLoggedIn ? (
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
                )}
              </div>
            )}
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
                  className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  WhatsApp
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
            </div>
          )}
        </div>
      </div>

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
                  <ListingCard key={listing.id} listing={listing} />
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
                  <PostCard key={post.id} post={post} path={`/usuarios/${profile.id}`} isLoggedIn={isLoggedIn} />
                ))
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}
