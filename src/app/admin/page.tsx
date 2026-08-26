import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { mapBusinessProfileRow } from "@/lib/data/profiles";
import { VerifyButtons } from "@/components/verify-buttons";

export const metadata = {
  title: "Admin — Paseo Textil",
};

export default async function AdminPage() {
  if (!isSupabaseConfigured()) redirect("/");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/cuenta/ingresar");

  const { data: me } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (me?.role !== "admin") redirect("/");

  const { data } = await supabase
    .from("business_profiles")
    .select("*, owner:users(display_name)")
    .order("created_at", { ascending: false });

  const businesses = (data ?? []).map((row) => ({
    ...mapBusinessProfileRow(row),
    ownerName: (row.owner as { display_name: string | null } | null)?.display_name || "Usuario sin nombre",
  }));

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Admin</p>
      <h1 className="mt-2 text-2xl font-black tracking-tight">Verificación de negocios</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Revisá cada negocio a mano. Marcalo &quot;Verificado&quot; si te parece un negocio real y de confianza — la
        insignia aparece en su ficha y en sus anuncios.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {businesses.length === 0 && <p className="text-muted-foreground">Todavía no hay negocios cargados.</p>}
        {businesses.map((b) => (
          <div
            key={b.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4"
          >
            <div>
              <p className="font-semibold">{b.businessName}</p>
              <p className="text-xs text-muted-foreground">
                {b.ownerName} · {[b.city, b.province].filter(Boolean).join(", ") || "sin ubicación"} · estado actual:{" "}
                <strong>{b.verificationStatus}</strong>
              </p>
            </div>
            <VerifyButtons businessId={b.id} currentStatus={b.verificationStatus} />
          </div>
        ))}
      </div>
    </div>
  );
}
