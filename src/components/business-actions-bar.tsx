"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "pt_compare_business_ids";
const MAX_COMPARE = 3;

function readIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function BusinessActionsBar({ businessId, businessName }: { businessId: string; businessName: string }) {
  const [copied, setCopied] = useState(false);
  const [inCompare, setInCompare] = useState(false);

  useEffect(() => {
    setInCompare(readIds().includes(businessId));
  }, [businessId]);

  function share() {
    const url = window.location.href;
    const nav = navigator as Navigator & { share?: (data: { title: string; url: string }) => Promise<void> };
    if (nav.share) {
      nav.share({ title: businessName, url }).catch(() => {});
      return;
    }
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function toggleCompare() {
    let ids = readIds().filter((id) => id !== businessId);
    if (!inCompare) ids = [...ids, businessId].slice(-MAX_COMPARE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new Event("pt-compare-changed"));
    setInCompare(!inCompare);
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={share}
        className="rounded-full border border-border px-3 py-1.5 text-xs font-semibold hover:border-primary"
      >
        {copied ? "¡Copiado!" : "Compartir"}
      </button>
      <button
        type="button"
        onClick={toggleCompare}
        className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
          inCompare ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary"
        }`}
      >
        {inCompare ? "En comparador ✓" : "Comparar"}
      </button>
    </div>
  );
}
