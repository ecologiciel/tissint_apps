import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { MobileImageFile } from "@tissint/api-client";
import { useApp } from "@/lib/store";
import {
  getSavedWebSession,
  getWebQuota,
  scanWebExterior,
  webApiErrorMessage,
} from "@/lib/server-api";
import {
  AlertCircle,
  Camera,
  Check,
  ChevronRight,
  ImagePlus,
  Loader2,
  MapPin,
  Magnet,
  RotateCcw,
  Scale,
  Scissors,
  Sparkles,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/scan")({ component: ScanPage });

type ScanStep = 1 | 2 | 3;
type CaptureMode = "upload" | "camera";

type Shot = {
  id: string;
  label: string;
  optional?: boolean;
  uri?: string;
  file?: File;
  source?: CaptureMode;
};

const MAX_EXTERIOR_IMAGES = 8;
const SCAN_PROXY_LIMIT_BYTES = Math.floor(4.35 * 1024 * 1024);
const SCAN_SOURCE_LIMIT_BYTES = 15 * 1024 * 1024;
const SCAN_FORM_OVERHEAD_BYTES = 256 * 1024;
const SCAN_MIN_IMAGE_BYTES = 360 * 1024;

const REQUIRED_SHOTS: Shot[] = [
  { id: "front", label: "الوجه الرئيسي" },
  { id: "side", label: "الجانب" },
  { id: "back", label: "الوجه الآخر" },
];
const OPTIONAL_SHOT: Shot = { id: "cut", label: "صورة مقطع", optional: true };

function ScanPage() {
  const nav = useNavigate();
  const { scenario, scansToday, dailyLimit, role, incrementScans, setLastScan, setServerQuota } =
    useApp();
  const [shots, setShots] = useState<Shot[]>([...REQUIRED_SHOTS, OPTIONAL_SHOT]);
  const [step, setStep] = useState<ScanStep>(1);
  const [activeIdx, setActiveIdx] = useState(0);
  const [permission, setPermission] = useState<"idle" | "granted" | "denied">("idle");
  const [captureMode, setCaptureMode] = useState<CaptureMode>("upload");
  const [scanning, setScanning] = useState(false);
  const [scanPhase, setScanPhase] = useState<"upload" | "analyze">("upload");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [weight, setWeight] = useState("");
  const [magnetism, setMagnetism] = useState<"unknown" | "none" | "weak" | "strong">("unknown");
  const [region, setRegion] = useState("طاطا");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const exteriorInputRef = useRef<HTMLInputElement | null>(null);
  const interiorInputRef = useRef<HTMLInputElement | null>(null);

  const indexedExteriorShots = useMemo(
    () => shots.map((shot, index) => ({ shot, index })).filter(({ shot }) => !shot.optional),
    [shots],
  );
  const exteriorTaken = indexedExteriorShots.filter(({ shot }) => shot.file).length;
  const optionalIndex = shots.findIndex((shot) => shot.optional);
  const optionalShot = optionalIndex >= 0 ? shots[optionalIndex] : undefined;
  const activeShot = shots[activeIdx] ?? shots[0];
  const blocked = scansToday >= dailyLimit && role !== "premium" && role !== "admin";
  const canAnalyze = exteriorTaken >= 3 && !scanning && !blocked;

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const startCamera = async (targetIndex?: number) => {
    if (typeof targetIndex === "number") setActiveIdx(targetIndex);
    try {
      stopCamera();
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
      setCaptureMode("camera");
    } catch {
      setPermission("denied");
      setCaptureMode("camera");
    }
  };

  useEffect(() => () => stopCamera(), []);

  const switchToUpload = () => {
    stopCamera();
    setCaptureMode("upload");
  };

  const addExtraSlot = async (openCamera = false) => {
    const exteriorTotal = indexedExteriorShots.length;
    if (exteriorTotal >= MAX_EXTERIOR_IMAGES) {
      toast(`الحد الأقصى هو ${MAX_EXTERIOR_IMAGES} صور`);
      return;
    }
    const insertAt = optionalIndex >= 0 ? optionalIndex : shots.length;
    const nextShot: Shot = {
      id: `extra-${Date.now()}`,
      label: `إضافية ${exteriorTotal + 1}`,
    };
    setShots((current) => {
      const cutIndex = current.findIndex((shot) => shot.optional);
      const index = cutIndex >= 0 ? cutIndex : current.length;
      return [...current.slice(0, index), nextShot, ...current.slice(index)];
    });
    setActiveIdx(insertAt);
    if (openCamera) await startCamera(insertAt);
  };

  const updateShot = (idx: number, patch: Partial<Shot>) => {
    setShots((current) =>
      current.map((shot, index) => (index === idx ? { ...shot, ...patch } : shot)),
    );
  };

  const clearShot = (idx: number) => {
    const target = shots[idx];
    if (!target) return;
    setShots((current) => {
      const currentShot = current[idx];
      if (currentShot && !currentShot.optional && currentShot.id.startsWith("extra-")) {
        return current.filter((_, index) => index !== idx);
      }
      return current.map((shot, index) =>
        index === idx ? { ...shot, uri: undefined, file: undefined, source: undefined } : shot,
      );
    });
    setActiveIdx(Math.max(0, Math.min(idx, shots.length - 2)));
  };

  const capture = async () => {
    if (permission !== "granted" || !videoRef.current) {
      await startCamera(activeIdx);
      return;
    }

    const video = videoRef.current;
    const sourceWidth = video.videoWidth || 1280;
    const sourceHeight = video.videoHeight || 960;
    const scale = Math.min(1, 1440 / Math.max(sourceWidth, sourceHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sourceWidth * scale));
    canvas.height = Math.max(1, Math.round(sourceHeight * scale));
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      toast.error("تعذر التقاط الصورة");
      return;
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const blob = await canvasToBlob(canvas, "image/jpeg", 0.82);
    const file = new File([blob], `${activeShot.id}-${Date.now()}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
    const uri = await fileToDataUrl(file);
    updateShot(activeIdx, { file, uri, source: "camera" });
    toast.success("تم اعتماد الصورة");

    if (activeShot.optional) {
      switchToUpload();
      return;
    }

    const next = shots.findIndex((shot, index) => index !== activeIdx && !shot.optional && !shot.file);
    if (next >= 0) setActiveIdx(next);
  };

  const handleExteriorFiles = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (selected.length === 0) return;

    const capacity = MAX_EXTERIOR_IMAGES - exteriorTaken;
    if (capacity <= 0) {
      toast(`الحد الأقصى هو ${MAX_EXTERIOR_IMAGES} صور`);
      return;
    }

    const valid = selected.filter((file) => isAllowedImage(file) && file.size <= SCAN_SOURCE_LIMIT_BYTES);
    if (valid.length < selected.length) {
      toast.error("يُقبل فقط JPEG/PNG بحجم 15 Mo كحد أقصى");
    }
    const accepted = valid.slice(0, capacity);
    if (accepted.length < valid.length) toast(`تم الاحتفاظ بأول ${capacity} صور فقط`);
    if (accepted.length === 0) return;

    const prepared = await Promise.all(
      accepted.map(async (file) => ({
        file,
        uri: await fileToDataUrl(file),
      })),
    );

    setShots((current) => {
      let next = [...current];
      for (const item of prepared) {
        let slot = next.findIndex((shot) => !shot.optional && !shot.file);
        if (slot < 0) {
          const cutIndex = next.findIndex((shot) => shot.optional);
          slot = cutIndex >= 0 ? cutIndex : next.length;
          const exteriorTotal = next.filter((shot) => !shot.optional).length;
          next = [
            ...next.slice(0, slot),
            { id: `extra-${Date.now()}-${slot}`, label: `إضافية ${exteriorTotal + 1}` },
            ...next.slice(slot),
          ];
        }
        next[slot] = {
          ...next[slot],
          file: item.file,
          uri: item.uri,
          source: "upload",
        };
      }
      return next;
    });
    switchToUpload();
    toast.success(`تم اختيار ${accepted.length} صورة`);
  };

  const handleInteriorFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isAllowedImage(file) || file.size > SCAN_SOURCE_LIMIT_BYTES) {
      toast.error("يُقبل فقط JPEG/PNG بحجم 15 Mo كحد أقصى");
      return;
    }
    const uri = await fileToDataUrl(file);
    if (optionalIndex >= 0) {
      updateShot(optionalIndex, { file, uri, source: "upload" });
      setActiveIdx(optionalIndex);
      switchToUpload();
      toast.success("تمت إضافة صورة المقطع");
    }
  };

  const goNext = () => {
    if (step === 1 && exteriorTaken < 3) {
      toast("أضف 3 صور خارجية على الأقل");
      return;
    }
    switchToUpload();
    setStep((current) => Math.min(3, current + 1) as ScanStep);
  };

  const goBack = () => {
    switchToUpload();
    setStep((current) => Math.max(1, current - 1) as ScanStep);
  };

  const startAnalyze = async () => {
    if (!canAnalyze) {
      if (exteriorTaken < 3) toast.error("أضف 3 صور خارجية على الأقل");
      else if (blocked) toast.error("بلغت الحد اليومي. ترق إلى Premium.");
      return;
    }

    setScanning(true);
    setScanPhase("upload");
    setUploadProgress(4);
    try {
      const session = getSavedWebSession();
      const exteriorShotFiles = indexedExteriorShots.filter(({ shot }) => shot.file);
      const interiorShot = optionalShot?.file ? optionalShot : undefined;
      const exteriorFilesRaw = exteriorShotFiles.map(({ shot }) => shot.file!);
      const interiorFileRaw = interiorShot?.file;

      setUploadProgress(24);
      const prepared = await prepareScanUploadFiles(exteriorFilesRaw, interiorFileRaw);
      setUploadProgress(54);
      const exteriorFiles = await Promise.all(
        prepared.exterior.map((file, index) =>
          fileToMobileImageFile(file, exteriorShotFiles[index]?.shot.id ?? `photo-${index + 1}`),
        ),
      );
      const interiorFile = prepared.interior
        ? await fileToMobileImageFile(prepared.interior, "interior")
        : undefined;
      setUploadProgress(78);

      const parsedWeight = Number.parseFloat(weight.replace(",", "."));
      const result = await scanWebExterior(
        {
          metadata: {
            clientUuid: `web-${scenario}-${Date.now()}`,
            userId: session?.user.id,
            weightGram: Number.isFinite(parsedWeight) ? parsedWeight : undefined,
            magnetic: magnetism === "unknown" ? undefined : magnetism !== "none",
            region,
          },
          exteriorFiles,
          interiorFile,
        },
        scenario,
        exteriorFiles[0]?.uri,
      );
      setUploadProgress(100);
      setScanPhase("analyze");
      try {
        setServerQuota(await getWebQuota());
      } catch {
        incrementScans();
      }
      setLastScan(result);
      if (result.score < 50) {
        await nav({ to: "/scan/failed/$scanId", params: { scanId: result.scanId } });
      } else {
        await nav({ to: "/scan/success/$scanId", params: { scanId: result.scanId } });
      }
    } catch (error) {
      toast.error(webApiErrorMessage(error, "تعذر التحليل"));
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-stone text-warm" dir="rtl">
      <input
        ref={exteriorInputRef}
        type="file"
        accept="image/jpeg,image/png,image/*"
        multiple
        className="hidden"
        onChange={handleExteriorFiles}
      />
      <input
        ref={interiorInputRef}
        type="file"
        accept="image/jpeg,image/png,image/*"
        className="hidden"
        onChange={handleInteriorFile}
      />

      <header className="z-20 flex items-center justify-between px-5 pb-4 pt-12">
        <Link
          to="/dashboard"
          onClick={switchToUpload}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 backdrop-blur"
        >
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div className="text-center">
          <p className="text-[11px] font-bold text-gold">الخطوة {step} من 3</p>
          <h1 className="text-base font-black">
            {step === 1 ? "صور خارجية" : step === 2 ? "بيانات العينة" : "صورة داخلية"}
          </h1>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1.5 text-[11px] text-warm/75">
          {scansToday}/{dailyLimit >= 999 ? "∞" : dailyLimit}
        </div>
      </header>

      <div className="mx-5 h-1 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-l from-orange to-gold transition-all"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <main className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        {step === 1 && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                  <ImagePlus className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black">
                    {exteriorTaken >= 3
                      ? `تم اختيار ${exteriorTaken} صور`
                      : "اختيار صور للاختبار"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-warm/60">
                    يمكن رفع 3 إلى {MAX_EXTERIOR_IMAGES} صور من الجهاز، أو استخدام الكاميرا عند
                    الحاجة.
                  </p>
                </div>
              </div>
            </section>

            {captureMode === "camera" && (
              <CameraPanel
                permission={permission}
                activeShot={activeShot}
                videoRef={videoRef}
                onCapture={capture}
                onRetry={() => startCamera(activeIdx)}
                onClose={switchToUpload}
                scanning={scanning}
              />
            )}

            <div className="grid grid-cols-3 gap-2">
              {indexedExteriorShots.map(({ shot, index }, displayIndex) => (
                <PhotoTile
                  key={shot.id}
                  shot={shot}
                  label={displayIndex < 3 ? shot.label : `إضافية ${displayIndex + 1}`}
                  active={index === activeIdx && captureMode === "camera"}
                  required={displayIndex < 3}
                  onOpenCamera={() => startCamera(index)}
                  onClear={() => clearShot(index)}
                />
              ))}
              {indexedExteriorShots.length < MAX_EXTERIOR_IMAGES && (
                <button
                  type="button"
                  onClick={() => exteriorInputRef.current?.click()}
                  className="aspect-square rounded-2xl border border-dashed border-gold/50 bg-white/5 text-gold"
                >
                  <span className="flex h-full flex-col items-center justify-center gap-2 text-xs font-black">
                    <Upload className="h-5 w-5" />
                    إضافة صور
                  </span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl border border-dashed border-gold/40 bg-white/5 p-3">
              <button
                type="button"
                onClick={() => exteriorInputRef.current?.click()}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-black text-gold"
              >
                <Upload className="h-4 w-4" />
                إضافة صور
              </button>
              <button
                type="button"
                onClick={() => {
                  const nextEmpty =
                    indexedExteriorShots.find(({ shot }) => !shot.file)?.index ?? activeIdx;
                  void startCamera(nextEmpty);
                }}
                className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-black"
              >
                <Camera className="h-4 w-4" />
                استخدام الكاميرا
              </button>
            </div>

            {indexedExteriorShots.length < MAX_EXTERIOR_IMAGES && exteriorTaken >= 3 && (
              <button
                type="button"
                onClick={() => addExtraSlot(captureMode === "camera")}
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-black text-warm"
              >
                إضافة خانة تصوير أخرى
              </button>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-warm/70">
              البيانات الإضافية اختيارية، لكنها تساعد الخادم على تحسين قراءة العينة وربطها بمنطقة
              الاكتشاف.
            </section>

            <label className="block space-y-2">
              <span className="flex items-center gap-2 text-xs font-bold text-warm/70">
                <Scale className="h-4 w-4" /> الوزن بالغرام
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(event) => setWeight(event.target.value)}
                placeholder="مثال: 125"
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm outline-none"
                dir="ltr"
              />
            </label>

            <div className="space-y-2">
              <span className="flex items-center gap-2 text-xs font-bold text-warm/70">
                <Magnet className="h-4 w-4" /> التصرف المغناطيسي
              </span>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    ["unknown", "غير معروف"],
                    ["none", "غير مغناطيسي"],
                    ["weak", "مغناطيسي متوسط"],
                    ["strong", "مغناطيسي قوي"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setMagnetism(value)}
                    className={`rounded-xl border px-3 py-3 text-xs font-black ${
                      magnetism === value
                        ? "border-orange bg-orange text-white"
                        : "border-white/10 bg-white/5 text-warm"
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block space-y-2">
              <span className="flex items-center gap-2 text-xs font-bold text-warm/70">
                <MapPin className="h-4 w-4" /> منطقة الاكتشاف
              </span>
              <input
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm outline-none"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold/15 text-gold">
                  <Scissors className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-black">صورة المقطع الداخلي اختيارية</p>
                  <p className="mt-1 text-xs leading-5 text-warm/60">
                    أضف صورة الشق أو القطع الداخلي إن كانت متاحة. يمكنك تخطي هذه الخطوة.
                  </p>
                </div>
              </div>
            </section>

            {captureMode === "camera" && optionalShot?.optional && (
              <CameraPanel
                permission={permission}
                activeShot={optionalShot}
                videoRef={videoRef}
                onCapture={capture}
                onRetry={() => startCamera(optionalIndex)}
                onClose={switchToUpload}
                scanning={scanning}
              />
            )}

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5">
              {optionalShot?.uri ? (
                <div className="relative aspect-[4/3] bg-black">
                  <img src={optionalShot.uri} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => optionalIndex >= 0 && clearShot(optionalIndex)}
                    className="absolute left-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="grid aspect-[4/3] place-items-center text-center">
                  <div className="space-y-2">
                    <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/10 text-gold">
                      <Scissors className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-black">لم تتم إضافة صورة داخلية</p>
                    <p className="text-xs text-warm/50">هذه الخطوة اختيارية</p>
                  </div>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 p-3">
                <button
                  type="button"
                  onClick={() => interiorInputRef.current?.click()}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-black text-gold"
                >
                  <Upload className="h-4 w-4" />
                  رفع صورة
                </button>
                <button
                  type="button"
                  onClick={() => optionalIndex >= 0 && startCamera(optionalIndex)}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white/10 text-sm font-black"
                >
                  <Camera className="h-4 w-4" />
                  التقاط صورة
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="absolute bottom-0 left-0 right-0 z-20 flex gap-2 border-t border-white/10 bg-stone/95 px-4 pb-6 pt-3 backdrop-blur">
        {step > 1 && (
          <button
            type="button"
            onClick={goBack}
            className="rounded-2xl bg-white/10 px-5 py-3 text-sm font-black"
          >
            رجوع
          </button>
        )}
        {step < 3 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={step === 1 && exteriorTaken < 3}
            className="flex-1 rounded-2xl bg-gradient-to-l from-orange to-gold py-3 text-sm font-black text-white disabled:opacity-40"
          >
            التالي
          </button>
        ) : (
          <button
            type="button"
            onClick={startAnalyze}
            disabled={!canAnalyze}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-orange to-gold py-3 text-sm font-black text-white disabled:opacity-40"
          >
            {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            تحليل العينة
          </button>
        )}
      </footer>

      {blocked && (
        <div className="absolute bottom-24 left-4 right-4 z-20 rounded-2xl border border-destructive bg-destructive/20 p-3 text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <span className="flex-1">بلغت الحد اليومي ({dailyLimit}).</span>
            <Link to="/premium" className="font-black text-orange underline">
              ترقية
            </Link>
          </div>
        </div>
      )}

      {scanning && (
        <div className="absolute inset-0 z-50 grid place-items-center bg-black/85 px-6 text-center">
          <div className="w-full max-w-xs space-y-5">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/15 bg-white/10">
              {scanPhase === "upload" ? (
                <Upload className="h-9 w-9 text-gold" />
              ) : (
                <Sparkles className="h-9 w-9 text-gold" />
              )}
            </div>
            <div>
              <p className="text-lg font-black">
                {scanPhase === "upload" ? "رفع الصور…" : "الذكاء الاصطناعي يحلل…"}
              </p>
              <p className="mt-1 text-xs text-warm/50">
                {scanPhase === "upload"
                  ? `${uploadProgress}% — ${exteriorTaken} صور`
                  : "يفحص القشرة والبنية والخصائص"}
              </p>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-l from-orange to-gold transition-all"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CameraPanel({
  permission,
  activeShot,
  videoRef,
  onCapture,
  onRetry,
  onClose,
  scanning,
}: {
  permission: "idle" | "granted" | "denied";
  activeShot: Shot;
  videoRef: RefObject<HTMLVideoElement | null>;
  onCapture: () => void;
  onRetry: () => void;
  onClose: () => void;
  scanning: boolean;
}) {
  return (
    <section className="relative h-[42vh] min-h-[320px] overflow-hidden rounded-3xl bg-black">
      {permission === "granted" ? (
        <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          {permission === "denied" ? (
            <div className="space-y-3">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/20">
                <Camera className="h-6 w-6 text-destructive" />
              </div>
              <p className="text-sm font-black">الكاميرا غير مفعلة</p>
              <p className="text-xs leading-5 text-warm/55">
                يمكنك السماح بالكاميرا أو العودة لرفع الصور من الجهاز.
              </p>
              <button
                type="button"
                onClick={onRetry}
                className="rounded-full bg-orange px-5 py-2 text-sm font-black text-white"
              >
                السماح بالوصول
              </button>
            </div>
          ) : (
            <Loader2 className="h-6 w-6 animate-spin text-warm/50" />
          )}
        </div>
      )}

      {permission === "granted" && (
        <div className="pointer-events-none absolute inset-10 rounded-2xl">
          <span className="absolute -right-1 -top-1 h-7 w-7 rounded-tr-xl border-r-4 border-t-4 border-gold" />
          <span className="absolute -left-1 -top-1 h-7 w-7 rounded-tl-xl border-l-4 border-t-4 border-gold" />
          <span className="absolute -bottom-1 -right-1 h-7 w-7 rounded-br-xl border-b-4 border-r-4 border-gold" />
          <span className="absolute -bottom-1 -left-1 h-7 w-7 rounded-bl-xl border-b-4 border-l-4 border-gold" />
        </div>
      )}

      <div className="absolute left-3 right-3 top-3 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-full bg-black/45 text-white backdrop-blur"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="rounded-full bg-black/45 px-3 py-1 text-[11px] font-bold text-warm/85 backdrop-blur">
          ضع الحجر داخل الإطار — {activeShot.label}
        </div>
      </div>

      <button
        type="button"
        onClick={onCapture}
        disabled={scanning || permission !== "granted"}
        className="absolute bottom-4 left-1/2 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full bg-white disabled:opacity-40"
        aria-label="التقاط صورة"
      >
        <span className="absolute inset-1 rounded-full border-4 border-stone" />
        <span className="h-14 w-14 rounded-full bg-white" />
      </button>
    </section>
  );
}

function PhotoTile({
  shot,
  label,
  active,
  required,
  onOpenCamera,
  onClear,
}: {
  shot: Shot;
  label: string;
  active: boolean;
  required: boolean;
  onOpenCamera: () => void;
  onClear: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpenCamera}
      className={`relative aspect-square overflow-hidden rounded-2xl border bg-white/5 ${
        active ? "border-orange" : shot.file ? "border-success" : "border-white/15"
      }`}
    >
      {shot.uri ? (
        <img src={shot.uri} alt="" className="h-full w-full object-cover" />
      ) : (
        <span className="flex h-full flex-col items-center justify-center gap-2 px-2 text-center text-[11px] font-bold text-warm/55">
          <Camera className="h-5 w-5" />
          {label}
        </span>
      )}
      <span className="absolute bottom-2 right-2 rounded-full bg-black/55 px-2 py-1 text-[10px] font-black text-white">
        {required ? label : "إضافية"}
      </span>
      {shot.file && (
        <>
          <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-success text-white">
            <Check className="h-3.5 w-3.5" />
          </span>
          <span
            onClick={(event) => {
              event.stopPropagation();
              onClear();
            }}
            className="absolute left-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white"
          >
            {shot.id.startsWith("extra-") ? (
              <Trash2 className="h-3.5 w-3.5" />
            ) : (
              <RotateCcw className="h-3.5 w-3.5" />
            )}
          </span>
        </>
      )}
    </button>
  );
}

function isAllowedImage(file: File) {
  return ["image/jpeg", "image/png"].includes(file.type) || /\.(jpe?g|png)$/i.test(file.name);
}

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة"));
    reader.readAsDataURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("تعذر ضغط الصورة"))), type, quality);
  });
}

