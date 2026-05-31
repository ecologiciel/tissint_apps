import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, WifiOff, Database, RotateCw, Trash2 } from "lucide-react";
import { readOfflineCache } from "@/lib/offline-cache";
import { toast } from "sonner";

export const Route = createFileRoute("/offline")({ component: OfflinePage });

function OfflinePage() {
  const [cache, setCache] = useState(readOfflineCache());
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  const clear = () => {
    localStorage.removeItem("tissint_offline_cache_v1");
    setCache(null);
    toast.success("تم مسح الذاكرة المؤقتة");
  };

  const sizeKb = cache ? Math.round(JSON.stringify(cache).length / 1024) : 0;

  return (
    <div className="flex h-full flex-col bg-background" dir="rtl">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4 bg-navy text-warm rounded-b-2xl">
        <Link to="/settings" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-bold text-lg">الوضع غير المتصل</h1>
          <p className="text-xs text-warm/60">إدارة الذاكرة المؤقتة</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        <div
          className={`rounded-2xl p-4 flex items-center gap-3 ${online ? "bg-success/15 text-success" : "bg-destructive/15 text-destructive"}`}
        >
          <WifiOff className="h-6 w-6" />
          <div className="flex-1">
            <p className="font-bold text-sm">{online ? "متصل بالإنترنت" : "غير متصل"}</p>
            <p className="text-xs opacity-80">
              {online ? "البيانات تُزامن تلقائياً" : "تعتمد التطبيق على الذاكرة المؤقتة"}
            </p>
          </div>
        </div>

        <section className="rounded-2xl bg-card border p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold">
            <Database className="h-4 w-4 text-primary" /> محتوى الذاكرة
          </div>
          {cache ? (
            <>
              <Row label="آخر تحديث" value={new Date(cache.cachedAt).toLocaleString("ar-MA")} />
              <Row label="آخر عمليات المسح" value={`${cache.lastScans.length}`} />
              <Row label="مجموعتي" value={`${cache.collection.length}`} />
              <Row label="إعلانات السوق" value={`${cache.listings.length}`} />
              <Row label="الحجم" value={`${sizeKb} KB`} />
            </>
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">
              لا توجد بيانات مخزّنة بعد
            </p>
          )}
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => {
              setCache(readOfflineCache());
              toast.success("تم التحديث");
            }}
            className="rounded-xl bg-card border-2 py-3 font-bold flex items-center justify-center gap-2 text-sm"
          >
            <RotateCw className="h-4 w-4" /> تحديث
          </button>
          <button
            onClick={clear}
            disabled={!cache}
            className="rounded-xl bg-destructive/15 text-destructive border-2 border-destructive/30 py-3 font-bold flex items-center justify-center gap-2 text-sm disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" /> مسح
          </button>
        </div>

        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          يتم حفظ آخر 10 عمليات مسح + مجموعتك + 50 إعلان من السوق محلياً لتصفّحها بدون اتصال.
        </p>
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}
