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
  addressText: string | null;
  contactPhone: string | null;
  socialLinks: Record<string, string>;
  logoUrl: string | null;
  isFeatured: boolean;
  // Campos opcionales: ausentes en datos de prueba/mock, siempre presentes
  // cuando vienen de Supabase real (ver mapBusinessProfileRow).
  updatedAt?: string;
  hoursText?: string | null;
  minProduction?: string | null;
  leadTime?: string | null;
  fabricTypes?: string | null;
  acceptsOwnPatterns?: boolean | null;
  acceptsOrders?: boolean;
  reviewsAverage?: number | null;
  reviewsCount?: number;
};

export type BusinessReview = {
  id: string;
  businessProfileId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatarUrl: string | null;
  rating: number;
  body: string | null;
  createdAt: string;
};

export type SavedItemType = "listing" | "business";

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
  contactName: string | null;
  contactPhone: string | null;
  createdAt: string;
  expiresAt: string;
  images: ListingImage[];
  category?: Category;
  businessProfile?: BusinessProfile | null;
  seller?: { id: string; displayName: string; avatarUrl: string | null } | null;
};

export type QuoteRequest = {
  listingId: string;
  requesterName: string;
  requesterEmail?: string;
  requesterPhone?: string;
  message: string;
};

export type PostMedia = {
  id: string;
  postId: string;
  storagePath: string;
  mediaType: "image" | "video";
  position: number;
};

export type PostComment = {
  id: string;
  postId: string;
  userId: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorAvatarUrl: string | null;
};

export type Post = {
  id: string;
  userId: string;
  body: string;
  createdAt: string;
  authorName: string;
  authorAvatarUrl: string | null;
  media: PostMedia[];
  likesCount: number;
  likedByMe: boolean;
  comments: PostComment[];
};

export type PublicProfile = {
  id: string;
  displayName: string;
  phone: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  isProfilePublic: boolean;
  businessProfiles: BusinessProfile[];
};

export type MessageThread = {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatarUrl: string | null;
  lastMessageBody: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type Message = {
  id: string;
  senderId: string;
  recipientId: string;
  listingId: string | null;
  body: string;
  createdAt: string;
  readAt: string | null;
};
