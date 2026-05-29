import type { MarketplaceListing } from "@tissint/shared";

export type DemoCollectionItem = {
  id: string;
  scanId: string;
  name: string;
  className: string;
  fusionScore: number;
  status: "needs_cut" | "eligible" | "pending_validation" | "listed" | "sold";
  weightGram: number;
  region: string;
  createdAt: string;
  notes: string;
  isRare?: boolean;
};

export type DemoNotification = {
  id: string;
  kind: "scan" | "market" | "message" | "premium" | "system";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  route?: string;
};

export type DemoPaymentMethod = {
  id: string;
  kind: "card" | "cmi" | "paypal" | "wallet";
  label: string;
  last4?: string;
  isDefault: boolean;
};

export type DemoTransaction = {
  id: string;
  kind: "topup" | "premium" | "purchase" | "sale" | "withdrawal" | "refund";
  label: string;
  amountDh: number;
  status: "completed" | "pending" | "failed";
  createdAt: string;
  invoiceId?: string;
};

export type DemoInvoice = {
  id: string;
  number: string;
  label: string;
  amountDh: number;
  vatDh: number;
  totalDh: number;
  status: "paid" | "pending" | "failed";
  createdAt: string;
};

export type DemoConversation = {
  id: string;
  listingId: string;
  listingTitle: string;
  peerName: string;
  lastMessage: string;
  createdAt: string;
  unread: number;
};

export type DemoChatMessage = {
  id: string;
  threadId: string;
  fromMe: boolean;
  text: string;
  createdAt: string;
};

export const REGIONS = [
  "تاتا",
  "تيسينت",
  "الرشيدية",
  "زاكورة",
  "ورزازات",
  "كلميم",
  "العيون",
  "الداخلة",
  "أكادير",
  "الرباط",
];

export const CLASSIFICATIONS = [
  "Chondrite H5",
  "Chondrite L6",
  "Pallasite",
  "Shergottite",
  "Lunar meteorite",
  "Roche terrestre",
];

export const DEMO_MARKETPLACE_LISTINGS: MarketplaceListing[] = [
  {
    listingId: "mock-lst-001",
    scanId: "mock-scan-001",
    title: "Chondrite H5 - Tissint",
    dominantClass: "Chondrite H5",
    confidence: 0.88,
    fusionScore: 0.88,
    weightGram: 124,
    priceValue: 4500,
    priceMode: "fixed_total",
    region: "تاتا",
    status: "published",
    isRare: false,
    sellerMaskedName: "بائع موثق",
    sellerName: "Mohamed Alami",
    sellerPhone: "+212600000001",
    sellerWhatsapp: "+212600000001",
    sellerVerified: true,
    createdAt: "2026-05-26T10:00:00.000Z",
    description: "عينة نظيفة بقشرة انصهار واضحة، من منطقة تيسينت. الصور المثبتة لا يمكن تغييرها بعد الاعتماد.",
  },
  {
    listingId: "mock-lst-002",
    scanId: "mock-scan-002",
    title: "Pallasite - شريحة مصقولة",
    dominantClass: "Pallasite",
    confidence: 0.95,
    fusionScore: 0.95,
    weightGram: 48,
    priceValue: 12000,
    priceMode: "negotiable",
    region: "الرشيدية",
    status: "published",
    isRare: true,
    sellerMaskedName: "بائع موثق",
    sellerName: "Atelier Atlas",
    sellerPhone: "+212600000002",
    sellerWhatsapp: "+212600000002",
    sellerVerified: true,
    createdAt: "2026-05-25T12:20:00.000Z",
    description: "شريحة حجرية حديدية مع بلورات أوليفين واضحة. السعر قابل للتفاوض بعد معاينة الوثائق.",
  },
  {
    listingId: "mock-lst-003",
    scanId: "mock-scan-003",
    title: "Chondrite L6 - Zagora",
    dominantClass: "Chondrite L6",
    confidence: 0.87,
    fusionScore: 0.87,
    weightGram: 312,
    priceValue: 6800,
    priceMode: "price_per_gram",
    region: "زاكورة",
    status: "published",
    isRare: false,
    sellerMaskedName: "بائع موثق",
    sellerName: "Youssef Bennacer",
    sellerPhone: "+212600000003",
    sellerWhatsapp: "+212600000003",
    sellerVerified: false,
    createdAt: "2026-05-24T08:40:00.000Z",
    description: "حجر كامل مع قشرة انصهار جزئية. الوزن مؤكد بالجرام، والمنطقة العامة فقط ظاهرة للعموم.",
  },
  {
    listingId: "mock-lst-rare",
    scanId: "mock-scan-rare",
    title: "Meteorite Martienne - Shergottite",
    dominantClass: "Shergottite",
    confidence: 0.94,
    fusionScore: 0.94,
    weightGram: 12,
    priceMode: "on_request",
    region: "الداخلة",
    status: "institutional_hold_24h",
    isRare: true,
    sellerMaskedName: "قيد المعالجة",
    sellerName: "Vendeur protege",
    sellerPhone: "+212600000004",
    sellerWhatsapp: "+212600000004",
    sellerVerified: true,
    createdAt: "2026-05-23T18:30:00.000Z",
    description: "مرشح نادر يخضع لمعالجة مؤسساتية لمدة 24 ساعة قبل فتح التواصل.",
    contactLockedUntil: "2026-05-30T18:30:00.000Z",
  },
  {
    listingId: "mock-lst-005",
    scanId: "mock-scan-005",
    title: "Lunaire - شظية صغيرة",
    dominantClass: "Lunar meteorite",
    confidence: 0.9,
    fusionScore: 0.9,
    weightGram: 3,
    priceValue: 24000,
    priceMode: "fixed_total",
    region: "أكادير",
    status: "published",
    isRare: true,
    sellerMaskedName: "بائع موثق",
    sellerName: "Souad Bouanania",
    sellerPhone: "+212600000005",
    sellerWhatsapp: "+212600000005",
    sellerVerified: true,
    createdAt: "2026-05-22T15:10:00.000Z",
    description: "شظية قمرية صغيرة. المعلومات العامة متاحة، والتواصل محجوز لحسابات Premium.",
  },
  {
    listingId: "mock-lst-006",
    scanId: "mock-scan-006",
    title: "Chondrite H4 - مجموعة",
    dominantClass: "Chondrite H4",
    confidence: 0.86,
    fusionScore: 0.86,
    weightGram: 86,
    priceValue: 2100,
    priceMode: "negotiable",
    region: "كلميم",
    status: "published",
    isRare: false,
    sellerMaskedName: "بائع موثق",
    sellerName: "Ahmed Sahraoui",
    sellerPhone: "+212600000006",
    sellerWhatsapp: "+212600000006",
    sellerVerified: false,
    createdAt: "2026-05-21T09:05:00.000Z",
    description: "ثلاث قطع صغيرة من نفس السقوط. البيع قابل للتفاوض حسب الكمية.",
  },
];

