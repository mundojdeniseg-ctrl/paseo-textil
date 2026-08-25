import { PublishForm } from "@/components/publish-form";
import { getCategories } from "@/lib/data/listings";
import { getMyBusinesses } from "@/lib/data/profiles";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

export default async function PublicarPage() {
  const categories = await getCategories();

  let myBusinesses: Awaited<ReturnType<typeof getMyBusinesses>> = [];
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) myBusinesses = await getMyBusinesses(user.id);
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Publicar</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Publicá tu anuncio</h1>
      <p className="mt-2 text-muted-foreground">
        Gratis, sin cuenta obligatoria y sin trámites. Completá los datos y tu anuncio queda activo al instante.
      </p>

      <div className="mt-8">
        <PublishForm categories={categories} myBusinesses={myBusinesses} />
      </div>
    </div>
  );
}
