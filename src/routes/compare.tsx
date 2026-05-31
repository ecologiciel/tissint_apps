import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { useState } from "react";
import { ChevronRight, X, Plus, Check, Minus } from "lucide-react";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";

export const Route = createFileRoute("/compare")({ component: ComparePage });

function ComparePage() {
  const { collection } = useApp();
  const [selectedIds, setSelectedIds] = useState<string[]>(collection.slice(0, 2).map((c) => c.id));
  const [picker, setPicker] = useState(false);

  const items = selectedIds
    .map((id) => collection.find((c) => c.id === id))
    .filter(Boolean) as typeof collection;

  const add = (id: string) => {
    if (selectedIds.length >= 3) return;
    setSelectedIds([...selectedIds, id]);
    setPicker(false);
  };
  const remove = (id: string) => setSelectedIds(selectedIds.filter((x) => x !== id));

  const rows: {
    label: string;
    get: (c: any) => string;
    numeric?: boolean;
    numVal?: (c: any) => number;
  }[] = [
    { label: "التصنيف", get: (c) => c.classification },
    { label: "نقاط الجودة", get: (c) => `${c.score}/100`, numeric: true, numVal: (c) => c.score },
    { label: "الحكم", get: (c) => verdictLabel(c.verdict) },
    {
      label: "الوزن",
      get: (c) => (c.weightG ? `${c.weightG} غ` : "—"),
      numeric: true,
      numVal: (c) => c.weightG || 0,
    },
    { label: "المصدر", get: (c) => c.origin || "—" },
    { label: "التاريخ", get: (c) => new Date(c.createdAt).toLocaleDateString("ar-MA") },
  ];

  return (
    <div className="flex h-full flex-col bg-background" dir="rtl">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4 bg-navy text-warm rounded-b-2xl">
        <Link
          to="/collection"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-bold text-lg">مقارنة العيّنات</h1>
          <p className="text-xs text-warm/60">حتى 3 عناصر</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Headers */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: `100px repeat(${Math.max(items.length, 1)}, 1fr) ${items.length < 3 ? "60px" : ""}`,
          }}
        >
          <div />
          {items.map((c) => (
            <div key={c.id} className="rounded-xl bg-card border p-2 text-center relative">
              <button
                onClick={() => remove(c.id)}
                className="absolute top-1 left-1 grid h-5 w-5 place-items-center rounded-full bg-destructive/15 text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
              <MeteoriteThumb seed={c.imageSeed} className="aspect-square rounded-lg mb-1" />
              <p className="text-[10px] font-bold truncate">{c.name}</p>
            </div>
          ))}
          {items.length < 3 && (
            <button
              onClick={() => setPicker(true)}
              className="rounded-xl border-2 border-dashed border-border grid place-items-center text-muted-foreground"
            >
              <Plus className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Comparison rows */}
        {items.length > 0 ? (
          <div className="rounded-2xl bg-card border overflow-hidden">
            {rows.map((row, ri) => {
              const values = items.map(row.get);
              const bestIdx =
                row.numeric && row.numVal
                  ? items.reduce(
                      (bi, c, i) => (row.numVal!(c) > row.numVal!(items[bi]) ? i : bi),
                      0,
                    )
                  : -1;
              return (
                <div
                  key={row.label}
                  className={`grid gap-2 p-3 text-xs items-center ${ri % 2 ? "bg-muted/30" : ""}`}
                  style={{ gridTemplateColumns: `100px repeat(${items.length}, 1fr)` }}
                >
                  <div className="text-muted-foreground font-bold">{row.label}</div>
                  {values.map((v, i) => (
                    <div
                      key={i}
                      className={`text-center ${bestIdx === i ? "font-black text-success" : ""}`}
                    >
                      {bestIdx === i && row.numeric && <Check className="inline h-3 w-3 ml-1" />}
                      {v}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl bg-card border p-8 text-center text-sm text-muted-foreground">
            <Minus className="h-8 w-8 mx-auto mb-2 opacity-30" />
            أضف عيّنات للمقارنة
          </div>
        )}
      </main>

      {/* Picker sheet */}
      {picker && (
        <div
          className="absolute inset-0 z-50 bg-black/60 flex items-end"
          onClick={() => setPicker(false)}
        >
          <div
            className="w-full bg-card rounded-t-3xl p-4 max-h-[70%] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold">اختر عيّنة</h3>
              <button onClick={() => setPicker(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {collection
                .filter((c) => !selectedIds.includes(c.id))
                .map((c) => (
                  <button
                    key={c.id}
                    onClick={() => add(c.id)}
                    className="rounded-xl border bg-card p-2 text-right"
                  >
                    <MeteoriteThumb seed={c.imageSeed} className="aspect-square rounded mb-1" />
                    <p className="text-[10px] font-bold truncate">{c.name}</p>
                    <p className="text-[9px] text-muted-foreground">{c.score}/100</p>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function verdictLabel(v: string) {
  return (
    ({ likely: "احتمال قوي", possible: "متوسط", unlikely: "ضعيف", rejected: "مرفوض" } as any)[v] ||
    v
  );
}