export const DEMO_COLLECTION: DemoCollectionItem[] = [
  {
    id: "col-001",
    scanId: "mock-scan-001",
    name: "العينة رقم 1",
    className: "Chondrite H5",
    fusionScore: 0.88,
    status: "listed",
    weightGram: 124,
    region: "تاتا",
    createdAt: "2026-05-26T10:00:00.000Z",
    notes: "قشرة انصهار واضحة ومغناطيسية ضعيفة.",
  },
  {
    id: "col-002",
    scanId: "mock-scan-need-cut",
    name: "العينة رقم 2",
    className: "Présomption Chondrite L6",
    fusionScore: 0.72,
    status: "needs_cut",
    weightGram: 60,
    region: "زاكورة",
    createdAt: "2026-05-20T09:00:00.000Z",
    notes: "البيع مغلق حتى إضافة صورة مقطع أو تحليل تكميلي.",
  },
  {
    id: "col-003",
    scanId: "mock-scan-rare",
    name: "العينة النادرة",
    className: "Shergottite",
    fusionScore: 0.94,
    status: "pending_validation",
    weightGram: 12,
    region: "الداخلة",
    createdAt: "2026-05-23T18:30:00.000Z",
    notes: "حالة معالجة مؤسساتية 24 ساعة.",
    isRare: true,
  },
  {
    id: "col-004",
    scanId: "mock-scan-sold",
    name: "العينة رقم 4",
    className: "Chondrite H4",
    fusionScore: 0.86,
    status: "sold",
    weightGram: 86,
    region: "كلميم",
    createdAt: "2026-05-17T11:15:00.000Z",
    notes: "تم بيعها عبر السوق.",
  },
];

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "n1",
    kind: "message",
    title: "رسالة جديدة من بائع موثق",
    body: "السعر قابل للتفاوض بعد المعاينة.",
    createdAt: "2026-05-29T09:30:00.000Z",
    read: false,
    route: "/messages/th-001",
  },
  {
    id: "n2",
    kind: "market",
    title: "تم قبول إعلانك",
    body: "Chondrite H5 أصبح ظاهرا في السوق.",
    createdAt: "2026-05-28T18:00:00.000Z",
    read: false,
    route: "/marketplace/my-listings",
  },
  {
    id: "n3",
    kind: "scan",
    title: "اكتمل التحليل",
    body: "النتيجة: Chondrite H5 - 88%.",
    createdAt: "2026-05-27T11:12:00.000Z",
    read: true,
    route: "/collection/mock-scan-001",
  },
  {
    id: "n4",
    kind: "premium",
    title: "عرض Premium",
    body: "افتح أرقام البائعين والتنبيهات مقابل 100 درهم شهريا.",
    createdAt: "2026-05-26T08:00:00.000Z",
    read: true,
    route: "/premium",
  },
  {
    id: "n5",
    kind: "system",
    title: "تحسين جودة الفحص",
    body: "تم تحديث قواعد جودة الصور الميدانية في وضع المحاكاة.",
    createdAt: "2026-05-25T07:30:00.000Z",
    read: true,
  },
];

