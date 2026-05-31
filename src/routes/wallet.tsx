import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { TabBar } from "@/components/tissint/tab-bar";
import {
  ChevronLeft,
  Wallet as WalletIcon,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Crown,
  ShoppingBag,
  RefreshCw,
  Receipt,
  Banknote,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { TxKind } from "@/lib/tissint-types";

export const Route = createFileRoute("/wallet")({ component: WalletPage });

const KIND_META: Record<TxKind, { label: string; icon: typeof Plus }> = {
  topup: { label: "شحن", icon: Plus },
  premium: { label: "Premium", icon: Crown },
  purchase: { label: "شراء", icon: ShoppingBag },
  sale: { label: "بيع", icon: Banknote },
  refund: { label: "استرداد", icon: RefreshCw },
  withdrawal: { label: "سحب", icon: ArrowUpRight },
};

const PRESETS = [50, 100, 200, 500];

function WalletPage() {
  const { walletBalanceDh, transactions, paymentMethods, topUpWallet } = useApp();
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState<number>(100);
  const [methodId, setMethodId] = useState(
    paymentMethods.find((p) => p.kind !== "wallet")?.id ?? "",
  );
  const [loading, setLoading] = useState(false);

  const inflow = transactions
    .filter((t) => t.amountDh > 0 && t.status === "completed")
    .reduce((s, t) => s + t.amountDh, 0);
  const outflow = -transactions
    .filter((t) => t.amountDh < 0 && t.status === "completed")
    .reduce((s, t) => s + t.amountDh, 0);

  const confirmTopUp = async () => {
    if (!methodId || amount <= 0) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    topUpWallet(amount, methodId);
    setLoading(false);
    setOpen(false);
    toast.success(`تم شحن ${amount} د.م`);
  };

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-8 rounded-b-3xl shadow-lg">
        <div className="flex items-center justify-between">
          <Link to="/profile" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <ChevronLeft className="h-5 w-5 rotate-180" />
          </Link>
          <h1 className="text-base font-bold">المحفظة</h1>
          <Link to="/billing" className="grid h-9 w-9 place-items-center rounded-full bg-white/10">
            <Receipt className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-5 rounded-2xl bg-gradient-to-br from-orange to-gold p-5 text-white shadow-lg">
          <div className="flex items-center gap-2 text-xs text-white/80">
            <WalletIcon className="h-4 w-4" /> الرصيد الحالي
          </div>
          <p className="mt-2 text-4xl font-black">
            {walletBalanceDh.toLocaleString()}
            <span className="text-base font-bold mr-1">د.م</span>
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
            <div className="rounded-lg bg-white/15 p-2">
              <p className="text-white/80">دخل</p>
              <p className="font-bold">+{inflow.toLocaleString()} د.م</p>
            </div>
            <div className="rounded-lg bg-white/15 p-2">
              <p className="text-white/80">مصروف</p>
              <p className="font-bold">-{outflow.toLocaleString()} د.م</p>
            </div>
          </div>
        </div>
      </header>

      <div className="px-5 -mt-4 grid grid-cols-2 gap-2 relative z-10">
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-card border border-border py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
        >
          <Plus className="h-4 w-4 text-orange" /> شحن
        </button>
        <button
          onClick={() => toast("طلب سحب (محاكاة)")}
          className="rounded-xl bg-card border border-border py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
        >
          <ArrowUpRight className="h-4 w-4 text-navy" /> سحب
        </button>
      </div>

      <main className="flex-1 overflow-y-auto px-5 py-5">
        <h2 className="text-xs font-bold text-muted-foreground mb-2">آخر الحركات</h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">لا توجد حركات بعد.</p>
        ) : (
          <ul className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
            {transactions.map((t) => {
              const meta = KIND_META[t.kind];
              const Icon = meta.icon;
              const credit = t.amountDh > 0;
              return (
                <li key={t.id} className="flex items-center gap-3 p-3">
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-xl ${credit ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}
                  >
                    {credit ? <ArrowDownLeft className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{t.label}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {meta.label} · {new Date(t.createdAt).toLocaleDateString("ar")}
                      {t.status === "pending" && " · قيد التنفيذ"}
                      {t.status === "failed" && " · فشل"}
                    </p>
                  </div>
                  <p
                    className={`text-sm font-black ${credit ? "text-success" : "text-foreground"}`}
                  >
                    {credit ? "+" : ""}
                    {t.amountDh.toLocaleString()} د.م
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </main>

      <TabBar />

      {/* Top up sheet */}
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-end"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full bg-card rounded-t-3xl p-5 space-y-4"
            dir="rtl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-base">شحن المحفظة</h3>
              <button
                onClick={() => setOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">المبلغ (د.م)</p>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {PRESETS.map((v) => (
                  <button
                    key={v}
                    onClick={() => setAmount(v)}
                    className={`rounded-xl border-2 py-2 text-sm font-bold ${amount === v ? "border-orange bg-orange/10 text-orange" : "border-border bg-muted"}`}
                  >
                    {v}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={10}
                value={amount}
                onChange={(e) => setAmount(Math.max(0, Number(e.target.value) || 0))}
                className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm outline-none"
              />
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-2">من</p>
              <select
                value={methodId}
                onChange={(e) => setMethodId(e.target.value)}
                className="w-full rounded-xl border border-border bg-muted px-3 py-2.5 text-sm outline-none"
              >
                {paymentMethods
                  .filter((p) => p.kind !== "wallet")
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                      {p.last4 ? ` •••• ${p.last4}` : ""}
                    </option>
                  ))}
              </select>
            </div>

            <button
              onClick={confirmTopUp}
              disabled={loading || amount <= 0 || !methodId}
              className="w-full rounded-xl bg-gradient-to-r from-orange to-gold py-3.5 font-black text-white shadow-lg disabled:opacity-50"
            >
              {loading ? "جاري الشحن…" : `تأكيد شحن ${amount.toLocaleString()} د.م`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
