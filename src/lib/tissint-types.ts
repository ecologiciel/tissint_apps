export type UserRole = "guest" | "free" | "premium" | "admin";
export type ScenarioKey = "A" | "B" | "C" | "D";
export type Verdict = "likely" | "possible" | "unlikely" | "rejected";
export type ListingStatus = "pending" | "approved" | "rejected" | "sold";
export type PriceMode = "fixed" | "negotiable" | "auction";

export type EligibilityState = "rejected" | "needs_completion" | "ready";

export interface ScanResult {
  scanId: string;
  scenario: ScenarioKey;
  score: number; // 0-100
  verdict: Verdict;
  classification: string; // e.g., "Chondrite H5"
  confidence: number;
  features: { label: string; detected: boolean; weight: number }[];
  notes: string;
  needsInterior: boolean;
  eligibleForMarket: boolean;
  createdAt: string;
  imageSeed: string;
  isSyncRetry?: boolean;
  originalScanAt?: string;
  isRare?: boolean;
}

export interface CollectionItem {
  id: string;
  scanId: string;
  name: string;
  classification: string;
  score: number;
  verdict: Verdict;
  weightG?: number;
  origin?: string;
  notes?: string;
  imageSeed: string;
  createdAt: string;
}

export interface Listing {
  id: string;
  scanId?: string;
  title: string;
  classification: string;
  weightG: number;
  priceDh: number;
  priceMode: PriceMode;
  region: string;
  sellerName: string;
  sellerVerified: boolean;
  score: number;
  status: ListingStatus;
  imageSeed: string;
  createdAt: string;
  description: string;
}

export interface Quotas {
  scansToday: number;
  dailyLimit: number;
  listingsActive: number;
  listingsLimit: number;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  fromMe: boolean;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  listingId?: string;
  listingTitle?: string;
  listingImageSeed?: string;
  peerName: string;
  peerVerified: boolean;
  lastMessage: string;
  lastAt: string;
  unread: number;
}

export type NotificationKind =
  | "scan_done"
  | "listing_approved"
  | "listing_rejected"
  | "new_message"
  | "offer"
  | "system"
  | "premium";

export interface AppNotification {
  id: string;
  kind: NotificationKind;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  linkTo?: string;
  linkParams?: Record<string, string>;
}

export type PaymentMethodKind = "card" | "cmi" | "paypal" | "wallet" | "cash";
export type TxKind = "topup" | "purchase" | "premium" | "sale" | "refund" | "withdrawal";
export type TxStatus = "pending" | "completed" | "failed";

export interface PaymentMethod {
  id: string;
  kind: PaymentMethodKind;
  label: string;
  last4?: string;
  isDefault: boolean;
}

export interface Transaction {
  id: string;
  kind: TxKind;
  label: string;
  amountDh: number; // positive = credit, negative = debit
  status: TxStatus;
  createdAt: string;
  invoiceId?: string;
}

export interface Invoice {
  id: string;
  number: string; // e.g. INV-2026-0042
  label: string;
  amountDh: number;
  vatDh: number;
  totalDh: number;
  status: "paid" | "pending" | "failed";
  createdAt: string;
  pdfUrl?: string;
}

export type PlanKey = "monthly" | "yearly";
export interface PremiumPlan {
  key: PlanKey;
  label: string;
  priceDh: number;
  periodLabel: string;
  hint?: string;
}
