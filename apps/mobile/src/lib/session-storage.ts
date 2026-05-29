import * as SecureStore from "expo-secure-store";
import type { AuthSession } from "@tissint/shared";

const SESSION_KEY = "tissint.auth_session.v1";

export async function saveSession(session: AuthSession): Promise<void> {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
}

export async function loadSession(): Promise<AuthSession | null> {
  const raw = await SecureStore.getItemAsync(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    await clearSavedSession();
    return null;
  }
}

export async function clearSavedSession(): Promise<void> {
  await SecureStore.deleteItemAsync(SESSION_KEY);
}
