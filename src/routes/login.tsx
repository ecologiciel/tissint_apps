import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { AuthShell, AuthInput, AuthButton } from "@/components/tissint/auth-shell";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const nav = useNavigate();
  const { setRole, setOnboarded, setUserName } = useApp();
  const [email, setEmail] = useState("user@tissint.ma");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("الرجاء إكمال جميع الحقول"); return; }
    setLoading(true);
    setTimeout(() => {
      setRole("free");
      setOnboarded(true);
      setUserName("صديق النيازك");
      toast.success("مرحباً بعودتك!");
      nav({ to: "/dashboard" });
    }, 900);
  };

  return (
    <AuthShell
      title="مرحباً بعودتك"
      subtitle="سجل الدخول للوصول إلى مجموعتك وسوق النيازك"
      footer={<>ليس لديك حساب؟ <Link to="/register" className="text-gold font-bold underline">أنشئ حساباً</Link></>}
    >
      <form onSubmit={handleSubmit}>
        <AuthInput label="البريد الإلكتروني" type="email" value={email} onChange={setEmail}
          placeholder="exemple@tissint.ma" icon={Mail} dir="ltr" />

        <label className="block mb-2">
          <span className="block text-xs font-bold text-stone/80 mb-1.5">كلمة المرور</span>
          <div className="flex items-center gap-2 rounded-xl border border-stone/15 bg-white px-3 py-2.5 focus-within:border-orange focus-within:ring-2 focus-within:ring-orange/20">
            <Lock className="h-4 w-4 text-stone/50 shrink-0" />
            <input type={show ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" dir="ltr"
              className="flex-1 bg-transparent outline-none text-sm placeholder:text-stone/40" />
            <button type="button" onClick={() => setShow(!show)} className="text-stone/50">
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        <div className="flex justify-end mb-4">
          <Link to="/forgot-password" className="text-xs text-orange font-bold">نسيت كلمة المرور؟</Link>
        </div>

        <AuthButton type="submit" loading={loading}>تسجيل الدخول</AuthButton>

        <div className="my-4 flex items-center gap-3 text-xs text-stone/40">
          <div className="flex-1 h-px bg-stone/10" /> أو <div className="flex-1 h-px bg-stone/10" />
        </div>

        <AuthButton variant="social" onClick={() => toast.info("Google — تجريبي")}>
          <svg className="h-4 w-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
          متابعة بحساب Google
        </AuthButton>
      </form>
    </AuthShell>
  );
}
