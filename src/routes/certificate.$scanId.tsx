import { createFileRoute, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/store";
import { ChevronRight, Download, Printer, Shield, QrCode } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/certificate/$scanId")({ component: CertificatePage });

function CertificatePage() {
  const { scanId } = Route.useParams();
  const { lastScan, collection, userName } = useApp();
  const item = lastScan?.scanId === scanId ? lastScan : collection.find((c) => c.scanId === scanId);

  if (!item) {
    return (
      <div
        className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center"
        dir="rtl"
      >
        <p className="text-sm text-muted-foreground">لم يتم العثور على الفيحص</p>
        <Link to="/collection" className="rounded-full bg-orange px-5 py-2 text-white text-sm">
          العودة للمجموعة
        </Link>
      </div>
    );
  }

  const issuedAt = new Date().toLocaleDateString("ar-MA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const certId = `TSN-${scanId.slice(-6).toUpperCase()}`;

  const handlePrint = () => window.print();
  const handleDownload = () => {
    toast.success("سيتم تحميل ملف PDF عند الإطلاق");
  };

  return (
    <div className="flex h-full flex-col bg-stone" dir="rtl">
      <header className="flex items-center justify-between px-5 pt-12 pb-3 bg-navy text-warm print:hidden">
        <Link
          to="/collection"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
        <h1 className="font-bold">شهادة المصداقية</h1>
        <div className="w-10" />
      </header>

      <main className="flex-1 overflow-y-auto p-5">
        <div className="mx-auto max-w-md rounded-3xl bg-warm text-navy border-4 border-double border-gold p-6 shadow-2xl space-y-4 relative overflow-hidden">
          <div
            className="absolute inset-0 pointer-events-none opacity-5"
            style={{
              background:
                "repeating-linear-gradient(45deg, currentColor 0 1px, transparent 1px 14px)",
            }}
          />

          <div className="relative text-center border-b-2 border-gold/40 pb-4">
            <Shield className="h-10 w-10 mx-auto text-gold-foreground text-accent-foreground" />
            <h2 className="text-xl font-black tracking-wider mt-2">TISSINT</h2>
            <p className="text-[10px] uppercase tracking-[0.3em] text-navy/60">
              Certificate of Authenticity
            </p>
            <p className="text-xs text-navy/70 mt-1">شهادة فحص ومصداقية</p>
          </div>

          <div className="relative space-y-3 text-sm">
            <Row label="رقم الشهادة" value={certId} />
            <Row label="تاريخ الإصدار" value={issuedAt} />
            <Row label="المالك" value={userName || "—"} />
            <Row label="رقم الفحص" value={scanId} />
            <div className="border-t border-dashed border-gold/40 pt-3">
              <Row label="التصنيف" value={item.classification} bold />
              <Row label="نقاط الجودة" value={`${item.score}/100`} bold />
              <Row label="الحكم" value={verdictLabel(item.verdict)} bold />
            </div>
          </div>

          <div className="relative flex items-center justify-between border-t-2 border-gold/40 pt-4">
            <div className="text-[10px] text-navy/70 leading-relaxed max-w-[60%]">
              يُشهد بأن العيّنة الموصوفة قد خضعت للتحليل البصري ضمن منصة تيسنت. هذه الشهادة
              استرشادية ولا تحلّ محلّ التحليل المخبري.
            </div>
            <div className="grid place-items-center">
              <div className="h-16 w-16 grid place-items-center bg-navy text-warm rounded">
                <QrCode className="h-12 w-12" />
              </div>
              <span className="text-[9px] text-navy/60 mt-1">{certId}</span>
            </div>
          </div>

          <div className="relative text-center text-[10px] text-navy/50 italic">
            tissint.ma • {new Date().getFullYear()}
          </div>
        </div>

        <div className="mx-auto max-w-md mt-5 grid grid-cols-2 gap-3 print:hidden">
          <button
            onClick={handlePrint}
            className="rounded-xl bg-card border-2 py-3 font-bold flex items-center justify-center gap-2 text-sm"
          >
            <Printer className="h-4 w-4" /> طباعة
          </button>
          <button
            onClick={handleDownload}
            className="rounded-xl bg-orange text-white py-3 font-bold flex items-center justify-center gap-2 text-sm"
          >
            <Download className="h-4 w-4" /> تحميل PDF
          </button>
        </div>
      </main>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-navy/60 text-xs">{label}</span>
      <span className={`text-left ${bold ? "font-black" : ""}`}>{value}</span>
    </div>
  );
}

function verdictLabel(v: string) {
  return (
    { likely: "احتمال قوي", possible: "احتمال متوسط", unlikely: "احتمال ضعيف", rejected: "مرفوض" }[
      v
    ] || v
  );
}
