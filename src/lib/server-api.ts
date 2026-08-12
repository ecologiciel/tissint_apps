import {
  TissintClient,
  isTissintApiError,
  type MobileImageFile,
  type MarketplaceListing,
  type ScanExteriorInput,
} from "@tissint/api-client";
import type {
  AuthSession,
  CollectionItem as ServerCollectionItem,
  NormalizedScanResult,
  QuotaSnapshot,
  RegisterInput,
  UserRole,
} from "@tissint/shared";
import type {
  CollectionItem,
  Listing,
  ListingStatus,
  PriceMode,
  ScanResult,
  ScenarioKey,
  Verdict,
} from "./tissint-types";

const SESSION_KEY = "tissint.web.session.v1";
const DEVICE_KEY = "tissint.web.deviceId";

let accessToken: string | null = null;
let apiUserId: string | null = null;

export const webTissintClient = new TissintClient({
  baseUrl: "/api/proxy",
  getAccessToken: () => accessToken,
  getUserId: () => apiUserId,
});

function browserStorage() {
  return typeof window === "undefined" ? null : window.localStorage;
}

function setSessionContext(session: AuthSession | null) {
  accessToken = session?.tokens.accessToken ?? null;
  apiUserId = session?.user.id ?? null;
}

export function getSavedWebSession(): AuthSession | null {
  const storage = browserStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as AuthSession;
    setSessionContext(session);
    return session;
  } catch {
    storage.removeItem(SESSION_KEY);
    setSessionContext(null);
    return null;
  }
}

export function saveWebSession(session: AuthSession) {
  browserStorage()?.setItem(SESSION_KEY, JSON.stringify(session));
  setSessionContext(session);
}

export function clearWebSession() {
  browserStorage()?.removeItem(SESSION_KEY);
  setSessionContext(null);
}

