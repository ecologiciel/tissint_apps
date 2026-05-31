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
  type MarketplaceStatus,
  type NormalizedScanResult,
  type PublishListingResult,
  type QuotaSnapshot,
  type SessionUser,
  type UserRole,
} from "@tissint/shared";
import type {
  ApiErrorResponse as ServerApiErrorResponse,
  AuthResponse as ServerAuthContract,
  CollectionItemResponse as ServerCollectionContract,
  MarketplaceListingResponse as ServerPublishContract,
  PublicListingItem as ServerListingContract,
  ScanDecisionResponse as ServerScanContract,
} from "./generated/server-types";

export type { ServerApiErrorResponse };

export type ServerScanResponse = ServerScanContract;

export interface ServerListingItem extends ServerListingContract {
  title?: string;
  description?: string;
  region?: string;
  seller_masked_name?: string;
  seller_name?: string;
  seller_phone?: string;
  seller_whatsapp?: string;
  seller_verified?: boolean;
  contact_locked_until?: string;
  can_contact?: boolean;
  contact_lock_reason?: string;
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
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  expires_at?: string;
  expiresAt?: string;
  user?: {
    id?: string;
    user_id?: string;
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    role?: UserRole;
    premium_expires_at?: string;
    premiumExpiresAt?: string;
  };
  quota?: {
    role?: UserRole;
    daily_limit?: number;
    remaining_today?: number;
    resets_at?: string;
  };
}

export type ServerAuthPayload = ServerAuthContract & ServerAuthResponse;

export interface ServerQuotaResponse {
  role?: UserRole;
  daily_limit?: number;
  remaining_today?: number;
  resets_at?: string | null;
}

export interface ServerCollectionItem extends Partial<ServerCollectionContract> {
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

export type ServerPublishResponse = ServerPublishContract;

const MARKETPLACE_STATUSES = new Set<MarketplaceStatus>([
  "draft",
  "pending_admin",
  "institutional_hold_24h",
  "published",
  "admin_reserved",
  "sold",
  "rejected",
  "archived",
]);

function normalizeMarketplaceStatus(status?: string): MarketplaceStatus {
  if (!status) return "draft";
  if (status === "available") return "published";
  if (status === "reserved") return "admin_reserved";
  if (status === "inactive") return "archived";
  return MARKETPLACE_STATUSES.has(status as MarketplaceStatus)
    ? (status as MarketplaceStatus)
    : "draft";
}

export function normalizeScanResponse(payload: ServerScanResponse): NormalizedScanResult {
  const fusionScore = normalizeScore(
    payload.meteorite_probability ?? payload.class_confidence ?? 0,
  );
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
    canPublishMarketplace:
      payload.actions?.enable_marketplace_button ?? decision.canPublishMarketplace,
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
    status: normalizeMarketplaceStatus(payload.status),
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

export function normalizeListingDetail(
  payload: ServerListingItem,
  canContact = false,
): MarketplaceListingDetail {
  const listing = normalizeListing(payload);
  const serverCanContact = payload.can_contact ?? canContact;
  return {
    ...listing,
    canContact: serverCanContact,
    scientificNotice:
      "Cette analyse est une aide a l'identification et ne remplace pas une expertise de laboratoire.",
    contactLockReason: serverCanContact
      ? undefined
      : (payload.contact_lock_reason ?? "premium_required"),
  };
}

export function normalizeQuota(
  payload: ServerQuotaResponse,
  fallbackRole: UserRole = "free",
): QuotaSnapshot {
  const role = payload.role ?? fallbackRole;
  const dailyLimit = payload.daily_limit ?? quotaLimitForRole(role);
  return {
    role,
    dailyLimit,
    remainingToday: payload.remaining_today ?? dailyLimit,
    resetsAt: payload.resets_at ?? undefined,
  };
}

export function normalizeAuthSession(
  payload: ServerAuthPayload,
  fallback: { phoneOrEmail?: string } = {},
): AuthSession {
  const role = payload.user?.role ?? payload.quota?.role ?? "free";
  const id = payload.user?.id ?? payload.user?.user_id ?? fallback.phoneOrEmail ?? "user";
  const user: SessionUser = {
    id,
    firstName: payload.user?.first_name,
    lastName: payload.user?.last_name,
    phone: payload.user?.phone,
    email: payload.user?.email,
    role,
    premiumExpiresAt: payload.user?.premium_expires_at ?? payload.user?.premiumExpiresAt,
  };
  return {
    user,
    tokens: {
      accessToken: payload.access_token ?? payload.accessToken ?? "",
      refreshToken: payload.refresh_token ?? payload.refreshToken ?? "",
      expiresAt: payload.expires_at ?? payload.expiresAt,
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
  const status = payload.status
    ? normalizeMarketplaceStatus(payload.status)
    : rare
      ? "institutional_hold_24h"
      : "pending_admin";
  return {
    scanId: payload.scan_id,
    status,
    isRareCandidate: rare,
    message: payload.message ?? "Publication request accepted",
    listing: {
      listingId: payload.listing_id ?? payload.scan_id,
      scanId: payload.scan_id,
      title: payload.dominant_class ?? "Meteorite",
      dominantClass: payload.dominant_class ?? "Unknown",
      confidence: payload.confidence ?? 0,
      fusionScore: payload.confidence,
      weightGram: payload.weight ?? undefined,
      priceValue: payload.price,
      priceMode: payload.price > 0 ? "fixed_total" : "on_request",
      status,
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
