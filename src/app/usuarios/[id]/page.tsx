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
  const logoUrl = getAvatarUrl(profile.businessProfile?.logoUrl);

  const [posts, listings] = canViewContent
    ? await Promise.all([getPostsByUser(profile.id), getListingsByUser(profile.id)])
    : [[], []];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt={profile.displayName} className="h-20 w-20 shrink-0 rounded-full object-cover" />
        ) : (
          <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
            {profile.displayName.charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <h1 className="text-2xl font-black tracking-tight">{profile.displayName}</h1>
          {profile.businessProfile && (
            <div className="mt-1 flex items-center justify-center gap-2 text-muted-foreground sm:justify-start">
              {logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logoUrl} alt="" className="h-5 w-5 rounded-full object-cover" />
              )}
              <span>{profile.businessProfile.businessName}</span>
              {profile.businessProfile.verificationStatus === "verificado" && (
                <Badge>Negocio verificado</Badge>
              )}
            </div>
          )}
        </div>

        {!isOwnProfile && (
          <div className="sm:ml-auto">
            {isLoggedIn ? (
              <Button
                render={<Link href={`/mensajes/${profile.id}`} />}
                nativeButton={false}
                className="rounded-full font-semibold"
              >
                Enviar mensaje
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

      {!canViewContent ? (
        <p className="mt-10 text-center text-muted-foreground">Este perfil es privado.</p>
      ) : (
        <>
          {listings.length > 0 && (
            <section className="mt-10">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                Anuncios
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </section>
          )}

          <section className="mt-10">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Publicaciones
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
