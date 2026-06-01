export default ({ config }) => ({
  ...config,
  android: {
    ...config.android,
    usesCleartextTraffic:
      process.env.EXPO_PUBLIC_TISSINT_ENV === "development" &&
      process.env.EXPO_PUBLIC_TISSINT_ALLOW_INSECURE_HTTP === "true",
  },
});
