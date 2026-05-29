import {
  evaluateScanDecision,
  normalizeScore,
  quotaLimitForRole,
  type AlertFrequency,
  type AlertRule,
  type AuthSession,
  type CollectionItem,
  type FavoriteListing,
  type MarketplaceListing,
  type MarketplaceListingDetail,
  type NormalizedScanResult,
  type PublishListingResult,
  type QuotaSnapshot,
  type SessionUser,
  type UserRole,
} from "@tissint/shared";

export interface ServerScanResponse {
  scan_id: string;
  status_code?: string;
  is_meteorite?: boolean;
  meteorite_probability?: number;
  dominant_class?: string;
  class_confidence?: number;
  actions?: {
    add_to_collection?: boolean;
    enable_marketplace_button?: boolean;
    invite_interior_cut?: boolean;
  };
  trigger_radar_admin?: boolean;
  metadata_applied?: {
    weight_provided?: boolean;
    magnetic_status?: boolean | null;
    has_coordinates?: boolean;
  };
  is_sync_retry?: boolean;
}

export interface ServerListingItem {
  listing_id: string;
  scan_id: string;
  price: number;
  status: string;
  dominant_class: string;
  confidence: number;
  weight?: number | null;
  blurred_latitude?: number | null;
  blurred_longitude?: number | null;
  title?: string;
  description?: string;
  region?: string;
  seller_masked_name?: string;
  seller_name?: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_verified?: boolean;
  contact_locked_until?: string;
  is_rare?: boolean;
  price_mode?: MarketplaceListing["priceMode"];
  created_at?: string;
}

export interface ServerFavoriteItem {
  listing_id: string;
  created_at?: string;
}

export interface ServerAlertRule {
  id: string;
  class_name?: string;
  region?: string;
  min_score?: number;
  rare_only?: boolean;
  frequency?: AlertFrequency;
  active?: boolean;
  created_at?: string;
}

export interface ServerAuthResponse {
  access_token?: string;
  refresh_token?: string;
  expires_at?: string;
  user?: {
    id?: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    role?: UserRole;
    premium_expires_at?: string;
  };
  quota?: {
    role?: UserRole;
    daily_limit?: number;
    remaining_today?: number;
    resets_at?: string;
  };
}

export interface ServerQuotaResponse {
  role?: UserRole;
  daily_limit?: number;
  remaining_today?: number;
  resets_at?: string;
}

export interface ServerCollectionItem {
  id?: string;
  scan_id: string;
  class_name?: string;
  dominant_class?: string;
  fusion_score?: number;
  meteorite_probability?: number;
  status?: CollectionItem["status"];
  created_at?: string;
  main_image_uri?: string;
}

export interface ServerPublishResponse {
  message?: string;
  scan_id: string;
  is_rare_candidate?: boolean;
  dominant_class?: string;
  confidence?: number;
  weight?: number | null;
  blurred_latitude?: number | null;
  blurred_longitude?: number | null;
}

export function normalizeScanResponse(payload: ServerScanResponse): NormalizedScanResult {
  const fusionScore = normalizeScore(payload.meteorite_probability ?? payload.class_confidence ?? 0);
  const className = payload.dominant_class ?? "Unknown";
  const decision = evaluateScanDecision({
    fusionScore,
    className,
    isRare: Boolean(payload.trigger_radar_admin),
  });

  return {
    ...decision,
    scanId: payload.scan_id,
    classConfidence: payload.class_confidence,
    rawStatusCode: payload.status_code,
    canAddToCollection: payload.actions?.add_to_collection ?? decision.canAddToCollection,
    canPublishMarketplace: payload.actions?.enable_marketplace_button ?? decision.canPublishMarketplace,
    needsInteriorCut: payload.actions?.invite_interior_cut ?? decision.needsInteriorCut,
    modelScores: { fusion: fusionScore },
    metadataApplied: {
      weightProvided: Boolean(payload.metadata_applied?.weight_provided),
      magneticStatus: payload.metadata_applied?.magnetic_status ?? null,
      hasCoordinates: Boolean(payload.metadata_applied?.has_coordinates),
    },
    isSyncRetry: payload.is_sync_retry,
    createdAt: new Date().toISOString(),
  };
}

