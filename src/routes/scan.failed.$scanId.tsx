import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { SCENARIO_LABELS } from "@/lib/scenarios";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import { ShieldX, Camera, BookmarkPlus, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/scan/failed/$scanId")({ component: ScanFailedPage });

function ScanFailedPage() {
  const { scanId } = Route.useParams();
  const { lastScan, addToCollection } = useApp();
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
  const scenarioLabel = SCENARIO_LABELS[r.scenario];

  const saveAsReference = () => {
    addToCollection({
      id: "col-" + r.scanId,
      scanId: r.scanId,
      name: "مرجع #" + r.scanId.slice(-3),
      classification: r.classification,
      score: r.score,
      verdict: r.verdict,
      imageSeed: r.imageSeed,
      createdAt: r.createdAt,
    });
    setSaved(true);
    toast.success("تم الحفظ كمرجع في مجموعتك");
  };

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-6 text-center py-6">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-destructive/10 text-destructive shadow animate-scale-in">
          <ShieldX className="h-12 w-12" />
        </div>
        <h1 className="mt-6 text-2xl font-black text-destructive">فشل التحقق</h1>
        <p className="mt-1 text-xs text-muted-foreground">السيناريو: {scenarioLabel}</p>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          العينة لا تستوفي معايير النيزك. لا يمكن نشرها في السوق.
        </p>

        <div className="mt-6 w-full max-w-sm rounded-2xl bg-card border border-border p-4 space-y-3">
          <MeteoriteThumb seed={r.imageSeed} className="aspect-[4/3] rounded-xl overflow-hidden" />
          <div className="text-right space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">التصنيف</span>
              <span className="font-bold">{r.classification}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">النتيجة</span>
              <span className="font-black text-destructive">{r.score}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">الملاحظة</span>
              <span className="font-medium text-xs">{r.notes}</span>
            </div>
          </div>
        </div>
      </main>

      <div className="p-5 space-y-2 border-t bg-card">
        <Link
          to="/scan"
          className="w-full block rounded-xl bg-gradient-to-r from-orange to-gold py-3.5 text-center font-black text-white shadow-lg flex items-center justify-center gap-2"
        >
          <Camera className="h-4 w-4" /> مسح عينة جديدة
        </Link>
        <button
          onClick={saveAsReference}
          disabled={saved}
          className="w-full rounded-xl bg-muted text-foreground py-3 font-bold flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <BookmarkPlus className="h-4 w-4" /> {saved ? "محفوظ كمرجع" : "حفظ كمرجع فقط"}
        </button>
        <Link
          to="/scan/result/$scanId"
          params={{ scanId: r.scanId }}
          className="w-full block rounded-xl bg-transparent text-foreground py-3 text-center font-bold text-sm flex items-center justify-center gap-2"
        >
          عرض التفاصيل <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
