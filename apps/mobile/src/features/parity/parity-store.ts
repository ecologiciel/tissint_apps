import { create } from "zustand";
import {
  DEMO_CONVERSATIONS,
  DEMO_INVOICES,
  DEMO_MESSAGES,
  DEMO_NOTIFICATIONS,
  DEMO_PAYMENT_METHODS,
  DEMO_TRANSACTIONS,
  type DemoChatMessage,
  type DemoConversation,
  type DemoInvoice,
  type DemoNotification,
  type DemoPaymentMethod,
  type DemoTransaction,
  type PremiumPlanId,
} from "./parity-data";

type ThemeMode = "light" | "dark" | "auto";
type LocaleMode = "ar" | "fr" | "en";

interface ParityState {
  notifications: DemoNotification[];
  paymentMethods: DemoPaymentMethod[];
  transactions: DemoTransaction[];
  invoices: DemoInvoice[];
  conversations: DemoConversation[];
  messages: DemoChatMessage[];
  premiumPlan: PremiumPlanId | null;
  premiumRenewsAt: string | null;
  themeMode: ThemeMode;
  locale: LocaleMode;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  biometricEnabled: boolean;
  analyticsEnabled: boolean;
  locationSharingEnabled: boolean;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setDefaultPaymentMethod: (id: string) => void;
  removePaymentMethod: (id: string) => void;
  topUpWallet: (amountDh: number, methodId: string) => DemoTransaction;
  subscribePremium: (plan: PremiumPlanId, totalDh: number, methodId: string) => DemoInvoice;
  cancelPremium: () => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  setLocale: (locale: LocaleMode) => void;
  togglePush: () => void;
  toggleEmail: () => void;
  toggleSms: () => void;
  toggleBiometric: () => void;
  toggleAnalytics: () => void;
  toggleLocationSharing: () => void;
  sendMessage: (threadId: string, text: string) => void;
}

export const useParityStore = create<ParityState>((set, get) => ({
  notifications: DEMO_NOTIFICATIONS,
  paymentMethods: DEMO_PAYMENT_METHODS,
  transactions: DEMO_TRANSACTIONS,
  invoices: DEMO_INVOICES,
  conversations: DEMO_CONVERSATIONS,
  messages: DEMO_MESSAGES,
  premiumPlan: null,
  premiumRenewsAt: null,
  themeMode: "auto",
  locale: "ar",
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  biometricEnabled: true,
  analyticsEnabled: true,
  locationSharingEnabled: true,
  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    })),
  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, read: true })),
    })),
  setDefaultPaymentMethod: (id) =>
    set((state) => ({
      paymentMethods: state.paymentMethods.map((method) => ({
        ...method,
        isDefault: method.id === id,
      })),
    })),
  removePaymentMethod: (id) =>
    set((state) => ({
      paymentMethods: state.paymentMethods.filter(
        (method) => method.id !== id || method.kind === "wallet",
      ),
    })),
  topUpWallet: (amountDh, methodId) => {
    const method = get().paymentMethods.find((item) => item.id === methodId);
    const tx: DemoTransaction = {
      id: `tx-${Date.now()}`,
      kind: "topup",
      label: `شحن المحفظة (${method?.label ?? "طريقة دفع"})`,
      amountDh,
      status: "completed",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ transactions: [tx, ...state.transactions] }));
    return tx;
  },
  subscribePremium: (plan, totalDh, methodId) => {
    const method = get().paymentMethods.find((item) => item.id === methodId);
    const now = new Date();
    const renewsAt = new Date(now);
    if (plan === "yearly") renewsAt.setFullYear(renewsAt.getFullYear() + 1);
    else renewsAt.setMonth(renewsAt.getMonth() + 1);

    const invoice: DemoInvoice = {
      id: `inv-${Date.now()}`,
      number: `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      label: `Premium ${plan === "yearly" ? "سنوي" : "شهري"}`,
      amountDh: Number((totalDh / 1.2).toFixed(2)),
      vatDh: Number((totalDh - totalDh / 1.2).toFixed(2)),
      totalDh,
      status: "paid",
      createdAt: now.toISOString(),
    };
    const tx: DemoTransaction = {
      id: `tx-${Date.now()}`,
      kind: "premium",
      label: `${invoice.label} (${method?.label ?? "طريقة دفع"})`,
      amountDh: -totalDh,
      status: "completed",
      createdAt: now.toISOString(),
      invoiceId: invoice.id,
    };

    set((state) => ({
      invoices: [invoice, ...state.invoices],
      transactions: [tx, ...state.transactions],
      premiumPlan: plan,
      premiumRenewsAt: renewsAt.toISOString(),
    }));
    return invoice;
  },
  cancelPremium: () => set({ premiumPlan: null, premiumRenewsAt: null }),
  setThemeMode: (themeMode) => set({ themeMode }),
  setLocale: (locale) => set({ locale }),
  togglePush: () => set((state) => ({ pushEnabled: !state.pushEnabled })),
  toggleEmail: () => set((state) => ({ emailEnabled: !state.emailEnabled })),
  toggleSms: () => set((state) => ({ smsEnabled: !state.smsEnabled })),
  toggleBiometric: () => set((state) => ({ biometricEnabled: !state.biometricEnabled })),
  toggleAnalytics: () => set((state) => ({ analyticsEnabled: !state.analyticsEnabled })),
  toggleLocationSharing: () =>
    set((state) => ({ locationSharingEnabled: !state.locationSharingEnabled })),
  sendMessage: (threadId, text) => {
    if (!text.trim()) return;
    const message: DemoChatMessage = {
      id: `m-${Date.now()}`,
      threadId,
      fromMe: true,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      messages: [...state.messages, message],
      conversations: state.conversations.map((conversation) =>
        conversation.id === threadId
          ? { ...conversation, lastMessage: text.trim(), createdAt: message.createdAt, unread: 0 }
          : conversation,
      ),
    }));
  },
}));

export function selectWalletBalance(state: ParityState) {
  return state.transactions
    .filter((transaction) => transaction.status === "completed")
    .reduce((total, transaction) => total + transaction.amountDh, 0);
}

export function selectUnreadNotifications(state: ParityState) {
  return state.notifications.filter((notification) => !notification.read).length;
}

export function selectUnreadMessages(state: ParityState) {
  return state.conversations.reduce((total, conversation) => total + conversation.unread, 0);
}
