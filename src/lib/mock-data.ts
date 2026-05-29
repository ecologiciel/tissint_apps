import type {
  Listing, CollectionItem, Conversation, ChatMessage, AppNotification,
  PaymentMethod, Transaction, Invoice, PremiumPlan,
} from "./tissint-types";

export function seedGradient(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  const h2 = (h + 60) % 360;
  return `linear-gradient(135deg, hsl(${h} 40% 25%), hsl(${h2} 30% 15%))`;
}

export const MOCK_LISTINGS: Listing[] = [
  {
    id: "lst-001", title: "Chondrite H5 — Tissint",
    classification: "Chondrite ordinaire H5", weightG: 124, priceDh: 4500, priceMode: "fixed",
    region: "طاطا", sellerName: "محمد العلوي", sellerVerified: true, score: 88,
    status: "approved", imageSeed: "lst-001", createdAt: "2026-05-12",
    description: "عينة نظيفة بقشرة انصهار واضحة، من منطقة تيسينت.",
  },
  {
    id: "lst-002", title: "Pallasite — شريحة مصقولة",
    classification: "Pallasite (Stony-iron)", weightG: 48, priceDh: 12000, priceMode: "negotiable",
    region: "الرشيدية", sellerName: "ورشة الأطلس", sellerVerified: true, score: 95,
    status: "approved", imageSeed: "lst-002", createdAt: "2026-05-08",
    description: "شريحة Pallasite مصقولة بحجم 4×6 سم، بلورات أوليفين رائعة.",
  },
  {
    id: "lst-003", title: "Chondrite L6",
    classification: "Chondrite ordinaire L6", weightG: 312, priceDh: 6800, priceMode: "fixed",
    region: "زاكورة", sellerName: "يوسف بناصر", sellerVerified: false, score: 79,
    status: "approved", imageSeed: "lst-003", createdAt: "2026-05-15",
    description: "حجر كامل مع قشرة انصهار جزئية.",
  },
  {
    id: "lst-004", title: "Shergottite (Martian)",
    classification: "Shergottite — أصل مريخي", weightG: 12, priceDh: 38000, priceMode: "auction",
    region: "الداخلة", sellerName: "د. كريم الفاسي", sellerVerified: true, score: 92,
    status: "approved", imageSeed: "lst-004", createdAt: "2026-05-20",
    description: "قطعة نادرة موثقة. شهادة معهد ميتيوريت دولي.",
  },
  {
    id: "lst-005", title: "Lunaire — شظية قمرية",
    classification: "Lunar meteorite", weightG: 3, priceDh: 24000, priceMode: "fixed",
    region: "أكادير", sellerName: "سعاد البوعنانية", sellerVerified: true, score: 90,
    status: "approved", imageSeed: "lst-005", createdAt: "2026-05-22",
    description: "شظية قمرية صغيرة، أصل مؤكد.",
  },
  {
    id: "lst-006", title: "Chondrite H4 — مجموعة",
    classification: "Chondrite H4", weightG: 86, priceDh: 2100, priceMode: "fixed",
    region: "طانطان", sellerName: "أحمد الصحراوي", sellerVerified: false, score: 71,
    status: "approved", imageSeed: "lst-006", createdAt: "2026-05-24",
    description: "ثلاث قطع صغيرة من نفس السقوط.",
  },
];

export const MOCK_COLLECTION: CollectionItem[] = [
  {
    id: "col-001", scanId: "scn-001", name: "العينة #1",
    classification: "Chondrite H5", score: 87, verdict: "likely",
    weightG: 145, origin: "طاطا", notes: "أول اكتشاف لي.",
    imageSeed: "col-001", createdAt: "2026-05-01",
  },
  {
    id: "col-002", scanId: "scn-002", name: "العينة #2",
    classification: "غير محدد", score: 42, verdict: "possible",
    weightG: 60, origin: "زاكورة", imageSeed: "col-002", createdAt: "2026-05-10",
  },
  {
    id: "col-003", scanId: "scn-003", name: "العينة #3",
    classification: "حجر أرضي", score: 12, verdict: "rejected",
    weightG: 230, origin: "أكادير", imageSeed: "col-003", createdAt: "2026-05-18",
  },
];

export const REGIONS = ["طاطا", "الرشيدية", "زاكورة", "الداخلة", "أكادير", "طانطان", "ورزازات", "العيون"];

