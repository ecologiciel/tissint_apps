import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { TabBar } from "@/components/tissint/tab-bar";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import { EmptyState } from "@/components/tissint/skeleton";
import { ChevronLeft, Heart, BadgeCheck, MapPin, Trash2, Store } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/favorites")({ component: FavoritesPage });

function FavoritesPage() {
  const { listings, favoriteIds, toggleFavorite } = useApp();
  const items = listings.filter((l) => favoriteIds.includes(l.id));

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-5 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Link>
          <div className="text-center">
            <h1 className="text-base font-bold">المفضلات</h1>
            <p className="text-[10px] text-warm/60">{items.length} عينة محفوظة</p>
          </div>
          <Heart className="h-5 w-5 text-orange fill-orange" />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5">
        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="لا توجد مفضلات بعد"
            body="اضغط على ❤ في أي إعلان لحفظه هنا والرجوع إليه لاحقاً."
            actionLabel="تصفّح السوق"
            actionTo="/market"
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {items.map((l) => (
              <div key={l.id} className="rounded-2xl bg-card border overflow-hidden relative">
                <Link to="/market/$listingId" params={{ listingId: l.id }}>
                  <MeteoriteThumb seed={l.imageSeed} className="aspect-square" />
                </Link>
                <button
                  onClick={() => {
                    toggleFavorite(l.id);
                    toast.success("تمت الإزالة من المفضلات");
                  }}
                  className="absolute top-2 left-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 backdrop-blur text-destructive shadow"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <Link to="/market/$listingId" params={{ listingId: l.id }} className="block p-2.5">
                  <p className="text-xs font-bold truncate">{l.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {l.region}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-sm font-black text-orange">
                      {l.priceDh.toLocaleString()} د.م
                    </span>
                    {l.sellerVerified && <BadgeCheck className="h-4 w-4 text-success" />}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>

      {items.length > 0 && (
        <div className="px-5 pb-2">
          <Link
            to="/market"
            className="flex items-center justify-center gap-2 rounded-full bg-muted py-3 text-xs font-bold"
          >
            <Store className="h-4 w-4" /> اكتشف المزيد في السوق
          </Link>
        </div>
      )}
      <TabBar />
    </div>
  );
}
