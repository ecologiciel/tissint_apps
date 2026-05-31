import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { useApp } from "@/lib/store";
import {
  ChevronRight,
  Check,
  X,
  ShieldCheck,
  Users,
  Flag,
  BarChart3,
  Store,
  TrendingUp,
  TrendingDown,
  Crown,
  ScanLine,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";

export const Route = createFileRoute("/admin")({ component: AdminPage });

type Tab = "listings" | "users" | "reports" | "stats";

// mock users / reports (admin-only view)
const MOCK_USERS = [
  {
    id: "u1",
    name: "Yassine A.",
    role: "premium",
    scans: 142,
    listings: 8,
    joined: "2025-11-12",
    flagged: false,
  },
  {
    id: "u2",
    name: "Khalid B.",
    role: "free",
    scans: 12,
    listings: 1,
    joined: "2026-01-04",
    flagged: false,
  },
  {
    id: "u3",
    name: "Soukaina M.",
    role: "premium",
    scans: 89,
    listings: 5,
    joined: "2025-09-30",
    flagged: false,
  },
  {
    id: "u4",
    name: "Mehdi T.",
    role: "free",
    scans: 3,
    listings: 0,
    joined: "2026-01-22",
    flagged: true,
  },
  {
    id: "u5",
    name: "Fatima Z.",
    role: "premium",
    scans: 211,
    listings: 12,
    joined: "2025-07-18",
    flagged: false,
  },
];

const MOCK_REPORTS = [
  {
    id: "r1",
    target: "إعلان: نيزك Erfoud 280g",
    reason: "صور غير مطابقة",
    reporter: "Yassine A.",
    at: "منذ 2 ساعة",
    severity: "high",
  },
  {
    id: "r2",
    target: "مستخدم: Mehdi T.",
    reason: "سلوك مشبوه",
    reporter: "Soukaina M.",
    at: "منذ 5 ساعات",
    severity: "medium",
  },
  {
    id: "r3",
    target: "إعلان: Chondrite 1.2kg",
    reason: "سعر مبالغ فيه",
    reporter: "Khalid B.",
    at: "أمس",
    severity: "low",
  },
];

function AdminPage() {
  const { role, listings, updateListingStatus, setRole } = useApp();
  const [pwd, setPwd] = useState("");
  const [unlocked, setUnlocked] = useState(role === "admin");
  const [tab, setTab] = useState<Tab>("listings");
  const [reports, setReports] = useState(MOCK_REPORTS);

  if (!unlocked) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center p-8 bg-stone text-warm gap-4"
        dir="rtl"
      >
        <ShieldCheck className="h-12 w-12 text-gold" />
        <h1 className="text-xl font-bold">لوحة الإدارة</h1>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="كلمة المرور"
          className="w-full rounded-xl bg-white/10 p-3 text-center outline-none"
        />
        <button
          onClick={() => {
            if (pwd === "tissint2026") {
              setUnlocked(true);
              setRole("admin");
              toast.success("مرحباً Admin");
            } else toast.error("كلمة مرور خاطئة");
          }}
          className="w-full rounded-full bg-orange py-3 font-bold text-white"
        >
          دخول
        </button>
        <Link to="/dashboard" className="text-xs text-warm/50">
          العودة
        </Link>
      </div>
    );
  }

  const pending = listings.filter((l) => l.status === "pending");
  const approved = listings.filter((l) => l.status === "approved").length;
  const rejected = listings.filter((l) => l.status === "rejected").length;
  const sold = listings.filter((l) => l.status === "sold").length;

  const totalUsers = MOCK_USERS.length + 4218;
  const premiumUsers = MOCK_USERS.filter((u) => u.role === "premium").length + 412;
  const scansTotal = useMemo(() => MOCK_USERS.reduce((s, u) => s + u.scans, 0) + 18400, []);
  const revenueDh = premiumUsers * 49 + sold * 250;

  const act = (id: string, status: "approved" | "rejected") => {
    updateListingStatus(id, status);
    toast.success(status === "approved" ? "تم القبول" : "تم الرفض");
  };

  const resolveReport = (id: string) => {
    setReports((rs) => rs.filter((r) => r.id !== id));
    toast.success("تمت معالجة البلاغ");
  };

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-stone text-warm px-5 pt-12 pb-4 flex items-center justify-between">
        <Link
          to="/dashboard"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div className="text-center">
          <h1 className="font-bold">لوحة الإدارة</h1>
          <p className="text-[10px] text-warm/60">Tissint Console</p>
        </div>
        <ShieldCheck className="h-5 w-5 text-gold" />
      </header>

      {/* tabs */}
      <div className="bg-stone/95 text-warm px-2 pb-3 flex gap-1 overflow-x-auto">
        {[
          { id: "listings", label: "الإعلانات", icon: Store, badge: pending.length },
          { id: "users", label: "المستخدمون", icon: Users },
          { id: "reports", label: "البلاغات", icon: Flag, badge: reports.length },
          { id: "stats", label: "الإحصائيات", icon: BarChart3 },
        ].map((t) => {
          const I = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id as Tab)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold relative ${active ? "bg-orange text-white" : "bg-white/10 text-warm/80"}`}
            >
              <I className="h-3.5 w-3.5" />
              {t.label}
              {t.badge ? (
                <span className="ml-1 grid h-4 min-w-4 px-1 place-items-center rounded-full bg-destructive text-[9px] text-white">
                  {t.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <main className="flex-1 overflow-y-auto p-5 space-y-5">
        {tab === "listings" && (
          <>
            <div className="grid grid-cols-4 gap-2 text-center">
              <Stat label="بانتظار" value={pending.length} color="text-warning" />
              <Stat label="مقبولة" value={approved} color="text-success" />
              <Stat label="مباعة" value={sold} color="text-primary" />
              <Stat label="مرفوضة" value={rejected} color="text-destructive" />
            </div>

            <section>
              <h2 className="font-bold mb-2 text-sm">في انتظار المراجعة</h2>
              {pending.length === 0 ? (
                <p className="text-sm text-muted-foreground rounded-xl bg-muted p-4 text-center">
                  لا توجد إعلانات للمراجعة
                </p>
              ) : (
                <div className="space-y-2">
                  {pending.map((l) => (
                    <div key={l.id} className="flex gap-3 rounded-xl bg-card border p-3">
                      <MeteoriteThumb
                        seed={l.imageSeed}
                        className="h-16 w-16 rounded-lg shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate">{l.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {l.priceDh} درهم • {l.region}
                        </p>
                        <div className="mt-2 flex gap-1">
                          <button
                            onClick={() => act(l.id, "approved")}
                            className="flex-1 rounded-lg bg-success text-white py-1.5 text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            قبول
                          </button>
                          <button
                            onClick={() => act(l.id, "rejected")}
                            className="flex-1 rounded-lg bg-destructive text-white py-1.5 text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            رفض
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <h2 className="font-bold mb-2 text-sm">جميع الإعلانات</h2>
              <div className="space-y-1.5">
                {listings.map((l) => (
                  <div
                    key={l.id}
                    className="flex items-center gap-2 rounded-lg bg-card border p-2 text-xs"
                  >
                    <MeteoriteThumb seed={l.imageSeed} className="h-8 w-8 rounded shrink-0" />
                    <span className="flex-1 truncate font-semibold">{l.title}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        l.status === "approved"
                          ? "bg-success/20 text-success"
                          : l.status === "pending"
                            ? "bg-warning/20 text-warning"
                            : l.status === "sold"
                              ? "bg-primary/20 text-primary"
                              : "bg-destructive/20 text-destructive"
                      }`}
                    >
                      {l.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {tab === "users" && (
          <>
            <div className="grid grid-cols-3 gap-2 text-center">
              <Stat label="إجمالي" value={totalUsers.toLocaleString()} color="text-foreground" />
              <Stat label="Premium" value={premiumUsers} color="text-gold" />
              <Stat
                label="مبلَّغ عنهم"
                value={MOCK_USERS.filter((u) => u.flagged).length}
                color="text-destructive"
              />
            </div>
            <div className="space-y-2">
              {MOCK_USERS.map((u) => (
                <div key={u.id} className="rounded-xl bg-card border p-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-orange to-gold text-white font-bold">
                      {u.name
                        .split(" ")
                        .map((s) => s[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold truncate">{u.name}</p>
                        {u.role === "premium" && <Crown className="h-3 w-3 text-gold" />}
                        {u.flagged && <AlertTriangle className="h-3 w-3 text-destructive" />}
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        منذ {u.joined} · {u.scans} فحص · {u.listings} إعلان
                      </p>
                    </div>
                    <button
                      onClick={() => toast.success("تم تعليق الحساب")}
                      className="text-[10px] font-bold rounded-full bg-destructive/10 text-destructive px-2.5 py-1"
                    >
                      تعليق
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "reports" && (
          <>
            {reports.length === 0 ? (
              <div className="rounded-xl bg-muted p-6 text-center">
                <Check className="h-8 w-8 mx-auto mb-2 text-success" />
                <p className="text-sm font-bold">لا توجد بلاغات نشطة</p>
              </div>
            ) : (
              <div className="space-y-2">
                {reports.map((r) => (
                  <div key={r.id} className="rounded-xl bg-card border p-3">
                    <div className="flex items-start gap-2">
                      <span
                        className={`mt-1 h-2 w-2 rounded-full shrink-0 ${
                          r.severity === "high"
                            ? "bg-destructive"
                            : r.severity === "medium"
                              ? "bg-warning"
                              : "bg-muted-foreground"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold">{r.target}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{r.reason}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          من {r.reporter} · {r.at}
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex gap-1">
                      <button
                        onClick={() => resolveReport(r.id)}
                        className="flex-1 rounded-lg bg-success text-white py-1.5 text-xs font-bold"
                      >
                        حل
                      </button>
                      <button
                        onClick={() => resolveReport(r.id)}
                        className="flex-1 rounded-lg bg-muted text-foreground py-1.5 text-xs font-bold"
                      >
                        تجاهل
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === "stats" && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <BigStat
                label="المداخيل (شهر)"
                value={`${revenueDh.toLocaleString()} د.م`}
                delta="+18%"
                up
                icon={TrendingUp}
              />
              <BigStat
                label="الفحوصات"
                value={scansTotal.toLocaleString()}
                delta="+24%"
                up
                icon={ScanLine}
              />
              <BigStat label="Premium نشط" value={premiumUsers} delta="+9%" up icon={Crown} />
              <BigStat label="انسحابات" value="12" delta="-3%" up={false} icon={TrendingDown} />
            </div>

            <section className="rounded-2xl bg-card border p-4">
              <h3 className="text-sm font-bold mb-3">المناطق الأكثر نشاطاً</h3>
              <div className="space-y-2">
                {[
                  { name: "العيون", pct: 82 },
                  { name: "الرشيدية", pct: 68 },
                  { name: "زاكورة", pct: 54 },
                  { name: "ورزازات", pct: 41 },
                  { name: "تيسنت", pct: 28 },
                ].map((r) => (
                  <div key={r.name}>
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="font-semibold">{r.name}</span>
                      <span className="text-muted-foreground">{r.pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange to-gold"
                        style={{ width: `${r.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl bg-card border p-4">
              <h3 className="text-sm font-bold mb-3">صحة النظام</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <Health label="نموذج AI" status="ok" value="99.2%" />
                <Health label="السوق" status="ok" value="online" />
                <Health label="المدفوعات" status="ok" value="CMI ✓" />
                <Health label="الإشعارات" status="warn" value="بطيئة" />
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <div className="rounded-xl bg-card border p-3">
      <p className={`text-xl font-black ${color}`}>{value}</p>
      <p className="text-[10px] text-muted-foreground">{label}</p>
    </div>
  );
}

function BigStat({
  label,
  value,
  delta,
  up,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  delta: string;
  up: boolean;
  icon: any;
}) {
  return (
    <div className="rounded-2xl bg-card border p-4">
      <div className="flex items-center justify-between">
        <Icon className="h-4 w-4 text-orange" />
        <span className={`text-[10px] font-bold ${up ? "text-success" : "text-destructive"}`}>
          {delta}
        </span>
      </div>
      <p className="mt-2 text-xl font-black">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function Health({
  label,
  status,
  value,
}: {
  label: string;
  status: "ok" | "warn" | "down";
  value: string;
}) {
  const dot = status === "ok" ? "bg-success" : status === "warn" ? "bg-warning" : "bg-destructive";
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted p-2.5">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      <span className="flex-1 font-semibold">{label}</span>
      <span className="text-muted-foreground">{value}</span>
    </div>
  );
}
