import type { AuthSession } from "@tissint/shared";
import { deleteStoredValue, getStoredValue, setStoredValue } from "./storage-adapter";

const SESSION_KEY = "tissint.auth_session.v1";

function withoutPersistedAccessToken(session: AuthSession): AuthSession {
  return {
    ...session,
    tokens: {
      ...session.tokens,
      accessToken: "",
    },
  };
}

export async function saveSession(session: AuthSession): Promise<void> {
  await setStoredValue(SESSION_KEY, JSON.stringify(withoutPersistedAccessToken(session)));
}

export async function loadSession(): Promise<AuthSession | null> {
  const raw = await getStoredValue(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthSession;
  } catch {
    await clearSavedSession();
    return null;
  }
}

export async function clearSavedSession(): Promise<void> {
  await deleteStoredValue(SESSION_KEY);
}