function getOrCreateWebDeviceId() {
  const storage = browserStorage();
  if (!storage) return `web-${Date.now()}`;
  const current = storage.getItem(DEVICE_KEY);
  if (current) return current;
  const next =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `web-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  storage.setItem(DEVICE_KEY, next);
  return next;
}

export async function loginWeb(phoneOrEmail: string, password: string): Promise<AuthSession> {
  const session = await webTissintClient.login({
    phoneOrEmail,
    password,
    deviceId: getOrCreateWebDeviceId(),
  });
  saveWebSession(session);
  return session;
}

export async function registerWeb(input: Omit<RegisterInput, "deviceId">): Promise<AuthSession> {
  const session = await webTissintClient.register({
    ...input,
    deviceId: getOrCreateWebDeviceId(),
  });
  saveWebSession(session);
  return session;
}

export async function restoreWebSession(): Promise<AuthSession | null> {
  const saved = getSavedWebSession();
  if (!saved?.tokens.refreshToken) return saved;

  try {
    const refreshed = await webTissintClient.refresh(saved.tokens.refreshToken);
    setSessionContext(refreshed);
    const identity = await webTissintClient.me();
    const session: AuthSession = {
      ...identity,
      tokens: {
        accessToken: refreshed.tokens.accessToken,
        refreshToken:
          refreshed.tokens.refreshToken ||
          identity.tokens.refreshToken ||
          saved.tokens.refreshToken,
        expiresAt: refreshed.tokens.expiresAt ?? identity.tokens.expiresAt,
      },
    };
    saveWebSession(session);
    return session;
  } catch {
    clearWebSession();
    return null;
  }
}

export async function getWebQuota(): Promise<QuotaSnapshot> {
  getSavedWebSession();
  return webTissintClient.quota();
}

export async function listWebCollection(): Promise<CollectionItem[]> {
  getSavedWebSession();
  const items = await webTissintClient.listCollection();
  return items.map(toWebCollectionItem);
}

export async function listWebMarketplace(): Promise<Listing[]> {
  getSavedWebSession();
  const listings = await webTissintClient.listMarketplace();
  return listings.map(toWebListing);
}

export async function scanWebExterior(
  input: ScanExteriorInput,
  scenario: ScenarioKey,
  imageUrl?: string,
): Promise<ScanResult> {
  getSavedWebSession();
  const result = await webTissintClient.scanExterior(input);
  return toWebScanResult(result, scenario, imageUrl);
}

export async function scanWebInterior(
  scanId: string,
  file: MobileImageFile,
  scenario: ScenarioKey,
  imageUrl?: string,
): Promise<ScanResult> {
  getSavedWebSession();
  const result = await webTissintClient.addInterior(scanId, file);
  return toWebScanResult(result, scenario, imageUrl);
}

export async function addWebScanToCollection(scanId: string): Promise<CollectionItem> {
  getSavedWebSession();
  const item = await webTissintClient.addToCollection({ scanId });
  return toWebCollectionItem(item);
}

export function webAuthErrorMessage(error: unknown, fallback: string) {
  if (!isTissintApiError(error)) return error instanceof Error ? error.message : fallback;
  if (error.code === "UNAUTHORIZED") return "بيانات الدخول غير صحيحة.";
  if (error.code === "VALIDATION_ERROR") return "يرجى التحقق من المعلومات المدخلة.";
  if (error.code === "NETWORK_ERROR") return "تعذر الاتصال بالخادم. تحقق من الشبكة.";
  return error.message || fallback;
}

export function webApiErrorMessage(error: unknown, fallback: string) {
  if (!isTissintApiError(error)) return error instanceof Error ? error.message : fallback;
  if (error.code === "UNAUTHORIZED") return "يجب تسجيل الدخول للاتصال بحسابك.";
  if (error.code === "QUOTA_EXCEEDED" || error.code === "RATE_LIMITED") {
    return "تم استهلاك حد المسح المتاح لهذا الحساب.";
  }
  if (error.code === "FILE_TOO_LARGE") return "حجم الصورة كبير جدا.";
  if (error.code === "INVALID_FILE_FORMAT") return "صيغة الصورة غير مدعومة.";
  if (error.code === "MISSING_EXTERNAL_PHOTOS" || error.code === "VALIDATION_ERROR") {
    return "يرجى التحقق من الصور والمعلومات المدخلة.";
  }
  if (error.code === "NETWORK_ERROR" || error.code === "SERVICE_UNAVAILABLE") {
    return "تعذر الاتصال بالخادم. حاول مرة أخرى.";
  }
  return error.message || fallback;
}

export function sessionDisplayName(session: AuthSession) {
  const fullName = [session.user.firstName, session.user.lastName].filter(Boolean).join(" ").trim();
  return fullName || session.user.email || session.user.phone || "صديق النيازك";
}

function mediaUrl(uri?: string) {
  if (!uri) return undefined;
  if (/^https?:\/\//i.test(uri)) return uri;
  return `/api/proxy${uri.startsWith("/") ? uri : `/${uri}`}`;
}

function listingImageUrl(listing: MarketplaceListing) {
  return mediaUrl(
    listing.imageUrl ??
      listing.mainImageUri ??
      listing.thumbnailUri ??
      listing.galleryImages?.find(Boolean),
  );
}

function toRootPriceMode(mode?: MarketplaceListing["priceMode"]): PriceMode {
  if (mode === "negotiable" || mode === "on_request") return "negotiable";
  return "fixed";
}

function verdictFromScore(score: number): Verdict {
  if (score >= 85) return "likely";
  if (score >= 50) return "possible";
  return "unlikely";
}

function webVerdictFromServer(verdict: NormalizedScanResult["verdict"], score: number): Verdict {
  if (verdict === "earth_rock") return "rejected";
  if (verdict === "needs_cut") return "possible";
  if (verdict === "eligible" || verdict === "rare_hold") return "likely";
  return verdictFromScore(score);
}

function toWebFeatures(result: NormalizedScanResult): ScanResult["features"] {
  const confidence = result.classConfidence ?? result.fusionScore;
  return [
    {
      label: "احتمال النيزك",
      detected: result.fusionScore >= 0.5,
      weight: result.fusionScore,
    },
    {
      label: "ثقة التصنيف",
      detected: confidence >= 0.5,
      weight: confidence,
    },
    {
      label: "تحليل الصور",
      detected: true,
      weight: result.modelScores.fusion,
    },
  ];
}

function toWebScanResult(
  result: NormalizedScanResult,
  scenario: ScenarioKey,
  imageUrl?: string,
): ScanResult {
  const score = Math.round(result.fusionScore * 100);
  return {
    scanId: result.scanId,
    scenario,
    score,
    verdict: webVerdictFromServer(result.verdict, score),
    classification: result.className,
    confidence: result.classConfidence ?? result.fusionScore,
    features: toWebFeatures(result),
    notes: result.messageKey,
    needsInterior: result.needsInteriorCut,
    eligibleForMarket: result.canPublishMarketplace,
    createdAt: result.createdAt,
    imageSeed: result.scanId,
    imageUrl,
    isSyncRetry: result.isSyncRetry,
    isRare: result.isRare,
  };
}

function statusFromServer(status: ServerCollectionItem["status"]): ListingStatus {
  if (status === "sold") return "sold";
  if (status === "listed" || status === "pending_validation") return "approved";
  if (status === "needs_cut") return "pending";
  return "pending";
}

function toWebCollectionItem(item: ServerCollectionItem): CollectionItem {
  const score = Math.round(item.fusionScore * 100);
  return {
    id: item.id || item.scanId,
    scanId: item.scanId,
    name: `العينة #${item.scanId.slice(-4)}`,
    classification: item.className,
    score,
    verdict: verdictFromScore(score),
    imageSeed: item.scanId,
    imageUrl: mediaUrl(item.mainImageUri),
    createdAt: item.createdAt,
  };
}

function toWebListing(listing: MarketplaceListing): Listing {
  const priceMode = toRootPriceMode(listing.priceMode);
  const status: ListingStatus =
    listing.status === "sold" ? "sold" : listing.status === "rejected" ? "rejected" : "approved";
  return {
    id: listing.listingId,
    scanId: listing.scanId,
    title: listing.title,
    classification: listing.dominantClass,
    weightG: listing.weightGram ?? 0,
    priceDh: listing.priceValue ?? 0,
    priceMode,
    region: listing.region ?? "المغرب",
    sellerName: listing.sellerName ?? "Tissint",
    sellerVerified: Boolean(listing.sellerVerified),
    score: Math.round((listing.fusionScore ?? listing.confidence) * 100),
    status,
    imageSeed: listing.listingId,
    imageUrl: listingImageUrl(listing),
    createdAt: listing.createdAt,
    description: listing.description ?? "",
    isRare: listing.isRare,
  };
}

export function isUnlimitedRole(role: UserRole) {
  return role === "premium" || role === "admin";
}
