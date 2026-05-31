import { normalizeBaseUrl, type TissintClientConfig } from "./config";
import { errorCodeForStatus, TissintApiError } from "./errors";

export type TissintRequestInit = RequestInit & {
  skipAuth?: boolean;
};

export class HttpTransport {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly getAccessToken?: TissintClientConfig["getAccessToken"];
  private readonly timeoutMs: number;

  constructor(config: TissintClientConfig) {
    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.apiKey = config.apiKey;
    this.getAccessToken = config.getAccessToken;
    this.timeoutMs = config.timeoutMs ?? 30000;
  }

  async request<T>(path: string, init: TissintRequestInit = {}): Promise<T> {
    const { skipAuth, ...fetchInit } = init;
    const headers = new Headers(init.headers);
    if (!skipAuth && this.apiKey) headers.set("X-API-Key", this.apiKey);

    const token = skipAuth ? null : await this.getAccessToken?.();
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...fetchInit,
        headers,
        signal: controller.signal,
      });
      const contentType = response.headers.get("content-type") ?? "";
      const payload = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new TissintApiError({
          code: payload?.error?.code ?? payload?.code ?? errorCodeForStatus(response.status),
          message: payload?.error?.message ?? payload?.message ?? `HTTP ${response.status}`,
          status: response.status,
          payload,
        });
      }

      return payload as T;
    } catch (error) {
      if (error instanceof TissintApiError) throw error;
      const message = error instanceof Error ? error.message : "Network request failed";
      throw new TissintApiError({ code: "NETWORK_ERROR", message, payload: error });
    } finally {
      clearTimeout(timer);
    }
  }
}
