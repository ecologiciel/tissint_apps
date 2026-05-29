import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { TabBar } from "@/components/tissint/tab-bar";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import { ScanLine, TrendingUp, BookOpen, Crown, Bell, Search, Heart } from "lucide-react";

export const Route = createFileRoute("/dashboard")({ component: Dashboard });

function Dashboard() {
  const { userName, role, scansToday, dailyLimit, collection, listings, unreadNotifications } = useApp();
  const recentScans = collection.slice(0, 3);
  const hot = listings.slice(0, 4);

  return (
    <div className="flex h-full flex-col" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-6 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-orange to-gold text-white font-black shadow-md">
              {userName.trim().split(" ").map(s => s[0]).slice(0,2).join("") || "؟"}
            </div>
            <div>
              <p className="text-xs text-gold">مرحباً</p>
              <h1 className="text-base font-bold leading-tight">{userName}</h1>
            </div>
          </Link>
          <div className="flex items-center gap-1.5">
            <Link to="/search" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
              <Search className="h-4 w-4" />
            </Link>
            <Link to="/favorites" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
              <Heart className="h-4 w-4" />
            </Link>
            <Link to="/notifications" className="relative grid h-10 w-10 place-items-center rounded-full bg-white/10">
              <Bell className="h-5 w-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-0.5 -right-0.5 grid h-5 min-w-5 px-1 place-items-center rounded-full bg-orange text-white text-[10px] font-bold">
                  {unreadNotifications}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-lg font-black text-gold">{collection.length}</p>
            <p className="text-[10px] text-warm/70">في مجموعتي</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-lg font-black text-gold">{scansToday}/{dailyLimit === 999 ? "∞" : dailyLimit}</p>
            <p className="text-[10px] text-warm/70">مسح اليوم</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-lg font-black text-gold">{listings.filter(l => l.status === "approved").length}</p>
            <p className="text-[10px] text-warm/70">في السوق</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 py-5 space-y-6">
        <Link to="/scan" className="block">
          <div className="rounded-2xl bg-gradient-to-br from-orange to-gold p-5 text-white shadow-lg active:scale-[0.98] transition">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black">امسح حجراً</h2>
                <p className="text-sm text-white/90 mt-1">حلّل عينة جديدة في ثوانٍ</p>
              </div>
              <div className="grid h-16 w-16 place-items-center rounded-full bg-white/20">
                <ScanLine className="h-8 w-8" />
              </div>
            </div>
          </div>
        </Link>

        <Link to="/first-scan" className="flex items-center gap-3 rounded-xl bg-card border border-border p-3 hover:bg-warm/40">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-orange/10 text-orange text-base">📖</span>
          <div className="flex-1">
            <p className="text-sm font-bold">دليل أول فحص</p>
            <p className="text-[11px] text-muted-foreground">5 نصائح للحصول على أفضل نتيجة</p>
          </div>
          <span className="text-orange text-sm font-bold">›</span>
        </Link>

        {role !== "premium" && (
          <Link to="/premium" className="block">
            <div className="rounded-2xl border-2 border-dashed border-gold/50 bg-gold/10 p-4 flex items-center gap-3">
              <Crown className="h-6 w-6 text-gold" />
              <div className="flex-1">
                <p className="text-sm font-bold">ارفع الحد اليومي</p>
                <p className="text-xs text-muted-foreground">Premium بـ 100 درهم/شهر</p>
              </div>
              <span className="text-orange text-sm font-bold">←</span>
            </div>
          </Link>
        )}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2"><BookOpen className="h-4 w-4 text-orange" /> آخر المسوحات</h3>
            <Link to="/collection" className="text-xs text-orange font-semibold">عرض الكل</Link>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {recentScans.map((s) => (
              <Link key={s.id} to="/collection/$id" params={{ id: s.id }} className="block">
                <MeteoriteThumb seed={s.imageSeed} className="aspect-square rounded-xl" />
                <p className="text-[11px] mt-1 truncate font-semibold">{s.name}</p>
                <p className="text-[10px] text-muted-foreground">{s.score}/100</p>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold flex items-center gap-2"><TrendingUp className="h-4 w-4 text-orange" /> رائج في السوق</h3>
            <Link to="/market" className="text-xs text-orange font-semibold">السوق</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {hot.map((l) => (
              <Link key={l.id} to="/market/$listingId" params={{ listingId: l.id }} className="block rounded-xl bg-card border border-border overflow-hidden">
                <MeteoriteThumb seed={l.imageSeed} className="aspect-square" />
                <div className="p-2">
                  <p className="text-[11px] font-bold truncate">{l.title}</p>
                  <p className="text-[10px] text-orange font-black">{l.priceDh.toLocaleString()} درهم</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <TabBar />
    </div>
  );
}
