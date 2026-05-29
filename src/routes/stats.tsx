import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import { useApp } from "@/lib/store";
import { ChevronRight, TrendingUp, Award, Target, Calendar, Sparkles, Scale } from "lucide-react";

export const Route = createFileRoute("/stats")({ component: StatsPage });

function StatsPage() {
  const { collection, scansToday, dailyLimit, listings, walletBalanceDh, role } = useApp();

  const stats = useMemo(() => {
    const total = collection.length;
    const likely = collection.filter((c) => c.verdict === "likely").length;
    const avgScore = total ? Math.round(collection.reduce((s, c) => s + c.score, 0) / total) : 0;
    const byClass = collection.reduce<Record<string, number>>((acc, c) => {
      acc[c.classification] = (acc[c.classification] || 0) + 1;
      return acc;
    }, {});
    const topClass = Object.entries(byClass).sort((a, b) => b[1] - a[1])[0];
    const active = listings.filter((l) => l.status === "approved").length;
    const sold = listings.filter((l) => l.status === "sold").length;
    return { total, likely, avgScore, byClass, topClass, active, sold };
  }, [collection, listings]);

  const last7 = Array.from({ length: 7 }, (_, i) => ({
    day: ["س", "ج", "خ", "ر", "ث", "ن", "ح"][i],
    n: Math.floor(Math.random() * 5) + (i === 6 ? scansToday : 0),
  }));
  const maxBar = Math.max(...last7.map((d) => d.n), 1);

  const achievements = [
    { id: "first", icon: Sparkles, label: "أول مسح", done: stats.total > 0 },
    { id: "ten", icon: Target, label: "10 عيّنات", done: stats.total >= 10 },
    { id: "likely", icon: Award, label: "5 احتمالات قوية", done: stats.likely >= 5 },
    { id: "seller", icon: TrendingUp, label: "بائع نشط", done: stats.active > 0 },
  ];

  return (
    <div className="flex h-full flex-col bg-background" dir="rtl">
      <header className="flex items-center gap-3 px-5 pt-12 pb-4 bg-navy text-warm rounded-b-2xl">
        <Link to="/profile" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="font-bold text-lg">إحصائياتي</h1>
          <p className="text-xs text-warm/60">نظرة شاملة على نشاطك</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* KPIs */}
        <div className="grid grid-cols-2 gap-3">
          <KPI icon={Scale} label="إجمالي العيّنات" value={stats.total} color="text-primary" bg="bg-primary/10" />
          <KPI icon={Award} label="احتمالات قوية" value={stats.likely} color="text-success" bg="bg-success/15" />
          <KPI icon={Target} label="متوسط النقاط" value={`${stats.avgScore}/100`} color="text-orange" bg="bg-orange/15" />
          <KPI icon={TrendingUp} label="مبيعات" value={stats.sold} color="text-gold" bg="bg-gold/15" />
        </div>

        {/* Weekly chart */}
        <section className="rounded-2xl bg-card border p-4">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><Calendar className="h-4 w-4" /> آخر 7 أيام</h3>
          <div className="flex items-end justify-between gap-1 h-28">
            {last7.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t bg-orange transition-all" style={{ height: `${(d.n / maxBar) * 100}%`, minHeight: 4 }} />
                <span className="text-[10px] text-muted-foreground">{d.day}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">اليوم: {scansToday}/{dailyLimit === 999 ? "∞" : dailyLimit}</p>
        </section>

        {/* Classification breakdown */}
        {stats.topClass && (
          <section className="rounded-2xl bg-card border p-4">
            <h3 className="text-sm font-bold mb-3">التصنيفات</h3>
            <div className="space-y-2">
              {Object.entries(stats.byClass).map(([cls, n]) => (
                <div key={cls}>
                  <div className="flex justify-between text-xs mb-1">
                    <span>{cls}</span>
                    <span className="text-muted-foreground">{n}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-primary" style={{ width: `${(n / stats.total) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Achievements */}
        <section className="rounded-2xl bg-card border p-4">
          <h3 className="text-sm font-bold mb-3">الإنجازات</h3>
          <div className="grid grid-cols-4 gap-2">
            {achievements.map((a) => {
              const Icon = a.icon;
              return (
                <div key={a.id} className={`flex flex-col items-center gap-1 p-2 rounded-xl ${a.done ? "bg-gold/15" : "bg-muted opacity-50"}`}>
                  <Icon className={`h-6 w-6 ${a.done ? "text-gold-foreground text-accent-foreground" : "text-muted-foreground"}`} />
                  <span className="text-[10px] text-center">{a.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Account summary */}
        <section className="rounded-2xl bg-card border p-4 text-sm space-y-2">
          <div className="flex justify-between"><span className="text-muted-foreground">الخطة</span><span className="font-bold">{role === "premium" ? "Premium" : role === "admin" ? "Admin" : "مجاني"}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">رصيد المحفظة</span><span className="font-bold">{walletBalanceDh} د.م</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">إعلانات نشطة</span><span className="font-bold">{stats.active}</span></div>
        </section>
      </main>
    </div>
  );
}

function KPI({ icon: Icon, label, value, color, bg }: any) {
  return (
    <div className="rounded-2xl bg-card border p-4">
      <div className={`grid h-10 w-10 place-items-center rounded-xl ${bg} ${color} mb-2`}>
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
