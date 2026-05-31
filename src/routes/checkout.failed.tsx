import { createFileRoute, Link } from "@tanstack/react-router";
import { AlertTriangle, RefreshCw, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/checkout/failed")({ component: FailedPage });

function FailedPage() {
  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="grid h-24 w-24 place-items-center rounded-full bg-destructive/10 text-destructive shadow">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h1 className="mt-6 text-2xl font-black">فشل الدفع</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          لم نتمكن من معالجة الدفع. تحقق من رصيد البطاقة أو جرّب طريقة دفع أخرى.
        </p>

        <div className="mt-6 rounded-2xl bg-card border border-border p-4 w-full max-w-sm text-right text-xs space-y-1">
          <p>
            <span className="text-muted-foreground">رمز الخطأ: </span>
            <span className="font-bold">CARD_DECLINED</span>
          </p>
          <p className="text-muted-foreground">لم يتم خصم أي مبلغ من حسابك.</p>
        </div>
      </main>

      <div className="p-5 space-y-2 border-t bg-card">
        <Link
          to="/checkout"
          search={{ plan: "monthly" }}
          className="w-full block rounded-xl bg-gradient-to-r from-orange to-gold py-3.5 text-center font-black text-white shadow-lg flex items-center justify-center gap-2"
        >
          <RefreshCw className="h-4 w-4" /> إعادة المحاولة
        </Link>
        <Link
          to="/dashboard"
          className="w-full block rounded-xl bg-muted text-foreground py-3 text-center font-bold flex items-center justify-center gap-2"
        >
          <MessageCircle className="h-4 w-4" /> تواصل مع الدعم
        </Link>
      </div>
    </div>
  );
}