export function normalizeListing(payload: ServerListingItem): MarketplaceListing {
  return {
    listingId: payload.listing_id,
    scanId: payload.scan_id,
    title: payload.title ?? payload.dominant_class,
    dominantClass: payload.dominant_class,
    confidence: payload.confidence,
    fusionScore: payload.confidence,
    weightGram: payload.weight ?? undefined,
    priceValue: payload.price,
    priceMode: payload.price_mode ?? "fixed_total",
    status: payload.status === "available" ? "published" : "archived",
    isRare: Boolean(payload.is_rare),
    region: payload.region,
    description: payload.description,
    sellerMaskedName: payload.seller_masked_name,
    sellerName: payload.seller_name,
    sellerPhone: payload.seller_phone,
    sellerWhatsapp: payload.seller_whatsapp,
    sellerVerified: payload.seller_verified,
    contactLockedUntil: payload.contact_locked_until,
    blurredLatitude: payload.blurred_latitude ?? undefined,
    blurredLongitude: payload.blurred_longitude ?? undefined,
    createdAt: payload.created_at,
  };
}

export function normalizeListingDetail(payload: ServerListingItem, canContact = false): MarketplaceListingDetail {
  const listing = normalizeListing(payload);
  return {
    ...listing,
    canContact,
    scientificNotice: "Cette analyse est une aide a l'identification et ne remplace pas une expertise de laboratoire.",
    contactLockReason: canContact ? undefined : "premium_required",
  };
}

export function normalizeQuota(payload: ServerQuotaResponse, fallbackRole: UserRole = "free"): QuotaSnapshot {
  const role = payload.role ?? fallbackRole;
  const dailyLimit = payload.daily_limit ?? quotaLimitForRole(role);
  return {
    role,
    dailyLimit,
    remainingToday: payload.remaining_today ?? dailyLimit,
    resetsAt: payload.resets_at,
  };
}

export function normalizeAuthSession(payload: ServerAuthResponse, fallback: { phoneOrEmail?: string } = {}): AuthSession {
  const role = payload.user?.role ?? payload.quota?.role ?? "free";
  const id = payload.user?.id ?? payload.user?.user_id ?? fallback.phoneOrEmail ?? "user";
  const user: SessionUser = {
    id,
    firstName: payload.user?.first_name,
    lastName: payload.user?.last_name,
    phone: payload.user?.phone,
    email: payload.user?.email,
    role,
    premiumExpiresAt: payload.user?.premium_expires_at,
  };
  return {
    user,
    tokens: {
      accessToken: payload.access_token ?? "",
      refreshToken: payload.refresh_token ?? "",
      expiresAt: payload.expires_at,
    },
    quota: normalizeQuota(payload.quota ?? {}, role),
  };
}

export function normalizeCollectionItem(payload: ServerCollectionItem): CollectionItem {
  const fusionScore = normalizeScore(payload.fusion_score ?? payload.meteorite_probability ?? 0);
  return {
    id: payload.id ?? payload.scan_id,
    scanId: payload.scan_id,
    mainImageUri: payload.main_image_uri,
    className: payload.class_name ?? payload.dominant_class ?? "Unknown",
    fusionScore,
    status: payload.status ?? (fusionScore >= 0.85 ? "eligible" : "needs_cut"),
    createdAt: payload.created_at ?? new Date().toISOString(),
  };
}

export function normalizePublishResult(payload: ServerPublishResponse): PublishListingResult {
  const rare = Boolean(payload.is_rare_candidate);
  return {
    scanId: payload.scan_id,
    status: rare ? "institutional_hold_24h" : "pending_admin",
    isRareCandidate: rare,
    message: payload.message ?? "Publication request accepted",
    listing: {
      listingId: payload.scan_id,
      scanId: payload.scan_id,
      title: payload.dominant_class ?? "Meteorite",
      dominantClass: payload.dominant_class ?? "Unknown",
      confidence: payload.confidence ?? 0,
      fusionScore: payload.confidence,
      weightGram: payload.weight ?? undefined,
      priceMode: "on_request",
      status: rare ? "institutional_hold_24h" : "pending_admin",
      isRare: rare,
      blurredLatitude: payload.blurred_latitude ?? undefined,
      blurredLongitude: payload.blurred_longitude ?? undefined,
    },
  };
}

export function normalizeFavorite(payload: ServerFavoriteItem): FavoriteListing {
  return {
    listingId: payload.listing_id,
    createdAt: payload.created_at ?? new Date().toISOString(),
  };
}

export function normalizeAlertRule(payload: ServerAlertRule): AlertRule {
  return {
    id: payload.id,
    className: payload.class_name,
    region: payload.region,
    minScore: payload.min_score,
    rareOnly: Boolean(payload.rare_only),
    frequency: payload.frequency ?? "daily",
    active: payload.active ?? true,
    createdAt: payload.created_at ?? new Date().toISOString(),
  };
}
