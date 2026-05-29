import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import {
  Sparkles, ScanLine, Store, ChevronLeft, Languages, MapPin, Check, User,
} from "lucide-react";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const LANGS = [
  { id: "ar", label: "العربية", flag: "🇲🇦" },
  { id: "fr", label: "Français", flag: "🇫🇷" },
  { id: "en", label: "English", flag: "🇬🇧" },
];

const REGIONS = [
  "تيسنت", "العيون", "الرشيدية", "زاكورة", "ورزازات",
  "كلميم", "أكادير", "الرباط", "الدار البيضاء", "أخرى",
];

const FEATURES = [
  { icon: ScanLine, title: "امسح حجرك", body: "استعمل الكاميرا. الذكاء الاصطناعي يحلل القشرة، الكثافة والمغناطيسية." },
  { icon: Sparkles, title: "نتيجة فورية", body: "تقييم من 0 إلى 100 مع تصنيف مبدئي ونصائح للتأكيد." },
  { icon: Store, title: "بِع في السوق", body: "العينات المؤهلة تُنشر مباشرة للمشترين الموثوقين." },
];

function Onboarding() {
  const [step, setStep] = useState(0);
  const { setOnboarded, setUserName, userName } = useApp();
  const [lang, setLang] = useState("ar");
  const [region, setRegion] = useState("");
  const nav = useNavigate();
  const totalSteps = 6; // 0=lang, 1=region, 2-4=features, 5=name
  const isFeature = step >= 2 && step <= 4;
  const feature = isFeature ? FEATURES[step - 2] : null;

  const canNext =
    (step === 0 && !!lang) ||
    (step === 1 && !!region) ||
    isFeature ||
    (step === 5 && userName.trim().length >= 2);

  const next = () => {
    if (step === totalSteps - 1) { setOnboarded(true); nav({ to: "/register" }); return; }
    setStep(step + 1);
  };

  return (
    <div className="flex h-full flex-col bg-stone text-warm" dir="rtl">
      <div className="flex-1 overflow-y-auto px-6 pt-12 pb-4">
        {step === 0 && (
          <StepShell icon={Languages} title="اختر لغتك" body="يمكنك تغييرها لاحقاً من الإعدادات">
            <div className="space-y-2 mt-2">
              {LANGS.map((l) => (
                <button key={l.id} onClick={() => setLang(l.id)}
                  className={`w-full flex items-center gap-3 rounded-2xl p-4 border-2 transition ${lang === l.id ? "border-orange bg-orange/10" : "border-white/10 bg-white/5"}`}>
                  <span className="text-2xl">{l.flag}</span>
                  <span className="flex-1 text-right text-base font-bold">{l.label}</span>
                  {lang === l.id && <Check className="h-5 w-5 text-orange" />}
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {step === 1 && (
          <StepShell icon={MapPin} title="منطقتك" body="نستعملها لتقريب المشترين والعروض">
            <div className="grid grid-cols-2 gap-2 mt-2">
              {REGIONS.map((r) => (
                <button key={r} onClick={() => setRegion(r)}
                  className={`rounded-xl py-3 text-sm font-bold border-2 transition ${region === r ? "border-orange bg-orange/10 text-gold" : "border-white/10 bg-white/5"}`}>
                  {r}
                </button>
              ))}
            </div>
          </StepShell>
        )}

        {isFeature && feature && (
          <div className="flex flex-col items-center justify-center text-center gap-7 pt-10">
            <div className="grid h-28 w-28 place-items-center rounded-full bg-orange/20 ring-8 ring-orange/10">
              <feature.icon className="h-12 w-12 text-orange" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gold">{feature.title}</h1>
              <p className="mt-4 text-base text-warm/80 leading-relaxed max-w-sm">{feature.body}</p>
            </div>
          </div>
        )}

        {step === 5 && (
          <StepShell icon={User} title="ما اسمك؟" body="سيظهر في إعلاناتك ومحادثاتك">
            <input value={userName} onChange={(e) => setUserName(e.target.value)}
              placeholder="اسمك أو لقبك" autoFocus
              className="w-full mt-2 rounded-xl bg-white/10 px-4 py-4 text-center text-lg font-bold text-warm placeholder:text-warm/40 outline-none focus:bg-white/15" />
            <p className="mt-3 text-center text-xs text-warm/50">حرفان على الأقل</p>
          </StepShell>
        )}
      </div>

      <div className="px-6 pb-8">
        <div className="mb-4 flex justify-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === step ? "w-8 bg-orange" : idx < step ? "w-1.5 bg-orange/60" : "w-1.5 bg-white/20"}`} />
          ))}
        </div>
        <div className="flex items-center gap-2">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)} className="grid h-12 w-12 place-items-center rounded-full bg-white/10">
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <button onClick={next} disabled={!canNext}
            className="flex-1 rounded-full bg-gradient-to-r from-orange to-gold py-4 font-bold text-white shadow-lg disabled:opacity-40">
            {step === totalSteps - 1 ? "إنشاء حساب" : "التالي"}
          </button>
        </div>
        <button onClick={() => nav({ to: "/login" })} className="mt-3 w-full text-xs text-warm/70">
          لدي حساب — تسجيل الدخول
        </button>
      </div>
    </div>
  );
}

function StepShell({ icon: Icon, title, body, children }: { icon: any; title: string; body: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex flex-col items-center text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-orange to-gold shadow-lg mb-3">
          <Icon className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-2xl font-black text-gold">{title}</h1>
        <p className="mt-2 text-sm text-warm/70 max-w-xs">{body}</p>
      </div>
      {children}
    </div>
  );
}
