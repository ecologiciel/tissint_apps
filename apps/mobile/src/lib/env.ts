type ApiMode = "mock" | "http";
type RuntimeEnvironment = "development" | "preview" | "production" | "test";

const rawApiMode = process.env.EXPO_PUBLIC_TISSINT_API_MODE ?? "mock";
const rawRuntimeEnvironment =
  process.env.EXPO_PUBLIC_TISSINT_ENV ?? (__DEV__ ? "development" : "production");
const apiBaseUrl = (process.env.EXPO_PUBLIC_TISSINT_API_BASE_URL ?? "").trim().replace(/\/+$/, "");
const allowInsecureHttp = process.env.EXPO_PUBLIC_TISSINT_ALLOW_INSECURE_HTTP === "true";

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
  allowInsecureHttp,
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

  if (!env.apiKey) {
    return "EXPO_PUBLIC_TISSINT_API_KEY est obligatoire pour le backend Tissint actuel. Recupere-la dans /opt/tissint/backend/.env cote serveur.";
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
    if (!env.allowInsecureHttp) {
      return "En developpement, l'API HTTP externe exige EXPO_PUBLIC_TISSINT_ALLOW_INSECURE_HTTP=true.";
    }
  }

  return null;
}
