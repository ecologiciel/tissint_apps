import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { TabBar } from "@/components/tissint/tab-bar";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import { Search, Download, FileJson, FileSpreadsheet, X } from "lucide-react";
import { exportCollectionCSV, exportCollectionJSON, downloadFile } from "@/lib/export";
import { toast } from "sonner";

export const Route = createFileRoute("/collection/")({ component: CollectionPage });

const FILTERS = ["الكل", "احتمال قوي", "متوسط", "مرفوض"] as const;

function CollectionPage() {
  const { collection } = useApp();
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("الكل");
  const [q, setQ] = useState("");
  const [exportOpen, setExportOpen] = useState(false);

  const doExport = (fmt: "csv" | "json") => {
    if (collection.length === 0) { toast.error("لا توجد عناصر للتصدير"); return; }
    const stamp = new Date().toISOString().slice(0, 10);
    if (fmt === "csv") downloadFile(`tissint-collection-${stamp}.csv`, exportCollectionCSV(collection), "text/csv");
    else downloadFile(`tissint-collection-${stamp}.json`, exportCollectionJSON(collection), "application/json");
    toast.success(`تم تصدير ${collection.length} عنصر`);
    setExportOpen(false);
  };

  const filtered = collection.filter((c) => {
    if (q && !c.name.includes(q) && !c.classification.includes(q)) return false;
    if (filter === "احتمال قوي") return c.verdict === "likely";
    if (filter === "متوسط") return c.verdict === "possible";
    if (filter === "مرفوض") return c.verdict === "rejected" || c.verdict === "unlikely";
    return true;
  });

  return (
    <div className="flex h-full flex-col" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-5 rounded-b-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black">مجموعتي</h1>
            <p className="text-xs text-gold mt-1">{collection.length} عينة</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setExportOpen(true)} className="rounded-full bg-white/10 text-warm text-xs font-bold px-3 py-1.5 flex items-center gap-1">
              <Download className="h-3 w-3" /> تصدير
            </button>
            <Link to="/compare" className="rounded-full bg-orange text-white text-xs font-bold px-3 py-1.5">
              ⚖️ مقارنة
            </Link>
          </div>
        </div>
        <div className="mt-4 relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm/50" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث…"
            className="w-full rounded-xl bg-white/10 pr-10 pl-4 py-2.5 text-sm outline-none placeholder:text-warm/40" />
        </div>
      </header>

      <div className="px-5 py-3 flex gap-2 overflow-x-auto hide-scroll">
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold ${filter === f ? "bg-orange text-white" : "bg-muted text-foreground"}`}>
            {f}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto px-5 pb-5">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-muted-foreground">لا توجد عينات</div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((c) => (
              <Link key={c.id} to="/collection/$id" params={{ id: c.id }}
                className="rounded-2xl bg-card border overflow-hidden">
                <MeteoriteThumb seed={c.imageSeed} className="aspect-square" />
                <div className="p-2.5">
                  <p className="text-xs font-bold truncate">{c.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{c.classification}</p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{c.weightG}g</span>
                    <span className="text-xs font-black text-primary">{c.score}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <TabBar />

      {exportOpen && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-end" onClick={() => setExportOpen(false)}>
          <div className="w-full bg-card rounded-t-3xl p-5 space-y-3" onClick={(e) => e.stopPropagation()} dir="rtl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold">تصدير المجموعة</h3>
              <button onClick={() => setExportOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <p className="text-xs text-muted-foreground">{collection.length} عنصر سيتم تصديره</p>
            <button onClick={() => doExport("csv")} className="w-full rounded-xl bg-card border-2 p-3 flex items-center gap-3 text-right">
              <FileSpreadsheet className="h-6 w-6 text-success" />
              <div className="flex-1">
                <p className="font-bold text-sm">CSV</p>
                <p className="text-[10px] text-muted-foreground">يفتح في Excel / Numbers</p>
              </div>
            </button>
            <button onClick={() => doExport("json")} className="w-full rounded-xl bg-card border-2 p-3 flex items-center gap-3 text-right">
              <FileJson className="h-6 w-6 text-primary" />
              <div className="flex-1">
                <p className="font-bold text-sm">JSON</p>
                <p className="text-[10px] text-muted-foreground">للنسخ الاحتياطي والمطورين</p>
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
