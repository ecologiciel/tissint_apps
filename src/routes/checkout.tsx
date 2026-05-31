import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { PREMIUM_PLANS } from "@/lib/mock-data";
import type { PlanKey } from "@/lib/tissint-types";
import {
  ChevronRight,
  CreditCard,
  Check,
  Lock,
  Wallet as WalletIcon,
  Smartphone,
  Crown,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

type Search = { plan?: PlanKey };

export const Route = createFileRoute("/checkout")({
  component: CheckoutPage,
  validateSearch: (s: Record<string, unknown>): Search => ({
    plan: (s.plan === "yearly" ? "yearly" : "monthly") as PlanKey,
  }),
});

function CheckoutPage() {
  const nav = useNavigate();
  const { plan: planFromSearch } = useSearch({ from: "/checkout" });
  const { paymentMethods, subscribePremium, walletBalanceDh } = useApp();
  const [plan, setPlan] = useState<PlanKey>(planFromSearch ?? "monthly");
  const [methodId, setMethodId] = useState(
    paymentMethods.find((p) => p.isDefault)?.id ?? paymentMethods[0]?.id,
  );
  const [coupon, setCoupon] = useState("");
  const [accepted, setAccepted] = useState(true);
  const [processing, setProcessing] = useState(false);

  const planObj = PREMIUM_PLANS.find((p) => p.key === plan)!;
  const subtotal = planObj.priceDh;
  const discount = coupon.trim().toUpperCase() === "TISSINT10" ? Math.round(subtotal * 0.1) : 0;
  const total = subtotal - discount;

  const pay = async () => {
    if (!methodId || !accepted) return;
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    // 5% chance of failure for demo realism
    if (Math.random() < 0.05) {
      setProcessing(false);
      nav({ to: "/checkout/failed" });
      return;
    }
    const { invoice } = subscribePremium(plan, methodId);
    setProcessing(false);
    toast.success("تم الدفع بنجاح");
    nav({ to: "/checkout/success", search: { invoice: invoice.id } });
  };

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-5 rounded-b-3xl shadow-lg flex items-center justify-between">
        <Link to="/premium" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
          <ChevronRight className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold">الدفع</h1>
        <span className="text-[10px] flex items-center gap-1 text-gold">
          <Lock className="h-3 w-3" /> آمن
        </span>
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Plan */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground mb-2">اختر الخطة</h2>
          <div className="grid grid-cols-2 gap-2">
            {PREMIUM_PLANS.map((p) => {
              const active = p.key === plan;
              return (
                <button
                  key={p.key}
                  onClick={() => setPlan(p.key)}
                  className={`rounded-2xl border-2 p-3 text-right transition ${active ? "border-orange bg-orange/10" : "border-border bg-card"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{p.label}</span>
                    {p.hint && (
                      <span className="text-[10px] bg-gold/20 text-gold rounded-full px-2 py-0.5">
                        {p.hint}
                      </span>
                    )}
                  </div>
                  <p className="mt-2">
                    <span className="text-xl font-black text-orange">{p.priceDh}</span>
                    <span className="text-[10px] text-muted-foreground"> د.م {p.periodLabel}</span>
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Methods */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground mb-2">طريقة الدفع</h2>
          <ul className="space-y-2">
            {paymentMethods.map((pm) => {
              const Icon =
                pm.kind === "wallet" ? WalletIcon : pm.kind === "cmi" ? Smartphone : CreditCard;
              const active = pm.id === methodId;
              const walletInsufficient = pm.kind === "wallet" && walletBalanceDh < total;
              return (
                <li key={pm.id}>
                  <button
                    disabled={walletInsufficient}
                    onClick={() => setMethodId(pm.id)}
                    className={`w-full flex items-center gap-3 rounded-2xl border-2 p-3 transition disabled:opacity-50 ${active ? "border-orange bg-orange/5" : "border-border bg-card"}`}
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-muted text-navy">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="flex-1 text-right">
                      <p className="text-sm font-bold">
                        {pm.label}
                        {pm.last4 ? ` •••• ${pm.last4}` : ""}
                      </p>
                      {pm.kind === "wallet" && (
                        <p className="text-[11px] text-muted-foreground">
                          الرصيد: {walletBalanceDh.toLocaleString()} د.م{" "}
                          {walletInsufficient && "— غير كافٍ"}
                        </p>
                      )}
                    </div>
                    <span
                      className={`h-5 w-5 rounded-full border-2 ${active ? "border-orange bg-orange" : "border-muted"} grid place-items-center`}
                    >
                      {active && <Check className="h-3 w-3 text-white" />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Link to="/billing" className="block text-xs text-orange font-bold mt-2">
            إدارة طرق الدفع ←
          </Link>
        </section>

        {/* Coupon */}
        <section>
          <h2 className="text-xs font-bold text-muted-foreground mb-2">رمز الخصم</h2>
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="TISSINT10"
              className="flex-1 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none"
            />
            <button
              onClick={() => toast(discount > 0 ? "تم تطبيق الخصم" : "رمز غير صالح")}
              className="rounded-xl bg-navy text-warm px-4 text-sm font-bold"
            >
              تطبيق
            </button>
          </div>
        </section>

        {/* Summary */}
        <section className="rounded-2xl bg-card border border-border p-4 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">المجموع الفرعي</span>
            <span>{subtotal.toLocaleString()} د.م</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>خصم</span>
              <span>-{discount} د.م</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground text-xs">
            <span>منها TVA 20٪</span>
            <span>{(total - total / 1.2).toFixed(2)} د.م</span>
          </div>
          <div className="border-t border-border my-2" />
          <div className="flex justify-between font-black text-base">
            <span>المجموع</span>
            <span className="text-orange">{total.toLocaleString()} د.م</span>
          </div>
        </section>

        <label className="flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="mt-0.5"
          />
          <span>أوافق على شروط الاشتراك المتجدد تلقائياً. يمكن الإلغاء في أي وقت.</span>
        </label>
      </main>

      <div className="border-t bg-card p-3">
        <button
          onClick={pay}
          disabled={!methodId || !accepted || processing}
          className="w-full rounded-xl bg-gradient-to-r from-orange to-gold py-4 font-black text-white shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {processing ? (
            <>
              <Sparkles className="h-4 w-4 animate-spin" /> جاري معالجة الدفع…
            </>
          ) : (
            <>
              <Crown className="h-4 w-4" /> ادفع {total.toLocaleString()} د.م
            </>
          )}
        </button>
        <p className="text-center text-[10px] text-muted-foreground mt-2">
          <Lock className="inline h-3 w-3 ml-1" /> تشفير SSL • الدفع عبر CMI / Visa
        </p>
      </div>
    </div>
  );
}
