import type { AuthSession, LoginInput, RegisterInput } from "@tissint/shared";
import { quotaLimitForRole } from "@tissint/shared";
import { isTissintApiError } from "@tissint/api-client";
import { getOrCreateDeviceId } from "./device-id";
import { env, isHttpApiEnabled } from "./env";
import { setApiAccessToken, tissintClient } from "./api";
import { clearSavedSession, loadSession, saveSession } from "./session-storage";

function mockSession(input: {
  id: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  role?: "free" | "premium";
}): AuthSession {
  const role = input.role ?? "free";
  const dailyLimit = quotaLimitForRole(role);
  return {
    user: {
      id: input.id,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      email: input.email,
      role,
    },
    tokens: {
      accessToken: `mock-access-${input.id}`,
      refreshToken: `mock-refresh-${input.id}`,
      expiresAt: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    },
    quota: {
      role,
      dailyLimit,
      remainingToday: dailyLimit,
      resetsAt: new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString(),
    },
  };
}

export async function loginWithCredentials(
  input: Omit<LoginInput, "deviceId">,
): Promise<AuthSession> {
  const deviceId = await getOrCreateDeviceId();
  if (isHttpApiEnabled()) {
    return tissintClient.login({ ...input, deviceId });
  }
  await new Promise((resolve) => setTimeout(resolve, 550));
  return mockSession({
    id: input.phoneOrEmail.replace(/[^a-zA-Z0-9_-]/g, "_") || "demo_user",
    phone: input.phoneOrEmail.includes("@") ? undefined : input.phoneOrEmail,
    email: input.phoneOrEmail.includes("@") ? input.phoneOrEmail : undefined,
    firstName: "Tissint",
    lastName: env.apiMode === "mock" ? "Demo" : "User",
    role: "free",
  });
}

export async function registerAccount(
  input: Omit<RegisterInput, "deviceId">,
): Promise<AuthSession> {
  const deviceId = await getOrCreateDeviceId();
  if (isHttpApiEnabled()) {
    return tissintClient.register({ ...input, deviceId });
  }
  await new Promise((resolve) => setTimeout(resolve, 700));
  return mockSession({
    id: input.phone.replace(/[^a-zA-Z0-9_-]/g, "_") || "new_user",
    phone: input.phone,
    email: input.email,
    firstName: input.firstName,
    lastName: input.lastName,
    role: input.desiredRole,
  });
}

function mergeAuthoritativeSession(
  tokens: AuthSession["tokens"],
  identity: AuthSession,
  fallbackRefreshToken: string,
) {
  return {
    ...identity,
    tokens: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken || identity.tokens.refreshToken || fallbackRefreshToken,
      expiresAt: tokens.expiresAt ?? identity.tokens.expiresAt,
    },
  };
}

export async function restoreAuthenticatedSession(): Promise<AuthSession | null> {
  const saved = await loadSession();
  if (!saved) return null;

  if (!isHttpApiEnabled()) return saved;

  const refreshToken = saved.tokens.refreshToken;
  if (!refreshToken) {
    await clearSavedSession();
    setApiAccessToken(null);
    return null;
  }

  try {
    const refreshed = await tissintClient.refresh(refreshToken);
    if (!refreshed.tokens.accessToken) {
      throw new Error("Refresh response did not include an access token");
    }

    setApiAccessToken(refreshed.tokens.accessToken);
    const identity = await tissintClient.me();
    const session = mergeAuthoritativeSession(refreshed.tokens, identity, refreshToken);
    await saveSession(session);
    return session;
  } catch {
    await clearSavedSession();
    setApiAccessToken(null);
    return null;
  }
}

export async function logoutCurrentSession(refreshToken?: string | null): Promise<void> {
  if (isHttpApiEnabled()) {
    try {
      await tissintClient.logout(refreshToken ?? undefined);
    } catch {
      // Local cleanup is more important than blocking logout on a transient network error.
    }
  }

  await clearSavedSession();
  setApiAccessToken(null);
}

export function authErrorMessage(error: unknown, fallback: string): string {
  if (!isTissintApiError(error)) {
    return error instanceof Error ? error.message : fallback;
  }

  if (error.code === "UNAUTHORIZED") return "بيانات الدخول غير صحيحة.";
  if (error.code === "VALIDATION_ERROR") return "يرجى التحقق من المعلومات المدخلة.";
  if (error.code === "RATE_LIMITED") return "محاولات كثيرة. حاول مرة أخرى لاحقاً.";
  if (error.code === "NETWORK_ERROR") return "تعذر الاتصال بالخادم. تحقق من الشبكة.";
  return error.message || fallback;
}
