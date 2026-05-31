import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { Check, Crown, Download, Receipt } from "lucide-react";

type Search = { invoice?: string };

export const Route = createFileRoute("/checkout/success")({
  component: SuccessPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    invoice: typeof s.invoice === "string" ? s.invoice : undefined,
  }),
});

function SuccessPage() {
  const { invoice: invId } = useSearch({ from: "/checkout/success" });
  const { invoices, premiumRenewsAt } = useApp();
  const inv = invoices.find((i) => i.id === invId) ?? invoices[0];

  return (
    <div className="flex h-full flex-col bg-stone text-warm relative overflow-hidden" dir="rtl">
      <div className="pointer-events-none absolute inset-0 z-0">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="confetti-piece absolute h-2 w-2 rounded-sm"
            style={{
              left: `${(i * 11) % 100}%`,
              background: ["#F48A2A", "#F7C75E", "#10B981", "#fff"][i % 4],
              animationDelay: `${(i % 10) * 0.06}s`,
            }}
          />
        ))}
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-success shadow-2xl">
          <Check className="h-12 w-12 text-white" />
        </div>
        <h1 className="mt-6 text-2xl font-black text-gold flex items-center gap-2">
          <Crown className="h-6 w-6" /> مرحباً في Premium!
        </h1>
        <p className="mt-2 text-sm text-warm/70">تم تفعيل اشتراكك بنجاح.</p>

        {inv && (
          <div className="mt-6 w-full max-w-sm rounded-2xl bg-white/5 p-4 text-right space-y-1.5 text-sm border border-white/10">
            <div className="flex justify-between">
              <span className="text-warm/60">رقم الفاتورة</span>
              <span className="font-bold">{inv.number}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-warm/60">المبلغ</span>
              <span className="font-bold text-gold">{inv.totalDh} د.م</span>
            </div>
            {premiumRenewsAt && (
              <div className="flex justify-between">
                <span className="text-warm/60">التجديد التالي</span>
                <span className="font-bold">
                  {new Date(premiumRenewsAt).toLocaleDateString("ar")}
                </span>
              </div>
            )}
          </div>
        )}
      </main>

      <div className="p-5 space-y-2 relative z-10 border-t border-white/10">
        <Link
          to="/billing"
          className="w-full block rounded-xl bg-white/10 text-warm py-3 text-center font-bold flex items-center justify-center gap-2"
        >
          <Receipt className="h-4 w-4" /> عرض الفواتير
        </Link>
        <button
          onClick={() => alert("تنزيل PDF (محاكاة)")}
          className="w-full rounded-xl bg-white/5 text-warm py-3 font-bold flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" /> تنزيل الفاتورة
        </button>
        <Link
          to="/dashboard"
          className="w-full block rounded-full bg-gradient-to-r from-orange to-gold py-3.5 text-center font-black text-white shadow-lg"
        >
          الذهاب إلى الرئيسية
        </Link>
      </div>
    </div>
  );
}
