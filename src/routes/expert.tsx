import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { useApp } from "@/lib/store";
import {
  annotateExpertItem,
  clearExpertSession,
  expertMediaUrl,
  getExpertDatasetStats,
  getNextExpertItem,
  getSavedExpertSession,
  listExpertDatasets,
  loginExpert,
  type ExpertAnnotationAction,
  type ExpertConfidence,
  type ExpertDataset,
  type ExpertDatasetStats,
  type ExpertQueueItem,
  type ExpertSession,
  type ExpertTopLabel,
} from "@/lib/expert-api";

export const Route = createFileRoute("/expert")({ component: ExpertRoute });

const TOP_LABELS: Array<[ExpertTopLabel, string]> = [
  ["meteorite", "نيزك"],
  ["terrestrial_rock", "صخرة أرضية"],
  ["uncertain", "غير مؤكد"],
  ["unusable", "صورة غير صالحة"],
  ["non_rock", "ليست صخرة"],
];

const METEORITE_SUBCLASSES = [
  ["chondrite", "كوندريت"],
  ["carbonaceous_chondrite", "كوندريت كربونية"],
  ["achondrite", "أكوندريت"],
  ["iron_meteorite", "نيزك حديدي"],
  ["stony_iron", "نيزك حجري حديدي"],
  ["meteorite_unknown", "نيزك غير محدد"],
] as const;

const TERRESTRIAL_FAMILIES = [
  ["slag", "خبث صناعي"],
  ["hematite", "هيماتيت"],
  ["magnetite", "مغنيتيت"],
  ["basalt", "بازلت"],
  ["quartz", "كوارتز"],
  ["sedimentary_rock", "صخر رسوبي"],
  ["industrial_material", "مادة صناعية"],
  ["terrestrial_unknown", "صخر أرضي غير محدد"],
] as const;

const CONFIDENCES: Array<[ExpertConfidence, string]> = [
  ["high", "عالية"],
  ["medium", "متوسطة"],
  ["low", "ضعيفة"],
  ["not_assessed", "غير مقيّمة"],
];

function isExpertSession(session: ExpertSession | null): session is ExpertSession {
  return session?.role === "expert" || session?.role === "admin";
}

