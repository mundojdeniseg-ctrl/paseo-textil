import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessById } from "@/lib/data/profiles";
import { BusinessForm } from "@/components/business-form";

export const metadata = {
  title: "Editar negocio — Paseo Textil",
};

export default async function EditarNegocioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar");

  const business = await getBusinessById(id);
  if (!business || business.userId !== user.id) notFound();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mis negocios</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Editar negocio</h1>

      <div className="mt-8">
        <BusinessForm business={business} />
      </div>
    </div>
  );
}
