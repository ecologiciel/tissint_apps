import { useCallback, useEffect, useMemo, useState } from "react";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { ArrowLeft, RefreshCw, ShieldAlert } from "lucide-react-native";
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
  ["chondrite", "Chondrite"],
  ["carbonaceous_chondrite", "Chondrite carbonée"],
  ["achondrite", "Achondrite"],
  ["iron_meteorite", "Météorite métallique"],
  ["stony_iron", "Météorite pierreuse-ferreuse"],
  ["meteorite_unknown", "Météorite — sous-classe inconnue"],
] as const;

const TERRESTRIAL_FAMILIES = [
  ["slag", "Scorie"],
  ["hematite", "Hématite"],
  ["magnetite", "Magnétite"],
  ["basalt", "Basalte"],
  ["quartz", "Quartz"],
  ["sedimentary_rock", "Roche sédimentaire"],
  ["industrial_material", "Matériau industriel"],
  ["terrestrial_unknown", "Roche terrestre — famille inconnue"],
] as const;

const TOP_LABELS: Array<[ExpertTopLabel, string]> = [
  ["meteorite", "Météorite"],
  ["terrestrial_rock", "Pierre terrestre"],
  ["uncertain", "Doute"],
  ["unusable", "Image inutilisable"],
  ["non_rock", "Non-roche"],
];

const CONFIDENCES: Array<[ExpertConfidence, string]> = [
  ["high", "Haute"],
  ["medium", "Moyenne"],
  ["low", "Faible"],
  ["not_assessed", "Non évaluée"],
];

