import { create } from "zustand";
import type { AlertRule } from "@tissint/shared";

interface EngagementState {
  favoriteIds: string[];
  alerts: AlertRule[];
  isFavorite: (listingId: string) => boolean;
  toggleFavoriteLocal: (listingId: string) => void;
  addAlertLocal: (alert: AlertRule) => void;
  removeAlertLocal: (alertId: string) => void;
}

export const useEngagementStore = create<EngagementState>((set, get) => ({
  favoriteIds: [],
  alerts: [],
  isFavorite: (listingId) => get().favoriteIds.includes(listingId),
  toggleFavoriteLocal: (listingId) =>
    set((state) => ({
      favoriteIds: state.favoriteIds.includes(listingId)
        ? state.favoriteIds.filter((id) => id !== listingId)
        : [listingId, ...state.favoriteIds],
    })),
  addAlertLocal: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts.filter((item) => item.id !== alert.id)],
    })),
  removeAlertLocal: (alertId) =>
    set((state) => ({
      alerts: state.alerts.filter((item) => item.id !== alertId),
    })),
}));
