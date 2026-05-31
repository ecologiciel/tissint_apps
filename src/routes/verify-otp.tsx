import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { AuthShell, AuthButton } from "@/components/tissint/auth-shell";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/verify-otp")({
  validateSearch: (s: Record<string, unknown>) => ({
    phone: (s.phone as string) || "+212 6 12 34 56 78",
  }),
  component: VerifyOtp,
});

function VerifyOtp() {
  const { phone } = Route.useSearch();
  const nav = useNavigate();
  const { setRole, setOnboarded } = useApp();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [seconds, setSeconds] = useState(45);
  const [loading, setLoading] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds(seconds - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const setDigit = (i: number, v: string) => {
    const c = v.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[i] = c;
    setDigits(next);
    if (c && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  const verify = () => {
    const code = digits.join("");
    if (code.length < 6) {
      toast.error("الرجاء إدخال الرمز الكامل");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setRole("free");
      setOnboarded(true);
      toast.success("تم تأكيد رقمك بنجاح");
      nav({ to: "/dashboard" });
    }, 800);
  };

  const resend = () => {
    if (seconds > 0) return;
    setSeconds(45);
    toast.success("تم إرسال رمز جديد (تجريبي: 123456)");
  };

  return (
    <AuthShell
      title="تأكيد الرقم"
      subtitle={`أدخل الرمز المرسل عبر SMS إلى ${phone}`}
      back="/register"
    >
      <div className="flex justify-center gap-2 mb-5" dir="ltr">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKey(i, e)}
            className="h-12 w-10 rounded-xl border-2 border-stone/15 bg-white text-center text-xl font-black text-stone outline-none focus:border-orange focus:ring-2 focus:ring-orange/20"
          />
        ))}
      </div>

      <p className="text-center text-xs text-stone/60 mb-4">
        💡 رمز التجربة: <span className="font-mono font-bold text-orange">123456</span>
      </p>

      <AuthButton onClick={verify} loading={loading}>
        تأكيد
      </AuthButton>

      <div className="mt-4 text-center text-xs text-stone/60">
        {seconds > 0 ? (
          <>
            إعادة الإرسال خلال <span className="font-bold text-stone">{seconds}s</span>
          </>
        ) : (
          <button onClick={resend} className="text-orange font-bold">
            إعادة إرسال الرمز
          </button>
        )}
      </div>
    </AuthShell>
  );
}
