import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { TabBar } from "@/components/tissint/tab-bar";
import {
  ArrowRight,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Crown,
  BadgeCheck,
  Library,
  Store,
  ScanLine,
  Star,
  Bell,
  Globe,
  Moon,
  HelpCircle,
  FileText,
  LogOut,
  ChevronLeft,
  Edit3,
  Wallet,
  Award,
  Settings as SettingsIcon,
  MessageCircle,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/profile")({ component: ProfilePage });

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  guest: { label: "زائر", color: "bg-muted text-muted-foreground" },
  free: { label: "حساب مجاني", color: "bg-navy text-warm" },
  premium: { label: "Premium", color: "bg-gradient-to-r from-orange to-gold text-white" },
  admin: { label: "مدير", color: "bg-stone text-warm" },
};

function ProfilePage() {
  const nav = useNavigate();
  const {
    userName,
    role,
    scansToday,
    dailyLimit,
    collection,
    listings,
    unreadMessages,
    unreadNotifications,
    walletBalanceDh,
    setRole,
    setOnboarded,
  } = useApp();
  const [editing, setEditing] = useState(false);

  const approved = listings.filter((l) => l.status === "approved").length;
  const sold = listings.filter((l) => l.status === "sold").length;
  const roleInfo = ROLE_LABELS[role];
  const initials = userName
    .trim()
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

  const handleLogout = () => {
    setRole("guest");
    setOnboarded(false);
    nav({ to: "/" });
  };

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      {/* Header */}
      <header className="bg-navy text-warm px-5 pt-12 pb-20 rounded-b-3xl shadow-lg relative">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10"
          >
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Link>
          <h1 className="text-base font-bold">الملف الشخصي</h1>
          <button
            onClick={() => setEditing(!editing)}
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10"
          >
            <Edit3 className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Avatar card */}
      <div className="px-5 -mt-14 relative z-10">
        <div className="rounded-2xl bg-card shadow-lg p-5 border border-border">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-orange to-gold text-white text-2xl font-black shadow-md">
                {initials || <User className="h-8 w-8" />}
              </div>
              {role === "premium" && (
                <span className="absolute -bottom-1 -left-1 grid h-7 w-7 place-items-center rounded-full bg-gold text-stone border-2 border-card">
                  <Crown className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="text-lg font-black truncate">{userName}</h2>
                <BadgeCheck className="h-4 w-4 text-orange shrink-0" />
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">@tissint_user_2026</p>
              <span
                className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${roleInfo.color}`}
              >
                {roleInfo.label}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="mt-4 grid grid-cols-4 gap-2 text-center pt-4 border-t border-border">
            <div>
              <p className="text-base font-black text-navy">{collection.length}</p>
              <p className="text-[9px] text-muted-foreground">مجموعة</p>
            </div>
            <div>
              <p className="text-base font-black text-navy">{approved}</p>
              <p className="text-[9px] text-muted-foreground">في السوق</p>
            </div>
            <div>
              <p className="text-base font-black text-navy">{sold}</p>
              <p className="text-[9px] text-muted-foreground">مُباع</p>
            </div>
            <div>
              <p className="text-base font-black text-navy">{scansToday}</p>
              <p className="text-[9px] text-muted-foreground">مسح اليوم</p>
            </div>
          </div>
        </div>
      </div>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Personal info */}
        <Section title="المعلومات الشخصية" icon={User}>
          <InfoRow icon={Mail} label="البريد الإلكتروني" value="user@tissint.ma" />
          <InfoRow icon={Phone} label="الهاتف" value="+212 6 12 34 56 78" />
          <InfoRow icon={MapPin} label="المنطقة" value="ورزازات، المغرب" />
          <InfoRow icon={Calendar} label="عضو منذ" value="يناير 2026" />
        </Section>

        {/* Account / subscription */}
        <Section title="الحساب والاشتراك" icon={Shield}>
          <InfoRow icon={Award} label="الدور" value={roleInfo.label} />
          <InfoRow
            icon={ScanLine}
            label="الحد اليومي للمسح"
            value={`${scansToday} / ${dailyLimit === 999 ? "∞" : dailyLimit}`}
          />
          <LinkRow
            to="/wallet"
            icon={Wallet}
            label="المحفظة"
            badge={`${walletBalanceDh.toLocaleString()} د.م`}
          />
          <LinkRow to="/billing" icon={FileText} label="الفوترة والفواتير" />
          {role !== "premium" && (
            <Link
              to="/premium"
              className="mt-2 block rounded-xl bg-gradient-to-r from-orange to-gold p-3 text-white text-center text-sm font-bold shadow"
            >
              <Crown className="inline h-4 w-4 ml-1" /> الترقية إلى Premium — 100 د.م/شهر
            </Link>
          )}
        </Section>

        {/* Activity */}
        <Section title="نشاطي" icon={Star}>
          <LinkRow to="/collection" icon={Library} label="مجموعتي" badge={`${collection.length}`} />
          <LinkRow to="/favorites" icon={Star} label="المفضلات" />
          <LinkRow
            to="/market/my-listings"
            icon={Store}
            label="إعلاناتي في السوق"
            badge={`${approved}`}
          />
          <LinkRow
            to="/messages"
            icon={MessageCircle}
            label="الرسائل"
            badge={unreadMessages > 0 ? `${unreadMessages}` : undefined}
          />
          <LinkRow
            to="/notifications"
            icon={Bell}
            label="الإشعارات"
            badge={unreadNotifications > 0 ? `${unreadNotifications}` : undefined}
          />
          <LinkRow to="/scan" icon={ScanLine} label="بدء مسح جديد" />
          <LinkRow to="/stats" icon={TrendingUp} label="إحصائياتي" />
          {role === "admin" && <LinkRow to="/admin" icon={Shield} label="لوحة الإدارة" />}
        </Section>

        {/* Preferences */}
        <Section title="التفضيلات" icon={SettingsIcon}>
          <LinkRow to="/settings" icon={SettingsIcon} label="الإعدادات المتقدمة" />
          <LinkRow to="/offline" icon={Globe} label="الوضع غير المتصل" />
          <ToggleRow icon={Bell} label="الإشعارات" defaultOn />
          <ToggleRow icon={Moon} label="الوضع الداكن" />
          <InfoRow icon={Globe} label="اللغة" value="العربية" />
        </Section>

        {/* Help & legal */}
        <Section title="المساعدة والقانوني" icon={HelpCircle}>
          <LinkRow to="/help" icon={HelpCircle} label="مركز المساعدة" />
          <LinkRow to="/legal/about" icon={FileText} label="عن Tissint" />
          <LinkRow to="/legal/terms" icon={FileText} label="شروط الاستخدام" />
          <LinkRow to="/legal/privacy" icon={FileText} label="سياسة الخصوصية" />
          <LinkRow to="/legal/cookies" icon={FileText} label="ملفات تعريف الارتباط" />
          <LinkRow to="/admin" icon={Shield} label="لوحة الإدارة" />
        </Section>

        <button
          onClick={handleLogout}
          className="w-full rounded-xl bg-destructive/10 text-destructive font-bold py-3 flex items-center justify-center gap-2"
        >
          <LogOut className="h-4 w-4" /> تسجيل الخروج
        </button>

        <p className="text-center text-[10px] text-muted-foreground pb-2">
          Tissint v1.0.0 · صُنع بحب في المغرب
        </p>
      </main>

      <TabBar />
    </div>
  );
}

function Section({
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
      <div className="p-2 space-y-1">{children}</div>
    </section>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-2 py-2.5 rounded-lg">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground flex-1">{label}</span>
      <span className="text-xs font-semibold text-foreground truncate max-w-[55%] text-left">
        {value}
      </span>
    </div>
  );
}

function LinkRow({
  to,
  icon: Icon,
  label,
  badge,
}: {
  to: string;
  icon: any;
  label: string;
  badge?: string;
}) {
  return (
    <Link
      to={to as never}
      className="flex items-center gap-3 px-2 py-2.5 rounded-lg hover:bg-warm/40 active:bg-warm"
    >
      <Icon className="h-4 w-4 text-navy shrink-0" />
      <span className="text-sm font-semibold flex-1">{label}</span>
      {badge && (
        <span className="text-[10px] font-bold bg-orange/10 text-orange px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <ArrowRight className="h-4 w-4 text-muted-foreground rotate-180" />
    </Link>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  defaultOn = false,
}: {
  icon: any;
  label: string;
  defaultOn?: boolean;
}) {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      onClick={() => setOn(!on)}
      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-lg"
    >
      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-semibold flex-1 text-right">{label}</span>
      <span className={`h-5 w-9 rounded-full transition relative ${on ? "bg-orange" : "bg-muted"}`}>
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition ${on ? "right-0.5" : "right-[18px]"}`}
        />
      </span>
    </button>
  );
}
