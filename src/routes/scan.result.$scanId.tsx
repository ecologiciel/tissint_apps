import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { tissintApi } from "@/lib/tissint-api";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import {
  Check,
  X,
  ChevronRight,
  Store,
  BookmarkPlus,
  Camera,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  RefreshCw,
  Share2,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import type { EligibilityState } from "@/lib/tissint-types";

export const Route = createFileRoute("/scan/result/$scanId")({ component: ResultPage });

function getEligibilityState(score: number): EligibilityState {
  if (score < 50) return "rejected";
  if (score < 85) return "needs_completion";
  return "ready";
}

const stateTheme: Record<
  EligibilityState,
  {
    ring: string;
    text: string;
    bg: string;
    border: string;
    chip: string;
    label: string;
    sublabel: string;
    Icon: typeof ShieldCheck;
  }
> = {
  rejected: {
    ring: "stroke-destructive",
    text: "text-destructive",
    bg: "bg-destructive/10",
    border: "border-destructive/40",
    chip: "bg-destructive text-destructive-foreground",
    label: "صخرة أرضية",
    sublabel: "العينة لا تستوفي معايير النيزك",
    Icon: ShieldX,
  },
  needs_completion: {
    ring: "stroke-warning",
    text: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/40",
    chip: "bg-warning text-warning-foreground",
    label: "شهادة معلّقة",
    sublabel: "أكمل الخطوات لتفعيل النشر في السوق",
    Icon: ShieldAlert,
  },
  ready: {
    ring: "stroke-success",
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/40",
    chip: "bg-success text-success-foreground",
    label: "موثّق تيسينت",
    sublabel: "العينة جاهزة للنشر والبيع",
    Icon: ShieldCheck,
  },
};

function ScoreRing({ score, colorClass }: { score: number; colorClass: string }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = requestAnimationFrame(() => setProgress(score));
    return () => cancelAnimationFrame(t);
  }, [score]);
  const R = 52;
  const C = 2 * Math.PI * R;
  const offset = C - (progress / 100) * C;
  return (
    <div className="relative h-32 w-32">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
        <circle cx="60" cy="60" r={R} strokeWidth="10" className="stroke-muted/40" fill="none" />
        <circle
          cx="60"
          cy="60"
          r={R}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          className={`${colorClass} transition-[stroke-dashoffset] duration-[1200ms] ease-out`}
          strokeDasharray={C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-black tabular-nums">{Math.round(progress)}</div>
          <div className="text-[10px] text-muted-foreground -mt-1">/ 100</div>
        </div>
      </div>
    </div>
  );
}

