import { createContext, useContext, useState, useCallback, useMemo, type ReactNode } from "react";
import type {
  UserRole,
  ScenarioKey,
  CollectionItem,
  Listing,
  ScanResult,
  Conversation,
  ChatMessage,
  AppNotification,
  PaymentMethod,
  Transaction,
  Invoice,
  PlanKey,
} from "./tissint-types";
import {
  MOCK_COLLECTION,
  MOCK_LISTINGS,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
  MOCK_NOTIFICATIONS,
  MOCK_PAYMENT_METHODS,
  MOCK_TRANSACTIONS,
  MOCK_INVOICES,
} from "./mock-data";

interface AppState {
  role: UserRole;
  onboarded: boolean;
  userName: string;
  scenario: ScenarioKey;
  scansToday: number;
  dailyLimit: number;
  collection: CollectionItem[];
  listings: Listing[];
  lastScan: ScanResult | null;
  devPanelOpen: boolean;
  conversations: Conversation[];
  messages: ChatMessage[];
  notifications: AppNotification[];
  unreadMessages: number;
  unreadNotifications: number;
  paymentMethods: PaymentMethod[];
  transactions: Transaction[];
  invoices: Invoice[];
  walletBalanceDh: number;
  premiumPlan: PlanKey | null;
  premiumRenewsAt: string | null;
  favoriteIds: string[];
  toggleFavorite: (listingId: string) => void;
  setRole: (r: UserRole) => void;
  setOnboarded: (v: boolean) => void;
  setUserName: (n: string) => void;
  setScenario: (s: ScenarioKey) => void;
  incrementScans: () => void;
  resetScans: () => void;
  setLastScan: (s: ScanResult | null) => void;
  addToCollection: (item: CollectionItem) => void;
  removeFromCollection: (id: string) => void;
  addListing: (l: Listing) => void;
  updateListingStatus: (id: string, status: Listing["status"]) => void;
  toggleDevPanel: () => void;
  sendMessage: (threadId: string, text: string) => void;
  markThreadRead: (threadId: string) => void;
  startConversationForListing: (l: Listing) => string;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setDefaultPaymentMethod: (id: string) => void;
  addPaymentMethod: (pm: Omit<PaymentMethod, "id">) => void;
  removePaymentMethod: (id: string) => void;
  topUpWallet: (amountDh: number, methodId: string) => Transaction;
  subscribePremium: (plan: PlanKey, methodId: string) => { tx: Transaction; invoice: Invoice };
  cancelPremium: () => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>("free");
  const [onboarded, setOnboarded] = useState(false);
  const [userName, setUserName] = useState("صديق النيازك");
  const [scenario, setScenario] = useState<ScenarioKey>("A");
  const [scansToday, setScansToday] = useState(2);
  const [collection, setCollection] = useState<CollectionItem[]>(MOCK_COLLECTION);
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS);
  const [lastScan, setLastScan] = useState<ScanResult | null>(null);
  const [devPanelOpen, setDevPanelOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  const [notifications, setNotifications] = useState<AppNotification[]>(MOCK_NOTIFICATIONS);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(MOCK_PAYMENT_METHODS);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [premiumPlan, setPremiumPlan] = useState<PlanKey | null>(null);
  const [premiumRenewsAt, setPremiumRenewsAt] = useState<string | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const toggleFavorite = useCallback(
    (id: string) =>
      setFavoriteIds((f) => (f.includes(id) ? f.filter((x) => x !== id) : [id, ...f])),
    [],
  );

  const dailyLimit = role === "premium" || role === "admin" ? 999 : role === "free" ? 5 : 1;

  const incrementScans = useCallback(() => setScansToday((s) => s + 1), []);
  const resetScans = useCallback(() => setScansToday(0), []);
  const addToCollection = useCallback((i: CollectionItem) => setCollection((c) => [i, ...c]), []);
  const removeFromCollection = useCallback(
    (id: string) => setCollection((c) => c.filter((x) => x.id !== id)),
    [],
  );
  const addListing = useCallback((l: Listing) => setListings((ls) => [l, ...ls]), []);
  const updateListingStatus = useCallback(
    (id: string, status: Listing["status"]) =>
      setListings((ls) => ls.map((l) => (l.id === id ? { ...l, status } : l))),
    [],
  );
  const toggleDevPanel = useCallback(() => setDevPanelOpen((v) => !v), []);

  const sendMessage = useCallback((threadId: string, text: string) => {
    const now = new Date().toISOString();
    const msg: ChatMessage = {
      id: "m_" + Math.random().toString(36).slice(2, 9),
      threadId,
      fromMe: true,
      text,
      createdAt: now,
      read: true,
    };
    setMessages((ms) => [...ms, msg]);
    setConversations((cs) =>
      cs.map((c) => (c.id === threadId ? { ...c, lastMessage: text, lastAt: now } : c)),
    );
    // Mock auto-reply after a short delay
    setTimeout(() => {
      const reply: ChatMessage = {
        id: "m_" + Math.random().toString(36).slice(2, 9),
        threadId,
        fromMe: false,
        text: "شكراً لتواصلك، سأرد عليك قريباً.",
        createdAt: new Date().toISOString(),
        read: false,
      };
      setMessages((ms) => [...ms, reply]);
      setConversations((cs) =>
        cs.map((c) =>
          c.id === threadId
            ? { ...c, lastMessage: reply.text, lastAt: reply.createdAt, unread: c.unread + 1 }
            : c,
        ),
      );
    }, 1400);
  }, []);

  const markThreadRead = useCallback((threadId: string) => {
    setMessages((ms) => ms.map((m) => (m.threadId === threadId ? { ...m, read: true } : m)));
    setConversations((cs) => cs.map((c) => (c.id === threadId ? { ...c, unread: 0 } : c)));
  }, []);

  const startConversationForListing = useCallback(
    (l: Listing): string => {
      const existing = conversations.find((c) => c.listingId === l.id);
      if (existing) return existing.id;
      const id = "th_" + Math.random().toString(36).slice(2, 9);
      const conv: Conversation = {
        id,
        listingId: l.id,
        listingTitle: l.title,
        listingImageSeed: l.imageSeed,
        peerName: l.sellerName,
        peerVerified: l.sellerVerified,
        lastMessage: "محادثة جديدة",
        lastAt: new Date().toISOString(),
        unread: 0,
      };
      setConversations((cs) => [conv, ...cs]);
      return id;
    },
    [conversations],
  );

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((ns) => ns.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllNotificationsRead = useCallback(() => {
    setNotifications((ns) => ns.map((n) => ({ ...n, read: true })));
  }, []);

  const unreadMessages = useMemo(
    () => conversations.reduce((s, c) => s + c.unread, 0),
    [conversations],
  );
  const unreadNotifications = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  );
  const walletBalanceDh = useMemo(
    () => transactions.filter((t) => t.status === "completed").reduce((s, t) => s + t.amountDh, 0),
    [transactions],
  );

  const setDefaultPaymentMethod = useCallback(
    (id: string) => setPaymentMethods((pms) => pms.map((p) => ({ ...p, isDefault: p.id === id }))),
    [],
  );
  const addPaymentMethod = useCallback(
    (pm: Omit<PaymentMethod, "id">) =>
      setPaymentMethods((pms) => [
        ...pms,
        { ...pm, id: "pm_" + Math.random().toString(36).slice(2, 8) },
      ]),
    [],
  );
  const removePaymentMethod = useCallback(
    (id: string) => setPaymentMethods((pms) => pms.filter((p) => p.id !== id)),
    [],
  );

  const topUpWallet = useCallback(
    (amountDh: number, methodId: string): Transaction => {
      const tx: Transaction = {
        id: "tx_" + Math.random().toString(36).slice(2, 8),
        kind: "topup",
        label:
          "شحن المحفظة (" + (paymentMethods.find((p) => p.id === methodId)?.label ?? "—") + ")",
        amountDh,
        status: "completed",
        createdAt: new Date().toISOString(),
      };
      setTransactions((ts) => [tx, ...ts]);
      return tx;
    },
    [paymentMethods],
  );

  const subscribePremium = useCallback(
    (plan: PlanKey, methodId: string) => {
      const priceDh = plan === "yearly" ? 960 : 100;
      const now = new Date();
      const renews = new Date(now);
      if (plan === "yearly") renews.setFullYear(renews.getFullYear() + 1);
      else renews.setMonth(renews.getMonth() + 1);

      const invoice: Invoice = {
        id: "inv_" + Math.random().toString(36).slice(2, 8),
        number: "INV-2026-" + String(Math.floor(1000 + Math.random() * 9000)),
        label: "Premium " + (plan === "yearly" ? "سنوي" : "شهري"),
        amountDh: +(priceDh / 1.2).toFixed(2),
        vatDh: +(priceDh - priceDh / 1.2).toFixed(2),
        totalDh: priceDh,
        status: "paid",
        createdAt: now.toISOString(),
      };
      const tx: Transaction = {
        id: "tx_" + Math.random().toString(36).slice(2, 8),
        kind: "premium",
        label:
          invoice.label +
          " (" +
          (paymentMethods.find((p) => p.id === methodId)?.label ?? "—") +
          ")",
        amountDh: -priceDh,
        status: "completed",
        createdAt: now.toISOString(),
        invoiceId: invoice.id,
      };
      setInvoices((iv) => [invoice, ...iv]);
      setTransactions((ts) => [tx, ...ts]);
      setPremiumPlan(plan);
      setPremiumRenewsAt(renews.toISOString());
      setRole("premium");
      return { tx, invoice };
    },
    [paymentMethods],
  );

  const cancelPremium = useCallback(() => {
    setPremiumPlan(null);
    setPremiumRenewsAt(null);
    setRole("free");
  }, []);

  return (
    <Ctx.Provider
      value={{
        role,
        onboarded,
        userName,
        scenario,
        scansToday,
        dailyLimit,
        collection,
        listings,
        lastScan,
        devPanelOpen,
        conversations,
        messages,
        notifications,
        unreadMessages,
        unreadNotifications,
        paymentMethods,
        transactions,
        invoices,
        walletBalanceDh,
        premiumPlan,
        premiumRenewsAt,
        favoriteIds,
        toggleFavorite,
        setRole,
        setOnboarded,
        setUserName,
        setScenario,
        incrementScans,
        resetScans,
        setLastScan,
        addToCollection,
        removeFromCollection,
        addListing,
        updateListingStatus,
        toggleDevPanel,
        sendMessage,
        markThreadRead,
        startConversationForListing,
        markNotificationRead,
        markAllNotificationsRead,
        setDefaultPaymentMethod,
        addPaymentMethod,
        removePaymentMethod,
        topUpWallet,
        subscribePremium,
        cancelPremium,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be inside AppProvider");
  return c;
}
