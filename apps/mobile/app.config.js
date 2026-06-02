import fs from "node:fs/promises";
import path from "node:path";
import ConfigPlugins from "expo/config-plugins.js";

const { AndroidConfig, withAndroidManifest, withDangerousMod } = ConfigPlugins;

const apiBaseUrl = process.env.EXPO_PUBLIC_TISSINT_API_BASE_URL ?? "";
const allowInsecureHttp = process.env.EXPO_PUBLIC_TISSINT_ALLOW_INSECURE_HTTP === "true";
const usesCleartextTraffic = apiBaseUrl.startsWith("http://") && allowInsecureHttp;
const parsedApiHost = (() => {
  try {
    return apiBaseUrl ? new URL(apiBaseUrl).hostname : "";
  } catch {
    return "";
  }
})();

function withTissintAndroidNetworkSecurity(config) {
  if (!usesCleartextTraffic || !parsedApiHost) return config;

  config = withAndroidManifest(config, (manifestConfig) => {
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifestConfig.modResults);
    application.$["android:usesCleartextTraffic"] = "true";
    application.$["android:networkSecurityConfig"] = "@xml/tissint_network_security_config";
    return manifestConfig;
  });

  return withDangerousMod(config, [
    "android",
    async (modConfig) => {
      const xmlDir = path.join(
        modConfig.modRequest.platformProjectRoot,
        "app",
        "src",
        "main",
        "res",
        "xml",
      );
      const xmlPath = path.join(xmlDir, "tissint_network_security_config.xml");
      const xml = `<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
  <domain-config cleartextTrafficPermitted="true">
    <domain includeSubdomains="false">${parsedApiHost}</domain>
  </domain-config>
</network-security-config>
`;

      await fs.mkdir(xmlDir, { recursive: true });
      await fs.writeFile(xmlPath, xml, "utf8");
      return modConfig;
    },
  ]);
}

export default ({ config }) => {
  const androidPermissions = new Set([...(config.android?.permissions ?? []), "INTERNET"]);

  const baseConfig = {
    ...config,
    android: {
      ...config.android,
      permissions: Array.from(androidPermissions),
      usesCleartextTraffic,
    },
  };

  return withTissintAndroidNetworkSecurity(baseConfig);
};
