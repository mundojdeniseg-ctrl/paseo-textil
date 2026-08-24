import { PublishForm } from "@/components/publish-form";
import { getCategories } from "@/lib/data/listings";

export default async function PublicarPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Publicar</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Publicá tu anuncio</h1>
      <p className="mt-2 text-muted-foreground">
        Gratis, sin cuenta obligatoria y sin trámites. Completá los datos y tu anuncio queda activo al instante.
      </p>

      <div className="mt-8">
        <PublishForm categories={categories} />
      </div>
    </div>
  );
}
