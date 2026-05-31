import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Sun,
  Ruler,
  Magnet,
  ShieldCheck,
  Sparkles,
  Check,
} from "lucide-react";

export const Route = createFileRoute("/first-scan")({ component: FirstScanPage });

const TIPS = [
  {
    icon: Sun,
    title: "إضاءة طبيعية",
    body: "صوّر في النهار بالقرب من نافذة. تجنّب الظلال القوية والفلاش المباشر.",
    do: "ضوء جانبي طبيعي",
    dont: "ظل أو فلاش",
  },
  {
    icon: Camera,
    title: "زاوية وتركيز",
    body: "ضع الحجر في وسط الإطار على مسافة 15-25 سم. لمس الشاشة لتركيز الكاميرا.",
    do: "صورة حادة من فوق",
    dont: "صورة ضبابية أو مائلة",
  },
  {
    icon: Ruler,
    title: "مرجع للحجم",
    body: "ضع عملة 1 درهم أو مسطرة بجانب العينة لتقدير الحجم بدقة.",
    do: "عملة أو مسطرة بجانب الحجر",
    dont: "بدون مرجع للحجم",
  },
  {
    icon: Magnet,
    title: "اختبار المغناطيس (اختياري)",
    body: "إذا كان لديك مغناطيس قوي، اقترب من الحجر. النيازك الحديدية تنجذب بقوة.",
    do: "اختبر قبل الفحص",
    dont: "تخمين بدون اختبار",
  },
  {
    icon: ShieldCheck,
    title: "خلفية محايدة",
    body: "ضع الحجر على قماش أبيض أو ورقة بيضاء. يساعد النموذج على التحليل بدقة أكبر.",
    do: "خلفية بيضاء أو رمادية",
    dont: "خلفية مزدحمة أو ملونة",
  },
];

function FirstScanPage() {
  const nav = useNavigate();
  const [i, setI] = useState(0);
  const tip = TIPS[i];
  const Icon = tip.icon;
  const last = i === TIPS.length - 1;

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-5 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="grid h-9 w-9 place-items-center rounded-full bg-white/10"
          >
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Link>
          <h1 className="text-base font-bold">دليل أول فحص</h1>
          <span className="text-xs text-warm/60">
            {i + 1}/{TIPS.length}
          </span>
        </div>
        <div className="mt-4 flex gap-1">
          {TIPS.map((_, idx) => (
            <span
              key={idx}
              className={`h-1 flex-1 rounded-full ${idx <= i ? "bg-orange" : "bg-white/20"}`}
            />
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="rounded-3xl bg-card border border-border p-6 text-center">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-orange to-gold shadow-lg">
            <Icon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-4 text-xl font-black">{tip.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground leading-6">{tip.body}</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-success/10 border border-success/30 p-3">
            <p className="text-[10px] font-black text-success mb-1">✓ افعل</p>
            <p className="text-xs font-bold">{tip.do}</p>
          </div>
          <div className="rounded-2xl bg-destructive/10 border border-destructive/30 p-3">
            <p className="text-[10px] font-black text-destructive mb-1">✕ تجنّب</p>
            <p className="text-xs font-bold">{tip.dont}</p>
          </div>
        </div>

        {last && (
          <div className="rounded-2xl bg-gradient-to-br from-orange/10 to-gold/10 border border-gold/30 p-4 flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-gold shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold">جاهز للفحص الأول!</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                ستحصل على نتيجة خلال 3 ثوانٍ.
              </p>
            </div>
          </div>
        )}

        <ul className="rounded-2xl bg-card border border-border p-3 space-y-2">
          {[
            "دقة 92% في الظروف الجيدة",
            "الصور لا تُحفظ بدون موافقتك",
            "يمكنك إعادة الفحص بدون تكلفة",
          ].map((t) => (
            <li key={t} className="flex items-center gap-2 text-xs">
              <Check className="h-3.5 w-3.5 text-success shrink-0" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </main>

      <div className="p-5 border-t border-border bg-card flex gap-2">
        {i > 0 && (
          <button
            onClick={() => setI(i - 1)}
            className="grid h-12 w-12 place-items-center rounded-full bg-muted"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
        <button
          onClick={() => (last ? nav({ to: "/scan" }) : setI(i + 1))}
          className="flex-1 rounded-full bg-gradient-to-r from-orange to-gold py-3.5 font-bold text-white"
        >
          {last ? "ابدأ الفحص" : "التالي"}
        </button>
      </div>
    </div>
  );
}
