import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useApp } from "@/lib/store";
import { tissintApi } from "@/lib/tissint-api";
import {
  ChevronRight,
  Zap,
  AlertCircle,
  Camera,
  Check,
  X,
  Sparkles,
  Scissors,
  ChevronUp,
  ChevronDown,
  Scale,
  Magnet,
  MapPin,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/scan")({ component: ScanPage });

type Shot = {
  id: string;
  label: string; // "أمامية", "خلفية", "جانبية", "مقطع"
  optional?: boolean;
  uri?: string; // data URL (mock)
};

const REQUIRED_SHOTS: Shot[] = [
  { id: "front", label: "أمامية" },
  { id: "back", label: "خلفية" },
  { id: "side", label: "جانبية" },
];
const OPTIONAL_SHOT: Shot = { id: "cut", label: "صورة مقطع", optional: true };

function ScanPage() {
  const nav = useNavigate();
  const { scenario, scansToday, dailyLimit, role, incrementScans, setLastScan } = useApp();
  const [shots, setShots] = useState<Shot[]>([...REQUIRED_SHOTS, OPTIONAL_SHOT]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [permission, setPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [streamOn, setStreamOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [weight, setWeight] = useState("");
  const [magnetism, setMagnetism] = useState<"none" | "weak" | "strong">("weak");
  const [region, setRegion] = useState("طاطا");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const blocked = scansToday >= dailyLimit && role !== "premium" && role !== "admin";
  const takenRequired = shots.filter((s) => !s.optional && s.uri).length;
  const canAnalyze = takenRequired >= 3 && !scanning && !blocked;

  // request permission lazily
  const askPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setPermission("granted");
      setStreamOn(true);
    } catch {
      setPermission("denied");
    }
  };

  useEffect(() => {
    askPermission();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  const capture = () => {
    if (permission !== "granted" || !videoRef.current) {
      // mock fallback: use a gradient seed
      const seed = `mock-${shots[activeIdx].id}-${Date.now()}`;
      updateShot(activeIdx, seed);
      return;
    }
    const v = videoRef.current;
    const c = document.createElement("canvas");
    c.width = v.videoWidth || 640;
    c.height = v.videoHeight || 640;
    const ctx = c.getContext("2d");
    if (ctx) ctx.drawImage(v, 0, 0, c.width, c.height);
    const uri = c.toDataURL("image/jpeg", 0.7);
    updateShot(activeIdx, uri);
  };

  const updateShot = (idx: number, uri: string) => {
    setShots((prev) => prev.map((s, i) => (i === idx ? { ...s, uri } : s)));
    // auto-advance to next non-captured slot
    const next = shots.findIndex((s, i) => i !== idx && !s.uri);
    if (next >= 0) setActiveIdx(next);
  };

  const retake = (idx: number) => {
    setShots((prev) => prev.map((s, i) => (i === idx ? { ...s, uri: undefined } : s)));
    setActiveIdx(idx);
  };

  const startAnalyze = async () => {
    if (!canAnalyze) {
      if (takenRequired < 3) toast.error("التقط 3 صور إلزامية على الأقل");
      else if (blocked) toast.error("بلغت الحد اليومي. ترقَّ إلى Premium.");
      return;
    }
    setScanning(true);
    try {
      const result = await tissintApi.scanExterior({
        scenario,
        clientUuid: `demo-${scenario}-${Date.now()}`,
      });
      incrementScans();
      setLastScan(result);
      if (result.score < 50) {
        await nav({ to: "/scan/failed/$scanId", params: { scanId: result.scanId } });
      } else {
        await nav({ to: "/scan/success/$scanId", params: { scanId: result.scanId } });
      }
    } catch {
      toast.error("تعذّر التحليل");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-stone text-warm relative overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-12 pb-3 z-20">
        <Link
          to="/dashboard"
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div className="text-center">
          <h1 className="font-bold text-sm">التقاط العينة</h1>
          <p className="text-[11px] text-gold">صورة {takenRequired}/3 إلزامية</p>
        </div>
        <div className="text-[11px] text-warm/70 rounded-full bg-white/10 px-3 py-1.5">
          {scansToday}/{dailyLimit === 999 ? "∞" : dailyLimit}
        </div>
      </header>

      {/* Camera viewport */}
      <div
        className="relative flex-1 mx-3 rounded-3xl overflow-hidden bg-black"
        style={{
          background:
            "radial-gradient(circle at 50% 40%, oklch(0.22 0.02 250), oklch(0.08 0.01 250))",
        }}
      >
        {permission === "granted" ? (
          <video
            ref={videoRef}
            playsInline
            muted
            className="absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center text-center px-6">
            {permission === "denied" ? (
              <div className="space-y-3">
                <div className="grid h-16 w-16 place-items-center rounded-full bg-destructive/20 mx-auto">
                  <Camera className="h-7 w-7 text-destructive" />
                </div>
                <p className="text-sm font-bold">الكاميرا غير مفعلة</p>
                <p className="text-xs text-warm/60 max-w-xs">
                  يحتاج تيسنت للوصول إلى الكاميرا لالتقاط صور العينة. لا يمكن رفع صور من المعرض
                  لضمان جودة التحليل.
                </p>
                <button
                  onClick={askPermission}
                  className="rounded-full bg-orange text-white px-5 py-2 text-sm font-bold"
                >
                  السماح بالوصول
                </button>
              </div>
            ) : (
              <Loader2 className="h-6 w-6 animate-spin text-warm/50" />
            )}
          </div>
        )}

        {/* Center framing guide */}
        {permission === "granted" && (
          <div className="absolute inset-10 rounded-2xl pointer-events-none">
            <span className="absolute -top-1 -right-1 h-6 w-6 border-t-4 border-r-4 border-gold rounded-tr-xl" />
            <span className="absolute -top-1 -left-1 h-6 w-6 border-t-4 border-l-4 border-gold rounded-tl-xl" />
            <span className="absolute -bottom-1 -right-1 h-6 w-6 border-b-4 border-r-4 border-gold rounded-br-xl" />
            <span className="absolute -bottom-1 -left-1 h-6 w-6 border-b-4 border-l-4 border-gold rounded-bl-xl" />
            {scanning && (
              <div className="scanner-sweep absolute left-2 right-2 h-0.5 bg-orange shadow-[0_0_12px_oklch(0.71_0.17_50)]" />
            )}
          </div>
        )}

        {/* Top instruction */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 text-[11px] text-warm/80 bg-black/40 backdrop-blur rounded-full px-3 py-1">
          {shots[activeIdx].optional
            ? "اختياري — صورة مقطع للعينة"
            : `ضع الحجر داخل الإطار — ${shots[activeIdx].label}`}
        </div>

        {/* Shot strip */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 z-10">
          {shots.map((s, i) => {
            const isActive = i === activeIdx;
            const hasShot = !!s.uri;
            return (
              <button
                key={s.id}
                onClick={() => setActiveIdx(i)}
                className={`relative flex-1 h-16 rounded-xl border-2 overflow-hidden transition ${
                  isActive ? "border-orange" : hasShot ? "border-success" : "border-white/20"
                }`}
              >
                {hasShot && s.uri?.startsWith("data:") ? (
                  <img src={s.uri} alt={s.label} className="h-full w-full object-cover" />
                ) : hasShot ? (
                  <div
                    className="h-full w-full"
                    style={{
                      background:
                        "radial-gradient(circle, oklch(0.4 0.05 60), oklch(0.15 0.02 40))",
                    }}
                  />
                ) : (
                  <div className="h-full w-full bg-white/5 grid place-items-center">
                    <span className="text-[10px] text-warm/60">{s.label}</span>
                  </div>
                )}
                {s.optional && (
                  <span className="absolute top-1 left-1 rounded-full bg-gold/90 text-stone text-[9px] font-bold px-1.5 py-0.5 flex items-center gap-0.5">
                    <Scissors className="h-2.5 w-2.5" /> اختياري
                  </span>
                )}
                {hasShot && (
                  <span className="absolute top-1 right-1 grid h-4 w-4 place-items-center rounded-full bg-success text-white">
                    <Check className="h-2.5 w-2.5" />
                  </span>
                )}
                {hasShot && (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      retake(i);
                    }}
                    className="absolute bottom-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="px-5 pt-4 pb-3 space-y-3 z-20">
        {blocked && (
          <div className="rounded-xl bg-destructive/20 border border-destructive p-3 flex items-center gap-2 text-xs">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span>بلغت الحد اليومي ({dailyLimit}).</span>
            <Link to="/premium" className="text-orange font-bold underline">
              ترقية
            </Link>
          </div>
        )}

        <div className="flex items-center justify-center gap-6">
          {/* Metadata sheet trigger */}
          <button
            onClick={() => setSheetOpen(true)}
            className="grid h-12 w-12 place-items-center rounded-full bg-white/10 relative"
            title="بيانات العينة"
          >
            <Scale className="h-5 w-5" />
            {weight && (
              <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-success" />
            )}
          </button>

          {/* Capture button */}
          <button
            onClick={capture}
            disabled={scanning || permission !== "granted" || !!shots[activeIdx].uri}
            className="relative grid h-20 w-20 place-items-center rounded-full bg-white disabled:opacity-40"
            aria-label="التقاط صورة"
          >
            <span className="absolute inset-1 rounded-full border-4 border-stone" />
            <span className="h-14 w-14 rounded-full bg-white" />
          </button>

          {/* Analyze button */}
          <button
            onClick={startAnalyze}
            disabled={!canAnalyze}
            className="grid h-12 w-12 place-items-center rounded-full bg-orange text-white disabled:opacity-40 relative"
            title="بدء التحليل"
          >
            {scanning ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            {canAnalyze && (
              <span className="absolute inset-0 rounded-full ring-2 ring-orange/40 animate-ping" />
            )}
          </button>
        </div>

        <p className="text-center text-[11px] text-warm/60">
          {scanning
            ? "جاري التحليل بالذكاء الاصطناعي…"
            : takenRequired < 3
              ? `التقط ${3 - takenRequired} صور إضافية لتفعيل التحليل`
              : "جاهز للتحليل — اضغط الشرارة"}
        </p>
      </div>

      {/* Metadata Sheet */}
      {sheetOpen && (
        <div
          className="absolute inset-0 z-30 bg-black/60 flex items-end"
          onClick={() => setSheetOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full bg-stone border-t border-white/10 rounded-t-3xl p-5 space-y-4 animate-in slide-in-from-bottom"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold">بيانات العينة</h3>
              <button
                onClick={() => setSheetOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className="flex items-center gap-2 text-xs text-warm/70 mb-1">
                  <Scale className="h-3.5 w-3.5" /> الوزن (غرام)
                </span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="مثال: 45.2"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                />
              </label>

              <div>
                <span className="flex items-center gap-2 text-xs text-warm/70 mb-1">
                  <Magnet className="h-3.5 w-3.5" /> المغناطيسية
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      ["none", "ضعيفة جداً"],
                      ["weak", "متوسطة"],
                      ["strong", "قوية"],
                    ] as const
                  ).map(([v, l]) => (
                    <button
                      key={v}
                      onClick={() => setMagnetism(v)}
                      className={`rounded-xl py-2 text-xs font-bold border ${
                        magnetism === v
                          ? "bg-orange text-white border-orange"
                          : "bg-white/5 border-white/10"
                      }`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>

              <label className="block">
                <span className="flex items-center gap-2 text-xs text-warm/70 mb-1">
                  <MapPin className="h-3.5 w-3.5" /> منطقة الاكتشاف
                </span>
                <input
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm"
                />
              </label>
            </div>

            <button
              onClick={() => {
                setSheetOpen(false);
                toast.success("تم حفظ البيانات");
              }}
              className="w-full rounded-full bg-orange text-white py-3 font-bold text-sm"
            >
              حفظ ومتابعة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
