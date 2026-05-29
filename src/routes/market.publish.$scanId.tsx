import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useApp } from "@/lib/store";
import { MeteoriteThumb } from "@/components/tissint/meteorite-thumb";
import {
  ChevronRight, Camera, X, Info, MapPin, Weight, Tag, FileText,
  ShieldCheck, Sparkles, Wand2, TrendingUp, PartyPopper, Share2,
} from "lucide-react";
import { toast } from "sonner";
import type { PriceMode } from "@/lib/tissint-types";

export const Route = createFileRoute("/market/publish/$scanId")({ component: PublishPage });

const REGIONS = ["ورزازات", "الرشيدية", "كلميم", "الداخلة", "العيون", "أكادير", "مراكش", "أخرى"];

// Base price per gram (DH) by classification family
const PRICE_TABLE: { match: RegExp; basePerG: number; label: string }[] = [
  { match: /pallasite|باللاسيت/i, basePerG: 380, label: "Pallasite" },
  { match: /martian|martien|mars|مريخ/i, basePerG: 1200, label: "Martian" },
  { match: /lunar|قمر/i, basePerG: 900, label: "Lunar" },
  { match: /achondrit|achondrite/i, basePerG: 220, label: "Achondrite" },
  { match: /chondrite|شوندريت|H5|H6|L5|L6/i, basePerG: 35, label: "Chondrite" },
];

function suggestPrice(classification: string, weightG: number, rare: boolean) {
  const entry = PRICE_TABLE.find((p) => p.match.test(classification)) ?? PRICE_TABLE[PRICE_TABLE.length - 1];
  const raw = entry.basePerG * weightG * (rare ? 1.6 : 1);
  return { price: Math.max(50, Math.round(raw / 10) * 10), family: entry.label, basePerG: entry.basePerG };
}

