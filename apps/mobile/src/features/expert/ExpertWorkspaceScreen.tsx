import { useCallback, useEffect, useMemo, useState } from "react";
import { Redirect, router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ArrowRight, RefreshCw, ShieldCheck } from "lucide-react-native";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import {
  annotateExpertItem,
  createExpertAudit,
  createExpertExport,
  getExpertDatasetStats,
  getNextExpertItem,
  listExpertDatasets,
} from "@/lib/api";
import { colors, radius, spacing } from "@/theme";
import { useSessionStore } from "@/store/session-store";
import type {
  ExpertAnnotationInput,
  ExpertConfidence,
  ExpertDataset,
  ExpertDatasetStats,
  ExpertQueueItem,
  ExpertTopLabel,
} from "@tissint/shared";

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

const TOP_LABELS: Array<[ExpertTopLabel, string]> = [
  ["meteorite", "نيزك"],
  ["terrestrial_rock", "صخرة أرضية"],
  ["uncertain", "غير مؤكد"],
  ["unusable", "صورة غير صالحة"],
  ["non_rock", "ليست صخرة"],
];

const CONFIDENCES: Array<[ExpertConfidence, string]> = [
  ["high", "عالية"],
  ["medium", "متوسطة"],
  ["low", "ضعيفة"],
  ["not_assessed", "غير مقيّمة"],
];

