import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { TabBar } from "@/components/tissint/tab-bar";
import {
  ChevronLeft, CreditCard, Smartphone, Wallet as WalletIcon, Crown,
  Plus, Trash2, Star, Download, FileText, BadgeCheck, Clock, XCircle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/billing")({ component: BillingPage });

function BillingPage() {
  const {
    paymentMethods, invoices, premiumPlan, premiumRenewsAt, role,
    setDefaultPaymentMethod, removePaymentMethod, cancelPremium,
  } = useApp();

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-5 rounded-b-3xl shadow-lg flex items-center justify-between">
        <Link to="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
          <ChevronLeft className="h-5 w-5 rotate-180" />
        </Link>
        <h1 className="text-base font-bold">الفوترة والاشتراك</h1>
        <div className="h-9 w-9" />
      </header>

      <main className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
        {/* Subscription */}
        <section className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-warm/30">
            <Crown className="h-4 w-4 text-orange" />
            <h2 className="text-sm font-bold">الاشتراك الحالي</h2>
          </div>
          <div className="p-4">
            {role === "premium" && premiumPlan ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">الخطة</p>
                    <p className="font-bold">Premium {premiumPlan === "yearly" ? "سنوي" : "شهري"}</p>
                  </div>
                  <span className="text-[11px] font-bold bg-success/10 text-success rounded-full px-2 py-1 flex items-center gap-1">
                    <BadgeCheck className="h-3 w-3" /> نشط
                  </span>
                </div>
                {premiumRenewsAt && (
                  <p className="text-xs text-muted-foreground mt-2">يتجدد في {new Date(premiumRenewsAt).toLocaleDateString("ar")}</p>
                )}
                <button onClick={() => { cancelPremium(); toast("تم إلغاء التجديد التلقائي"); }}
                  className="mt-4 w-full rounded-xl bg-destructive/10 text-destructive font-bold py-2.5 text-sm">
                  إلغاء التجديد التلقائي
                </button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">لا يوجد اشتراك نشط.</p>
                <Link to="/premium"
                  className="mt-3 block rounded-xl bg-gradient-to-r from-orange to-gold py-2.5 text-center text-white text-sm font-bold">
                  الترقية إلى Premium
                </Link>
              </>
            )}
          </div>
        </section>

        {/* Payment methods */}
        <section className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-warm/30">
            <CreditCard className="h-4 w-4 text-orange" />
            <h2 className="text-sm font-bold flex-1">طرق الدفع</h2>
            <button onClick={() => toast("نموذج إضافة بطاقة (محاكاة)")}
              className="text-[11px] font-bold text-orange flex items-center gap-1">
              <Plus className="h-3 w-3" /> إضافة
            </button>
          </div>
          <ul className="p-2 space-y-1">
            {paymentMethods.map((pm) => {
              const Icon = pm.kind === "wallet" ? WalletIcon : pm.kind === "cmi" ? Smartphone : CreditCard;
              return (
                <li key={pm.id} className="flex items-center gap-3 rounded-xl px-2 py-2.5 hover:bg-warm/40">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-muted text-navy"><Icon className="h-4 w-4" /></span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{pm.label}{pm.last4 ? ` •••• ${pm.last4}` : ""}</p>
                    {pm.isDefault && <p className="text-[10px] text-success font-bold">الافتراضي</p>}
                  </div>
                  {!pm.isDefault && (
                    <button onClick={() => { setDefaultPaymentMethod(pm.id); toast.success("تم تعيين كافتراضي"); }}
                      className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground hover:bg-warm">
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  {pm.kind !== "wallet" && (
                    <button onClick={() => removePaymentMethod(pm.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-destructive hover:bg-destructive/10">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </section>

        {/* Invoices */}
        <section className="rounded-2xl bg-card border border-border overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b bg-warm/30">
            <FileText className="h-4 w-4 text-orange" />
            <h2 className="text-sm font-bold">سجل الفواتير</h2>
          </div>
          <ul className="divide-y divide-border">
            {invoices.length === 0 && (
              <li className="p-6 text-center text-sm text-muted-foreground">لا توجد فواتير بعد.</li>
            )}
            {invoices.map((iv) => (
              <li key={iv.id} className="flex items-center gap-3 p-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold truncate">{iv.label}</p>
                    {iv.status === "paid" && <span className="text-[10px] font-bold bg-success/10 text-success rounded-full px-2 py-0.5 flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> مدفوعة</span>}
                    {iv.status === "pending" && <span className="text-[10px] font-bold bg-gold/10 text-gold rounded-full px-2 py-0.5 flex items-center gap-1"><Clock className="h-3 w-3" /> قيد الانتظار</span>}
                    {iv.status === "failed" && <span className="text-[10px] font-bold bg-destructive/10 text-destructive rounded-full px-2 py-0.5 flex items-center gap-1"><XCircle className="h-3 w-3" /> فاشلة</span>}
                  </div>
                  <p className="text-[11px] text-muted-foreground">{iv.number} · {new Date(iv.createdAt).toLocaleDateString("ar")}</p>
                </div>
                <p className="text-sm font-black text-orange">{iv.totalDh} د.م</p>
                <button onClick={() => toast("تنزيل PDF (محاكاة)")}
                  className="grid h-8 w-8 place-items-center rounded-lg bg-muted text-navy">
                  <Download className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <Link to="/wallet" className="block rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
          <WalletIcon className="h-5 w-5 text-orange" />
          <span className="flex-1 text-sm font-bold">المحفظة</span>
          <span className="text-xs text-orange font-bold">فتح ←</span>
        </Link>
      </main>

      <TabBar />
    </div>
  );
}
