import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Redirect, Stack, usePathname } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";
import { ResponsiveViewport } from "@/components/ui/ResponsiveViewport";
import { ensureRtl } from "@/i18n";
import { restoreAuthenticatedSession } from "@/lib/auth";
import { getConfigurationIssue } from "@/lib/env";
import { useSessionStore } from "@/store/session-store";
import { colors, spacing } from "@/theme";

export function AppProviders({ children }: { children: ReactNode }) {
  const setSession = useSessionStore((state) => state.setSession);
  const setBooted = useSessionStore((state) => state.setBooted);
  const configurationIssue = getConfigurationIssue();
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 2,
            staleTime: 30000,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  useEffect(() => {
    ensureRtl();
  }, []);

  useEffect(() => {
    if (configurationIssue) {
      setBooted();
      return;
    }

    let mounted = true;
    restoreAuthenticatedSession()
      .then((session) => {
        if (!mounted) return;
        if (session) {
          setSession(session);
        } else {
          setBooted();
        }
      })
      .catch(() => {
        if (mounted) setBooted();
      });
    return () => {
      mounted = false;
    };
  }, [configurationIssue, setBooted, setSession]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <ResponsiveViewport>
          <StatusBar hidden barStyle="light-content" backgroundColor="#1C2024" />
          {configurationIssue ? (
            <ConfigurationErrorScreen message={configurationIssue} />
          ) : (
            <RouteAccessGate>{children}</RouteAccessGate>
          )}
        </ResponsiveViewport>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

function isPublicRoute(pathname: string) {
  return (
    pathname === "/" ||
    pathname === "/onboarding" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/verify-otp" ||
    pathname.startsWith("/legal")
  );
}

function isGuestEntryRoute(pathname: string) {
  return (
    pathname === "/onboarding" ||
    pathname === "/auth/login" ||
    pathname === "/auth/register" ||
    pathname === "/login" ||
    pathname === "/register"
  );
}

function RouteAccessGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const status = useSessionStore((state) => state.status);
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const publicRoute = isPublicRoute(pathname);

  if (status === "booting") {
    return publicRoute ? children : <BootScreen />;
  }

  if (!publicRoute && status !== "authenticated") {
    return <Redirect href="/onboarding" />;
  }

  if (status === "authenticated" && isGuestEntryRoute(pathname)) {
    return <Redirect href="/dashboard" />;
  }

  if (pathname.startsWith("/admin/radar") && role !== "admin") {
    return <Redirect href="/dashboard" />;
  }

  return children;
}

function BootScreen() {
  return (
    <View style={styles.bootRoot}>
      <ActivityIndicator color={colors.orange} />
    </View>
  );
}

function ConfigurationErrorScreen({ message }: { message: string }) {
  return (
    <View style={styles.configRoot}>
      <Card style={styles.configCard}>
        <AppText variant="title" color={colors.danger} style={styles.configTitle}>
          إعداد الاتصال غير مكتمل
        </AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.configText}>
          {message}
        </AppText>
        <Button tone="dark">راجِع ملف البيئة</Button>
      </Card>
    </View>
  );
}

export function RootStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-otp" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="alerts" />
      <Stack.Screen name="billing" />
      <Stack.Screen name="camera-permissions" />
      <Stack.Screen name="certificate/[scanId]" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="checkout/success" />
      <Stack.Screen name="checkout/failed" />
      <Stack.Screen name="collection/[scanId]" />
      <Stack.Screen name="compare" />
      <Stack.Screen name="favorites" />
      <Stack.Screen name="first-scan" />
      <Stack.Screen name="help" />
      <Stack.Screen name="legal/about" />
      <Stack.Screen name="legal/cookies" />
      <Stack.Screen name="legal/privacy" />
      <Stack.Screen name="legal/terms" />
      <Stack.Screen name="marketplace/[listingId]" />
      <Stack.Screen name="marketplace/my-listings" />
      <Stack.Screen name="marketplace/publish" />
      <Stack.Screen name="market" />
      <Stack.Screen name="market/[listingId]" />
      <Stack.Screen name="market/my-listings" />
      <Stack.Screen name="market/publish/[scanId]" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="messages/[threadId]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="offline" />
      <Stack.Screen name="price-history" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="search" />
      <Stack.Screen name="seller/[name]" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="scan" />
      <Stack.Screen name="scan/result" />
      <Stack.Screen name="scan/result/[scanId]" />
      <Stack.Screen name="scan/success/[scanId]" />
      <Stack.Screen name="scan/failed/[scanId]" />
      <Stack.Screen name="stats" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="admin/radar" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  configRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
    backgroundColor: colors.warm,
  },
  configCard: {
    width: "100%",
    maxWidth: 420,
    gap: spacing.md,
  },
  configTitle: {
    textAlign: "center",
  },
  configText: {
    textAlign: "center",
  },
  bootRoot: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.warm,
  },
});