export const DEMO_PAYMENT_METHODS: DemoPaymentMethod[] = [
  { id: "pm-card", kind: "card", label: "Visa", last4: "4242", isDefault: true },
  { id: "pm-cmi", kind: "cmi", label: "CMI Maroc", last4: "1107", isDefault: false },
  { id: "pm-paypal", kind: "paypal", label: "PayPal", isDefault: false },
  { id: "pm-wallet", kind: "wallet", label: "محفظة Tissint", isDefault: false },
];

export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  { id: "tx-1", kind: "topup", label: "شحن المحفظة", amountDh: 200, status: "completed", createdAt: "2026-05-20T09:00:00.000Z" },
  { id: "tx-2", kind: "premium", label: "اشتراك Premium شهري", amountDh: -100, status: "completed", createdAt: "2026-05-21T10:15:00.000Z", invoiceId: "inv-2" },
  { id: "tx-3", kind: "sale", label: "بيع: Chondrite H4", amountDh: 1995, status: "completed", createdAt: "2026-05-24T16:40:00.000Z" },
  { id: "tx-4", kind: "purchase", label: "طلب معاينة شريحة Pallasite", amountDh: -250, status: "pending", createdAt: "2026-05-26T12:00:00.000Z" },
];

export const DEMO_INVOICES: DemoInvoice[] = [
  { id: "inv-1", number: "INV-2026-0041", label: "Premium شهري - أبريل", amountDh: 83.33, vatDh: 16.67, totalDh: 100, status: "paid", createdAt: "2026-04-21T10:00:00.000Z" },
  { id: "inv-2", number: "INV-2026-0042", label: "Premium شهري - ماي", amountDh: 83.33, vatDh: 16.67, totalDh: 100, status: "paid", createdAt: "2026-05-21T10:15:00.000Z" },
  { id: "inv-3", number: "INV-2026-0043", label: "عمولة بيع - Chondrite H4", amountDh: 87.5, vatDh: 17.5, totalDh: 105, status: "pending", createdAt: "2026-05-24T16:40:00.000Z" },
];

export const DEMO_CONVERSATIONS: DemoConversation[] = [
  {
    id: "th-001",
    listingId: "mock-lst-001",
    listingTitle: "Chondrite H5 - Tissint",
    peerName: "Mohamed Alami",
    lastMessage: "نعم، السعر قابل للتفاوض قليلا.",
    createdAt: "2026-05-27T14:20:00.000Z",
    unread: 2,
  },
  {
    id: "th-002",
    listingId: "mock-lst-002",
    listingTitle: "Pallasite - شريحة مصقولة",
    peerName: "Atelier Atlas",
    lastMessage: "يمكنني إرسال صور إضافية اليوم.",
    createdAt: "2026-05-26T10:05:00.000Z",
    unread: 0,
  },
  {
    id: "th-003",
    listingId: "mock-lst-rare",
    listingTitle: "Meteorite Martienne",
    peerName: "Radar Admin",
    lastMessage: "العينة في معالجة مؤسساتية لمدة 24 ساعة.",
    createdAt: "2026-05-24T09:40:00.000Z",
    unread: 0,
  },
];

export const DEMO_MESSAGES: DemoChatMessage[] = [
  { id: "m1", threadId: "th-001", fromMe: true, text: "السلام عليكم، هل العينة لا تزال متوفرة؟", createdAt: "2026-05-27T13:50:00.000Z" },
  { id: "m2", threadId: "th-001", fromMe: false, text: "وعليكم السلام، نعم متوفرة.", createdAt: "2026-05-27T14:00:00.000Z" },
  { id: "m3", threadId: "th-001", fromMe: true, text: "هل السعر قابل للتفاوض؟", createdAt: "2026-05-27T14:10:00.000Z" },
  { id: "m4", threadId: "th-001", fromMe: false, text: "نعم، السعر قابل للتفاوض قليلا.", createdAt: "2026-05-27T14:20:00.000Z" },
  { id: "m5", threadId: "th-002", fromMe: true, text: "صور إضافية من فضلك؟", createdAt: "2026-05-26T09:50:00.000Z" },
  { id: "m6", threadId: "th-002", fromMe: false, text: "يمكنني إرسال صور إضافية اليوم.", createdAt: "2026-05-26T10:05:00.000Z" },
];

export const PREMIUM_PLANS = [
  { id: "monthly" as const, label: "شهري", priceDh: 100, period: "/شهر" },
  { id: "yearly" as const, label: "سنوي", priceDh: 960, period: "/سنة", hint: "وفر 20%" },
];

export type PremiumPlanId = (typeof PREMIUM_PLANS)[number]["id"];