function imageFromFile(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Image invalide"));
    };
    image.src = url;
  });
}

async function compressImageFile(file: File, targetBytes: number) {
  if (file.size <= targetBytes && file.type === "image/jpeg") return file;

  const image = await imageFromFile(file);
  let maxEdge = 2200;
  let quality = 0.92;
  let best: Blob | null = null;

  for (let attempt = 0; attempt < 9; attempt += 1) {
    const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Compression image impossible");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(image, 0, 0, width, height);

    const blob = await canvasToBlob(canvas, "image/jpeg", quality);
    if (!best || blob.size < best.size) best = blob;
    if (blob.size <= targetBytes) break;

    if (quality > 0.74) quality -= 0.06;
    else if (quality > 0.58) quality -= 0.08;
    else maxEdge = Math.max(1200, Math.round(maxEdge * 0.86));
  }

  if (!best) throw new Error("Compression image impossible");
  const outputName = file.name.replace(/\.(png|jpe?g)$/i, "") + ".jpg";
  return new File([best], outputName, {
    type: "image/jpeg",
    lastModified: file.lastModified || Date.now(),
  });
}

function estimateMultipartBytes(files: File[]) {
  return files.reduce((sum, file) => sum + file.size, SCAN_FORM_OVERHEAD_BYTES);
}

