import { create } from "zustand";
import type { AuthSession, QuotaSnapshot, SessionUser, UserRole } from "@tissint/shared";

interface SessionState {
  status: "booting" | "anonymous" | "authenticated";
  user: SessionUser | null;
  quota: QuotaSnapshot;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (session: AuthSession) => void;
  clearSession: () => void;
  setRole: (role: UserRole) => void;
  setQuota: (quota: QuotaSnapshot) => void;
  setBooted: () => void;
}

export const anonymousQuota: QuotaSnapshot = {
  role: "guest",
  dailyLimit: 0,
  remainingToday: 0,
};

export const useSessionStore = create<SessionState>((set) => ({
  status: "booting",
  user: null,
  quota: anonymousQuota,
  accessToken: null,
  refreshToken: null,
  setSession: (session) =>
    set({
      status: "authenticated",
      user: session.user,
      quota: session.quota,
      accessToken: session.tokens.accessToken,
      refreshToken: session.tokens.refreshToken,
    }),
  clearSession: () =>
    set({
      status: "anonymous",
      user: null,
      quota: anonymousQuota,
      accessToken: null,
      refreshToken: null,
    }),
  setRole: (role) =>
    set((state) => {
      if (!state.user) return state;
      const dailyLimit = role === "premium" || role === "admin" ? 10 : 5;
      return {
        user: { ...state.user, role },
        quota: {
          ...state.quota,
          role,
          dailyLimit,
          remainingToday: Math.min(state.quota.remainingToday || dailyLimit, dailyLimit),
        },
      };
    }),
  setQuota: (quota) => set({ quota }),
  setBooted: () => set((state) => (state.status === "booting" ? { status: "anonymous" } : state)),
}));