function clientUuid() {
  return `expert-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function scoreLabel(value?: number) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "غير متاح";
}

function ChoiceRow({
  choices,
  value,
  onChange,
}: {
  choices: ReadonlyArray<readonly [string, string]>;
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={styles.choiceGrid}>
      {choices.map(([key, label]) => (
        <Pressable
          key={key}
          accessibilityRole="button"
          onPress={() => onChange(key)}
          style={[styles.choice, value === key ? styles.choiceSelected : null]}
        >
          <AppText
            variant="caption"
            color={value === key ? "#FFFFFF" : colors.navy}
            style={styles.choiceText}
          >
            {label}
          </AppText>
        </Pressable>
      ))}
    </View>
  );
}

export function ExpertWorkspaceScreen() {
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const [datasets, setDatasets] = useState<ExpertDataset[]>([]);
  const [datasetId, setDatasetId] = useState<string>();
  const [stats, setStats] = useState<ExpertDatasetStats | null>(null);
  const [item, setItem] = useState<ExpertQueueItem | null>(null);
  const [topLabel, setTopLabel] = useState<ExpertTopLabel>();
  const [subclass, setSubclass] = useState<string>();
  const [family, setFamily] = useState<string>();
  const [confidence, setConfidence] = useState<ExpertConfidence>();
  const [comment, setComment] = useState("");
  const [specimenId, setSpecimenId] = useState("");
  const [origin, setOrigin] = useState("");
  const [interiorCut, setInteriorCut] = useState("unknown");
  const [imageQuality, setImageQuality] = useState("unknown");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedDataset = useMemo(
    () => datasets.find((dataset) => dataset.id === datasetId),
    [datasetId, datasets],
  );

  const clearAnnotation = useCallback(() => {
    setTopLabel(undefined);
    setSubclass(undefined);
    setFamily(undefined);
    setConfidence(undefined);
    setComment("");
    setSpecimenId(item?.specimenId ?? "");
    setOrigin(String(item?.metadata?.origin ?? ""));
    setInteriorCut(String(item?.metadata?.has_interior_cut ?? "unknown"));
    setImageQuality(String(item?.metadata?.expert_image_quality ?? "unknown"));
  }, [item]);

  const loadNext = useCallback(async (requestedDatasetId?: string) => {
    setLoading(true);
    setError(null);
    try {
      const next = await getNextExpertItem(requestedDatasetId);
      setItem(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل قائمة الخبير.");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (role !== "expert" && role !== "admin") return;
    setLoading(true);
    setError(null);
    try {
      const available = await listExpertDatasets();
      setDatasets(available);
      const nextDatasetId =
        datasetId && available.some((dataset) => dataset.id === datasetId)
          ? datasetId
          : available[0]?.id;
      setDatasetId(nextDatasetId);
      if (nextDatasetId) {
        const [nextStats, nextItem] = await Promise.all([
          getExpertDatasetStats(nextDatasetId),
          getNextExpertItem(nextDatasetId),
        ]);
        setStats(nextStats);
        setItem(nextItem);
      } else {
        setStats(null);
        setItem(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل مساحة الخبير.");
      setItem(null);
    } finally {
      setLoading(false);
    }
  }, [datasetId, role]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    clearAnnotation();
  }, [clearAnnotation]);

  if (role !== "expert" && role !== "admin") {
    return <Redirect href="/dashboard" />;
  }

  async function saveAnnotation(action: ExpertAnnotationInput["action"] = "label") {
    if (!item) return;
    if (action === "label" && (!topLabel || !confidence)) {
      Alert.alert("تعليق غير مكتمل", "اختر الحكم ومستوى الثقة قبل الحفظ.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const input: ExpertAnnotationInput = {
        clientUuid: clientUuid(),
        action,
        topLabel: action === "label" ? topLabel : undefined,
        meteoriteSubclass: action === "label" && topLabel === "meteorite" ? subclass : undefined,
        terrestrialFamily:
          action === "label" && topLabel === "terrestrial_rock" ? family : undefined,
        confidence: action === "label" ? confidence : "not_assessed",
        comment: comment.trim() || undefined,
        specimenId: specimenId.trim() || undefined,
        metadata: {
          origin: origin.trim() || "unknown",
          has_interior_cut: interiorCut || "unknown",
          expert_image_quality: imageQuality || "unknown",
        },
      };
      const result = await annotateExpertItem(item.itemId, input);
      if (result.reviewRequired) {
        Alert.alert("تم حفظ التعليق", "هذه الصورة موجهة إلى مراجعة ثانية.");
      }
      setItem(null);
      await loadNext(datasetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر حفظ التعليق.");
    } finally {
      setSaving(false);
    }
  }

  async function runAudit() {
    if (!datasetId) return;
    try {
      const audit = await createExpertAudit(datasetId);
      Alert.alert("تم إطلاق التدقيق", `التقرير ${audit.id}: ${audit.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر إطلاق التدقيق.");
    }
  }

  async function runExport() {
    if (!datasetId) return;
    try {
      const exportJob = await createExpertExport(datasetId);
      Alert.alert("تم تحضير التصدير", `الإصدار ${exportJob.version}: ${exportJob.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحضير التصدير.");
    }
  }

  const annotationReady = Boolean(
    topLabel &&
    confidence &&
    (topLabel !== "meteorite" || subclass) &&
    (topLabel !== "terrestrial_rock" || family),
  );

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <Button tone="ghost" icon={ArrowRight} onPress={() => router.back()}>
          رجوع
        </Button>
        <View style={styles.headerCopy}>
          <AppText variant="hero" color={colors.navy} style={styles.rtlText}>
            وضع الخبير
          </AppText>
          <AppText variant="caption" style={styles.rtlText}>
            تعليق علمي قابل للتتبع - taxonomy-v1
          </AppText>
        </View>
        <Button tone="ghost" icon={RefreshCw} onPress={() => void refresh()} loading={loading}>
          تحديث
        </Button>
      </View>

      {error ? (
        <Card style={styles.notice}>
          <AppText variant="body" color={colors.danger} style={styles.rtlText}>
            {error}
          </AppText>
        </Card>
      ) : null}

      {datasets.length > 1 ? (
        <Card style={styles.cardGap}>
          <AppText variant="subtitle" style={styles.rtlText}>
            Dataset النشط
          </AppText>
          <ChoiceRow
            choices={datasets.map((dataset) => [dataset.id, dataset.name] as const)}
            value={datasetId}
            onChange={(value) => {
              setDatasetId(value);
              void loadNext(value);
            }}
          />
        </Card>
      ) : null}

      <Card style={styles.statsCard}>
        <View style={styles.statsHeader}>
          <ShieldCheck color={colors.orange} size={22} />
          <AppText variant="subtitle" style={styles.rtlText}>
            {selectedDataset?.name ?? "لا يوجد dataset متاح"}
          </AppText>
        </View>
        {stats ? (
          <View style={styles.statsRow}>
            <StatPill label="مستوردة" value={stats.counts.imported ?? 0} />
            <StatPill label="معلّقة" value={stats.counts.queued ?? 0} />
            <StatPill label="منجزة" value={stats.counts.annotated ?? 0} />
            <StatPill label="مراجعة" value={stats.counts.needs_review ?? 0} />
          </View>
        ) : null}
        {role === "admin" ? (
          <View style={styles.actionsRow}>
            <Button tone="ghost" onPress={() => void runAudit()} disabled={!datasetId}>
              إطلاق تدقيق
            </Button>
            <Button tone="secondary" onPress={() => void runExport()} disabled={!datasetId}>
              تحضير التصدير
            </Button>
          </View>
        ) : null}
      </Card>

      {loading && !item ? (
        <Card style={styles.center}>
          <ActivityIndicator color={colors.orange} />
          <AppText variant="caption" style={styles.rtlText}>
            جار تحميل قائمة المراجعة...
          </AppText>
        </Card>
      ) : null}

      {!loading && !item ? (
        <Card style={styles.center}>
          <AppText variant="subtitle" style={styles.rtlText}>
            لا توجد صورة متاحة
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.centerText}>
            انتظر إدخال دفعة جديدة أو انتهاء worker من استنتاج Vision Trio.
          </AppText>
        </Card>
      ) : null}

      {item ? (
        <Card style={styles.cardGap}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
          ) : null}
          <AppText variant="caption" color={colors.textMuted} style={styles.rtlText}>
            {item.originalFilename ?? item.itemId} · {item.status}
          </AppText>

          <View style={styles.predictionBox}>
            <AppText variant="subtitle" style={styles.rtlText}>
              Vision Trio
            </AppText>
            <AppText variant="hero" color={colors.orange} style={styles.rtlText}>
              {scoreLabel(item.prediction?.meteoriteProbability)} احتمال نيزك
            </AppText>
            <AppText variant="caption" style={styles.rtlText}>
              النطاق: {item.prediction?.decisionBand ?? "غير متاح"} · الفئة الغالبة:{" "}
              {item.prediction?.dominantClass ?? "غير متاح"}
            </AppText>
            <AppText variant="caption" style={styles.rtlText}>
              الجودة الآلية:{" "}
              {scoreLabel(
                typeof item.qualityReport?.score === "number"
                  ? item.qualityReport.score
                  : undefined,
              )}{" "}
              · {item.qualityReport?.passed ? "مقبولة" : "تحتاج مراجعة"}
            </AppText>
            {Object.entries(item.prediction?.models ?? {}).map(([model, prediction]) => (
              <View key={model} style={styles.modelRow}>
                <AppText variant="caption">{scoreLabel(prediction.meteoriteProbability)}</AppText>
                <AppText variant="caption">{model}</AppText>
              </View>
            ))}
          </View>

          <AppText variant="subtitle" style={styles.sectionTitle}>
            حكم الخبير
          </AppText>
          <ChoiceRow
            choices={TOP_LABELS}
            value={topLabel}
            onChange={(value) => {
              setTopLabel(value as ExpertTopLabel);
              setSubclass(undefined);
              setFamily(undefined);
            }}
          />

          {topLabel === "meteorite" ? (
            <>
              <AppText variant="subtitle" style={styles.sectionTitle}>
                الصنف النيزكي
              </AppText>
              <ChoiceRow choices={METEORITE_SUBCLASSES} value={subclass} onChange={setSubclass} />
            </>
          ) : null}

          {topLabel === "terrestrial_rock" ? (
            <>
              <AppText variant="subtitle" style={styles.sectionTitle}>
                العائلة الأرضية
              </AppText>
              <ChoiceRow choices={TERRESTRIAL_FAMILIES} value={family} onChange={setFamily} />
            </>
          ) : null}

          <AppText variant="subtitle" style={styles.sectionTitle}>
            ثقة الخبير
          </AppText>
          <ChoiceRow
            choices={CONFIDENCES}
            value={confidence}
            onChange={(value) => setConfidence(value as ExpertConfidence)}
          />

          <AppText variant="subtitle" style={styles.sectionTitle}>
            البيانات المرافقة - يمكن ترك unknown
          </AppText>
          <Field
            label="العينة أو المجموعة"
            value={specimenId}
            onChangeText={setSpecimenId}
            placeholder="unknown"
          />
          <Field
            label="مصدر الصورة"
            value={origin}
            onChangeText={setOrigin}
            placeholder="unknown"
          />
          <AppText variant="caption" style={styles.fieldLabel}>
            قطع داخلي
          </AppText>
          <ChoiceRow
            choices={[
              ["yes", "نعم"],
              ["no", "لا"],
              ["unknown", "غير معروف"],
            ]}
            value={interiorCut}
            onChange={setInteriorCut}
          />
          <AppText variant="caption" style={styles.fieldLabel}>
            جودة الصورة
          </AppText>
          <ChoiceRow
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
            onChangeText={setComment}
            placeholder="ملاحظة علمية قصيرة"
            multiline
          />

          <View style={styles.actionsColumn}>
            <Button
              onPress={() => void saveAnnotation()}
              loading={saving}
              disabled={!annotationReady}
            >
              حفظ والانتقال للصورة التالية
            </Button>
            <View style={styles.actionsRow}>
              <Button tone="ghost" onPress={() => void saveAnnotation("skip")} loading={saving}>
                تخطي
              </Button>
              <Button
                tone="ghost"
                onPress={() => void saveAnnotation("review")}
                loading={saving}
                disabled={!annotationReady}
              >
                طلب مراجعة
              </Button>
              <Button
                tone="danger"
                onPress={() => void saveAnnotation("unusable")}
                loading={saving}
              >
                غير صالحة
              </Button>
            </View>
          </View>
        </Card>
      ) : null}
    </Screen>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.statPill}>
      <AppText variant="subtitle" color={colors.navy} style={styles.centerText}>
        {value}
      </AppText>
      <AppText variant="caption" color={colors.textMuted} style={styles.centerText}>
        {label}
      </AppText>
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" style={styles.fieldLabel}>
        {label}
      </AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        textAlign="right"
        style={[styles.input, multiline ? styles.inputMultiline : null]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.md },
  rtlText: { textAlign: "right", writingDirection: "rtl" },
  header: { gap: spacing.sm },
  headerCopy: { gap: 2, alignItems: "flex-end" },
  notice: { borderColor: colors.danger },
  cardGap: { gap: spacing.md },
  statsCard: { gap: spacing.md },
  statsHeader: { flexDirection: "row-reverse", alignItems: "center", gap: spacing.sm },
  statsRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm },
  statPill: {
    minWidth: 76,
    flex: 1,
    backgroundColor: colors.warm,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  actionsRow: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm },
  actionsColumn: { gap: spacing.sm, marginTop: spacing.md },
  center: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.xl },
  centerText: { textAlign: "center", writingDirection: "rtl" },
  image: {
    width: "100%",
    height: 280,
    borderRadius: radius.md,
    backgroundColor: colors.stone,
    marginBottom: spacing.sm,
  },
  predictionBox: {
    backgroundColor: colors.warm,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  modelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.xs,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    textAlign: "right",
    writingDirection: "rtl",
  },
  choiceGrid: { flexDirection: "row-reverse", flexWrap: "wrap", gap: spacing.sm },
  choice: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
  },
  choiceSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  choiceText: { textAlign: "center", writingDirection: "rtl" },
  field: { gap: spacing.xs, marginTop: spacing.sm },
  fieldLabel: {
    marginTop: spacing.xs,
    color: colors.textMuted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    color: colors.text,
    minHeight: 46,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    writingDirection: "rtl",
  },
  inputMultiline: { minHeight: 88, textAlignVertical: "top" },
});
