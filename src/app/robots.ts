import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // "/cuenta" a secas es el panel privado (redirige a /cuenta/ingresar
      // si no hay sesion, asi que un bot nunca ve nada sensible ahi tampoco),
      // pero como disallow matchea por prefijo bloquear ese solo path
      // tambien tapaba /cuenta/ingresar y /cuenta/registrarse -- paginas
      // publicas de conversion que conviene que se indexen.
      disallow: ["/cuenta$", "/mensajes", "/mis-anuncios", "/auth"],
    },
    sitemap: "https://paseotextil.com/sitemap.xml",
  };
}
