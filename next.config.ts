import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Por defecto Next.js corta en 1MB. Una foto de celular real pesa
      // varios MB, y publicar/muro permiten hasta 8 archivos en un solo
      // envio -- 1MB rompia la subida en cualquier uso real (no en mis
      // pruebas, que usaban imagenes de 68 bytes).
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
