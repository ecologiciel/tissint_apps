import type {
  AlertRule,
  AuthSession,
  CollectionItem,
  CreateAlertRuleInput,
  CreateCollectionItemInput,
  CreateListingInput,
  FavoriteListing,
  LoginInput,
  MarketplaceListing,
  MarketplaceListingDetail,
  PublishListingResult,
  QuotaSnapshot,
  RegisterInput,
  ScanMetadata,
} from "@tissint/shared";
import { HttpTransport } from "./http";
import {
  normalizeAlertRule,
  normalizeAuthSession,
  normalizeCollectionItem,
  normalizeFavorite,
  normalizeListing,
  normalizeListingDetail,
  normalizePublishResult,
  normalizeQuota,
  normalizeScanResponse,
  type ServerAlertRule,
  type ServerAuthResponse,
  type ServerCollectionItem,
  type ServerFavoriteItem,
  type ServerListingItem,
  type ServerPublishResponse,
  type ServerQuotaResponse,
  type ServerScanResponse,
} from "./normalizers";
import type { TissintClientConfig } from "./config";

export interface MobileImageFile {
  uri: string;
  name: string;
  type: "image/jpeg" | "image/png";
}

export interface ScanExteriorInput {
  metadata: ScanMetadata;
  exteriorFiles: MobileImageFile[];
  interiorFile?: MobileImageFile;
}

export interface PublishListingInput {
  price: number;
  description?: string;
}

function appendImage(form: FormData, field: string, image: MobileImageFile) {
  form.append(field, {
    uri: image.uri,
    name: image.name,
    type: image.type,
  } as unknown as Blob);
}

export class TissintClient {
  private readonly http: HttpTransport;

  constructor(config: TissintClientConfig) {
    this.http = new HttpTransport(config);
  }

  async login(input: LoginInput): Promise<AuthSession> {
    const payload = await this.http.request<ServerAuthResponse>("/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phone_or_email: input.phoneOrEmail,
        password: input.password,
        device_id: input.deviceId,
      }),
    });
    return normalizeAuthSession(payload, { phoneOrEmail: input.phoneOrEmail });
  }

  async register(input: RegisterInput): Promise<AuthSession> {
    const payload = await this.http.request<ServerAuthResponse>("/api/v1/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: input.firstName,
        last_name: input.lastName,
        phone: input.phone,
        email: input.email,
        password: input.password,
        desired_role: input.desiredRole,
        device_id: input.deviceId,
      }),
    });
    return normalizeAuthSession(payload, { phoneOrEmail: input.phone });
  }

  async me(): Promise<AuthSession> {
    const payload = await this.http.request<ServerAuthResponse>("/api/v1/auth/me");
    return normalizeAuthSession(payload);
  }

  async refresh(refreshToken: string): Promise<AuthSession> {
    const payload = await this.http.request<ServerAuthResponse>("/api/v1/auth/refresh", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    return normalizeAuthSession(payload);
  }

  async quota(): Promise<QuotaSnapshot> {
    const payload = await this.http.request<ServerQuotaResponse>("/api/v1/quota/me");
    return normalizeQuota(payload);
  }

  async scanExterior(input: ScanExteriorInput) {
    const form = new FormData();
    form.append("client_uuid", input.metadata.clientUuid);
    form.append("user_id", input.metadata.userId);
    if (input.metadata.weightGram != null) form.append("weight", String(input.metadata.weightGram));
    if (input.metadata.magnetic != null) form.append("magnetic", String(input.metadata.magnetic));
    if (input.metadata.latitude != null) form.append("latitude", String(input.metadata.latitude));
    if (input.metadata.longitude != null) form.append("longitude", String(input.metadata.longitude));
    for (const file of input.exteriorFiles) appendImage(form, "files_exterior", file);
    if (input.interiorFile) appendImage(form, "file_interior", input.interiorFile);

    const payload = await this.http.request<ServerScanResponse>("/api/v1/scan/exterior", {
      method: "POST",
      body: form,
    });

    return normalizeScanResponse(payload);
  }

  async addInterior(scanId: string, file: MobileImageFile) {
    const form = new FormData();
    appendImage(form, "file_interior", file);
    const payload = await this.http.request<ServerScanResponse>(`/api/v1/scan/${scanId}/interior`, {
      method: "PATCH",
      body: form,
    });
    return normalizeScanResponse(payload);
  }

  async publishListing(scanId: string, _input: PublishListingInput) {
    return this.http.request(`/api/v1/marketplace/publish/${scanId}`, {
      method: "POST",
    });
  }

  async createListing(input: CreateListingInput): Promise<PublishListingResult> {
    const payload = await this.http.request<ServerPublishResponse>("/api/v1/marketplace/listings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        scan_id: input.scanId,
        title: input.title,
        description: input.description,
        price_mode: input.priceMode,
        price_value: input.priceValue,
        weight_gram: input.weightGram,
        region: input.region,
      }),
    });
    return normalizePublishResult(payload);
  }

  async listMarketplace(): Promise<MarketplaceListing[]> {
    const payload = await this.http.request<ServerListingItem[]>("/api/v1/marketplace/listings");
    return payload.map(normalizeListing);
  }

  async getListing(listingId: string): Promise<MarketplaceListingDetail> {
    const payload = await this.http.request<ServerListingItem>(`/api/v1/marketplace/listings/${listingId}`);
    return normalizeListingDetail(payload);
  }

  async listCollection(): Promise<CollectionItem[]> {
    const payload = await this.http.request<ServerCollectionItem[]>("/api/v1/collection");
    return payload.map(normalizeCollectionItem);
  }

  async addToCollection(input: CreateCollectionItemInput): Promise<CollectionItem> {
    const payload = await this.http.request<ServerCollectionItem>(`/api/v1/collection/${input.scanId}`, {
      method: "POST",
    });
    return normalizeCollectionItem(payload);
  }

  async getCollectionItem(scanId: string): Promise<CollectionItem> {
    const payload = await this.http.request<ServerCollectionItem>(`/api/v1/collection/${scanId}`);
    return normalizeCollectionItem(payload);
  }

  async listFavorites(): Promise<FavoriteListing[]> {
    const payload = await this.http.request<ServerFavoriteItem[]>("/api/v1/marketplace/favorites");
    return payload.map(normalizeFavorite);
  }

  async addFavorite(listingId: string): Promise<FavoriteListing> {
    const payload = await this.http.request<ServerFavoriteItem>(`/api/v1/marketplace/favorites/${listingId}`, {
      method: "POST",
    });
    return normalizeFavorite(payload);
  }

  async removeFavorite(listingId: string): Promise<void> {
    await this.http.request(`/api/v1/marketplace/favorites/${listingId}`, {
      method: "DELETE",
    });
  }

  async listAlerts(): Promise<AlertRule[]> {
    const payload = await this.http.request<ServerAlertRule[]>("/api/v1/marketplace/alerts");
    return payload.map(normalizeAlertRule);
  }

  async createAlert(input: CreateAlertRuleInput): Promise<AlertRule> {
    const payload = await this.http.request<ServerAlertRule>("/api/v1/marketplace/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_name: input.className,
        region: input.region,
        min_score: input.minScore,
        rare_only: input.rareOnly ?? false,
        frequency: input.frequency,
      }),
    });
    return normalizeAlertRule(payload);
  }
}
