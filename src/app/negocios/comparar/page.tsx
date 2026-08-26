import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getBusinessById } from "@/lib/data/profiles";
import { getReviewStatsMap } from "@/lib/data/reviews";
import { BusinessProfile } from "@/lib/types/domain";

export const metadata = {
  title: "Comparar negocios — Paseo Textil",
};

export default async function CompararNegociosPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids: idsParam } = await searchParams;
  const ids = (idsParam ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  const businesses = (await Promise.all(ids.map((id) => getBusinessById(id)))).filter(
    (b): b is BusinessProfile => Boolean(b)
  );

  if (businesses.length === 0) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-black tracking-tight">Comparador de negocios</h1>
        <p className="mt-3 text-muted-foreground">
          Elegí &quot;Comparar&quot; en dos o tres fichas de negocio para verlas lado a lado acá.
        </p>
        <Link href="/anuncios" className="mt-4 inline-block text-primary underline">
          Ver anuncios
        </Link>
      </div>
    );
  }

  const stats = await getReviewStatsMap(businesses.map((b) => b.id));

  const rows: { label: string; render: (b: BusinessProfile) => ReactNode }[] = [
    {
      label: "Negocio",
      render: (b) => (
        <Link href={`/usuarios/${b.userId}`} className="font-semibold text-primary hover:underline">
          {b.businessName}
        </Link>
      ),
    },
    {
      label: "Verificación",
      render: (b) => (b.verificationStatus === "verificado" ? <Badge>Verificado</Badge> : "Sin verificar"),
    },
    {
      label: "Reseñas",
      render: (b) => (stats[b.id]?.count ? `${stats[b.id].average.toFixed(1)} ★ (${stats[b.id].count})` : "Sin reseñas todavía"),
    },
    { label: "Ubicación", render: (b) => [b.city, b.province].filter(Boolean).join(", ") || "No especifica" },
    { label: "Mínimo de producción", render: (b) => b.minProduction || "No especifica" },
    { label: "Tiempo de entrega", render: (b) => b.leadTime || "No especifica" },
    { label: "Tipos de tela", render: (b) => b.fabricTypes || "No especifica" },
    {
      label: "Acepta moldes propios",
      render: (b) => (b.acceptsOwnPatterns === null || b.acceptsOwnPatterns === undefined ? "No especifica" : b.acceptsOwnPatterns ? "Sí" : "No"),
    },
    { label: "Horario", render: (b) => b.hoursText || "No especifica" },
    { label: "¿Acepta pedidos ahora?", render: (b) => (b.acceptsOrders === false ? "No por el momento" : "Sí") },
    {
      label: "Contacto",
      render: (b) =>
        b.contactPhone ? (
          <a
            className="text-primary hover:underline"
            href={`https://wa.me/${b.contactPhone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        ) : (
          "No especifica"
        ),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-black tracking-tight">Comparar negocios</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {businesses.length} negocio{businesses.length > 1 ? "s" : ""} lado a lado.
      </p>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-border">
                <th className="w-40 shrink-0 py-3 pr-4 text-left align-top text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {row.label}
                </th>
                {businesses.map((b) => (
                  <td key={b.id} className="py-3 pr-4 align-top">
                    {row.render(b)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
