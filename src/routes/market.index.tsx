import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import { TabBar } from "@/components/tissint/tab-bar";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import { EmptyState } from "@/components/tissint/skeleton";
import {
  BadgeCheck, MapPin, Search, SlidersHorizontal, X, ArrowUpDown, Check,
} from "lucide-react";

export const Route = createFileRoute("/market/")({ component: MarketPage });

type Sort = "recent" | "price_asc" | "price_desc" | "score" | "weight";
type Mode = "all" | "fixed" | "negotiable" | "auction";

function MarketPage() {
  const { listings } = useApp();
  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [classification, setClassification] = useState<string>("all");
  const [priceMin, setPriceMin] = useState(0);
  const [priceMax, setPriceMax] = useState(100000);
  const [weightMin, setWeightMin] = useState(0);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [mode, setMode] = useState<Mode>("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [openFilters, setOpenFilters] = useState(false);

  const approved = listings.filter((l) => l.status === "approved");
  const regions = ["all", ...Array.from(new Set(approved.map((l) => l.region)))];
  const classes = ["all", ...Array.from(new Set(approved.map((l) => l.classification)))];

  const filtered = useMemo(() => {
    let out = approved.filter((l) => {
      if (region !== "all" && l.region !== region) return false;
      if (classification !== "all" && l.classification !== classification) return false;
      if (mode !== "all" && l.priceMode !== mode) return false;
      if (verifiedOnly && !l.sellerVerified) return false;
      if (l.priceDh < priceMin || l.priceDh > priceMax) return false;
      if (l.weightG < weightMin) return false;
      if (q && !l.title.includes(q) && !l.classification.includes(q) && !l.region.includes(q)) return false;
      return true;
    });
    switch (sort) {
      case "price_asc": out = [...out].sort((a, b) => a.priceDh - b.priceDh); break;
      case "price_desc": out = [...out].sort((a, b) => b.priceDh - a.priceDh); break;
      case "score": out = [...out].sort((a, b) => b.score - a.score); break;
      case "weight": out = [...out].sort((a, b) => b.weightG - a.weightG); break;
      default: out = [...out].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }
    return out;
  }, [approved, region, classification, mode, verifiedOnly, priceMin, priceMax, weightMin, q, sort]);

  const activeFilters =
    (region !== "all" ? 1 : 0) + (classification !== "all" ? 1 : 0) + (mode !== "all" ? 1 : 0) +
    (verifiedOnly ? 1 : 0) + (priceMin > 0 || priceMax < 100000 ? 1 : 0) + (weightMin > 0 ? 1 : 0);

  const reset = () => {
    setRegion("all"); setClassification("all"); setMode("all");
    setVerifiedOnly(false); setPriceMin(0); setPriceMax(100000); setWeightMin(0);
  };

  return (
    <div className="flex h-full flex-col" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-5 rounded-b-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black">السوق</h1>
            <p className="text-xs text-gold mt-1">{filtered.length} إعلان متاح</p>
          </div>
          <div className="flex gap-2">
            <Link to="/price-history" className="rounded-full bg-white/10 text-warm text-xs font-bold px-3 py-1.5">
              📈 الأسعار
            </Link>
            <Link to="/market/my-listings" className="rounded-full bg-orange text-white text-xs font-bold px-3 py-1.5">
              إعلاناتي
            </Link>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-warm/50" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث في السوق…"
              className="w-full rounded-xl bg-white/10 pr-10 pl-4 py-2.5 text-sm outline-none placeholder:text-warm/40" />
          </div>
          <button onClick={() => setOpenFilters(true)}
            className="relative grid place-items-center h-11 w-11 rounded-xl bg-orange text-white">
            <SlidersHorizontal className="h-4 w-4" />
            {activeFilters > 0 && (
              <span className="absolute -top-1 -right-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-gold text-[9px] font-black text-stone">{activeFilters}</span>
            )}
          </button>
        </div>
      </header>

      <div className="px-5 py-3 flex gap-2 overflow-x-auto hide-scroll">
        {regions.map((r) => (
          <button key={r} onClick={() => setRegion(r)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-bold ${region === r ? "bg-orange text-white" : "bg-muted"}`}>
            {r === "all" ? "كل المناطق" : r}
          </button>
        ))}
        <button onClick={() => {
          const next: Sort[] = ["recent", "price_asc", "price_desc", "score", "weight"];
          setSort(next[(next.indexOf(sort) + 1) % next.length]);
        }} className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold bg-navy text-warm flex items-center gap-1">
          <ArrowUpDown className="h-3 w-3" />
          {sort === "recent" ? "الأحدث" : sort === "price_asc" ? "السعر ↑" : sort === "price_desc" ? "السعر ↓" : sort === "score" ? "الجودة" : "الوزن"}
        </button>
      </div>

      <main className="flex-1 overflow-y-auto px-5 pb-5">
        {filtered.length === 0 ? (
          <EmptyState
            icon={Search}
            title="لا توجد نتائج"
            body="جرّب تعديل البحث أو مسح الفلاتر للعثور على نيازك متاحة."
            actionLabel="مسح الفلاتر"
            onAction={reset}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((l) => (
              <Link key={l.id} to="/market/$listingId" params={{ listingId: l.id }}
                className="rounded-2xl bg-card border overflow-hidden flex flex-col">
                <MeteoriteThumb seed={l.imageSeed} className="aspect-square" />
                <div className="p-2.5 flex-1 flex flex-col">
                  <p className="text-xs font-bold truncate">{l.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {l.region} · {l.weightG}g
                  </p>
                  <div className="mt-auto pt-1 flex items-center justify-between">
                    <span className="text-sm font-black text-orange">{l.priceDh.toLocaleString()} د.م</span>
                    {l.sellerVerified && <BadgeCheck className="h-4 w-4 text-success" />}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Filters bottom sheet */}
      {openFilters && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50" onClick={() => setOpenFilters(false)}>
          <div onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-t-3xl p-5 max-h-[85vh] overflow-y-auto" dir="rtl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black">الفلاتر</h2>
              <button onClick={() => setOpenFilters(false)} className="grid h-8 w-8 place-items-center rounded-full bg-muted">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <h3 className="text-xs font-bold text-muted-foreground mb-2">التصنيف</h3>
                <div className="flex flex-wrap gap-2">
                  {classes.map((c) => (
                    <button key={c} onClick={() => setClassification(c)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold ${classification === c ? "bg-orange text-white" : "bg-muted"}`}>
                      {c === "all" ? "الكل" : c}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground mb-2">نوع السعر</h3>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { id: "all", label: "الكل" },
                    { id: "fixed", label: "ثابت" },
                    { id: "negotiable", label: "تفاوض" },
                    { id: "auction", label: "مزاد" },
                  ] as const).map((m) => (
                    <button key={m.id} onClick={() => setMode(m.id)}
                      className={`rounded-xl py-2 text-xs font-bold ${mode === m.id ? "bg-orange text-white" : "bg-muted"}`}>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground mb-2">
                  السعر: {priceMin.toLocaleString()} – {priceMax.toLocaleString()} د.م
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" value={priceMin} onChange={(e) => setPriceMin(Number(e.target.value) || 0)}
                    placeholder="من" className="rounded-xl bg-muted px-3 py-2 text-sm outline-none text-center" />
                  <input type="number" value={priceMax} onChange={(e) => setPriceMax(Number(e.target.value) || 0)}
                    placeholder="إلى" className="rounded-xl bg-muted px-3 py-2 text-sm outline-none text-center" />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-muted-foreground mb-2">
                  الوزن الأدنى: {weightMin}g
                </h3>
                <input type="range" min={0} max={2000} step={50} value={weightMin}
                  onChange={(e) => setWeightMin(Number(e.target.value))} className="w-full accent-orange" />
              </div>

              <button onClick={() => setVerifiedOnly(!verifiedOnly)}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted">
                <div className={`grid h-5 w-5 place-items-center rounded ${verifiedOnly ? "bg-success" : "bg-card border border-border"}`}>
                  {verifiedOnly && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className="flex-1 text-right text-sm font-bold">بائعون موثوقون فقط</span>
                <BadgeCheck className="h-4 w-4 text-success" />
              </button>

              <div className="flex gap-2 pt-2">
                <button onClick={reset} className="flex-1 rounded-xl bg-muted py-3 text-sm font-bold">مسح</button>
                <button onClick={() => setOpenFilters(false)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-orange to-gold text-white py-3 text-sm font-bold">
                  عرض {filtered.length} نتيجة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <TabBar />
    </div>
  );
}
