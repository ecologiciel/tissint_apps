import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft,
  Search,
  HelpCircle,
  ScanLine,
  Store,
  CreditCard,
  Shield,
  ChevronDown,
  MessageCircle,
  Mail,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/help")({ component: HelpPage });

type Topic = "all" | "scan" | "market" | "billing" | "account";

const FAQS: { topic: Exclude<Topic, "all">; q: string; a: string }[] = [
  {
    topic: "scan",
    q: "كيف أقوم بفحص نيزك؟",
    a: "افتح تبويب الفحص، صوّر الحجر من زاوية واضحة بإضاءة طبيعية، ثم انتظر 3 ثوانٍ لتظهر النتيجة بنسبة الثقة.",
  },
  {
    topic: "scan",
    q: "لماذا النتيجة 'غير مؤكدة'؟",
    a: "قد تكون الصورة ضبابية أو الإضاءة سيئة. جرّب صورة جديدة قريبة وواضحة، أو أضف صورة داخلية بعد القطع.",
  },
  {
    topic: "scan",
    q: "ما هو الحد اليومي للفحص؟",
    a: "3 فحوصات/يوم في الحساب المجاني، غير محدود في Premium.",
  },
  {
    topic: "market",
    q: "كيف أنشر إعلاناً؟",
    a: "بعد فحص ناجح، اضغط 'نشر في السوق'. املأ التفاصيل: الوزن، المنطقة، السعر، الوصف، وارفع 6 صور.",
  },
  { topic: "market", q: "كم تأخذ Tissint كعمولة؟", a: "5% فقط على كل بيع ناجح. لا توجد رسوم نشر." },
  {
    topic: "market",
    q: "كيف أتواصل مع البائع؟",
    a: "اضغط زر 'محادثة' في صفحة الإعلان لفتح دردشة آمنة.",
  },
  {
    topic: "billing",
    q: "كيف ألغي اشتراك Premium؟",
    a: "من الفوترة > إلغاء الاشتراك. يبقى مفعّلاً حتى نهاية الفترة المدفوعة.",
  },
  {
    topic: "billing",
    q: "هل يمكنني استرداد المبلغ؟",
    a: "نعم خلال 14 يوماً من أول اشتراك، إذا لم تستخدم أكثر من 10 فحوصات Premium.",
  },
  {
    topic: "billing",
    q: "ما طرق الدفع المقبولة؟",
    a: "Visa، Mastercard، CMI، والمحفظة الداخلية Tissint Wallet.",
  },
  {
    topic: "account",
    q: "كيف أغيّر كلمة المرور؟",
    a: "تسجيل الخروج > نسيت كلمة المرور > أدخل بريدك > ستصلك رسالة.",
  },
  {
    topic: "account",
    q: "كيف أحذف حسابي؟",
    a: "تواصل مع support@tissint.ma. سنحذف بياناتك خلال 30 يوماً وفق CNDP.",
  },
];

const TOPICS: { id: Topic; label: string; icon: any; color: string }[] = [
  { id: "all", label: "الكل", icon: HelpCircle, color: "bg-navy text-warm" },
  { id: "scan", label: "الفحص", icon: ScanLine, color: "bg-orange/10 text-orange" },
  { id: "market", label: "السوق", icon: Store, color: "bg-gold/10 text-gold" },
  { id: "billing", label: "الفوترة", icon: CreditCard, color: "bg-success/10 text-success" },
  { id: "account", label: "الحساب", icon: Shield, color: "bg-primary/10 text-primary" },
];

function HelpPage() {
  const [topic, setTopic] = useState<Topic>("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState<number | null>(0);

  const filtered = FAQS.filter(
    (f) =>
      (topic === "all" || f.topic === topic) &&
      (query === "" || f.q.includes(query) || f.a.includes(query)),
  );

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-5 rounded-b-3xl shadow-md">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Link>
          <h1 className="text-base font-bold">مركز المساعدة</h1>
          <div className="w-9" />
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5">
          <Search className="h-4 w-4 text-warm/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="ابحث في الأسئلة..."
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-warm/40"
          />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          {TOPICS.map((t) => {
            const Icon = t.icon;
            const active = topic === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTopic(t.id)}
                className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold border ${active ? t.color + " border-transparent shadow" : "bg-card border-border text-foreground"}`}
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <section className="space-y-2">
          {filtered.length === 0 && (
            <p className="rounded-xl bg-muted p-4 text-center text-sm text-muted-foreground">
              لا توجد نتائج
            </p>
          )}
          {filtered.map((f, i) => {
            const isOpen = open === i;
            return (
              <div key={i} className="rounded-xl bg-card border border-border overflow-hidden">
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 text-right"
                >
                  <span className="text-sm font-bold flex-1">{f.q}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-muted-foreground leading-6 border-t border-border pt-3">
                    {f.a}
                  </div>
                )}
              </div>
            );
          })}
        </section>

        <section className="rounded-2xl bg-gradient-to-br from-navy to-stone text-warm p-5">
          <h3 className="text-base font-black mb-1">لم تجد إجابة؟</h3>
          <p className="text-xs text-warm/70 mb-3">فريق الدعم متاح 7/7 من 9ص إلى 9م.</p>
          <div className="grid grid-cols-3 gap-2">
            <Link to="/messages" className="rounded-xl bg-white/10 p-3 text-center">
              <MessageCircle className="h-4 w-4 mx-auto mb-1" />
              <span className="text-[10px] font-bold">دردشة</span>
            </Link>
            <button
              onClick={() => toast.success("سيتم فتح البريد")}
              className="rounded-xl bg-white/10 p-3 text-center"
            >
              <Mail className="h-4 w-4 mx-auto mb-1" />
              <span className="text-[10px] font-bold">بريد</span>
            </button>
            <button
              onClick={() => toast.success("0537-XX-XX-XX")}
              className="rounded-xl bg-orange p-3 text-center"
            >
              <Phone className="h-4 w-4 mx-auto mb-1" />
              <span className="text-[10px] font-bold">اتصال</span>
            </button>
          </div>
        </section>

        <div className="text-center pb-2">
          <Link to="/legal/about" className="text-xs text-muted-foreground underline">
            عن Tissint
          </Link>
        </div>
      </main>
    </div>
  );
}
