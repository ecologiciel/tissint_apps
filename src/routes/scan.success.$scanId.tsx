import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { SCENARIO_LABELS } from "@/lib/scenarios";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import {
  Check,
  ShieldCheck,
  ShieldAlert,
  BookmarkPlus,
  Store,
  ChevronRight,
  Camera,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/scan/success/$scanId")({ component: ScanSuccessPage });

function ScanSuccessPage() {
  const { scanId } = Route.useParams();
  const { lastScan, addToCollection } = useApp();
  const nav = useNavigate();
  const [saved, setSaved] = useState(false);

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
  const isReady = r.score >= 85;
  const scenarioLabel = SCENARIO_LABELS[r.scenario];
  const Icon = isReady ? ShieldCheck : ShieldAlert;
  const accent = isReady ? "bg-success" : "bg-warning";
  const accentText = isReady ? "text-success" : "text-warning";

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

  const publish = () => {
    if (!isReady) {
      toast.error("أكمل قائمة المتطلبات في صفحة التفاصيل أولاً");
      nav({ to: "/scan/result/$scanId", params: { scanId: r.scanId } });
      return;
    }
    nav({ to: "/market/publish/$scanId", params: { scanId: r.scanId } });
  };

  return (
    <div className="flex h-full flex-col bg-stone text-warm relative overflow-hidden" dir="rtl">
      <div className="pointer-events-none absolute inset-0 z-0">
        {isReady &&
          Array.from({ length: 24 }).map((_, i) => (
            <span
              key={i}
              className="confetti-piece absolute h-2 w-2 rounded-sm"
              style={{
                left: `${(i * 11) % 100}%`,
                background: ["#F48A2A", "#F7C75E", "#10B981", "#fff"][i % 4],
                animationDelay: `${(i % 10) * 0.06}s`,
              }}
            />
          ))}
      </div>

      <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 text-center relative z-10 py-6">
        <div
          className={`grid h-24 w-24 place-items-center rounded-full ${accent} shadow-2xl animate-scale-in`}
        >
          <Icon className="h-12 w-12 text-white" />
        </div>
        <h1 className={`mt-6 text-2xl font-black flex items-center gap-2 ${accentText}`}>
          <Check className="h-6 w-6" /> {isReady ? "تم التحقق بنجاح" : "تحليل مقبول مبدئياً"}
        </h1>
        <p className="mt-1 text-xs text-warm/60">السيناريو: {scenarioLabel}</p>

        <div className="mt-6 w-full max-w-sm rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3">
          <MeteoriteThumb seed={r.imageSeed} className="aspect-[4/3] rounded-xl overflow-hidden" />
          <div className="text-right space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-warm/60">التصنيف</span>
              <span className="font-bold">{r.classification}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm/60">النتيجة</span>
              <span className={`font-black ${accentText}`}>{r.score}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm/60">رقم المسح</span>
              <span className="font-mono text-xs">{r.scanId}</span>
            </div>
          </div>
        </div>
      </main>

      <div className="p-5 space-y-2 relative z-10 border-t border-white/10">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={saveToCollection}
            disabled={saved}
            className="rounded-xl bg-white/10 text-warm py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <BookmarkPlus className="h-4 w-4" /> {saved ? "محفوظ" : "حفظ في المجموعة"}
          </button>
          <button
            onClick={publish}
            className={`rounded-xl py-3 font-bold flex items-center justify-center gap-2 ${isReady ? "bg-gradient-to-r from-orange to-gold text-white shadow-lg" : "bg-white/10 text-warm/70"}`}
          >
            <Store className="h-4 w-4" /> نشر في السوق
          </button>
        </div>
        <Link
          to="/scan/result/$scanId"
          params={{ scanId: r.scanId }}
          className="w-full block rounded-xl bg-white/5 text-warm py-3 text-center font-bold flex items-center justify-center gap-2"
        >
          عرض التفاصيل الكاملة <ChevronRight className="h-4 w-4" />
        </Link>
        <Link
          to="/scan"
          className="w-full block rounded-full bg-white/5 py-3 text-center font-bold text-sm flex items-center justify-center gap-2"
        >
          <Camera className="h-4 w-4" /> مسح عينة جديدة
        </Link>
      </div>
    </div>
  );
}
