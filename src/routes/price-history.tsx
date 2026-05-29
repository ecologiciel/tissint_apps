import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { useMemo, useState } from "react";
import { ChevronRight, TrendingUp, TrendingDown, Filter } from "lucide-react";

export const Route = createFileRoute("/price-history")({ component: PriceHistoryPage });

function PriceHistoryPage() {
  const { listings } = useApp();
  const classifications = useMemo(
    () => Array.from(new Set(listings.map((l) => l.classification))),
    [listings]
  );
  const [selected, setSelected] = useState(classifications[0] ?? "Chondrite H5");

  const matching = listings.filter((l) => l.classification === selected);
  const avgPrice = matching.length
    ? Math.round(matching.reduce((s, l) => s + l.priceDh / Math.max(l.weightG, 1), 0) / matching.length)
    : 0;

  // mock 30-day history
  const history = useMemo(() => {
    const seed = selected.length;
    return Array.from({ length: 30 }, (_, i) => {
      const base = avgPrice || 200;
      const noise = Math.sin((i + seed) * 0.6) * 40 + Math.cos(i * 0.3) * 20;
      return { day: i + 1, price: Math.max(50, Math.round(base + noise)) };
    });
  }, [selected, avgPrice]);

  const min = Math.min(...history.map((h) => h.price));
  const max = Math.max(...history.map((h) => h.price));
  const trend = history[history.length - 1].price - history[0].price;
  const trendPct = Math.round((trend / Math.max(history[0].price, 1)) * 100);

  // SVG line path
  const w = 320, h = 140, pad = 8;
  const points = history.map((p, i) => {
    const x = pad + (i / (history.length - 1)) * (w - pad * 2);
    const y = h - pad - ((p.price - min) / Math.max(max - min, 1)) * (h - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="flex h-full flex-col bg-background" dir="rtl">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4 bg-navy text-warm rounded-b-2xl">
        <Link to="/market" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-bold text-lg">سجل الأسعار</h1>
          <p className="text-xs text-warm/60">آخر 30 يوم</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Selector */}
        <div className="rounded-2xl bg-card border p-3">
          <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
            <Filter className="h-3 w-3" /> اختر التصنيف
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {classifications.map((c) => (
              <button
                key={c}
                onClick={() => setSelected(c)}
                className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-bold border ${
                  selected === c ? "bg-orange text-white border-orange" : "bg-card border-border"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Trend card */}
        <div className="rounded-2xl bg-card border p-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">متوسط السعر (د.م/غ)</span>
            <span className={`flex items-center gap-1 text-xs font-bold ${trend >= 0 ? "text-success" : "text-destructive"}`}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {trendPct > 0 ? "+" : ""}{trendPct}%
            </span>
          </div>
          <p className="text-3xl font-black text-primary">{avgPrice} <span className="text-sm text-muted-foreground">د.م/غ</span></p>

          <svg viewBox={`0 0 ${w} ${h}`} className="w-full mt-3 h-36">
            <defs>
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="oklch(0.71 0.17 50)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="oklch(0.71 0.17 50)" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polyline points={points} fill="none" stroke="oklch(0.71 0.17 50)" strokeWidth="2" />
            <polygon points={`${pad},${h - pad} ${points} ${w - pad},${h - pad}`} fill="url(#grad)" />
          </svg>

          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>أدنى {min} د.م</span>
            <span>أعلى {max} د.م</span>
          </div>
        </div>

        {/* Sample comps */}
        <div className="rounded-2xl bg-card border p-4">
          <h3 className="text-sm font-bold mb-3">إعلانات مماثلة ({matching.length})</h3>
          {matching.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">لا توجد بيانات لهذا التصنيف</p>
          ) : (
            <div className="space-y-2">
              {matching.slice(0, 5).map((l) => (
                <Link
                  key={l.id}
                  to="/market/$listingId"
                  params={{ listingId: l.id }}
                  className="flex items-center justify-between gap-3 py-2 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{l.weightG}غ · {l.region}</p>
                  </div>
                  <span className="font-bold text-orange whitespace-nowrap">{l.priceDh} د.م</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
