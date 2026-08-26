"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { SearchIcon, XIcon } from "lucide-react";
import { searchListingsLiveAction } from "@/app/anuncios/actions";
import { Listing } from "@/lib/types/domain";
import { getImageUrl } from "@/lib/format";

// Buscador global: vive en el header (desktop inline, mobile fila propia),
// siempre visible. Resultados en vivo con debounce de 300ms + atajo de
// teclado Ctrl+K / Cmd+K para enfocarlo desde cualquier pagina.
export function GlobalSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Listing[]>([]);
  const [open, setOpen] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [isPending, startTransition] = useTransition();

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    setIsMac(/Mac|iPod|iPhone|iPad/.test(navigator.platform));
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === inputRef.current) {
        setOpen(false);
        inputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setSearched(false);
      return;
    }
    const timer = setTimeout(() => {
      startTransition(async () => {
        const data = await searchListingsLiveAction(q);
        setResults(data);
        setSearched(true);
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function goToFullResults(finalQuery: string) {
    const q = finalQuery.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/anuncios?q=${encodeURIComponent(q)}`);
  }

  return (
    <div ref={containerRef} className={`relative w-full ${className ?? ""}`}>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              goToFullResults(query);
            }
          }}
          placeholder="Buscar telas, proveedores, zonas..."
          aria-label="Buscar en Paseo Textil"
          className="h-10 w-full rounded-full border border-border bg-background pl-9 pr-9 text-sm outline-none ring-primary/30 focus:ring-2 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label="Borrar búsqueda"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <XIcon className="h-4 w-4" />
          </button>
        ) : (
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:block">
            {isMac ? "⌘K" : "Ctrl K"}
          </kbd>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card p-2 shadow-lg">
          {isPending && <p className="px-3 py-3 text-sm text-muted-foreground">Buscando...</p>}

          {!isPending && searched && results.length === 0 && (
            <div className="px-3 py-4 text-sm">
              <p className="font-medium">No encontramos nada para &quot;{query}&quot;.</p>
              <p className="mt-1 text-muted-foreground">
                Probá con otra palabra o mirá{" "}
                <Link href="/anuncios" className="text-primary underline" onClick={() => setOpen(false)}>
                  todos los anuncios
                </Link>
                .
              </p>
            </div>
          )}

          {!isPending &&
            results.map((listing) => {
              const image = listing.images[0] ? getImageUrl(listing.images[0].storagePath) : null;
              return (
                <Link
                  key={listing.id}
                  href={`/anuncios/${listing.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl p-2 hover:bg-muted"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted">
                    {image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={image} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs font-semibold text-muted-foreground">
                        {listing.category?.name?.charAt(0) ?? "?"}
                      </span>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium">{listing.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {listing.category?.name} · {listing.city}, {listing.province}
                    </span>
                  </span>
                </Link>
              );
            })}

          {!isPending && results.length > 0 && (
            <button
              type="button"
              onClick={() => goToFullResults(query)}
              className="mt-1 block w-full rounded-xl px-3 py-2 text-center text-sm font-semibold text-primary hover:bg-muted"
            >
              Ver todos los resultados para &quot;{query}&quot; →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
