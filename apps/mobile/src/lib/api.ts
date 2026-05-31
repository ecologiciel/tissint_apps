import { TissintClient, type MobileImageFile, type ScanExteriorInput } from "@tissint/api-client";
import {
  buildMockScanResult,
  containsContactLeak,
  type AlertRule,
  type AdminListingActionInput,
  type AdminRadarActionResult,
  type AdminRadarListing,
  type AuditLogEntry,
  type CollectionItem,
  type CreateAlertRuleInput,
  type CreateListingInput,
  type FavoriteListing,
  type MarketplaceListing,
  type MarketplaceListingDetail,
  type PublishListingResult,
  type QuotaSnapshot,
  type ScanScenarioKey,
  type UserRole,
} from "@tissint/shared";
import { DEMO_COLLECTION, DEMO_MARKETPLACE_LISTINGS } from "@/features/parity/parity-data";
import { env, isHttpApiEnabled } from "./env";

let accessToken: string | null = null;
let apiUserId: string | null = null;

export function setApiAccessToken(token: string | null) {
  accessToken = token;
}

export function setApiUserId(userId: string | null) {
  apiUserId = userId;
}

export const tissintClient = new TissintClient({
  baseUrl: env.apiBaseUrl || "http://127.0.0.1:8000",
  apiKey: env.apiKey || undefined,
  getAccessToken: () => accessToken,
  getUserId: () => apiUserId,
});

export async function checkApiHealth() {
  return tissintClient.health();
}

export async function getQuota(role: UserRole): Promise<QuotaSnapshot> {
  if (!isHttpApiEnabled()) {
    const dailyLimit = role === "premium" || role === "admin" ? 10 : role === "free" ? 5 : 0;
    return {
      role,
      dailyLimit,
      remainingToday: dailyLimit,
      resetsAt: new Date(Date.now() + 1000 * 60 * 60 * 10).toISOString(),
    };
  }
  return tissintClient.quota();
}

export async function scanExterior(input: ScanExteriorInput, mockScenario: ScanScenarioKey) {
  if (!isHttpApiEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 850));
    return buildMockScanResult(mockScenario, input.metadata.clientUuid);
  }
  return tissintClient.scanExterior(input);
}

export async function addInterior(
  scanId: string,
  file: MobileImageFile,
  mockScenario: ScanScenarioKey,
) {
  if (!isHttpApiEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return buildMockScanResult(mockScenario === "B" ? "C" : mockScenario, scanId);
  }
  return tissintClient.addInterior(scanId, file);
}

export async function listMarketplace(): Promise<MarketplaceListing[]> {
  if (!isHttpApiEnabled()) {
    return DEMO_MARKETPLACE_LISTINGS;
  }
  return tissintClient.listMarketplace();
}

export async function getListing(
  listingId: string,
  role: UserRole,
): Promise<MarketplaceListingDetail> {
  if (!isHttpApiEnabled()) {
    const listing =
      DEMO_MARKETPLACE_LISTINGS.find((item) => item.listingId === listingId) ??
      DEMO_MARKETPLACE_LISTINGS[0];
    const lockedByHold = listing.status === "institutional_hold_24h" && role !== "admin";
    const lockedByPremium = role !== "premium" && role !== "admin";
    return {
      ...listing,
      canContact: !lockedByHold && !lockedByPremium,
      contactLockReason: lockedByHold
        ? "institutional_hold_24h"
        : lockedByPremium
          ? "premium_required"
          : undefined,
      scientificNotice:
        "Cette analyse est une aide a l'identification et ne remplace pas une expertise de laboratoire.",
      sellerName: role === "premium" || role === "admin" ? listing.sellerName : undefined,
      sellerPhone: role === "premium" || role === "admin" ? listing.sellerPhone : undefined,
      sellerWhatsapp: role === "premium" || role === "admin" ? listing.sellerWhatsapp : undefined,
    };
  }
  return tissintClient.getListing(listingId);
}

export async function listCollection(
  lastResult?: ReturnType<typeof buildMockScanResult> | null,
): Promise<CollectionItem[]> {
  if (!isHttpApiEnabled()) {
    const base = DEMO_COLLECTION.map((item) => ({
      id: item.id,
      scanId: item.scanId,
      className: item.className,
      fusionScore: item.fusionScore,
      status: item.status,
      createdAt: item.createdAt,
    }));
    if (!lastResult?.canAddToCollection) return base;
    return [
      {
        id: lastResult.scanId,
        scanId: lastResult.scanId,
        className: lastResult.className,
        fusionScore: lastResult.fusionScore,
        status: lastResult.needsInteriorCut ? "needs_cut" : "eligible",
        createdAt: lastResult.createdAt,
      },
      ...base.filter((item) => item.scanId !== lastResult.scanId),
    ];
  }
  return tissintClient.listCollection();
}

export async function addScanToCollection(scanId: string): Promise<CollectionItem> {
  if (!isHttpApiEnabled()) {
    return {
      id: scanId,
      scanId,
      className: "Mock scan",
      fusionScore: 0.88,
      status: "eligible",
      createdAt: new Date().toISOString(),
    };
  }
  return tissintClient.addToCollection({ scanId });
}

