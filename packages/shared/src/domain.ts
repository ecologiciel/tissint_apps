export type UserRole = "guest" | "free" | "premium" | "admin";

export type SupportedLocale = "ar" | "en";

export type ScanScenarioKey = "A" | "B" | "C" | "D";

export type MarketplaceStatus =
  | "draft"
  | "pending_admin"
  | "institutional_hold_24h"
  | "published"
  | "admin_reserved"
  | "sold"
  | "rejected"
  | "archived";

export type PriceMode = "fixed_total" | "price_per_gram" | "negotiable" | "on_request";

export type VerdictCode = "earth_rock" | "needs_cut" | "eligible" | "rare_hold";

export type MagneticInput = "unknown" | "no" | "weak" | "strong";

export interface ModelScores {
  edino?: number;
  convnext?: number;
  swin?: number;
  fusion: number;
}

export interface ScanDecision {
  verdict: VerdictCode;
  fusionScore: number;
  className: string;
  isRare: boolean;
  canAddToCollection: boolean;
  canPublishMarketplace: boolean;
  needsInteriorCut: boolean;
  marketplaceStatus?: MarketplaceStatus;
  messageKey: string;
}

export interface NormalizedScanResult extends ScanDecision {
  scanId: string;
  modelScores: ModelScores;
  classConfidence?: number;
  rawStatusCode?: string;
  metadataApplied?: {
    weightProvided: boolean;
    magneticStatus: boolean | null;
    hasCoordinates: boolean;
  };
  isSyncRetry?: boolean;
  createdAt: string;
}

export interface ScanMetadata {
  clientUuid: string;
  userId?: string;
  weightGram?: number;
  magnetic?: boolean;
  latitude?: number;
  longitude?: number;
  region?: string;
}

export interface CollectionItem {
  id: string;
  scanId: string;
  mainImageUri?: string;
  className: string;
  fusionScore: number;
  status: "needs_cut" | "eligible" | "pending_validation" | "listed" | "sold";
  createdAt: string;
}

export interface MarketplaceListing {
  listingId: string;
  scanId: string;
  title: string;
  dominantClass: string;
  confidence: number;
  fusionScore?: number;
  weightGram?: number;
  priceValue?: number;
  priceMode: PriceMode;
  region?: string;
  status: MarketplaceStatus;
  isRare: boolean;
  sellerMaskedName?: string;
  sellerName?: string;
  sellerPhone?: string;
  sellerWhatsapp?: string;
  blurredLatitude?: number;
  blurredLongitude?: number;
  createdAt?: string;
  description?: string;
  sellerVerified?: boolean;
  sellerRegion?: string;
  contactLockedUntil?: string;
}

export interface MarketplaceListingDetail extends MarketplaceListing {
  scientificNotice: string;
  modelScores?: ModelScores;
  canContact: boolean;
  contactLockReason?: string;
}

export interface AdminRadarListing extends MarketplaceListing {
  meteoriteProbability: number;
  latitude?: number;
  longitude?: number;
  holdUntil?: string;
  sellerUserId?: string;
  sellerEmail?: string;
}

export type AdminRadarAction = "reserve" | "release" | "reject";

export interface AdminRadarActionResult {
  status: MarketplaceStatus;
  message: string;
  listing: AdminRadarListing;
}

export interface AdminListingActionInput {
  reason?: string;
}

export interface AuditLogEntry {
  id: string;
  actorUserId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: unknown;
  createdAt: string;
}

export interface QuotaSnapshot {
  role: UserRole;
  dailyLimit: number;
  remainingToday: number;
  resetsAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt?: string;
}

export interface SessionUser {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  role: UserRole;
  premiumExpiresAt?: string;
}

export interface AuthSession {
  user: SessionUser;
  tokens: AuthTokens;
  quota: QuotaSnapshot;
}

export interface LoginInput {
  phoneOrEmail: string;
  password: string;
  deviceId: string;
}

export interface RegisterInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  desiredRole: Exclude<UserRole, "guest" | "admin">;
  deviceId: string;
}

export interface CreateCollectionItemInput {
  scanId: string;
}

export interface CreateListingInput {
  scanId: string;
  title: string;
  description?: string;
  priceMode: PriceMode;
  priceValue?: number;
  weightGram: number;
  region: string;
}

export interface PublishListingResult {
  listing?: MarketplaceListing;
  scanId: string;
  status: MarketplaceStatus;
  isRareCandidate: boolean;
  message: string;
}

export interface FavoriteListing {
  listingId: string;
  createdAt: string;
}

export type AlertFrequency = "instant" | "daily";

export interface AlertRule {
  id: string;
  className?: string;
  region?: string;
  minScore?: number;
  rareOnly: boolean;
  frequency: AlertFrequency;
  active: boolean;
  createdAt: string;
}

export interface CreateAlertRuleInput {
  className?: string;
  region?: string;
  minScore?: number;
  rareOnly?: boolean;
  frequency: AlertFrequency;
}

export type ApiErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "PREMIUM_REQUIRED"
  | "QUOTA_EXCEEDED"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONTACT_LEAK_DETECTED"
  | "MISSING_EXTERNAL_PHOTOS"
  | "INVALID_FILE_FORMAT"
  | "FILE_TOO_LARGE"
  | "CONFLICT"
  | "SERVICE_UNAVAILABLE"
  | "INTERNAL_PROCESSING_ERROR"
  | "RATE_LIMITED"
  | "NETWORK_ERROR"
  | "HTTP_ERROR";

export interface ApiErrorPayload {
  code: ApiErrorCode | string;
  message: string;
  status?: number;
}

export type PaymentProvider = "cmi" | "stripe" | "paypal" | "wallet";
export type SubscriptionStatus = "none" | "active" | "past_due" | "cancelled" | "expired";
export type InvoiceStatus = "paid" | "pending" | "failed" | "refunded";

export interface Subscription {
  status: SubscriptionStatus;
  role: UserRole;
  provider?: PaymentProvider;
  plan?: "monthly" | "yearly";
  renewsAt?: string;
  cancelsAt?: string;
}

export interface CheckoutSession {
  id: string;
  provider: PaymentProvider;
  checkoutUrl?: string;
  amountDh: number;
  currency: "MAD";
  expiresAt?: string;
}

export interface Invoice {
  id: string;
  number: string;
  amountDh: number;
  vatDh?: number;
  totalDh: number;
  status: InvoiceStatus;
  createdAt: string;
  downloadUrl?: string;
}

export type QueuedUploadStatus = "queued" | "uploading" | "failed" | "synced";

export interface QueuedUpload {
  id: string;
  clientUuid: string;
  status: QueuedUploadStatus;
  createdAt: string;
  updatedAt: string;
  retryCount: number;
  lastError?: string;
}

export interface OfflineCacheSnapshot {
  lastUpdatedAt?: string;
  recentScans: number;
  collectionItems: number;
  marketplaceListings: number;
  queuedUploads: number;
  sizeBytes: number;
}
