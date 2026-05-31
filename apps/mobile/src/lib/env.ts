type ApiMode = "mock" | "http";
type RuntimeEnvironment = "development" | "preview" | "production" | "test";

const rawApiMode = process.env.EXPO_PUBLIC_TISSINT_API_MODE ?? "mock";
const rawRuntimeEnvironment =
  process.env.EXPO_PUBLIC_TISSINT_ENV ?? (__DEV__ ? "development" : "production");
const apiBaseUrl = (process.env.EXPO_PUBLIC_TISSINT_API_BASE_URL ?? "").trim().replace(/\/+$/, "");

function normalizeApiMode(value: string): ApiMode {
  return value === "http" || value === "mock" ? value : "mock";
}

function normalizeRuntimeEnvironment(value: string): RuntimeEnvironment {
  if (value === "preview" || value === "production" || value === "test") return value;
  return "development";
}

export const env = {
  runtimeEnvironment: normalizeRuntimeEnvironment(rawRuntimeEnvironment),
  apiMode: normalizeApiMode(rawApiMode),
  apiBaseUrl,
  // Public app keys are allowed only for non-secret gateway identifiers.
  // Never put backend secrets in EXPO_PUBLIC_* variables.
  apiKey: process.env.EXPO_PUBLIC_TISSINT_API_KEY?.trim() ?? "",
} as const;

export function isHttpApiEnabled(): boolean {
  return env.apiMode === "http" && getConfigurationIssue() == null;
}

export function getConfigurationIssue(): string | null {
  if (rawApiMode !== "mock" && rawApiMode !== "http") {
    return "EXPO_PUBLIC_TISSINT_API_MODE doit etre 'mock' ou 'http'.";
  }

  if (env.runtimeEnvironment === "production" && env.apiMode !== "http") {
    return "La build production doit utiliser EXPO_PUBLIC_TISSINT_API_MODE=http.";
  }

  if (env.apiMode !== "http") return null;

  if (!env.apiBaseUrl) {
    return "EXPO_PUBLIC_TISSINT_API_BASE_URL est obligatoire lorsque l'API HTTP est active.";
  }

  const isLocalhost =
    env.apiBaseUrl.startsWith("http://127.0.0.1") ||
    env.apiBaseUrl.startsWith("http://localhost") ||
    env.apiBaseUrl.startsWith("http://10.0.2.2");
  const requiresHttps =
    env.runtimeEnvironment === "preview" || env.runtimeEnvironment === "production";

  if (requiresHttps && !env.apiBaseUrl.startsWith("https://")) {
    return "Les builds preview/production doivent utiliser une API HTTPS.";
  }

  if (!requiresHttps && !env.apiBaseUrl.startsWith("https://") && !isLocalhost) {
    return "En developpement, l'API HTTP doit cibler localhost/10.0.2.2 ou HTTPS.";
  }

  return null;
}
