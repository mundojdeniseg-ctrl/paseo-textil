"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const STORAGE_KEY = "pt_compare_business_ids";

// Barra flotante global (montada en el layout raiz): aparece en cualquier
// pagina en cuanto hay 2+ negocios marcados para comparar en localStorage.
export function CompareTray() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    function sync() {
      try {
        setIds(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]"));
      } catch {
        setIds([]);
      }
    }
    sync();
    window.addEventListener("pt-compare-changed", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("pt-compare-changed", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (ids.length < 2) return null;

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("pt-compare-changed"));
  }

  return (
    <div className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-full border border-border bg-card px-4 py-2.5 shadow-lg md:bottom-4">
      <span className="text-sm font-semibold">
        Comparar {ids.length} negocio{ids.length > 1 ? "s" : ""}
      </span>
      <Link
        href={`/negocios/comparar?ids=${ids.join(",")}`}
        className="rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
      >
        Ver comparación →
      </Link>
      <button type="button" onClick={clear} className="text-xs text-muted-foreground hover:text-foreground">
        Limpiar
      </button>
    </div>
  );
}
