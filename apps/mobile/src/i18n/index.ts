import { I18nManager } from "react-native";
import type { SupportedLocale } from "@tissint/shared";

export const defaultLocale: SupportedLocale = "ar";

export const messages = {
  ar: {
    "app.name": "تيسينت",
    "nav.dashboard": "الرئيسية",
    "nav.scanner": "الفحص",
    "nav.collection": "مجموعتي",
    "nav.market": "السوق",
    "nav.premium": "Premium",
    "dashboard.greeting": "مرحبا",
    "dashboard.scanCta": "فحص حجر جديد",
    "dashboard.quota": "الفحوصات المتبقية",
    "dashboard.latest": "أحدث الإعلانات",
    "scanner.title": "فحص الحجر",
    "scanner.required": "صور خارجية مطلوبة",
    "scanner.cut": "صورة مقطع اختيارية",
    "scanner.metadata": "بيانات العينة",
    "scanner.capture": "التقاط",
    "scanner.analyze": "تحليل",
    "scanner.permission": "السماح بالكاميرا",
    "scanner.mock": "وضع تجريبي",
    "scan.verdict.earth_rock": "يبدو أنها صخرة أرضية. حظا موفقا في البحث القادم ولا تستسلم.",
    "scan.verdict.needs_cut": "البيع مغلق حاليا: نحتاج صورة مقطع أو تحليلا إضافيا للتوثيق.",
    "scan.verdict.eligible": "النتيجة قوية ويمكن إضافة الحجر إلى مجموعتك ونشره في السوق.",
    "scan.verdict.rare_hold": "العينة نادرة وتدخل معالجة إدارية لمدة 24 ساعة قبل فتح التواصل.",
    "result.scientificNotice": "هذا التحليل يساعد على التعرف البصري ولا يعوض خبرة المختبر.",
    "result.addCollection": "إضافة إلى مجموعتي",
    "result.sell": "نشر في السوق",
    "result.newScan": "فحص جديد",
    "market.title": "السوق",
    "market.locked": "التواصل متاح لحسابات Premium فقط.",
    "premium.title": "Tissint Premium",
    "premium.cta": "ترقية الحساب",
    "admin.radar": "رادار العينات النادرة",
  },
  en: {
    "app.name": "Tissint",
    "nav.dashboard": "Home",
    "nav.scanner": "Scan",
    "nav.collection": "Collection",
    "nav.market": "Market",
    "nav.premium": "Premium",
    "dashboard.greeting": "Welcome",
    "dashboard.scanCta": "Scan a new stone",
    "dashboard.quota": "Remaining scans",
    "dashboard.latest": "Latest listings",
    "scanner.title": "Stone scan",
    "scanner.required": "Required exterior photos",
    "scanner.cut": "Optional cut photo",
    "scanner.metadata": "Sample data",
    "scanner.capture": "Capture",
    "scanner.analyze": "Analyze",
    "scanner.permission": "Allow camera",
    "scanner.mock": "Mock mode",
    "scan.verdict.earth_rock": "This appears to be a terrestrial rock. Good luck on your next search.",
    "scan.verdict.needs_cut": "Sale locked: add a cut photo or complementary analysis for certification.",
    "scan.verdict.eligible": "Strong result. You can save this stone and publish it to the market.",
    "scan.verdict.rare_hold": "Rare sample. Admin processing is active for 24 hours before contact is opened.",
    "result.scientificNotice": "This analysis is an identification aid and does not replace laboratory expertise.",
    "result.addCollection": "Add to collection",
    "result.sell": "Sell in market",
    "result.newScan": "New scan",
    "market.title": "Marketplace",
    "market.locked": "Seller contact is available to Premium accounts only.",
    "premium.title": "Tissint Premium",
    "premium.cta": "Upgrade",
    "admin.radar": "Rare sample radar",
  },
} as const;

export function ensureRtl() {
  if (!I18nManager.isRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }
}

export function t(key: keyof typeof messages.ar, locale: SupportedLocale = defaultLocale): string {
  return messages[locale][key] ?? messages.ar[key] ?? key;
}
