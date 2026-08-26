import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BusinessForm } from "@/components/business-form";

export const metadata = {
  title: "Nuevo negocio — Paseo Textil",
};

export default async function NuevoNegocioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar");

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Mis negocios</p>
      <h1 className="mt-2 text-3xl font-black tracking-tight">Nuevo negocio</h1>

      <div className="mt-8">
        <BusinessForm />
      </div>
    </div>
  );
}