export async function getCollectionItem(
  scanId: string,
  lastResult?: ReturnType<typeof buildMockScanResult> | null,
): Promise<CollectionItem> {
  if (!isHttpApiEnabled()) {
    if (lastResult?.scanId === scanId) {
      return {
        id: lastResult.scanId,
        scanId: lastResult.scanId,
        className: lastResult.className,
        fusionScore: lastResult.fusionScore,
        status: lastResult.needsInteriorCut ? "needs_cut" : "eligible",
        createdAt: lastResult.createdAt,
      };
    }
    return {
      id: scanId,
      scanId,
      className:
        DEMO_COLLECTION.find((item) => item.scanId === scanId)?.className ?? "Chondrite H5",
      fusionScore: DEMO_COLLECTION.find((item) => item.scanId === scanId)?.fusionScore ?? 0.88,
      status: DEMO_COLLECTION.find((item) => item.scanId === scanId)?.status ?? "eligible",
      createdAt:
        DEMO_COLLECTION.find((item) => item.scanId === scanId)?.createdAt ??
        new Date().toISOString(),
    };
  }
  return tissintClient.getCollectionItem(scanId);
}

export async function createListing(input: CreateListingInput): Promise<PublishListingResult> {
  if (containsContactLeak(input.description ?? "")) {
    throw new Error(
      "La description contient un contact. Les coordonnees doivent rester protegees par Premium.",
    );
  }
  if (!isHttpApiEnabled()) {
    await new Promise((resolve) => setTimeout(resolve, 650));
    return {
      scanId: input.scanId,
      status: "pending_admin",
      isRareCandidate: false,
      message: "Annonce preparee en mode mock. Le serveur production validera le statut final.",
      listing: {
        listingId: `mock-listing-${input.scanId}`,
        scanId: input.scanId,
        title: input.title,
        dominantClass: input.title,
        confidence: 0.88,
        priceMode: input.priceMode,
        priceValue: input.priceValue,
        weightGram: input.weightGram,
        region: input.region,
        status: "pending_admin",
        isRare: false,
      },
    };
  }
  return tissintClient.createListing(input);
}

export async function listFavorites(): Promise<FavoriteListing[]> {
  if (!isHttpApiEnabled()) return [];
  return tissintClient.listFavorites();
}

export async function addFavorite(listingId: string): Promise<FavoriteListing> {
  if (!isHttpApiEnabled()) return { listingId, createdAt: new Date().toISOString() };
  return tissintClient.addFavorite(listingId);
}

export async function removeFavorite(listingId: string): Promise<void> {
  if (!isHttpApiEnabled()) return;
  return tissintClient.removeFavorite(listingId);
}

export async function listAlerts(): Promise<AlertRule[]> {
  if (!isHttpApiEnabled()) return [];
  return tissintClient.listAlerts();
}

export async function createAlert(input: CreateAlertRuleInput): Promise<AlertRule> {
  if (!isHttpApiEnabled()) {
    return {
      id: `mock-alert-${Date.now()}`,
      className: input.className,
      region: input.region,
      minScore: input.minScore,
      rareOnly: input.rareOnly ?? false,
      frequency: input.frequency,
      active: true,
      createdAt: new Date().toISOString(),
    };
  }
  return tissintClient.createAlert(input);
}

export async function listAdminRadar(): Promise<AdminRadarListing[]> {
  if (!isHttpApiEnabled()) {
    return DEMO_MARKETPLACE_LISTINGS.filter((listing) => listing.isRare).map((listing) => ({
      ...listing,
      meteoriteProbability: listing.confidence,
      holdUntil: listing.contactLockedUntil,
      sellerUserId: "mock-seller",
      sellerEmail: "seller@example.com",
      latitude: listing.blurredLatitude,
      longitude: listing.blurredLongitude,
    }));
  }
  return tissintClient.listAdminRadar();
}

function mockAdminAction(
  listingId: string,
  status: AdminRadarListing["status"],
  message: string,
): AdminRadarActionResult {
  const listing =
    DEMO_MARKETPLACE_LISTINGS.find((item) => item.listingId === listingId) ??
    DEMO_MARKETPLACE_LISTINGS.find((item) => item.isRare) ??
    DEMO_MARKETPLACE_LISTINGS[0];
  return {
    status,
    message,
    listing: {
      ...listing,
      status,
      meteoriteProbability: listing.confidence,
      holdUntil: listing.contactLockedUntil,
      sellerUserId: "mock-seller",
      sellerEmail: "seller@example.com",
      latitude: listing.blurredLatitude,
      longitude: listing.blurredLongitude,
    },
  };
}

export async function reserveAdminListing(
  listingId: string,
  input: AdminListingActionInput = {},
): Promise<AdminRadarActionResult> {
  if (!isHttpApiEnabled()) {
    return mockAdminAction(listingId, "admin_reserved", input.reason ?? "Reserve admin");
  }
  return tissintClient.reserveAdminListing(listingId, input);
}

export async function releaseAdminListing(
  listingId: string,
  input: AdminListingActionInput = {},
): Promise<AdminRadarActionResult> {
  if (!isHttpApiEnabled()) {
    return mockAdminAction(listingId, "published", input.reason ?? "Publication admin");
  }
  return tissintClient.releaseAdminListing(listingId, input);
}

export async function rejectAdminListing(
  listingId: string,
  input: AdminListingActionInput = {},
): Promise<AdminRadarActionResult> {
  if (!isHttpApiEnabled()) {
    return mockAdminAction(listingId, "rejected", input.reason ?? "Rejet admin");
  }
  return tissintClient.rejectAdminListing(listingId, input);
}

export async function listAuditLogs(): Promise<AuditLogEntry[]> {
  if (!isHttpApiEnabled()) return [];
  return tissintClient.listAuditLogs(50);
}
