"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, SearchIcon, PlusCircleIcon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function MobileBottomNavClient({ isLoggedIn, unreadCount }: { isLoggedIn: boolean; unreadCount: number }) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Inicio", Icon: HomeIcon, active: pathname === "/" },
    { href: "/anuncios", label: "Anuncios", Icon: SearchIcon, active: pathname.startsWith("/anuncios") },
    { href: "/publicar", label: "Publicar", Icon: PlusCircleIcon, active: pathname.startsWith("/publicar") },
    {
      href: isLoggedIn ? "/cuenta" : "/cuenta/ingresar",
      label: isLoggedIn ? "Cuenta" : "Ingresar",
      Icon: UserIcon,
      active: pathname.startsWith("/cuenta"),
      badge: isLoggedIn && unreadCount > 0 ? unreadCount : null,
    },
  ];

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="grid grid-cols-4">
        {items.map(({ href, label, Icon, active, badge }) => (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors",
              active ? "text-primary" : "text-muted-foreground"
            )}
          >
            {active && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />}
            <span className="relative">
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              {badge != null && (
                <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                  {badge}
                </span>
              )}
            </span>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
