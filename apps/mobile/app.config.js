const apiBaseUrl = process.env.EXPO_PUBLIC_TISSINT_API_BASE_URL ?? "";
const allowInsecureHttp = process.env.EXPO_PUBLIC_TISSINT_ALLOW_INSECURE_HTTP === "true";
const usesCleartextTraffic = apiBaseUrl.startsWith("http://") && allowInsecureHttp;

export default ({ config }) => {
  const androidPermissions = new Set([...(config.android?.permissions ?? []), "INTERNET"]);

  return {
    ...config,
    android: {
      ...config.android,
      permissions: Array.from(androidPermissions),
      usesCleartextTraffic,
    },
  };
};
