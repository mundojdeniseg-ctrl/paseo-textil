import type { MetadataRoute } from "next";
import { getListings } from "@/lib/data/listings";

const BASE_URL = "https://paseotextil.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/anuncios`, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE_URL}/muro`, changeFrequency: "hourly", priority: 0.7 },
    { url: `${BASE_URL}/publicar`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/legales/terminos`, changeFrequency: "yearly", priority: 0.1 },
    { url: `${BASE_URL}/legales/privacidad`, changeFrequency: "yearly", priority: 0.1 },
  ];

  // Si Supabase no responde (red caida, timeout), que se pierdan los
  // anuncios del sitemap y no el sitemap entero -- las rutas estaticas no
  // dependen de la base. OJO: Next.js usa una excepcion interna con
  // digest "DYNAMIC_SERVER_USAGE" para marcar esta ruta como dinamica
  // (porque getListings usa cookies()) -- esa hay que dejarla pasar, no es
  // un error real.
  try {
    const listings = await getListings();
    const listingRoutes: MetadataRoute.Sitemap = listings.map((listing) => ({
      url: `${BASE_URL}/anuncios/${listing.id}`,
      lastModified: new Date(listing.createdAt),
      changeFrequency: "weekly",
      priority: 0.6,
    }));
    return [...staticRoutes, ...listingRoutes];
  } catch (error) {
    if (error instanceof Error && "digest" in error && error.digest === "DYNAMIC_SERVER_USAGE") {
      throw error;
    }
    console.error("sitemap: no se pudieron cargar los anuncios:", error);
    return staticRoutes;
  }
}
