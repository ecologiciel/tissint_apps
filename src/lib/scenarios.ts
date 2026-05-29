import type { ScanResult, ScenarioKey, Verdict } from "./tissint-types";

export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  A: "أ — احتمال قوي (Chondrite H5)",
  B: "ب — احتمال متوسط (يتطلب فحص داخلي)",
  C: "ج — احتمال ضعيف",
  D: "د — مرفوض (حجر أرضي)",
};

export function verdictForScore(score: number): Verdict {
  if (score >= 75) return "likely";
  if (score >= 50) return "possible";
  if (score >= 25) return "unlikely";
  return "rejected";
}

export function buildScenario(scenario: ScenarioKey, scanId: string): ScanResult {
  const now = new Date().toISOString();
  const base = { scanId, scenario, createdAt: now, imageSeed: scanId };

  switch (scenario) {
    case "A":
      return {
        ...base,
        score: 87,
        verdict: "likely",
        classification: "Chondrite ordinaire H5",
        confidence: 0.87,
        features: [
          { label: "قشرة الانصهار", detected: true, weight: 0.3 },
          { label: "كثافة عالية", detected: true, weight: 0.25 },
          { label: "مغناطيسية", detected: true, weight: 0.2 },
          { label: "بنية حبيبية (Chondrules)", detected: true, weight: 0.25 },
        ],
        notes: "كل المؤشرات الخارجية إيجابية. يُنصح بالنشر في السوق.",
        needsInterior: false,
        eligibleForMarket: true,
        isRare: true,
      };
    case "B":
      return {
        ...base,
        score: 62,
        verdict: "possible",
        classification: "محتمل: نيزك حجري — يتطلب تأكيد",
        confidence: 0.62,
        features: [
          { label: "قشرة الانصهار", detected: true, weight: 0.3 },
          { label: "كثافة عالية", detected: true, weight: 0.25 },
          { label: "مغناطيسية", detected: false, weight: 0.2 },
          { label: "بنية حبيبية", detected: false, weight: 0.25 },
        ],
        notes: "النتيجة غير قاطعة. التقط صورة للسطح الداخلي (شريحة مكسورة أو مصقولة).",
        needsInterior: true,
        eligibleForMarket: false,
      };
    case "C":
      return {
        ...base,
        score: 34,
        verdict: "unlikely",
        classification: "احتمال ضعيف — يشبه البازلت الأرضي",
        confidence: 0.34,
        features: [
          { label: "قشرة الانصهار", detected: false, weight: 0.3 },
          { label: "كثافة عالية", detected: true, weight: 0.25 },
          { label: "مغناطيسية", detected: false, weight: 0.2 },
          { label: "بنية حبيبية", detected: false, weight: 0.25 },
        ],
        notes: "العينة لا تحتوي على قشرة انصهار واضحة. يُحفظ كمرجع فقط.",
        needsInterior: false,
        eligibleForMarket: false,
      };
    case "D":
    default:
      return {
        ...base,
        score: 8,
        verdict: "rejected",
        classification: "مرفوض — حجر أرضي (Pseudo-météorite)",
        confidence: 0.08,
        features: [
          { label: "قشرة الانصهار", detected: false, weight: 0.3 },
          { label: "كثافة عالية", detected: false, weight: 0.25 },
          { label: "مغناطيسية", detected: false, weight: 0.2 },
          { label: "بنية حبيبية", detected: false, weight: 0.25 },
        ],
        notes: "العينة لا تطابق أي خصائص نيزكية معروفة.",
        needsInterior: false,
        eligibleForMarket: false,
      };
  }
}
