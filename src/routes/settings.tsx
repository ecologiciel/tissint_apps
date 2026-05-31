import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { toast } from "sonner";
import {
  ChevronLeft,
  Shield,
  Smartphone,
  Globe,
  Bell,
  Moon,
  Sun,
  Trash2,
  Download,
  KeyRound,
  Eye,
  EyeOff,
  Mail,
  MapPin,
  Lock,
  LogOut,
  AlertTriangle,
  Check,
  Languages,
  Monitor,
} from "lucide-react";

export const Route = createFileRoute("/settings")({ component: SettingsPage });

type Section = "security" | "appearance" | "notifications" | "privacy" | "devices";

const DEVICES = [
  {
    id: "d1",
    name: "iPhone 15 Pro",
    os: "iOS 18",
    lastSeen: "نشط الآن",
    current: true,
    location: "الرباط، المغرب",
  },
  {
    id: "d2",
    name: "MacBook Air",
    os: "macOS Sonoma",
    lastSeen: "منذ 3 ساعات",
    current: false,
    location: "الرباط، المغرب",
  },
  {
    id: "d3",
    name: "Samsung Galaxy",
    os: "Android 14",
    lastSeen: "منذ 5 أيام",
    current: false,
    location: "الدار البيضاء",
  },
];

function SettingsPage() {
  const nav = useNavigate();
  const { setRole, setOnboarded } = useApp();
  const [section, setSection] = useState<Section>("security");
  const [twoFA, setTwoFA] = useState(false);
  const [biometric, setBiometric] = useState(true);
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);
  const [smsNotif, setSmsNotif] = useState(false);
  const [marketingNotif, setMarketingNotif] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark" | "auto">("auto");
  const [lang, setLang] = useState<"ar" | "fr" | "en">("ar");
  const [analytics, setAnalytics] = useState(true);
  const [personalized, setPersonalized] = useState(false);
  const [shareLoc, setShareLoc] = useState(true);
  const [devices, setDevices] = useState(DEVICES);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  const revoke = (id: string) => {
    setDevices((d) => d.filter((x) => x.id !== id));
    toast.success("تم إلغاء الجهاز");
  };

  const exportData = () => toast.success("جاري تحضير ملفك… سيصلك بريد خلال 24س");

  const deleteAccount = () => {
    toast.success("تم تقديم طلب الحذف. ستتم معالجته خلال 30 يوماً.");
    setRole("guest");
    setOnboarded(false);
    nav({ to: "/" });
  };

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-4 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Link>
          <h1 className="text-base font-bold">الإعدادات</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="bg-navy/95 text-warm px-2 pb-3 flex gap-1 overflow-x-auto -mt-1">
        {[
          { id: "security", label: "الأمان", icon: Shield },
          { id: "appearance", label: "المظهر", icon: Monitor },
          { id: "notifications", label: "الإشعارات", icon: Bell },
          { id: "privacy", label: "الخصوصية", icon: Lock },
          { id: "devices", label: "الأجهزة", icon: Smartphone },
        ].map((t) => {
          const I = t.icon;
          const active = section === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setSection(t.id as Section)}
              className={`shrink-0 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${active ? "bg-orange text-white" : "bg-white/10"}`}
            >
              <I className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        {section === "security" && (
          <>
            <Card title="المصادقة الثنائية (2FA)" icon={KeyRound}>
              <Toggle
                label="تفعيل 2FA عبر SMS"
                value={twoFA}
                onChange={(v) => {
                  setTwoFA(v);
                  toast.success(v ? "تم التفعيل" : "تم الإلغاء");
                }}
              />
              <Toggle label="بصمة الإصبع / Face ID" value={biometric} onChange={setBiometric} />
              <p className="text-[11px] text-muted-foreground px-1 mt-1">
                حماية إضافية ضد سرقة الحساب.
              </p>
            </Card>

            <Card title="تغيير كلمة المرور" icon={Lock}>
              <PwdInput
                label="الحالية"
                value={oldPwd}
                onChange={setOldPwd}
                show={showPwd}
                setShow={setShowPwd}
              />
              <PwdInput
                label="الجديدة"
                value={newPwd}
                onChange={setNewPwd}
                show={showPwd}
                setShow={setShowPwd}
              />
              <button
                onClick={() => {
                  if (newPwd.length < 8) return toast.error("8 أحرف على الأقل");
                  toast.success("تم التحديث");
                  setOldPwd("");
                  setNewPwd("");
                }}
                className="w-full mt-2 rounded-xl bg-orange text-white py-2.5 text-sm font-bold"
              >
                تحديث
              </button>
            </Card>

            <Card title="الجلسات النشطة" icon={Shield}>
              <button
                onClick={() => {
                  setDevices((d) => d.filter((x) => x.current));
                  toast.success("تم تسجيل الخروج من كل الأجهزة");
                }}
                className="w-full rounded-xl bg-destructive/10 text-destructive py-2.5 text-sm font-bold flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" /> تسجيل خروج من كل الأجهزة
              </button>
            </Card>
          </>
        )}

        {section === "appearance" && (
          <>
            <Card title="السمة" icon={Moon}>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { id: "light", label: "فاتح", icon: Sun },
                    { id: "dark", label: "داكن", icon: Moon },
                    { id: "auto", label: "تلقائي", icon: Monitor },
                  ] as const
                ).map((t) => {
                  const I = t.icon;
                  const active = theme === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => {
                        setTheme(t.id);
                        toast.success("تم التحديث");
                      }}
                      className={`rounded-xl p-3 flex flex-col items-center gap-1 border-2 ${active ? "border-orange bg-orange/10" : "border-border bg-card"}`}
                    >
                      <I
                        className={`h-5 w-5 ${active ? "text-orange" : "text-muted-foreground"}`}
                      />
                      <span className="text-xs font-bold">{t.label}</span>
                    </button>
                  );
                })}
              </div>
            </Card>

            <Card title="اللغة" icon={Languages}>
              {(
                [
                  { id: "ar", label: "العربية", flag: "🇲🇦" },
                  { id: "fr", label: "Français", flag: "🇫🇷" },
                  { id: "en", label: "English", flag: "🇬🇧" },
                ] as const
              ).map((l) => (
                <button
                  key={l.id}
                  onClick={() => {
                    setLang(l.id);
                    toast.success("تم تغيير اللغة");
                  }}
                  className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-warm/40"
                >
                  <span className="text-xl">{l.flag}</span>
                  <span className="flex-1 text-right text-sm font-semibold">{l.label}</span>
                  {lang === l.id && <Check className="h-4 w-4 text-success" />}
                </button>
              ))}
            </Card>
          </>
        )}

        {section === "notifications" && (
          <Card title="قنوات الإشعار" icon={Bell}>
            <Toggle label="إشعارات Push" value={pushNotif} onChange={setPushNotif} icon={Bell} />
            <Toggle
              label="البريد الإلكتروني"
              value={emailNotif}
              onChange={setEmailNotif}
              icon={Mail}
            />
            <Toggle label="رسائل SMS" value={smsNotif} onChange={setSmsNotif} icon={Smartphone} />
            <Toggle label="عروض تسويقية" value={marketingNotif} onChange={setMarketingNotif} />
            <p className="text-[11px] text-muted-foreground px-1 mt-1">
              التحديثات الأمنية تُرسل دائماً بغض النظر عن إعداداتك.
            </p>
          </Card>
        )}

        {section === "privacy" && (
          <>
            <Card title="البيانات والتخصيص" icon={Lock}>
              <Toggle label="تحليلات مجهولة" value={analytics} onChange={setAnalytics} />
              <Toggle label="اقتراحات مخصصة" value={personalized} onChange={setPersonalized} />
              <Toggle
                label="مشاركة الموقع الجغرافي"
                value={shareLoc}
                onChange={setShareLoc}
                icon={MapPin}
              />
            </Card>

            <Card title="حقوقك (CNDP / RGPD)" icon={Shield}>
              <button
                onClick={exportData}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-warm/60"
              >
                <Download className="h-4 w-4 text-navy" />
                <div className="flex-1 text-right">
                  <p className="text-sm font-bold">تحميل بياناتي</p>
                  <p className="text-[11px] text-muted-foreground">ملف JSON يحتوي كل بياناتك</p>
                </div>
              </button>
              <Link
                to="/legal/privacy"
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-muted hover:bg-warm/60"
              >
                <Eye className="h-4 w-4 text-navy" />
                <div className="flex-1 text-right">
                  <p className="text-sm font-bold">سياسة الخصوصية</p>
                  <p className="text-[11px] text-muted-foreground">كيف نستخدم بياناتك</p>
                </div>
              </Link>
            </Card>

            <Card title="منطقة الخطر" icon={AlertTriangle}>
              {!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="w-full rounded-xl bg-destructive/10 text-destructive py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> حذف حسابي نهائياً
                </button>
              ) : (
                <div className="rounded-xl bg-destructive/10 p-3 space-y-2">
                  <p className="text-xs text-destructive font-bold flex items-center gap-1">
                    <AlertTriangle className="h-3.5 w-3.5" /> هذا الإجراء لا يمكن التراجع عنه
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 rounded-lg bg-card py-2 text-xs font-bold"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={deleteAccount}
                      className="flex-1 rounded-lg bg-destructive text-white py-2 text-xs font-bold"
                    >
                      تأكيد الحذف
                    </button>
                  </div>
                </div>
              )}
            </Card>
          </>
        )}

        {section === "devices" && (
          <Card title={`${devices.length} جهاز متصل`} icon={Smartphone}>
            <div className="space-y-2">
              {devices.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-card">
                    <Smartphone className="h-5 w-5 text-navy" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-bold truncate">{d.name}</p>
                      {d.current && (
                        <span className="text-[9px] font-bold bg-success/20 text-success px-1.5 py-0.5 rounded-full">
                          حالي
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {d.os} · {d.lastSeen}
                    </p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" /> {d.location}
                    </p>
                  </div>
                  {!d.current && (
                    <button
                      onClick={() => revoke(d.id)}
                      className="text-[10px] font-bold rounded-full bg-destructive/10 text-destructive px-2.5 py-1"
                    >
                      إلغاء
                    </button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function Card({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-card border border-border overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-warm/30">
        <Icon className="h-4 w-4 text-orange" />
        <h3 className="text-sm font-bold">{title}</h3>
      </div>
      <div className="p-3 space-y-1">{children}</div>
    </section>
  );
}

function Toggle({
  label,
  value,
  onChange,
  icon: Icon,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  icon?: any;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg"
    >
      {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" />}
      <span className="text-sm font-semibold flex-1 text-right">{label}</span>
      <span
        className={`h-5 w-9 rounded-full transition relative shrink-0 ${value ? "bg-orange" : "bg-muted"}`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${value ? "right-0.5" : "right-[18px]"}`}
        />
      </span>
    </button>
  );
}

function PwdInput({
  label,
  value,
  onChange,
  show,
  setShow,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  setShow: (v: boolean) => void;
}) {
  return (
    <label className="block mb-2">
      <span className="block text-xs font-bold text-muted-foreground mb-1">{label}</span>
      <div className="flex items-center gap-2 rounded-xl border border-border bg-warm px-3 py-2">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
        />
        <button onClick={() => setShow(!show)} type="button">
          {show ? (
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Eye className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </label>
  );
}
