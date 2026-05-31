import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { User, Mail, Phone, Lock, MapPin } from "lucide-react";
import { AuthShell, AuthInput, AuthButton } from "@/components/tissint/auth-shell";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({ component: RegisterPage });

const REGIONS = [
  "ورزازات",
  "الرشيدية",
  "كلميم",
  "الداخلة",
  "العيون",
  "أكادير",
  "مراكش",
  "الدار البيضاء",
  "الرباط",
  "أخرى",
];

function RegisterPage() {
  const nav = useNavigate();
  const { setUserName } = useApp();
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "+212 ",
    password: "",
    region: REGIONS[0],
  });
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (k: keyof typeof form) => (v: string) => setForm({ ...form, [k]: v });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.password) {
      toast.error("الرجاء إكمال جميع الحقول");
      return;
    }
    if (form.password.length < 8) {
      toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
      return;
    }
    if (!accept) {
      toast.error("الرجاء قبول الشروط");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setUserName(form.name);
      toast.success("تم إنشاء الحساب! تحقق من رمز التأكيد");
      nav({ to: "/verify-otp", search: { phone: form.phone } });
    }, 900);
  };

  return (
    <AuthShell
      title="إنشاء حساب"
      subtitle="انضم إلى مجتمع باحثي النيازك في المغرب"
      back="/login"
      footer={
        <>
          لديك حساب؟{" "}
          <Link to="/login" className="text-gold font-bold underline">
            سجل الدخول
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <AuthInput
          label="الاسم الكامل"
          value={form.name}
          onChange={update("name")}
          placeholder="محمد العلوي"
          icon={User}
        />
        <AuthInput
          label="البريد الإلكتروني"
          type="email"
          value={form.email}
          onChange={update("email")}
          placeholder="exemple@tissint.ma"
          icon={Mail}
          dir="ltr"
        />
        <AuthInput
          label="رقم الهاتف"
          type="tel"
          value={form.phone}
          onChange={update("phone")}
          placeholder="+212 6 12 34 56 78"
          icon={Phone}
          dir="ltr"
        />

        <label className="block mb-3">
          <span className="block text-xs font-bold text-stone/80 mb-1.5">المنطقة</span>
          <div className="flex items-center gap-2 rounded-xl border border-stone/15 bg-white px-3 py-2.5">
            <MapPin className="h-4 w-4 text-stone/50 shrink-0" />
            <select
              value={form.region}
              onChange={(e) => update("region")(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm"
            >
              {REGIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
        </label>

        <AuthInput
          label="كلمة المرور (8 أحرف على الأقل)"
          type="password"
          value={form.password}
          onChange={update("password")}
          placeholder="••••••••"
          icon={Lock}
          dir="ltr"
        />

        <label className="flex items-start gap-2 mb-4 text-xs text-stone/70">
          <input
            type="checkbox"
            checked={accept}
            onChange={(e) => setAccept(e.target.checked)}
            className="mt-0.5 accent-orange"
          />
          <span>
            أوافق على <span className="text-orange font-bold">الشروط والأحكام</span> و
            <span className="text-orange font-bold">سياسة الخصوصية</span>
          </span>
        </label>

        <AuthButton type="submit" loading={loading}>
          إنشاء الحساب
        </AuthButton>
      </form>
    </AuthShell>
  );
}
