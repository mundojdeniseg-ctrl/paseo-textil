import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import { signOutAction } from "@/app/cuenta/actions";
import { Button } from "@/components/ui/button";
import { getAvatarUrl } from "@/lib/format";

export default async function MiCuentaPage({
  searchParams,
}: {
  searchParams: Promise<{ avatarError?: string }>;
}) {
  const { avatarError } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cuenta/ingresar");
  }

  const { data: profile } = await supabase.from("users").select("*").eq("id", user.id).maybeSingle();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mi cuenta</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Tu perfil</h1>
        </div>
        <form action={signOutAction}>
          <Button type="submit" variant="outline" className="rounded-full">
            Cerrar sesión
          </Button>
        </form>
      </div>
      <p className="mt-2 text-muted-foreground">{user.email}</p>
      <div className="mt-2 flex gap-4">
        <Link href="/mis-anuncios" className="inline-block text-sm text-primary underline">
          Ver mis anuncios
        </Link>
        <Link href="/cuenta/negocios" className="inline-block text-sm text-primary underline">
          Mis negocios
        </Link>
      </div>

      {avatarError && (
        <p className="mt-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          Tu cuenta se creó bien, pero no pudimos guardar la foto de perfil. Probá subirla de nuevo acá abajo.
        </p>
      )}

      <div className="mt-8">
        <ProfileForm
          displayName={profile?.display_name ?? ""}
          phone={profile?.phone ?? ""}
          avatarUrl={getAvatarUrl(profile?.avatar_url)}
          coverUrl={getAvatarUrl(profile?.cover_url)}
          isProfilePublic={profile?.is_profile_public ?? true}
          userId={user.id}
        />
      </div>
    </div>
  );
}
