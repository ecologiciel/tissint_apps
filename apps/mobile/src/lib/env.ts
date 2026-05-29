export const env = {
  apiMode: process.env.EXPO_PUBLIC_TISSINT_API_MODE ?? "mock",
  apiBaseUrl: process.env.EXPO_PUBLIC_TISSINT_API_BASE_URL ?? "",
  apiKey: process.env.EXPO_PUBLIC_TISSINT_API_KEY ?? "",
} as const;

export function isHttpApiEnabled(): boolean {
  return env.apiMode === "http" && env.apiBaseUrl.length > 0;
}
