import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileForm } from "@/components/profile-form";
import { signOutAction } from "@/app/cuenta/actions";
import { Button } from "@/components/ui/button";
import { getAvatarUrl } from "@/lib/format";

export default async function MiCuentaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/cuenta/ingresar");
  }

  const [{ data: profile }, { data: businessProfile }] = await Promise.all([
    supabase.from("users").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("business_profiles").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

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

      <div className="mt-8">
        <ProfileForm
          displayName={profile?.display_name ?? ""}
          phone={profile?.phone ?? ""}
          avatarUrl={getAvatarUrl(profile?.avatar_url)}
          isProfilePublic={profile?.is_profile_public ?? true}
          userId={user.id}
          businessProfile={
            businessProfile
              ? {
                  businessName: businessProfile.business_name,
                  contactPhone: businessProfile.contact_phone ?? "",
                  email: (businessProfile.social_links as { email?: string } | null)?.email ?? "",
                  address: businessProfile.address_text ?? "",
                  logoUrl: getAvatarUrl(businessProfile.logo_url),
                }
              : null
          }
        />
      </div>
    </div>
  );
}
