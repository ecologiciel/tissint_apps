import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronRight, Star, BadgeCheck, Zap, Award, ShieldCheck, ThumbsUp, MessageCircle, Calendar, Clock } from "lucide-react";
import { getReputation, getReviewsFor } from "@/lib/reviews";
import { useApp } from "@/lib/store";
import { toast } from "sonner";

export const Route = createFileRoute("/seller/$name")({ component: SellerPage });

const BADGE_META: Record<string, { icon: any; label: string; color: string }> = {
  verified: { icon: BadgeCheck, label: "موثّق", color: "text-primary bg-primary/10" },
  top_seller: { icon: Award, label: "بائع متميّز", color: "text-gold-foreground text-accent-foreground bg-gold/15" },
  fast_shipper: { icon: Zap, label: "شحن سريع", color: "text-orange bg-orange/15" },
  trusted: { icon: ShieldCheck, label: "موثوق", color: "text-success bg-success/15" },
};

function SellerPage() {
  const { name } = Route.useParams();
  const sellerName = decodeURIComponent(name);
  const { listings, startConversationForListing } = useApp();
  const rep = getReputation(sellerName);
  const reviews = getReviewsFor(sellerName);
  const sellerListings = listings.filter((l) => l.sellerName === sellerName && l.status === "approved");
  const [helpful, setHelpful] = useState<Record<string, boolean>>({});

  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const maxDist = Math.max(...distribution.map((d) => d.count), 1);

  const contact = () => {
    const l = sellerListings[0];
    if (!l) { toast.error("لا توجد إعلانات نشطة"); return; }
    startConversationForListing(l);
    toast.success("تم فتح المحادثة");
  };

  return (
    <div className="flex h-full flex-col bg-background" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-6 rounded-b-3xl">
        <Link to="/market" className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div className="mt-3 flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange to-gold grid place-items-center font-black text-xl">
            {sellerName.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="font-black text-xl">{sellerName}</h1>
            <div className="flex items-center gap-1 text-sm mt-1">
              <Star className="h-4 w-4 fill-gold text-gold" />
              <span className="font-bold">{rep.avgRating.toFixed(1)}</span>
              <span className="text-warm/60">· {rep.totalReviews} تقييم</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <Stat label="مبيعات" value={`${rep.totalSales}`} />
          <Stat label="استجابة" value={`${rep.responseTimeHours}س`} icon={Clock} />
          <Stat label="انضمّ" value={new Date(rep.joinedAt).getFullYear()} icon={Calendar} />
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Badges */}
        {rep.badges.length > 0 && (
          <section className="flex flex-wrap gap-2">
            {rep.badges.map((b) => {
              const m = BADGE_META[b];
              if (!m) return null;
              const Icon = m.icon;
              return (
                <span key={b} className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${m.color}`}>
                  <Icon className="h-3 w-3" /> {m.label}
                </span>
              );
            })}
          </section>
        )}

        {/* Rating distribution */}
        <section className="rounded-2xl bg-card border p-4">
          <h3 className="text-sm font-bold mb-3">توزيع التقييمات</h3>
          <div className="flex items-end gap-4">
            <div className="text-center">
              <p className="text-4xl font-black text-primary">{rep.avgRating.toFixed(1)}</p>
              <div className="flex justify-center mt-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-3 w-3 ${i < Math.round(rep.avgRating) ? "fill-gold text-gold" : "text-muted"}`} />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">{rep.totalReviews} تقييم</p>
            </div>
            <div className="flex-1 space-y-1">
              {distribution.map((d) => (
                <div key={d.star} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{d.star}</span>
                  <Star className="h-3 w-3 fill-gold text-gold" />
                  <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full bg-gold" style={{ width: `${(d.count / maxDist) * 100}%` }} />
                  </div>
                  <span className="w-6 text-muted-foreground">{d.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Reviews */}
        <section className="space-y-2">
          <h3 className="text-sm font-bold">الآراء ({reviews.length})</h3>
          {reviews.map((r) => (
            <article key={r.id} className="rounded-2xl bg-card border p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-muted grid place-items-center text-xs font-bold">
                    {r.reviewerName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold">{r.reviewerName}</p>
                    <p className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleDateString("ar-MA")}</p>
                  </div>
                </div>
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-gold text-gold" : "text-muted"}`} />
                  ))}
                </div>
              </div>
              {r.listingTitle && (
                <p className="text-[10px] text-muted-foreground italic">على: {r.listingTitle}</p>
              )}
              <p className="text-sm leading-relaxed">{r.comment}</p>
              <button
                onClick={() => setHelpful((h) => ({ ...h, [r.id]: !h[r.id] }))}
                className={`flex items-center gap-1 text-xs ${helpful[r.id] ? "text-primary font-bold" : "text-muted-foreground"}`}
              >
                <ThumbsUp className="h-3 w-3" />
                مفيد ({r.helpful + (helpful[r.id] ? 1 : 0)})
              </button>
            </article>
          ))}
        </section>

        {/* Listings */}
        {sellerListings.length > 0 && (
          <section>
            <h3 className="text-sm font-bold mb-2">إعلانات {sellerName} ({sellerListings.length})</h3>
            <div className="space-y-2">
              {sellerListings.slice(0, 5).map((l) => (
                <Link key={l.id} to="/market/$listingId" params={{ listingId: l.id }}
                  className="flex justify-between items-center rounded-xl bg-card border p-3">
                  <div>
                    <p className="text-sm font-bold">{l.title}</p>
                    <p className="text-xs text-muted-foreground">{l.weightG}غ · {l.region}</p>
                  </div>
                  <span className="font-bold text-orange">{l.priceDh} د.م</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="p-4 border-t bg-card">
        <button onClick={contact} className="w-full rounded-full bg-orange text-white py-3 font-bold flex items-center justify-center gap-2">
          <MessageCircle className="h-4 w-4" /> راسل البائع
        </button>
      </footer>
    </div>
  );
}

function Stat({ label, value, icon: Icon }: any) {
  return (
    <div className="rounded-xl bg-white/10 p-2 text-center">
      <p className="text-lg font-black flex items-center justify-center gap-1">
        {Icon && <Icon className="h-3 w-3" />} {value}
      </p>
      <p className="text-[10px] text-warm/60">{label}</p>
    </div>
  );
}
