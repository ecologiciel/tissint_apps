import type { ScanResult, Listing, ScenarioKey } from "./tissint-types";
import { buildScenario } from "./scenarios";
import { MOCK_LISTINGS } from "./mock-data";

const API_BASE = import.meta.env.VITE_TISSINT_API_BASE_URL ?? "";
const API_KEY = import.meta.env.VITE_TISSINT_API_KEY ?? "";
const MODE = (import.meta.env.VITE_TISSINT_API_MODE ?? "mock") as "mock" | "http";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface TissintAPI {
  scanExterior(input: { scenario: ScenarioKey; clientUuid?: string }): Promise<ScanResult>;
  scanInterior(scanId: string, scenario: ScenarioKey): Promise<ScanResult>;
  listMarketplace(): Promise<Listing[]>;
  publishListing(scanId: string, payload: Partial<Listing>): Promise<Listing>;
}

class MockTissintAPI implements TissintAPI {
  private cache = new Map<string, ScanResult>();

  async scanExterior({ scenario, clientUuid }: { scenario: ScenarioKey; clientUuid?: string }) {
    await delay(900);
    if (clientUuid && this.cache.has(clientUuid)) {
      const cached = this.cache.get(clientUuid)!;
      return { ...cached, isSyncRetry: true, originalScanAt: cached.createdAt };
    }
    const scanId = "scn-" + Math.random().toString(36).slice(2, 8);
    const result = buildScenario(scenario, scanId);
    if (clientUuid) this.cache.set(clientUuid, result);
    return result;
  }
  async scanInterior(scanId: string, scenario: ScenarioKey) {
    await delay(700);
    // Interior bumps scenario B → A
    const next = scenario === "B" ? "A" : scenario;
    return buildScenario(next, scanId);
  }
  async listMarketplace() {
    await delay(300);
    return MOCK_LISTINGS;
  }
  async publishListing(scanId: string, payload: Partial<Listing>) {
    await delay(500);
    return {
      id: "lst-" + Math.random().toString(36).slice(2, 8),
      scanId,
      title: payload.title ?? "إعلان جديد",
      classification: payload.classification ?? "Chondrite",
      weightG: payload.weightG ?? 100,
      priceDh: payload.priceDh ?? 1000,
      priceMode: payload.priceMode ?? "fixed",
      region: payload.region ?? "طاطا",
      sellerName: payload.sellerName ?? "مستخدم",
      sellerVerified: false,
      score: payload.score ?? 70,
      status: "pending",
      imageSeed: scanId,
      createdAt: new Date().toISOString(),
      description: payload.description ?? "",
    } as Listing;
  }
}

class HttpTissintAPI implements TissintAPI {
  private headers() {
    return { "Content-Type": "application/json", ...(API_KEY ? { "X-API-Key": API_KEY } : {}) };
  }
  async scanExterior({ scenario, clientUuid }: { scenario: ScenarioKey; clientUuid?: string }) {
    const r = await fetch(`${API_BASE}/api/v1/scan/exterior`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ scenario, clientUuid }),
    });
    return r.json();
  }
  async scanInterior(scanId: string, scenario: ScenarioKey) {
    const r = await fetch(`${API_BASE}/api/v1/scan/${scanId}/interior`, {
      method: "PATCH",
      headers: this.headers(),
      body: JSON.stringify({ scenario }),
    });
    return r.json();
  }
  async listMarketplace() {
    const r = await fetch(`${API_BASE}/api/v1/marketplace/listings`, { headers: this.headers() });
    return r.json();
  }
  async publishListing(scanId: string, payload: Partial<Listing>) {
    const r = await fetch(`${API_BASE}/api/v1/marketplace/publish/${scanId}`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload),
    });
    return r.json();
  }
}

export const tissintApi: TissintAPI =
  MODE === "http" && API_BASE ? new HttpTissintAPI() : new MockTissintAPI();
export const TISSINT_API_MODE = MODE;