function clientUuid() {
  return `expert-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
}

function scoreLabel(value?: number) {
  return typeof value === "number" ? `${Math.round(value * 100)} %` : "—";
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
      setError(err instanceof Error ? err.message : "Impossible de charger la file expert.");
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
      const nextDatasetId = datasetId && available.some((dataset) => dataset.id === datasetId)
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
      setError(err instanceof Error ? err.message : "Impossible de charger l'espace expert.");
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
    return (
      <Screen>
        <Card style={styles.center}>
          <ShieldAlert color={colors.warning} size={34} />
          <AppText variant="subtitle">Accès expert requis</AppText>
          <Button onPress={() => router.back()}>Retour</Button>
        </Card>
      </Screen>
    );
  }

  async function saveAnnotation(action: ExpertAnnotationInput["action"] = "label") {
    if (!item) return;
    if (action === "label" && (!topLabel || !confidence)) {
      Alert.alert("Annotation incomplète", "Choisissez un verdict et votre niveau de confiance.");
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
        terrestrialFamily: action === "label" && topLabel === "terrestrial_rock" ? family : undefined,
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
        Alert.alert("Annotation enregistrée", "Cette image est orientée vers une seconde revue.");
      }
      setItem(null);
      await loadNext(datasetId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Enregistrement impossible.");
    } finally {
      setSaving(false);
    }
  }

  async function runAudit() {
    if (!datasetId) return;
    try {
      const audit = await createExpertAudit(datasetId);
      Alert.alert("Audit lancé", `Rapport ${audit.id} : ${audit.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Audit impossible.");
    }
  }

  async function runExport() {
    if (!datasetId) return;
    try {
      const exportJob = await createExpertExport(datasetId);
      Alert.alert("Export lancé", `Export ${exportJob.version} : ${exportJob.status}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export impossible.");
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
        <Button tone="ghost" icon={ArrowLeft} onPress={() => router.back()}>
          Retour
        </Button>
        <View style={styles.headerCopy}>
          <AppText variant="hero" color={colors.navy}>Mode expert</AppText>
          <AppText variant="caption">Annotation scientifique traçable — taxonomy-v1</AppText>
        </View>
        <Button tone="ghost" icon={RefreshCw} onPress={() => void refresh()} loading={loading}>
          Actualiser
        </Button>
      </View>

      {error ? (
        <Card style={styles.notice}>
          <AppText variant="body" color={colors.danger}>{error}</AppText>
        </Card>
      ) : null}

      {datasets.length > 1 ? (
        <Card>
          <AppText variant="subtitle">Dataset actif</AppText>
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
        <AppText variant="subtitle">{selectedDataset?.name ?? "Aucun dataset disponible"}</AppText>
        {stats ? (
          <View style={styles.statsRow}>
            <AppText variant="caption">Importées : {stats.counts.imported ?? 0}</AppText>
            <AppText variant="caption">Annotées : {stats.counts.annotated ?? 0}</AppText>
            <AppText variant="caption">Revue : {stats.counts.needs_review ?? 0}</AppText>
          </View>
        ) : null}
        {role === "admin" ? (
          <View style={styles.actionsRow}>
            <Button tone="ghost" onPress={() => void runAudit()} disabled={!datasetId}>Lancer un audit</Button>
            <Button tone="secondary" onPress={() => void runExport()} disabled={!datasetId}>Préparer l’export</Button>
          </View>
        ) : null}
      </Card>

      {loading && !item ? (
        <Card style={styles.center}><ActivityIndicator color={colors.orange} /></Card>
      ) : null}

      {!loading && !item ? (
        <Card style={styles.center}>
          <AppText variant="subtitle">Aucune image disponible</AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.centerText}>
            Importez un lot ou attendez que le worker termine l’inférence Vision Trio.
          </AppText>
        </Card>
      ) : null}

      {item ? (
        <Card>
          {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" /> : null}
          <AppText variant="caption" color={colors.textMuted}>
            {item.originalFilename ?? item.itemId} · {item.status}
          </AppText>

          <View style={styles.predictionBox}>
            <AppText variant="subtitle">Vision Trio</AppText>
            <AppText variant="hero" color={colors.orange}>
              {scoreLabel(item.prediction?.meteoriteProbability)} météorite
            </AppText>
            <AppText variant="caption">
              Bande : {item.prediction?.decisionBand ?? "non disponible"} · Classe dominante : {item.prediction?.dominantClass ?? "—"}
            </AppText>
            <AppText variant="caption">
              Qualité automatique : {scoreLabel(typeof item.qualityReport?.score === "number" ? item.qualityReport.score : undefined)} · {item.qualityReport?.passed ? "passée" : "à vérifier"}
            </AppText>
            {Object.entries(item.prediction?.models ?? {}).map(([model, prediction]) => (
              <View key={model} style={styles.modelRow}>
                <AppText variant="caption">{model}</AppText>
                <AppText variant="caption">{scoreLabel(prediction.meteoriteProbability)}</AppText>
              </View>
            ))}
          </View>

          <AppText variant="subtitle" style={styles.sectionTitle}>Votre verdict</AppText>
          <ChoiceRow choices={TOP_LABELS} value={topLabel} onChange={(value) => {
            setTopLabel(value as ExpertTopLabel);
            setSubclass(undefined);
            setFamily(undefined);
          }} />

          {topLabel === "meteorite" ? (
            <>
              <AppText variant="subtitle" style={styles.sectionTitle}>Sous-classe météoritique</AppText>
              <ChoiceRow choices={METEORITE_SUBCLASSES} value={subclass} onChange={setSubclass} />
            </>
          ) : null}

          {topLabel === "terrestrial_rock" ? (
            <>
              <AppText variant="subtitle" style={styles.sectionTitle}>Famille terrestre</AppText>
              <ChoiceRow choices={TERRESTRIAL_FAMILIES} value={family} onChange={setFamily} />
            </>
          ) : null}

          <AppText variant="subtitle" style={styles.sectionTitle}>Confiance de l’expert</AppText>
          <ChoiceRow choices={CONFIDENCES} value={confidence} onChange={(value) => setConfidence(value as ExpertConfidence)} />

          <AppText variant="subtitle" style={styles.sectionTitle}>Métadonnées — “unknown” est accepté</AppText>
          <Field label="Spécimen / groupe" value={specimenId} onChangeText={setSpecimenId} placeholder="unknown" />
          <Field label="Origine de l’image" value={origin} onChangeText={setOrigin} placeholder="unknown" />
          <AppText variant="caption" style={styles.fieldLabel}>Coupe intérieure</AppText>
          <ChoiceRow choices={[["yes", "Oui"], ["no", "Non"], ["unknown", "Inconnue"]]} value={interiorCut} onChange={setInteriorCut} />
          <AppText variant="caption" style={styles.fieldLabel}>Qualité observée</AppText>
          <ChoiceRow choices={[["good", "Bonne"], ["fair", "Moyenne"], ["poor", "Faible"], ["unknown", "Inconnue"]]} value={imageQuality} onChange={setImageQuality} />
          <Field label="Commentaire" value={comment} onChangeText={setComment} placeholder="Observation courte et factuelle" multiline />

          <View style={styles.actionsColumn}>
            <Button onPress={() => void saveAnnotation()} loading={saving} disabled={!annotationReady}>
              Enregistrer et passer à la suivante
            </Button>
            <View style={styles.actionsRow}>
              <Button tone="ghost" onPress={() => void saveAnnotation("skip")} loading={saving}>Passer</Button>
              <Button tone="ghost" onPress={() => void saveAnnotation("review")} loading={saving} disabled={!annotationReady}>Demander une revue</Button>
              <Button tone="danger" onPress={() => void saveAnnotation("unusable")} loading={saving}>Inutilisable</Button>
            </View>
          </View>
        </Card>
      ) : null}
    </Screen>
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
      <AppText variant="caption" style={styles.fieldLabel}>{label}</AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        style={[styles.input, multiline ? styles.inputMultiline : null]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { gap: spacing.md },
  header: { gap: spacing.sm },
  headerCopy: { gap: 2 },
  notice: { borderColor: colors.danger },
  statsCard: { gap: spacing.md },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.md },
  actionsRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  actionsColumn: { gap: spacing.sm, marginTop: spacing.md },
  center: { alignItems: "center", gap: spacing.md, paddingVertical: spacing.xl },
  centerText: { textAlign: "center" },
  image: { width: "100%", height: 280, borderRadius: radius.md, backgroundColor: colors.stone, marginBottom: spacing.sm },
  predictionBox: { backgroundColor: colors.warm, borderRadius: radius.md, padding: spacing.md, gap: spacing.xs, marginTop: spacing.md },
  modelRow: { flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: spacing.xs },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm },
  choiceGrid: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm },
  choice: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, backgroundColor: colors.card },
  choiceSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  choiceText: { textAlign: "center" },
  field: { gap: spacing.xs, marginTop: spacing.sm },
  fieldLabel: { marginTop: spacing.xs, color: colors.textMuted },
  input: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, backgroundColor: colors.card, color: colors.text, minHeight: 46, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  inputMultiline: { minHeight: 88, textAlignVertical: "top" },
});
