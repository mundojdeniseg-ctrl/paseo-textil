import { BusinessProfile, Listing } from "@/lib/types/domain";
import { BlogPost } from "@/lib/content/blog-posts";
import { getImageUrl, getAvatarUrl } from "@/lib/format";
import { ReviewStats } from "@/lib/data/reviews";

// Datos estructurados (schema.org JSON-LD) para AEO/SEO: ayudan a que
// buscadores y asistentes de IA (Google AI Overviews, ChatGPT, Perplexity)
// entiendan y citen el contenido del sitio con precisión. No afecta nada
// visual -- viaja en un <script type="application/ld+json"> invisible.

export const SITE_URL = "https://paseotextil.com";
export const SITE_NAME = "Paseo Textil";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type JsonLd = Record<string, any>;

export function organizationJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "Plaza textil argentina online: catálogo de anuncios, directorio de negocios y red social para talleres, proveedores y fabricantes del rubro textil.",
    areaServed: { "@type": "Country", name: "Argentina" },
  };
}

export function websiteJsonLd(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "es-AR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/anuncios?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function productJsonLd(listing: Listing): JsonLd {
  const imageUrl = listing.images[0] ? getImageUrl(listing.images[0].storagePath) : null;
  const price = listing.priceRetail ?? listing.priceWholesale;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description || listing.title,
    ...(listing.category?.name ? { category: listing.category.name } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(listing.businessProfile
      ? { brand: { "@type": "Brand", name: listing.businessProfile.businessName } }
      : {}),
    ...(!listing.priceOnRequest && price
      ? {
          offers: {
            "@type": "Offer",
            price,
            priceCurrency: listing.currencyCode,
            availability:
              listing.status === "activo" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${SITE_URL}/anuncios/${listing.id}`,
          },
        }
      : {}),
  };
}

export function localBusinessJsonLd(business: BusinessProfile, reviewStats: ReviewStats | null): JsonLd {
  const hasLocation = Boolean(business.city || business.province);
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: business.businessName,
    url: `${SITE_URL}/usuarios/${business.userId}`,
    ...(business.description ? { description: business.description } : {}),
    ...(business.logoUrl ? { image: getAvatarUrl(business.logoUrl) } : {}),
    ...(business.contactPhone ? { telephone: business.contactPhone } : {}),
    ...(hasLocation
      ? {
          address: {
            "@type": "PostalAddress",
            ...(business.city ? { addressLocality: business.city } : {}),
            ...(business.province ? { addressRegion: business.province } : {}),
            addressCountry: "AR",
          },
        }
      : {}),
    ...(reviewStats && reviewStats.count > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: reviewStats.average,
            reviewCount: reviewStats.count,
          },
        }
      : {}),
  };
}

export function faqPageJsonLd(faqs: { question: string; answerText: string }[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answerText },
    })),
  };
}

export function articleJsonLd(post: BlogPost): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${SITE_URL}/blog/${post.slug}`,
    articleBody: post.paragraphs.join("\n\n"),
    publisher: { "@type": "Organization", name: SITE_NAME },
    inLanguage: "es-AR",
  };
}

export function jsonLdScript(data: JsonLd) {
  return { __html: JSON.stringify(data) };
}
