import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { AuthShell, AuthInput, AuthButton } from "@/components/tissint/auth-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/forgot-password")({ component: ForgotPassword });

function ForgotPassword() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("أدخل بريدك الإلكتروني");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
      toast.success("تم إرسال رابط إعادة التعيين");
    }, 900);
  };

  return (
    <AuthShell
      title="نسيت كلمة المرور؟"
      subtitle="أدخل بريدك وسنرسل لك رابطاً لإعادة التعيين"
      back="/login"
      footer={
        <>
          تذكرت كلمة المرور؟{" "}
          <Link to="/login" className="text-gold font-bold underline">
            عودة إلى الدخول
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="text-center py-4">
          <div className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-orange/10">
            <CheckCircle2 className="h-8 w-8 text-orange" />
          </div>
          <h3 className="mt-4 font-black text-stone">تحقق من بريدك</h3>
          <p className="mt-2 text-sm text-stone/70">
            أرسلنا رابط إعادة التعيين إلى <span className="font-bold">{email}</span>. الرابط صالح
            لمدة ساعة.
          </p>
          <div className="mt-5">
            <AuthButton onClick={() => nav({ to: "/reset-password" })}>
              محاكاة فتح الرابط
            </AuthButton>
          </div>
          <button onClick={() => setSent(false)} className="mt-3 text-xs text-orange font-bold">
            تغيير البريد الإلكتروني
          </button>
        </div>
      ) : (
        <form onSubmit={submit}>
          <AuthInput
            label="البريد الإلكتروني"
            type="email"
            value={email}
            onChange={setEmail}
            placeholder="exemple@tissint.ma"
            icon={Mail}
            dir="ltr"
          />
          <AuthButton type="submit" loading={loading}>
            إرسال رابط الإعادة
          </AuthButton>
        </form>
      )}
    </AuthShell>
  );
}
