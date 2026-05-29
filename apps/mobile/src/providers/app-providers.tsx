import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import { StatusBar } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ensureRtl } from "@/i18n";
import { setApiAccessToken } from "@/lib/api";
import { loadSession } from "@/lib/session-storage";
import { useSessionStore } from "@/store/session-store";
import { colors } from "@/theme";

export function AppProviders({ children }: { children: ReactNode }) {
  const setSession = useSessionStore((state) => state.setSession);
  const setBooted = useSessionStore((state) => state.setBooted);
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
    let mounted = true;
    loadSession()
      .then((session) => {
        if (!mounted) return;
        if (session) {
          setApiAccessToken(session.tokens.accessToken);
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
  }, [setBooted, setSession]);

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={client}>
        <StatusBar barStyle="light-content" backgroundColor={colors.navy} />
        {children}
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

export function RootStack() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="auth/login" />
      <Stack.Screen name="auth/register" />
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
      <Stack.Screen name="messages" />
      <Stack.Screen name="messages/[threadId]" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="offline" />
      <Stack.Screen name="price-history" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="search" />
      <Stack.Screen name="seller/[name]" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="scan/result" />
      <Stack.Screen name="stats" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="admin" />
      <Stack.Screen name="admin/radar" />
    </Stack>
  );
}
