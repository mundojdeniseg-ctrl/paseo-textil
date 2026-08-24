import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getListingById, getCategories } from "@/lib/data/listings";
import { EditListingForm } from "@/components/edit-listing-form";

export default async function EditarAnuncioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar");

  const listing = await getListingById(id);
  if (!listing) notFound();
  if (listing.userId !== user.id) notFound();

  const categories = await getCategories();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Editar anuncio</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">{listing.title}</h1>
      <div className="mt-8">
        <EditListingForm listing={listing} categories={categories} />
      </div>
    </div>
  );
}
