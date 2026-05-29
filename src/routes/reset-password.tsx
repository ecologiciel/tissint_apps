import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, CheckCircle2 } from "lucide-react";
import { AuthShell, AuthInput, AuthButton } from "@/components/tissint/auth-shell";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({ component: ResetPassword });

function ResetPassword() {
  const nav = useNavigate();
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = pw.length >= 12 ? "قوية" : pw.length >= 8 ? "متوسطة" : pw.length > 0 ? "ضعيفة" : "";
  const strengthColor = pw.length >= 12 ? "text-green-600" : pw.length >= 8 ? "text-orange" : "text-red-500";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw.length < 8) { toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل"); return; }
    if (pw !== pw2) { toast.error("كلمتا المرور غير متطابقتين"); return; }
    setLoading(true);
    setTimeout(() => { setDone(true); setLoading(false); }, 900);
  };

  if (done) {
    return (
      <AuthShell title="تم بنجاح" subtitle="تم تحديث كلمة المرور">
        <div className="text-center py-4">
          <div className="grid h-16 w-16 mx-auto place-items-center rounded-full bg-green-100">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <h3 className="mt-4 font-black text-stone">كلمة المرور محدّثة</h3>
          <p className="mt-2 text-sm text-stone/70">يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.</p>
          <div className="mt-5">
            <AuthButton onClick={() => nav({ to: "/login" })}>الذهاب لتسجيل الدخول</AuthButton>
          </div>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell title="كلمة مرور جديدة" subtitle="اختر كلمة مرور قوية لحماية حسابك" back="/login">
      <form onSubmit={submit}>
        <AuthInput label="كلمة المرور الجديدة" type="password" value={pw} onChange={setPw}
          placeholder="••••••••" icon={Lock} dir="ltr" />
        {strength && (
          <p className="-mt-2 mb-3 text-xs">
            القوة: <span className={`font-bold ${strengthColor}`}>{strength}</span>
          </p>
        )}
        <AuthInput label="تأكيد كلمة المرور" type="password" value={pw2} onChange={setPw2}
          placeholder="••••••••" icon={Lock} dir="ltr" />
        <ul className="text-[11px] text-stone/60 space-y-1 mb-4 pr-4 list-disc">
          <li>8 أحرف على الأقل</li>
          <li>حرف كبير وصغير</li>
          <li>رقم أو رمز خاص</li>
        </ul>
        <AuthButton type="submit" loading={loading}>تحديث كلمة المرور</AuthButton>
      </form>
    </AuthShell>
  );
}
