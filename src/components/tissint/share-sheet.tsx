import { useState } from "react";
import { Share2, Link as LinkIcon, MessageCircle, Mail, Check, X } from "lucide-react";
import { toast } from "sonner";

export function ShareSheet({
  open,
  onClose,
  title,
  text,
  url,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  text: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);

  const native = async () => {
    if (typeof navigator !== "undefined" && (navigator as any).share) {
      try {
        await (navigator as any).share({ title, text, url });
        onClose();
      } catch {
        /* cancelled */
      }
    } else {
      copy();
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("تم نسخ الرابط");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("فشل النسخ");
    }
  };

  const wa = `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`;
  const mail = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`;

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/50" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-t-3xl p-5 space-y-4"
        dir="rtl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black">مشاركة</h2>
          <button
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-full bg-muted"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <ShareBtn icon={Share2} label="نظام" onClick={native} />
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            onClick={onClose}
            className="flex flex-col items-center gap-1.5"
          >
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-success text-white">
              <MessageCircle className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-bold">واتساب</span>
          </a>
          <a href={mail} onClick={onClose} className="flex flex-col items-center gap-1.5">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-navy text-warm">
              <Mail className="h-5 w-5" />
            </span>
            <span className="text-[10px] font-bold">بريد</span>
          </a>
          <ShareBtn
            icon={copied ? Check : LinkIcon}
            label={copied ? "تم" : "نسخ"}
            onClick={copy}
            accent
          />
        </div>
        <div className="rounded-xl bg-muted p-3 text-[11px] text-muted-foreground break-all">
          {url}
        </div>
      </div>
    </div>
  );
}

function ShareBtn({
  icon: Icon,
  label,
  onClick,
  accent,
}: {
  icon: any;
  label: string;
  onClick: () => void;
  accent?: boolean;
}) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5">
      <span
        className={`grid h-12 w-12 place-items-center rounded-2xl ${accent ? "bg-gradient-to-br from-orange to-gold text-white" : "bg-muted text-foreground"}`}
      >
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}