function clientUuid() {
  return `web-expert-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function scoreLabel(value?: number) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "غير متاح";
}

function ExpertRoute() {
  const { role } = useApp();
  const appRoleCanOpen = role === "expert" || role === "admin";
  const [session, setSession] = useState<ExpertSession | null>(() => getSavedExpertSession());
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [datasets, setDatasets] = useState<ExpertDataset[]>([]);
  const [datasetId, setDatasetId] = useState("");
  const [stats, setStats] = useState<ExpertDatasetStats | null>(null);
  const [item, setItem] = useState<ExpertQueueItem | null>(null);
  const [topLabel, setTopLabel] = useState<ExpertTopLabel>();
  const [subclass, setSubclass] = useState("");
  const [family, setFamily] = useState("");
  const [confidence, setConfidence] = useState<ExpertConfidence>();
  const [specimenId, setSpecimenId] = useState("");
  const [origin, setOrigin] = useState("");
  const [interiorCut, setInteriorCut] = useState("unknown");
  const [imageQuality, setImageQuality] = useState("unknown");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnnotate = isExpertSession(session);
  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === datasetId),
    [datasetId, datasets],
  );
  const annotationReady = Boolean(
    canAnnotate &&
    topLabel &&
    confidence &&
    (topLabel !== "meteorite" || subclass) &&
    (topLabel !== "terrestrial_rock" || family),
  );

  async function refresh(activeSession = session, requestedDatasetId = datasetId) {
    if (!isExpertSession(activeSession)) return;
    setLoading(true);
    setError(null);
    try {
      const available = await listExpertDatasets(activeSession);
      const nextDatasetId =
        requestedDatasetId && available.some((dataset) => dataset.id === requestedDatasetId)
          ? requestedDatasetId
          : (available[0]?.id ?? "");
      const [nextStats, nextItem] = nextDatasetId
        ? await Promise.all([
            getExpertDatasetStats(nextDatasetId, activeSession),
            getNextExpertItem(nextDatasetId, activeSession),
          ])
        : [null, null];
      setDatasets(available);
      setDatasetId(nextDatasetId);
      setStats(nextStats);
      setItem(nextItem);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل مساحة الخبير.");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
  }, []);

  useEffect(() => {
    setTopLabel(undefined);
    setSubclass("");
    setFamily("");
    setConfidence(undefined);
    setSpecimenId(item?.specimenId ?? "");
    setOrigin(String(item?.metadata?.origin ?? ""));
    setInteriorCut(String(item?.metadata?.has_interior_cut ?? "unknown"));
    setImageQuality(String(item?.metadata?.expert_image_quality ?? "unknown"));
    setComment("");
  }, [item]);

  async function submitLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const nextSession = await loginExpert(email.trim(), password);
      setSession(nextSession);
      await refresh(nextSession, "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تسجيل الدخول.");
    } finally {
      setLoading(false);
    }
  }

  async function saveAnnotation(action: ExpertAnnotationAction = "label") {
    if (!item || !session || !canAnnotate) return;
    if (action === "label" && !annotationReady) {
      setError("اختر الحكم ومستوى الثقة قبل الحفظ.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await annotateExpertItem(
        item.itemId,
        {
          clientUuid: clientUuid(),
          action,
          topLabel: action === "label" ? topLabel : undefined,
          meteoriteSubclass: action === "label" && topLabel === "meteorite" ? subclass : undefined,
          terrestrialFamily:
            action === "label" && topLabel === "terrestrial_rock" ? family : undefined,
          confidence: action === "label" ? confidence : "not_assessed",
          specimenId: specimenId.trim() || undefined,
          comment: comment.trim() || undefined,
          metadata: {
            origin: origin.trim() || "unknown",
            has_interior_cut: interiorCut,
            expert_image_quality: imageQuality,
          },
        },
        session,
      );
      await refresh(session, datasetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ التعليق.");
    } finally {
      setSaving(false);
    }
  }

  function logout() {
    clearExpertSession();
    setSession(null);
    setDatasets([]);
    setStats(null);
    setItem(null);
  }

  if (!session) {
    return (
      <div className="h-full overflow-y-auto bg-warm px-5 py-8" dir="rtl">
        <Header
          appRoleCanOpen={appRoleCanOpen}
          loading={loading}
          onRefresh={() => void refresh()}
        />
        <form
          onSubmit={submitLogin}
          className="mt-6 rounded-2xl border border-border bg-card p-4 space-y-4"
        >
          <div>
            <h1 className="text-xl font-black text-navy">تسجيل دخول الخبير</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              أدخل حساب خبير أو مدير لمراجعة الصور العلمية.
            </p>
          </div>
          {error && (
            <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
          )}
          <label className="block text-sm font-bold">
            البريد أو الهاتف
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-right"
              autoComplete="username"
              required
            />
          </label>
          <label className="block text-sm font-bold">
            كلمة المرور
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 h-11 w-full rounded-lg border border-input bg-background px-3 text-right"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-lg bg-orange px-4 text-sm font-black text-white disabled:opacity-60"
          >
            دخول إلى وضع الخبير
          </button>
        </form>
      </div>
    );
  }

  if (!canAnnotate) {
    return (
      <div className="h-full overflow-y-auto bg-warm px-5 py-8" dir="rtl">
        <Header
          appRoleCanOpen={appRoleCanOpen}
          loading={loading}
          onRefresh={() => void refresh()}
        />
        <div className="mt-6 rounded-2xl border border-warning/30 bg-card p-5 text-center">
          <ShieldCheck className="mx-auto h-9 w-9 text-warning" />
          <h1 className="mt-3 text-lg font-black text-navy">هذا الحساب غير مخول</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            التعليق العلمي متاح فقط لحسابات expert و admin.
          </p>
          <button
            onClick={logout}
            className="mt-4 rounded-lg border border-border px-4 py-2 text-sm font-bold"
          >
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-warm px-5 py-6" dir="rtl">
      <Header
        appRoleCanOpen={appRoleCanOpen}
        loading={loading}
        onRefresh={() => void refresh()}
        onLogout={logout}
      />

      {error && (
        <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>
      )}

      <section className="mt-4 rounded-2xl border border-border bg-card p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground">dataset النشط</p>
            <h2 className="text-base font-black text-navy">
              {selectedDataset?.name ?? "لا يوجد dataset"}
            </h2>
          </div>
          <ShieldCheck className="h-6 w-6 text-orange" />
        </div>
        {datasets.length > 1 && (
          <select
            value={datasetId}
            onChange={(event) => {
              setDatasetId(event.target.value);
              void refresh(session, event.target.value);
            }}
            className="h-10 w-full rounded-lg border border-input bg-background px-3 text-right text-sm"
          >
            {datasets.map((dataset) => (
              <option key={dataset.id} value={dataset.id}>
                {dataset.name}
              </option>
            ))}
          </select>
        )}
        {stats && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="مستوردة" value={stats.counts.imported ?? 0} />
            <Stat label="معلّقة" value={stats.counts.queued ?? 0} />
            <Stat label="منجزة" value={stats.counts.annotated ?? 0} />
          </div>
        )}
      </section>

      {loading && !item && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
          جاري تحميل ملف المراجعة...
        </div>
      )}

      {!loading && !item && (
        <div className="mt-4 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-black text-navy">لا توجد صورة في قائمة الانتظار</p>
          <p className="mt-1 text-sm text-muted-foreground">
            انتظر إدخال دفعة جديدة أو حدّث الصفحة.
          </p>
        </div>
      )}

      {item && (
        <section className="mt-4 rounded-2xl border border-border bg-card p-4 space-y-4">
          {item.imageUrl && (
            <img
              src={expertMediaUrl(item.imageUrl)}
              alt={item.originalFilename ?? item.itemId}
              className="h-72 w-full rounded-xl bg-muted object-contain"
            />
          )}
          <div className="text-xs text-muted-foreground">
            {item.originalFilename ?? item.itemId} · {item.status}
          </div>

          <div className="rounded-xl bg-warm p-3">
            <p className="text-sm font-black text-navy">Vision Trio</p>
            <p className="mt-1 text-2xl font-black text-orange">
              {scoreLabel(item.prediction?.meteoriteProbability)} احتمال نيزك
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              النطاق: {item.prediction?.decisionBand ?? "غير متاح"} · الفئة:{" "}
              {item.prediction?.dominantClass ?? "غير متاح"}
            </p>
            {Object.entries(item.prediction?.models ?? {}).map(([model, prediction]) => (
              <div
                key={model}
                className="mt-2 flex justify-between border-t border-border pt-2 text-xs"
              >
                <span>{model}</span>
                <span>{scoreLabel(prediction.meteoriteProbability)}</span>
              </div>
            ))}
          </div>

          <ChoiceGroup
            title="حكم الخبير"
            choices={TOP_LABELS}
            value={topLabel}
            onChange={(value) => {
              setTopLabel(value as ExpertTopLabel);
              setSubclass("");
              setFamily("");
            }}
          />

          {topLabel === "meteorite" && (
            <ChoiceGroup
              title="الصنف النيزكي"
              choices={METEORITE_SUBCLASSES}
              value={subclass}
              onChange={setSubclass}
            />
          )}

          {topLabel === "terrestrial_rock" && (
            <ChoiceGroup
              title="العائلة الأرضية"
              choices={TERRESTRIAL_FAMILIES}
              value={family}
              onChange={setFamily}
            />
          )}

          <ChoiceGroup
            title="ثقة الخبير"
            choices={CONFIDENCES}
            value={confidence}
            onChange={(value) => setConfidence(value as ExpertConfidence)}
          />

          <div className="grid gap-3">
            <Field
              label="المجموعة أو العينة"
              value={specimenId}
              onChange={setSpecimenId}
              placeholder="unknown"
            />
            <Field label="مصدر الصورة" value={origin} onChange={setOrigin} placeholder="unknown" />
            <ChoiceGroup
              title="قطع داخلي"
              choices={[
                ["yes", "نعم"],
                ["no", "لا"],
                ["unknown", "غير معروف"],
              ]}
              value={interiorCut}
              onChange={setInteriorCut}
            />
            <ChoiceGroup
              title="جودة الصورة"
              choices={[
                ["good", "جيدة"],
                ["fair", "متوسطة"],
                ["poor", "ضعيفة"],
                ["unknown", "غير معروفة"],
              ]}
              value={imageQuality}
              onChange={setImageQuality}
            />
            <Field
              label="ملاحظة"
              value={comment}
              onChange={setComment}
              placeholder="ملاحظة علمية قصيرة"
              textarea
            />
          </div>

          <div className="space-y-2">
            <button
              onClick={() => void saveAnnotation()}
              disabled={!annotationReady || saving}
              className="h-11 w-full rounded-lg bg-orange px-4 text-sm font-black text-white disabled:opacity-50"
            >
              حفظ والانتقال للصورة التالية
            </button>
            <div className="grid grid-cols-3 gap-2">
              <ActionButton disabled={saving} onClick={() => void saveAnnotation("skip")}>
                تخطي
              </ActionButton>
              <ActionButton
                disabled={!annotationReady || saving}
                onClick={() => void saveAnnotation("review")}
              >
                مراجعة
              </ActionButton>
              <ActionButton
                disabled={saving}
                danger
                onClick={() => void saveAnnotation("unusable")}
              >
                غير صالحة
              </ActionButton>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

function Header({
  appRoleCanOpen,
  loading,
  onRefresh,
  onLogout,
}: {
  appRoleCanOpen: boolean;
  loading: boolean;
  onRefresh: () => void;
  onLogout?: () => void;
}) {
  return (
    <header className="flex items-center justify-between gap-2">
      <Link
        to="/dashboard"
        className="grid h-10 w-10 place-items-center rounded-full bg-card border border-border"
      >
        <ArrowRight className="h-5 w-5" />
      </Link>
      <div className="min-w-0 flex-1 text-right">
        <p className="text-xs text-muted-foreground">
          {appRoleCanOpen ? "مدمج داخل التطبيق العربي" : "دخول محمي"}
        </p>
        <h1 className="truncate text-lg font-black text-navy">وضع الخبير</h1>
      </div>
      <button
        onClick={onRefresh}
        disabled={loading}
        className="grid h-10 w-10 place-items-center rounded-full bg-card border border-border disabled:opacity-60"
        title="تحديث"
      >
        <RefreshCw className="h-4 w-4" />
      </button>
      {onLogout && (
        <button
          onClick={onLogout}
          className="grid h-10 w-10 place-items-center rounded-full bg-card border border-border"
          title="تسجيل الخروج"
        >
          <LogOut className="h-4 w-4" />
        </button>
      )}
    </header>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-navy/10 px-2 py-3">
      <p className="text-lg font-black text-navy">{value}</p>
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
  );
}

function ChoiceGroup({
  title,
  choices,
  value,
  onChange,
}: {
  title: string;
  choices: ReadonlyArray<readonly [string, string]>;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-black text-navy">{title}</p>
      <div className="flex flex-wrap gap-2">
        {choices.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-full border px-3 py-2 text-xs font-bold ${
              value === key
                ? "border-navy bg-navy text-white"
                : "border-border bg-background text-navy"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  textarea?: boolean;
}) {
  const className =
    "mt-1 w-full rounded-lg border border-input bg-background px-3 py-2 text-right text-sm";
  return (
    <label className="block text-sm font-bold text-navy">
      {label}
      {textarea ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${className} min-h-24 resize-none`}
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={`${className} h-10`}
        />
      )}
    </label>
  );
}

function ActionButton({
  children,
  disabled,
  danger = false,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`min-h-10 rounded-lg border px-2 text-xs font-black disabled:opacity-50 ${
        danger
          ? "border-destructive bg-destructive text-white"
          : "border-border bg-background text-navy"
      }`}
    >
      {children}
    </button>
  );
}
