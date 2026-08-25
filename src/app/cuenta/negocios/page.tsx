import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyBusinesses } from "@/lib/data/profiles";
import { getAvatarUrl } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BusinessDeleteButton } from "@/components/business-delete-button";

export default async function MisNegociosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar");

  const businesses = await getMyBusinesses(user.id);

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mis negocios</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Tus marcas</h1>
        </div>
        <Button render={<Link href="/cuenta/negocios/nuevo" />} nativeButton={false} className="rounded-full font-semibold">
          + Nuevo negocio
        </Button>
      </div>
      <p className="mt-2 text-muted-foreground">
        Podés cargar más de un negocio o marca. Se muestran con protagonismo en tu perfil público.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {businesses.length === 0 ? (
          <p className="text-muted-foreground">Todavía no cargaste ningún negocio.</p>
        ) : (
          businesses.map((biz) => {
            const logoUrl = getAvatarUrl(biz.logoUrl);
            return (
              <div key={biz.id} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4">
                {logoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={logoUrl} alt={biz.businessName} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary">
                    {biz.businessName.charAt(0).toUpperCase()}
                  </span>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-semibold">{biz.businessName}</p>
                    {biz.verificationStatus === "verificado" && <Badge>Verificado</Badge>}
                  </div>
                  {biz.contactPhone && <p className="text-sm text-muted-foreground">{biz.contactPhone}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Link
                      href={`/cuenta/negocios/${biz.id}/editar`}
                      className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary"
                    >
                      Editar
                    </Link>
                    <BusinessDeleteButton businessId={biz.id} />
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
