import Link from "next/link";
import { BusinessProfile } from "@/lib/types/domain";
import { getAvatarUrl } from "@/lib/format";
import { Badge } from "@/components/ui/badge";

export function SimilarBusinesses({ businesses }: { businesses: BusinessProfile[] }) {
  if (businesses.length === 0) return null;

  return (
    <section className="mt-10">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Negocios similares</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {businesses.map((b) => {
          const logo = getAvatarUrl(b.logoUrl);
          const location = [b.city, b.province].filter(Boolean).join(", ");
          return (
            <Link
              key={b.id}
              href={`/usuarios/${b.userId}`}
              className="flex items-center gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary"
            >
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={b.businessName} loading="lazy" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-lg font-bold text-primary">
                  {b.businessName.charAt(0).toUpperCase()}
                </span>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-semibold text-sm">{b.businessName}</p>
                  {b.verificationStatus === "verificado" && <Badge>Verificado</Badge>}
                </div>
                {location && <p className="text-xs text-muted-foreground">{location}</p>}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