function PublishPage() {
  const { scanId } = Route.useParams();
  const { lastScan, collection, listings, addListing, userName } = useApp();
  const nav = useNavigate();

  const source = lastScan?.scanId === scanId ? lastScan : collection.find((c) => c.scanId === scanId);
  const isCertified = !!source && source.score >= 85;
  const isRare = (lastScan?.scanId === scanId && lastScan?.isRare) || false;

  // Defaults pre-filled from scan
  const defaultWeight = isRare ? "180" : "120";
  const [title, setTitle] = useState(source?.classification || "");
  const [weight, setWeight] = useState(defaultWeight);
  const suggestion = useMemo(
    () => suggestPrice(source?.classification || "", parseFloat(weight) || 0, isRare),
    [source, weight, isRare],
  );
  const [price, setPrice] = useState(String(suggestion.price));
  const [mode, setMode] = useState<PriceMode>("fixed");
  const [region, setRegion] = useState(REGIONS[0]);
  const [description, setDescription] = useState(
    isCertified
      ? `عينة موثّقة من تيسينت (نقاط الثقة ${source?.score}/100). ${source?.classification}. تم التحقق من المعايير الخارجية والداخلية.`
      : "",
  );
  const [photos, setPhotos] = useState<string[]>([source?.imageSeed || "stone-1"]);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<null | { id: string }>(null);

  const crossSell = useMemo(
    () =>
      listings
        .filter((l) => l.status === "approved" && l.classification === source?.classification)
        .slice(0, 3),
    [listings, source],
  );

  if (!source) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center" dir="rtl">
        <p className="text-sm text-muted-foreground mb-4">لم يتم العثور على المسح</p>
        <Link to="/scan" className="rounded-full bg-orange px-5 py-2 text-white text-sm">العودة للمسح</Link>
      </div>
    );
  }

  const addPhoto = () => setPhotos([...photos, `extra-${Date.now()}`]);
  const removePhoto = (i: number) => setPhotos(photos.filter((_, idx) => idx !== i));

  const applySuggestion = () => {
    setPrice(String(suggestion.price));
    toast.success(`السعر المقترح: ${suggestion.price} د.م`);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !weight || !price) { toast.error("الرجاء إكمال الحقول المطلوبة"); return; }
    if (!agree) { toast.error("الرجاء قبول شروط البيع"); return; }
    setLoading(true);
    const id = "list-" + Date.now();
    setTimeout(() => {
      addListing({
        id, scanId, title,
        classification: source.classification,
        weightG: parseFloat(weight),
        priceDh: parseFloat(price),
        priceMode: mode, region,
        sellerName: userName, sellerVerified: isCertified,
        score: source.score,
        status: isCertified ? "approved" : "pending",
        imageSeed: photos[0],
        createdAt: new Date().toISOString(),
        description,
      });
      setLoading(false);
      setSuccess({ id });
    }, 700);
  };

  if (success) {
    return (
      <SuccessOverlay
        listingId={success.id}
        title={title}
        price={parseFloat(price)}
        imageSeed={photos[0]}
        certified={isCertified}
        crossSell={crossSell}
        onClose={() => nav({ to: "/market/my-listings" })}
      />
    );
  }

  return (
    <div className="flex h-full flex-col bg-warm" dir="rtl">
      <header className="bg-navy text-warm px-5 pt-12 pb-4 flex items-center justify-between rounded-b-2xl">
        <Link to="/scan/result/$scanId" params={{ scanId }} className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
          <ChevronRight className="h-5 w-5" />
        </Link>
        <h1 className="font-bold">نشر في السوق</h1>
        <div className="w-10" />
      </header>

      <form onSubmit={submit} className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Prefill banner (scenario 3) */}
        {isCertified && (
          <div className="rounded-2xl bg-gradient-to-l from-success/15 via-gold/10 to-orange/10 border-2 border-success/40 p-4 animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-success" />
              <span className="text-xs font-bold text-success">موثّق تيسينت — تم التعبئة التلقائية</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              تم نقل التصنيف والصورة وشهادة المصداقية تلقائياً. عدّل الوزن والسعر فقط.
            </p>
          </div>
        )}

        {/* Source preview */}
        <div className="rounded-2xl bg-card border border-border p-3 flex items-center gap-3 relative overflow-hidden">
          <MeteoriteThumb seed={source.imageSeed} className="h-16 w-16 rounded-xl" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">المصدر</p>
            <p className="font-bold text-sm truncate">{source.classification}</p>
            <p className="text-xs text-orange font-bold">النتيجة: {source.score}/100</p>
          </div>
          {isCertified && (
            <span className="absolute top-2 left-2 rounded-full bg-success text-success-foreground text-[9px] font-bold px-2 py-0.5 flex items-center gap-1">
              <ShieldCheck className="h-2.5 w-2.5" /> موثّق
            </span>
          )}
          {isRare && (
            <span className="absolute bottom-2 left-2 rounded-full bg-gold text-white text-[9px] font-bold px-2 py-0.5">⭐ نادرة</span>
          )}
        </div>

        {/* Photos */}
        <Section title="الصور (1-6)" icon={Camera}>
          <div className="grid grid-cols-3 gap-2">
            {photos.map((p, i) => (
              <div key={i} className="relative aspect-square">
                <MeteoriteThumb seed={p} className="h-full w-full rounded-xl" />
                {i > 0 && (
                  <button type="button" onClick={() => removePhoto(i)}
                    className="absolute -top-1 -right-1 grid h-6 w-6 place-items-center rounded-full bg-destructive text-white">
                    <X className="h-3 w-3" />
                  </button>
                )}
                {i === 0 && <span className="absolute bottom-1 right-1 rounded bg-orange text-white text-[9px] px-1.5 py-0.5 font-bold">الرئيسية</span>}
              </div>
            ))}
            {photos.length < 6 && (
              <button type="button" onClick={addPhoto}
                className="aspect-square rounded-xl border-2 border-dashed border-border grid place-items-center text-muted-foreground hover:border-orange hover:text-orange">
                <Camera className="h-6 w-6" />
              </button>
            )}
          </div>
        </Section>

        <Section title="معلومات العينة" icon={Tag}>
          <Field label="عنوان الإعلان *">
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: شوندريت H5 — ورزازات" className={inputCls} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="الوزن (غرام) *" icon={Weight}>
              <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)}
                placeholder="125" className={inputCls} />
            </Field>
            <Field label="المنطقة" icon={MapPin}>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls}>
                {REGIONS.map((r) => <option key={r}>{r}</option>)}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="السعر" icon={Tag}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {([
              { v: "fixed" as const, l: "ثابت" },
              { v: "negotiable" as const, l: "قابل للتفاوض" },
              { v: "auction" as const, l: "مزاد" },
            ]).map((o) => (
              <button key={o.v} type="button" onClick={() => setMode(o.v)}
                className={`rounded-xl py-2 text-xs font-bold border-2 ${mode === o.v ? "border-orange bg-orange/10 text-orange" : "border-border bg-card text-muted-foreground"}`}>
                {o.l}
              </button>
            ))}
          </div>

          {/* AI suggested price */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-3 mb-3">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-[11px] font-bold flex items-center gap-1 text-primary">
                <Wand2 className="h-3 w-3" /> اقتراح ذكي
              </span>
              <button type="button" onClick={applySuggestion}
                className="rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1">
                تطبيق
              </button>
            </div>
            <p className="text-sm font-bold tabular-nums">{suggestion.price.toLocaleString()} د.م</p>
            <p className="text-[10px] text-muted-foreground">
              {suggestion.family} · {suggestion.basePerG} د.م/غ {isRare && "× 1.6 (نادرة)"}
            </p>
          </div>

          <Field label={mode === "auction" ? "السعر الابتدائي (درهم) *" : "السعر (درهم) *"}>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
              placeholder="2500" className={inputCls} />
          </Field>
          {price && (
            <p className="text-[11px] text-muted-foreground -mt-2">
              عمولة المنصة (5%): <span className="font-bold text-stone">{(parseFloat(price) * 0.05).toFixed(0)} د.م</span> ·
              صافي: <span className="font-bold text-orange">{(parseFloat(price) * 0.95).toFixed(0)} د.م</span>
            </p>
          )}
        </Section>

        <Section title="الوصف" icon={FileText}>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            rows={4} maxLength={500} placeholder="اذكر تفاصيل العثور، التاريخ، الحالة، الشهادات…"
            className={`${inputCls} resize-none`} />
          <p className="text-[10px] text-muted-foreground text-left mt-1">{description.length}/500</p>
        </Section>

        {/* Cross-sell preview */}
        {crossSell.length > 0 && (
          <section className="rounded-2xl bg-card border border-border p-4">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange" /> أسعار مماثلة في السوق
            </h3>
            <div className="space-y-2">
              {crossSell.map((l) => (
                <div key={l.id} className="flex items-center gap-3 rounded-xl bg-warm/40 p-2">
                  <MeteoriteThumb seed={l.imageSeed} className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{l.title}</p>
                    <p className="text-[10px] text-muted-foreground">{l.weightG} غ · {l.region}</p>
                  </div>
                  <p className="text-sm font-bold text-orange tabular-nums">{l.priceDh.toLocaleString()} د.م</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="rounded-xl bg-gold/10 border border-gold/30 p-3 flex gap-2 text-xs">
          <Info className="h-4 w-4 text-gold shrink-0 mt-0.5" />
          <p className="text-stone/80">
            {isCertified
              ? "العينات الموثّقة تُنشر فوراً بدون مراجعة."
              : "سيتم مراجعة إعلانك من طرف فريق Tissint خلال 24 ساعة قبل النشر."}
          </p>
        </div>

        <label className="flex items-start gap-2 text-xs text-stone/70">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-orange" />
          <span>أؤكد أن العينة مطابقة للوصف، وأوافق على <span className="text-orange font-bold">شروط البيع</span> وعمولة 5%.</span>
        </label>

        <button type="submit" disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-orange to-gold text-white py-3.5 font-bold shadow-md disabled:opacity-50">
          {loading ? "..." : isCertified ? "نشر فوري" : "إرسال للمراجعة"}
        </button>
      </form>
    </div>
  );
}

// ============================================================
// Success overlay with confetti animation + cross-sell
// ============================================================
function SuccessOverlay({
  listingId, title, price, imageSeed, certified, crossSell, onClose,
}: {
  listingId: string; title: string; price: number; imageSeed: string;
  certified: boolean; crossSell: ReturnType<typeof useApp>["listings"]; onClose: () => void;
}) {
  return (
    <div className="flex h-full flex-col bg-gradient-to-b from-success/10 via-warm to-warm overflow-y-auto" dir="rtl">
      {/* Confetti */}
      <div className="relative h-48 overflow-hidden">
        {Array.from({ length: 24 }).map((_, i) => (
          <span
            key={i}
            className="absolute top-0 block w-2 h-3 rounded-sm animate-fade-in"
            style={{
              left: `${(i * 4.2) % 100}%`,
              background: ["#e85d3a", "#c9a84c", "#2dd4a8", "#4f46e5"][i % 4],
              transform: `translateY(${20 + (i * 13) % 100}px) rotate(${i * 30}deg)`,
              animationDelay: `${(i * 60)}ms`,
              animationDuration: "900ms",
            }}
          />
        ))}
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-success text-success-foreground shadow-2xl animate-scale-in">
            <PartyPopper className="h-12 w-12" />
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 space-y-5">
        <div className="text-center animate-fade-in">
          <h1 className="text-2xl font-black mb-1">🎉 تم النشر بنجاح!</h1>
          <p className="text-sm text-muted-foreground">
            {certified ? "إعلانك مباشر على السوق الآن" : "إعلانك قيد المراجعة"}
          </p>
        </div>

        {/* Card preview */}
        <div className="rounded-2xl bg-card border-2 border-success/30 p-4 shadow-xl animate-scale-in">
          <div className="flex items-center gap-3">
            <MeteoriteThumb seed={imageSeed} className="h-20 w-20 rounded-xl" />
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground">{certified ? "منشور" : "قيد المراجعة"}</p>
              <p className="font-bold text-sm truncate">{title}</p>
              <p className="text-lg font-black text-orange tabular-nums">{price.toLocaleString()} د.م</p>
            </div>
            {certified && (
              <span className="rounded-full bg-success text-success-foreground text-[9px] font-bold px-2 py-1 flex items-center gap-1 shrink-0">
                <ShieldCheck className="h-2.5 w-2.5" /> موثّق
              </span>
            )}
          </div>
        </div>

        {/* Share row */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(`https://tissint.app/market/${listingId}`);
              toast.success("تم نسخ الرابط");
            }}
            className="rounded-xl border border-border bg-card py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Share2 className="h-3.5 w-3.5" /> مشاركة
          </button>
          <Link
            to="/market/$listingId"
            params={{ listingId }}
            className="rounded-xl border border-border bg-card py-2.5 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Sparkles className="h-3.5 w-3.5" /> معاينة
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-navy text-warm py-2.5 text-xs font-bold"
          >
            إعلاناتي
          </button>
        </div>

        {/* Cross-sell */}
        {crossSell.length > 0 && (
          <section className="rounded-2xl bg-card border border-border p-4">
            <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange" /> منافسوك في نفس التصنيف
            </h3>
            <div className="space-y-2">
              {crossSell.map((l) => (
                <Link
                  key={l.id}
                  to="/market/$listingId"
                  params={{ listingId: l.id }}
                  className="flex items-center gap-3 rounded-xl bg-warm/40 p-2 hover:bg-warm/60 transition"
                >
                  <MeteoriteThumb seed={l.imageSeed} className="h-10 w-10 rounded-lg" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold truncate">{l.title}</p>
                    <p className="text-[10px] text-muted-foreground">{l.weightG} غ · {l.region}</p>
                  </div>
                  <p className="text-sm font-bold text-orange tabular-nums">{l.priceDh.toLocaleString()}</p>
                </Link>
              ))}
            </div>
            <Link
              to="/market"
              className="mt-3 block text-center text-xs font-bold text-primary"
            >
              استكشف السوق ←
            </Link>
          </section>
        )}

        <div className="h-6" />
      </div>
    </div>
  );
}

const inputCls = "w-full rounded-xl border border-stone/15 bg-white px-3 py-2.5 text-sm outline-none focus:border-orange focus:ring-2 focus:ring-orange/20";

function Section({ title, icon: Icon, children }: { title: string; icon: any; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-card border border-border p-4 space-y-3">
      <h3 className="text-sm font-bold flex items-center gap-2">
        <Icon className="h-4 w-4 text-orange" /> {title}
      </h3>
      {children}
    </section>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon?: any; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-bold text-stone/70 mb-1 flex items-center gap-1">
        {Icon && <Icon className="h-3 w-3" />} {label}
      </span>
      {children}
    </label>
  );
}
