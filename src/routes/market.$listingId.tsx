import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import { ShareSheet } from "@/components/tissint/share-sheet";
import { BadgeCheck, ChevronRight, MapPin, MessageCircle, Phone, Shield, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/market/$listingId")({ component: ListingPage });

function ListingPage() {
  const { listingId } = Route.useParams();
  const { listings, startConversationForListing, favoriteIds, toggleFavorite } = useApp();
  const nav = useNavigate();
  const [shareOpen, setShareOpen] = useState(false);
  const l = listings.find((x) => x.id === listingId);
  const isFav = !!l && favoriteIds.includes(l.id);

  if (!l) return <div className="p-6" dir="rtl"><p>غير موجود</p><Link to="/market" className="text-orange">العودة</Link></div>;

  const openChat = () => {
    const tid = startConversationForListing(l);
    nav({ to: "/messages/$threadId", params: { threadId: tid } });
  };
  const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/market/${l.id}` : `/market/${l.id}`;

  return (
    <div className="flex h-full flex-col" dir="rtl">
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-5 pt-12 pb-3">
        <Link to="/market" className="grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur">
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2">
          <button onClick={() => { toggleFavorite(l.id); toast.success(isFav ? "أُزيلت" : "أُضيفت للمفضلات"); }}
            className={`grid h-10 w-10 place-items-center rounded-full backdrop-blur ${isFav ? "bg-orange text-white" : "bg-black/40 text-white"}`}>
            <Heart className={`h-4 w-4 ${isFav ? "fill-current" : ""}`} />
          </button>
          <button onClick={() => setShareOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white backdrop-blur">
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto">
        <MeteoriteThumb seed={l.imageSeed} className="aspect-square" />

        <div className="p-5 space-y-4 -mt-6 relative bg-background rounded-t-3xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-orange bg-orange/10 rounded-full px-2 py-0.5">
                {l.priceMode === "fixed" ? "سعر ثابت" : l.priceMode === "negotiable" ? "قابل للتفاوض" : "مزاد"}
              </span>
              {l.sellerVerified && <span className="text-xs font-bold text-success bg-success/10 rounded-full px-2 py-0.5 flex items-center gap-1"><BadgeCheck className="h-3 w-3" /> بائع موثوق</span>}
            </div>
            <h1 className="text-xl font-black">{l.title}</h1>
            <p className="text-sm text-muted-foreground">{l.classification}</p>
            <p className="text-2xl font-black text-orange mt-2">{l.priceDh.toLocaleString()} درهم</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-xl bg-muted p-2"><p className="text-muted-foreground">الوزن</p><p className="font-bold">{l.weightG} g</p></div>
            <div className="rounded-xl bg-muted p-2"><p className="text-muted-foreground">نقاط AI</p><p className="font-bold">{l.score}/100</p></div>
            <div className="rounded-xl bg-muted p-2"><p className="text-muted-foreground">المنطقة</p><p className="font-bold flex items-center justify-center gap-1"><MapPin className="h-3 w-3" />{l.region}</p></div>
          </div>

          <div>
            <h3 className="font-bold mb-1 text-sm">الوصف</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{l.description}</p>
          </div>

          <Link
            to="/seller/$name"
            params={{ name: encodeURIComponent(l.sellerName) }}
            className="block rounded-2xl bg-card border p-4 hover:bg-muted/30 transition"
          >
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-full bg-primary text-primary-foreground font-bold">
                {l.sellerName.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm flex items-center gap-1">{l.sellerName} {l.sellerVerified && <BadgeCheck className="h-4 w-4 text-success" />}</p>
                <p className="text-xs text-muted-foreground">{l.region} · عرض الملف والآراء ←</p>
              </div>
            </div>
          </Link>

          <div className="rounded-xl bg-muted p-3 flex items-start gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>التواصل خارج التطبيق. لا تدفع قبل الفحص الفعلي. Tissint غير مسؤولة عن المعاملات.</span>
          </div>
        </div>
      </main>

      <div className="border-t bg-card p-3 grid grid-cols-3 gap-2">
        <button onClick={openChat}
          className="rounded-xl bg-orange text-white py-3 font-bold flex items-center justify-center gap-2 text-sm">
          <MessageCircle className="h-4 w-4" /> محادثة
        </button>
        <button onClick={() => toast.success("فُتح واتساب (محاكاة)")}
          className="rounded-xl bg-success text-white py-3 font-bold flex items-center justify-center gap-2 text-sm">
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </button>
        <button onClick={() => toast.success("اتصال (محاكاة)")}
          className="rounded-xl bg-primary text-primary-foreground py-3 font-bold flex items-center justify-center gap-2 text-sm">
          <Phone className="h-4 w-4" /> اتصال
        </button>
      </div>
      <ShareSheet open={shareOpen} onClose={() => setShareOpen(false)}
        title={l.title} text={`اكتشف ${l.title} على Tissint`} url={shareUrl} />
    </div>
  );
}
