import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import { TabBar } from "@/components/tissint/tab-bar";
import { ChevronRight, Plus, Eye, Pencil, Trash2, Clock, CheckCircle2, XCircle, BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import type { ListingStatus } from "@/lib/tissint-types";

export const Route = createFileRoute("/market/my-listings")({ component: MyListings });

const TABS: { k: "all" | ListingStatus; l: string }[] = [
  { k: "all", l: "الكل" },
  { k: "pending", l: "قيد المراجعة" },
  { k: "approved", l: "نشط" },
  { k: "sold", l: "مُباع" },
  { k: "rejected", l: "مرفوض" },
];

const statusMeta: Record<ListingStatus, { color: string; bg: string; label: string; icon: any }> = {
  pending: { color: "text-gold", bg: "bg-gold/15", label: "قيد المراجعة", icon: Clock },
  approved: { color: "text-green-700", bg: "bg-green-100", label: "نشط", icon: CheckCircle2 },
  sold: { color: "text-navy", bg: "bg-navy/15", label: "مُباع", icon: BadgeCheck },
  rejected: { color: "text-destructive", bg: "bg-destructive/10", label: "مرفوض", icon: XCircle },
};

function MyListings() {
  const { listings, userName, updateListingStatus } = useApp();
  const nav = useNavigate();
  const [tab, setTab] = useState<"all" | ListingStatus>("all");

  // In a real app: filter by sellerId. Here we show all the mock seller's listings.
  const mine = listings.filter((l) => l.sellerName === userName || l.sellerName.includes("النيازك"));
  const visible = tab === "all" ? mine : mine.filter((l) => l.status === tab);

  const counts = {
    all: mine.length,
    pending: mine.filter((l) => l.status === "pending").length,
    approved: mine.filter((l) => l.status === "approved").length,
    sold: mine.filter((l) => l.status === "sold").length,
    rejected: mine.filter((l) => l.status === "rejected").length,
  };

  const remove = (id: string) => {
    updateListingStatus(id, "rejected");
    toast.success("تم حذف الإعلان");
  };

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-4 rounded-b-2xl">
        <div className="flex items-center justify-between mb-3">
          <Link to="/market" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
            <ChevronRight className="h-5 w-5" />
          </Link>
          <h1 className="font-bold">إعلاناتي</h1>
          <Link to="/scan" className="grid h-10 w-10 place-items-center rounded-full bg-orange">
            <Plus className="h-5 w-5" />
          </Link>
        </div>

        {/* Stats summary */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <Stat label="الإجمالي" value={counts.all} />
          <Stat label="نشط" value={counts.approved} />
          <Stat label="مُباع" value={counts.sold} />
          <Stat label="مراجعة" value={counts.pending} />
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-card border-b border-border overflow-x-auto sticky top-0 z-10">
        <div className="flex gap-1 px-3 py-2 min-w-max">
          {TABS.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold whitespace-nowrap ${
                tab === t.k ? "bg-orange text-white" : "bg-warm/50 text-muted-foreground"
              }`}>
              {t.l} {counts[t.k] > 0 && <span className="opacity-70">({counts[t.k]})</span>}
            </button>
          ))}
        </div>
      </div>

      <main className="flex-1 overflow-y-auto p-4 space-y-3">
        {visible.length === 0 ? (
          <div className="text-center py-12">
            <div className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-warm">
              <Eye className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">لا توجد إعلانات في هذه الفئة</p>
            <button onClick={() => nav({ to: "/scan" })} className="mt-4 rounded-full bg-orange text-white px-5 py-2 text-sm font-bold">
              ابدأ مسحاً جديداً
            </button>
          </div>
        ) : (
          visible.map((l) => {
            const meta = statusMeta[l.status];
            const Icon = meta.icon;
            return (
              <div key={l.id} className="rounded-2xl bg-card border border-border overflow-hidden">
                <div className="flex gap-3 p-3">
                  <MeteoriteThumb seed={l.imageSeed} className="h-20 w-20 rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm truncate flex-1">{l.title}</h3>
                      <span className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.bg} ${meta.color}`}>
                        <Icon className="h-3 w-3" /> {meta.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{l.weightG}غ · {l.region}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-base font-black text-orange">{l.priceDh.toLocaleString()} د.م</p>
                      <p className="text-[10px] text-muted-foreground">{new Date(l.createdAt).toLocaleDateString("ar-MA")}</p>
                    </div>
                  </div>
                </div>

                {/* Status banner */}
                {l.status === "pending" && (
                  <div className="bg-gold/10 px-3 py-2 text-[11px] text-stone/80 border-t border-gold/20">
                    📋 سيُراجع إعلانك خلال 24 ساعة
                  </div>
                )}
                {l.status === "rejected" && (
                  <div className="bg-destructive/10 px-3 py-2 text-[11px] text-destructive border-t border-destructive/20">
                    ⚠ تم رفض الإعلان — يرجى مراجعة الصور أو الوصف
                  </div>
                )}

                {/* Actions */}
                <div className="flex border-t border-border divide-x divide-x-reverse divide-border">
                  <Link to="/market/$listingId" params={{ listingId: l.id }}
                    className="flex-1 py-2.5 text-xs font-bold text-navy flex items-center justify-center gap-1.5">
                    <Eye className="h-3.5 w-3.5" /> عرض
                  </Link>
                  {l.status !== "sold" && (
                    <button onClick={() => toast.info("تعديل — قريباً")}
                      className="flex-1 py-2.5 text-xs font-bold text-stone flex items-center justify-center gap-1.5">
                      <Pencil className="h-3.5 w-3.5" /> تعديل
                    </button>
                  )}
                  {(l.status === "pending" || l.status === "approved") && (
                    <button onClick={() => remove(l.id)}
                      className="flex-1 py-2.5 text-xs font-bold text-destructive flex items-center justify-center gap-1.5">
                      <Trash2 className="h-3.5 w-3.5" /> حذف
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </main>

      <TabBar />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-white/10 p-2">
      <p className="text-base font-black text-gold">{value}</p>
      <p className="text-[9px] text-warm/70">{label}</p>
    </div>
  );
}