async function prepareScanUploadFiles(exteriorFiles: File[], interiorFile?: File) {
  const allFiles = [...exteriorFiles, interiorFile].filter(Boolean) as File[];
  const target = Math.max(
    SCAN_MIN_IMAGE_BYTES,
    Math.floor((SCAN_PROXY_LIMIT_BYTES - SCAN_FORM_OVERHEAD_BYTES) / Math.max(1, allFiles.length)),
  );

  const compressAll = async (imageTarget: number) => {
    const exterior: File[] = [];
    for (const file of exteriorFiles) exterior.push(await compressImageFile(file, imageTarget));
    const interior = interiorFile ? await compressImageFile(interiorFile, imageTarget) : undefined;
    return { exterior, interior };
  };

  let prepared = await compressAll(target);
  let preparedFiles = [...prepared.exterior, prepared.interior].filter(Boolean) as File[];

  if (estimateMultipartBytes(preparedFiles) > SCAN_PROXY_LIMIT_BYTES) {
    prepared = await compressAll(Math.max(SCAN_MIN_IMAGE_BYTES, Math.floor(target * 0.72)));
    preparedFiles = [...prepared.exterior, prepared.interior].filter(Boolean) as File[];
  }

  if (estimateMultipartBytes(preparedFiles) > SCAN_PROXY_LIMIT_BYTES) {
    throw new Error("Photos trop lourdes pour Vercel. Essaie 3 photos seulement ou des images plus legeres.");
  }

  return prepared;
}

async function fileToMobileImageFile(file: File, id: string): Promise<MobileImageFile> {
  return {
    uri: await fileToDataUrl(file),
    name: `${id}-${Date.now()}.jpg`,
    type: file.type === "image/png" ? "image/png" : "image/jpeg",
  };
}