export const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "th-001", listingId: "lst-001", listingTitle: "Chondrite H5 — Tissint", listingImageSeed: "lst-001",
    peerName: "محمد العلوي", peerVerified: true,
    lastMessage: "نعم، السعر قابل للتفاوض قليلاً.",
    lastAt: "2026-05-27T14:20:00Z", unread: 2,
  },
  {
    id: "th-002", listingId: "lst-002", listingTitle: "Pallasite — شريحة مصقولة", listingImageSeed: "lst-002",
    peerName: "ورشة الأطلس", peerVerified: true,
    lastMessage: "يمكنني إرسال صور إضافية اليوم.",
    lastAt: "2026-05-26T10:05:00Z", unread: 0,
  },
  {
    id: "th-003", listingId: "lst-004", listingTitle: "Shergottite (Martian)", listingImageSeed: "lst-004",
    peerName: "د. كريم الفاسي", peerVerified: true,
    lastMessage: "شكراً، سأراجع الشهادة وأعود إليك.",
    lastAt: "2026-05-24T09:40:00Z", unread: 0,
  },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  { id: "m1", threadId: "th-001", fromMe: true,  text: "السلام عليكم، هل العينة لا تزال متوفرة؟", createdAt: "2026-05-27T13:50:00Z", read: true },
  { id: "m2", threadId: "th-001", fromMe: false, text: "وعليكم السلام، نعم متوفرة.", createdAt: "2026-05-27T14:00:00Z", read: true },
  { id: "m3", threadId: "th-001", fromMe: true,  text: "هل السعر قابل للتفاوض؟", createdAt: "2026-05-27T14:10:00Z", read: true },
  { id: "m4", threadId: "th-001", fromMe: false, text: "نعم، السعر قابل للتفاوض قليلاً.", createdAt: "2026-05-27T14:20:00Z", read: false },
  { id: "m5", threadId: "th-001", fromMe: false, text: "هل تريد المعاينة في طاطا؟", createdAt: "2026-05-27T14:21:00Z", read: false },

  { id: "m6", threadId: "th-002", fromMe: true,  text: "صور إضافية من فضلك؟", createdAt: "2026-05-26T09:50:00Z", read: true },
  { id: "m7", threadId: "th-002", fromMe: false, text: "يمكنني إرسال صور إضافية اليوم.", createdAt: "2026-05-26T10:05:00Z", read: true },

  { id: "m8", threadId: "th-003", fromMe: true,  text: "لدي اهتمام بالقطعة المريخية.", createdAt: "2026-05-24T09:30:00Z", read: true },
  { id: "m9", threadId: "th-003", fromMe: false, text: "شكراً، سأراجع الشهادة وأعود إليك.", createdAt: "2026-05-24T09:40:00Z", read: true },
];

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1", kind: "new_message", title: "رسالة جديدة من محمد العلوي",
    body: "نعم، السعر قابل للتفاوض قليلاً.", createdAt: "2026-05-27T14:20:00Z",
    read: false, linkTo: "/messages/$threadId", linkParams: { threadId: "th-001" },
  },
  {
    id: "n2", kind: "listing_approved", title: "تم قبول إعلانك",
    body: "Chondrite H5 — Tissint أصبح ظاهراً في السوق.", createdAt: "2026-05-26T18:00:00Z",
    read: false, linkTo: "/market/my-listings",
  },
  {
    id: "n3", kind: "scan_done", title: "اكتمل التحليل",
    body: "النتيجة: Chondrite H5 — 87/100.", createdAt: "2026-05-25T11:12:00Z",
    read: true, linkTo: "/collection",
  },
  {
    id: "n4", kind: "premium", title: "عرض Premium",
    body: "احصل على شهر مجاني عند الترقية اليوم.", createdAt: "2026-05-23T08:00:00Z",
    read: true, linkTo: "/premium",
  },
  {
    id: "n5", kind: "system", title: "صيانة قصيرة",
    body: "تم تحسين أداء المسح بنسبة 30٪.", createdAt: "2026-05-20T07:30:00Z",
    read: true,
  },
];

export const PREMIUM_PLANS: PremiumPlan[] = [
  { key: "monthly", label: "شهري", priceDh: 100, periodLabel: "/شهر" },
  { key: "yearly",  label: "سنوي", priceDh: 960, periodLabel: "/سنة", hint: "وفّر 20٪" },
];

export const MOCK_PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm-1", kind: "card",   label: "Visa",         last4: "4242", isDefault: true },
  { id: "pm-2", kind: "cmi",    label: "CMI Maroc",    last4: "1107", isDefault: false },
  { id: "pm-3", kind: "wallet", label: "محفظة Tissint",               isDefault: false },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx-1", kind: "topup",    label: "شحن المحفظة",      amountDh:  200, status: "completed", createdAt: "2026-05-20T09:00:00Z" },
  { id: "tx-2", kind: "premium",  label: "اشتراك Premium شهري", amountDh: -100, status: "completed", createdAt: "2026-05-21T10:15:00Z", invoiceId: "inv-2" },
  { id: "tx-3", kind: "sale",     label: "بيع: Chondrite H4", amountDh:  1995, status: "completed", createdAt: "2026-05-24T16:40:00Z" },
  { id: "tx-4", kind: "purchase", label: "شراء: شريحة مصقولة", amountDh: -250, status: "pending",   createdAt: "2026-05-26T12:00:00Z" },
];

export const MOCK_INVOICES: Invoice[] = [
  { id: "inv-1", number: "INV-2026-0041", label: "Premium شهري — أبريل", amountDh: 83.33, vatDh: 16.67, totalDh: 100, status: "paid",    createdAt: "2026-04-21T10:00:00Z" },
  { id: "inv-2", number: "INV-2026-0042", label: "Premium شهري — مايو",  amountDh: 83.33, vatDh: 16.67, totalDh: 100, status: "paid",    createdAt: "2026-05-21T10:15:00Z" },
  { id: "inv-3", number: "INV-2026-0043", label: "عمولة بيع — Chondrite H4", amountDh: 87.5,  vatDh: 17.5,  totalDh: 105, status: "pending", createdAt: "2026-05-24T16:40:00Z" },
];
