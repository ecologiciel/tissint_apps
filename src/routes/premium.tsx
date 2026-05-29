import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Check, X, ChevronRight, Crown, Sparkles, Shield } from "lucide-react";

export const Route = createFileRoute("/premium")({ component: PremiumPage });

type Plan = "monthly" | "yearly";

const FEATURES: { label: string; free: string | boolean; premium: string | boolean; highlight?: boolean }[] = [
  { label: "فحوصات يومياً", free: "3", premium: "غير محدود", highlight: true },
  { label: "أولوية تحليل AI", free: false, premium: true },
  { label: "دقة النموذج", free: "أساسية", premium: "متقدمة +12%" },
  { label: "إعلانات نشطة", free: "1", premium: "20", highlight: true },
  { label: "عمولة البيع", free: "5%", premium: "2%", highlight: true },
  { label: "شارة بائع موثوق", free: false, premium: true },
  { label: "ظهور أعلى في السوق", free: false, premium: true },
  { label: "محفظة مع سحب فوري", free: false, premium: true },
  { label: "إحصائيات تفصيلية", free: false, premium: true },
  { label: "تصدير PDF للنتائج", free: false, premium: true },
  { label: "دعم فني سريع", free: "بريد", premium: "دردشة 24/7" },
  { label: "وصول مبكر للميزات", free: false, premium: true },
];

function PremiumPage() {
  const nav = useNavigate();
  const [plan, setPlan] = useState<Plan>("yearly");
  const price = plan === "monthly" ? 100 : 80;
  const total = plan === "monthly" ? "100 د.م/شهر" : "960 د.م/سنة";
  const save = plan === "yearly" ? "وفّر 240 د.م" : null;

  return (
    <div className="flex h-full flex-col bg-stone text-warm overflow-hidden" dir="rtl">
      <header className="flex items-center justify-between px-5 pt-12 pb-2">
        <Link to="/dashboard" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
          <ChevronRight className="h-5 w-5" />
        </Link>
        <span className="text-[10px] bg-gold/20 text-gold px-2 py-1 rounded-full font-bold">حصرياً للمغرب</span>
      </header>

      <main className="flex-1 px-5 pb-4 space-y-5 overflow-y-auto">
        <div className="text-center pt-2">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-gold to-orange shadow-xl">
            <Crown className="h-10 w-10 text-stone" />
          </div>
          <h1 className="mt-3 text-2xl font-black text-gold">Tissint Premium</h1>
          <p className="mt-1 text-xs text-warm/70">ارتقِ بتجربتك في عالم النيازك</p>
        </div>

        {/* Plan toggle */}
        <div className="rounded-2xl bg-white/5 p-1 flex">
          <button onClick={() => setPlan("monthly")}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold ${plan === "monthly" ? "bg-orange text-white" : "text-warm/70"}`}>
            شهري
          </button>
          <button onClick={() => setPlan("yearly")}
            className={`flex-1 rounded-xl py-2.5 text-xs font-bold relative ${plan === "yearly" ? "bg-orange text-white" : "text-warm/70"}`}>
            سنوي
            <span className="absolute -top-2 -left-1 text-[8px] bg-success text-white px-1.5 py-0.5 rounded-full">-20%</span>
          </button>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-orange/20 to-gold/10 p-5 border border-gold/30 text-center">
          <p className="text-5xl font-black text-gold">{price}<span className="text-base text-warm/70 mr-1">د.م</span></p>
          <p className="text-xs text-warm/60 mt-1">شهرياً • {total}</p>
          {save && <p className="text-[11px] text-success font-bold mt-1">✓ {save}</p>}
        </div>

        {/* Comparison table */}
        <section className="rounded-2xl bg-white/5 overflow-hidden border border-white/10">
          <div className="grid grid-cols-[1fr_70px_90px] gap-1 px-3 py-3 bg-white/5 border-b border-white/10 text-[10px] font-black uppercase text-warm/60">
            <span>الميزة</span>
            <span className="text-center">مجاني</span>
            <span className="text-center bg-gold/20 text-gold rounded-md py-0.5">Premium</span>
          </div>
          {FEATURES.map((f, idx) => (
            <div key={idx}
              className={`grid grid-cols-[1fr_70px_90px] gap-1 px-3 py-2.5 items-center text-xs border-b border-white/5 last:border-0 ${f.highlight ? "bg-gold/5" : ""}`}>
              <span className="font-semibold">{f.label}</span>
              <span className="text-center text-warm/60">
                {typeof f.free === "boolean" ? (f.free ? <Check className="h-3.5 w-3.5 inline text-success" /> : <X className="h-3.5 w-3.5 inline text-warm/30" />) : f.free}
              </span>
              <span className="text-center font-bold text-gold">
                {typeof f.premium === "boolean" ? (f.premium ? <Check className="h-3.5 w-3.5 inline text-success" /> : <X className="h-3.5 w-3.5 inline" />) : f.premium}
              </span>
            </div>
          ))}
        </section>

        <div className="rounded-xl bg-white/5 p-3 flex items-start gap-2 text-[11px] text-warm/60">
          <Shield className="h-4 w-4 text-success shrink-0 mt-0.5" />
          <span>إلغاء في أي وقت. استرداد كامل خلال 14 يوماً. دفع آمن عبر CMI.</span>
        </div>

        <div className="text-center text-[10px] text-warm/50 pb-2">
          <Sparkles className="h-3 w-3 inline text-gold mr-1" />
          أكثر من 3,200 جامع يثقون بـ Premium
        </div>
      </main>

      <div className="p-5 border-t border-white/10 space-y-2 bg-stone">
        <button onClick={() => nav({ to: "/checkout", search: { plan } })}
          className="w-full rounded-full bg-gradient-to-r from-orange to-gold py-4 font-black text-white shadow-xl">
          اشترك بـ {total}
        </button>
        <p className="text-center text-[10px] text-warm/40">يبدأ التجديد تلقائياً • قابل للإلغاء</p>
      </div>
    </div>
  );
}
