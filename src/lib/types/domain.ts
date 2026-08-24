export type ListingStatus = "activo" | "pausado" | "vencido" | "eliminado";

export type Category = {
  id: string;
  slug: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
};

export type BusinessProfile = {
  id: string;
  userId: string;
  businessName: string;
  description: string | null;
  verificationStatus: "sin_verificar" | "pendiente" | "verificado" | "rechazado";
  city: string | null;
  province: string | null;
  contactPhone: string | null;
  socialLinks: Record<string, string>;
};

export type ListingImage = {
  id: string;
  listingId: string;
  storagePath: string;
  position: number;
};

export type Listing = {
  id: string;
  userId: string | null;
  businessProfileId: string | null;
  categoryId: string;
  title: string;
  description: string;
  attributes: Record<string, string>;
  priceWholesale: number | null;
  priceRetail: number | null;
  priceOnRequest: boolean;
  currencyCode: string;
  city: string;
  province: string;
  countryCode: string;
  status: ListingStatus;
  createdAt: string;
  expiresAt: string;
  images: ListingImage[];
  category?: Category;
  businessProfile?: BusinessProfile | null;
};

export type QuoteRequest = {
  listingId: string;
  requesterName: string;
  requesterEmail?: string;
  requesterPhone?: string;
  message: string;
};