function ResultPage() {
  const { scanId } = Route.useParams();
  const { lastScan, scenario, setLastScan, addToCollection } = useApp();
  const nav = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    interior: false,
    weight: false,
    origin: false,
  });

  if (!lastScan || lastScan.scanId !== scanId) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center"
        dir="rtl"
      >
        <p className="text-sm text-muted-foreground">لا توجد نتيجة محفوظة</p>
        <Link to="/scan" className="rounded-full bg-orange px-5 py-2 text-white text-sm">
          العودة للمسح
        </Link>
      </div>
    );
  }

  const r = lastScan;
  const state = useMemo(() => getEligibilityState(r.score), [r.score]);
  const theme = stateTheme[state];
  const Icon = theme.Icon;

  const checklistDone = Object.values(checklist).every(Boolean);
  const canPublish = state === "ready" || (state === "needs_completion" && checklistDone);

  const analyzeInterior = async () => {
    setAnalyzing(true);
    const next = await tissintApi.scanInterior(r.scanId, scenario);
    setLastScan(next);
    setChecklist((c) => ({ ...c, interior: true }));
    setAnalyzing(false);
    toast.success("تم تحديث النتيجة بعد فحص الداخل");
  };

  const saveToCollection = () => {
    addToCollection({
      id: "col-" + r.scanId,
      scanId: r.scanId,
      name: "العينة #" + r.scanId.slice(-3),
      classification: r.classification,
      score: r.score,
      verdict: r.verdict,
      imageSeed: r.imageSeed,
      createdAt: r.createdAt,
    });
    setSaved(true);
    toast.success("تم الحفظ في مجموعتك");
  };

  const handlePublish = () => {
    if (!canPublish) {
      toast.error(state === "rejected" ? "غير مؤهلة للسوق" : "أكمل قائمة المتطلبات أولاً");
      return;
    }
    nav({ to: "/market/publish/$scanId", params: { scanId: r.scanId } });
  };

  return (
    <div className="flex h-full flex-col" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-4 flex items-center justify-between rounded-b-2xl">
        <Link to="/scan" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
          <ChevronRight className="h-5 w-5" />
        </Link>
        <h1 className="font-bold">نتيجة التحليل</h1>
        <button className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
          <Share2 className="h-4 w-4" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        {r.isSyncRetry && (
          <div className="flex items-center gap-3 rounded-xl bg-primary/10 border border-primary/30 p-3 animate-fade-in">
            <RefreshCw className="h-4 w-4 text-primary" />
            <div className="flex-1 text-xs">
              <p className="font-bold">نتيجة مستعادة</p>
              <p className="text-muted-foreground">تم استرجاع التحليل بدون استهلاك رصيد</p>
            </div>
          </div>
        )}

        {/* Hero: state + score ring */}
        <div className={`rounded-2xl border-2 ${theme.border} ${theme.bg} p-5 animate-fade-in`}>
          <div className="flex items-center gap-4">
            <ScoreRing score={r.score} colorClass={theme.ring} />
            <div className="flex-1">
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold ${theme.chip}`}
              >
                <Icon className="h-3 w-3" />
                {theme.label}
              </div>
              <h2 className="text-lg font-bold mt-2 leading-tight">{r.classification}</h2>
              <p className="text-xs text-muted-foreground mt-1">{theme.sublabel}</p>
              {r.isRare && state === "ready" && (
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-gold/20 px-2 py-0.5 text-[10px] font-bold text-gold-foreground">
                  ⭐ عينة نادرة
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Photo */}
        <div className="rounded-2xl bg-card border overflow-hidden relative">
          <MeteoriteThumb seed={r.imageSeed} className="aspect-[4/3]" />
          {state === "ready" && (
            <div className="absolute top-3 right-3 rounded-full bg-success text-success-foreground px-3 py-1 text-[10px] font-bold flex items-center gap-1 animate-scale-in shadow-lg">
              <ShieldCheck className="h-3 w-3" /> موثّق تيسينت
            </div>
          )}
          <div className="p-4">
            <p className="text-sm text-muted-foreground">{r.notes}</p>
          </div>
        </div>

        {/* Features */}
        <div className="rounded-2xl bg-card border p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-orange" /> الخصائص المكتشفة
          </h3>
          <ul className="space-y-2">
            {r.features.map((f) => (
              <li key={f.label} className="flex items-center gap-3">
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full ${f.detected ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
                >
                  {f.detected ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                </span>
                <span className="flex-1 text-sm">{f.label}</span>
                <span className="text-xs text-muted-foreground">{Math.round(f.weight * 100)}%</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Scenario 2: progressive checklist */}
        {state === "needs_completion" && (
          <div
            className={`rounded-2xl border-2 border-dashed ${theme.border} ${theme.bg} p-4 animate-fade-in`}
          >
            <h3 className="text-sm font-bold mb-1 flex items-center gap-2">
              <ListChecks className={`h-4 w-4 ${theme.text}`} /> أكمل لرفع الشهادة
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              {Object.values(checklist).filter(Boolean).length} / {Object.keys(checklist).length}{" "}
              مكتمل
            </p>
            <div className="h-1.5 w-full rounded-full bg-muted/50 mb-3 overflow-hidden">
              <div
                className="h-full bg-warning transition-all duration-500"
                style={{ width: `${(Object.values(checklist).filter(Boolean).length / 3) * 100}%` }}
              />
            </div>
            <div className="space-y-2">
              {[
                {
                  key: "interior",
                  label: "صورة السطح الداخلي",
                  action: r.needsInterior ? analyzeInterior : undefined,
                },
                { key: "weight", label: "تأكيد الوزن بالغرام" },
                { key: "origin", label: "تحديد موقع الاكتشاف" },
              ].map((step) => {
                const done = checklist[step.key];
                return (
                  <button
                    key={step.key}
                    onClick={() => {
                      if (step.action) {
                        step.action();
                        return;
                      }
                      setChecklist((c) => ({ ...c, [step.key]: !c[step.key] }));
                    }}
                    disabled={analyzing && step.key === "interior"}
                    className={`w-full flex items-center gap-3 rounded-xl border p-3 text-right transition ${
                      done
                        ? "bg-success/10 border-success/40"
                        : "bg-card border-border hover:border-warning"
                    }`}
                  >
                    <span
                      className={`grid h-6 w-6 place-items-center rounded-full ${done ? "bg-success text-success-foreground" : "bg-muted text-muted-foreground"}`}
                    >
                      {done ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : step.key === "interior" ? (
                        <Camera className="h-3.5 w-3.5" />
                      ) : (
                        <span className="text-[10px]">+</span>
                      )}
                    </span>
                    <span className="flex-1 text-sm font-medium">{step.label}</span>
                    {step.key === "interior" && analyzing && (
                      <span className="text-xs text-muted-foreground">جاري…</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Rejected CTA */}
        {state === "rejected" && (
          <Link
            to="/scan"
            className="block w-full rounded-2xl bg-destructive text-destructive-foreground py-4 text-center font-bold flex items-center justify-center gap-2"
          >
            <Camera className="h-4 w-4" /> مسح عينة جديدة
          </Link>
        )}

        {/* Actions */}
        {state !== "rejected" && (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={saveToCollection}
              disabled={saved}
              className="rounded-xl border-2 border-primary text-primary py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <BookmarkPlus className="h-4 w-4" />
              {saved ? "محفوظ" : "حفظ"}
            </button>
            <button
              onClick={handlePublish}
              disabled={!canPublish}
              className={`rounded-xl py-3 font-bold flex items-center justify-center gap-2 transition ${
                canPublish ? "bg-orange text-white shadow-lg" : "bg-muted text-muted-foreground"
              }`}
            >
              <Store className="h-4 w-4" /> نشر في السوق
            </button>
          </div>
        )}

        {state === "ready" && (
          <Link
            to="/certificate/$scanId"
            params={{ scanId: r.scanId }}
            className="block w-full rounded-xl bg-gold/15 border-2 border-gold py-3 text-center font-bold text-sm"
          >
            📜 عرض شهادة المصداقية
          </Link>
        )}
      </main>
    </div>
  );
}
