import { router } from "expo-router";
import { AlertTriangle, Award, CheckCircle2, FilePlus2, Store, XCircle } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { t } from "@/i18n";
import { useScanStore } from "@/store/scan-store";
import { colors, spacing } from "@/theme";
import { scoreToPercent } from "@tissint/shared";

function iconForVerdict(verdict?: string) {
  if (verdict === "earth_rock") return XCircle;
  if (verdict === "needs_cut") return AlertTriangle;
  return CheckCircle2;
}

export function ResultScreen() {
  const result = useScanStore((state) => state.lastResult);

  if (!result) {
    return (
      <Screen>
        <Card>
          <AppText variant="subtitle">Aucun resultat disponible</AppText>
          <Button onPress={() => router.replace("/scanner")}>Retour au scan</Button>
        </Card>
      </Screen>
    );
  }

  const Icon = iconForVerdict(result.verdict);
  const tone = result.verdict === "earth_rock" ? "danger" : result.verdict === "needs_cut" ? "warning" : "success";

  return (
    <Screen contentStyle={styles.screen}>
      <Card style={styles.hero}>
        <View style={[styles.iconWrap, { backgroundColor: result.verdict === "earth_rock" ? "#FDE7E5" : "#E5F4EC" }]}>
          <Icon color={result.verdict === "earth_rock" ? colors.danger : colors.success} size={38} />
        </View>
        <Badge
          label={
            result.verdict === "rare_hold"
              ? "Rare - hold 24h"
              : result.verdict === "needs_cut"
                ? "Coupe requise"
                : result.verdict === "earth_rock"
                  ? "Non meteorite"
                  : "Eligible"
          }
          tone={tone}
        />
        <AppText variant="hero" color={colors.navy} style={styles.score}>
          {scoreToPercent(result.fusionScore)}%
        </AppText>
        <AppText variant="subtitle">{result.className}</AppText>
        <AppText variant="body" color={colors.textMuted}>
          {t(result.messageKey as never)}
        </AppText>
      </Card>

      <Card>
        <AppText variant="subtitle">Scores IA</AppText>
        <View style={styles.scoreRows}>
          <ScoreLine label="DINOv2 / eDINOv2" value={result.modelScores.edino} />
          <ScoreLine label="ConvNeXt-V2" value={result.modelScores.convnext} />
          <ScoreLine label="Swin V2" value={result.modelScores.swin} />
          <ScoreLine label="Fusion" value={result.modelScores.fusion} strong />
        </View>
      </Card>

      <Card style={styles.notice}>
        <AppText variant="caption" color={colors.textMuted}>
          {t("result.scientificNotice")}
        </AppText>
      </Card>

      <View style={styles.actions}>
        {result.canAddToCollection ? (
          <Button icon={FilePlus2} tone="dark" onPress={() => router.push("/collection")}>
            {t("result.addCollection")}
          </Button>
        ) : null}
        {result.canPublishMarketplace ? (
          <Button icon={Store} tone="secondary" onPress={() => router.push("/marketplace")}>
            {t("result.sell")}
          </Button>
        ) : null}
        {result.canAddToCollection ? (
          <Button icon={Award} tone="ghost" onPress={() => router.push({ pathname: "/certificate/[scanId]", params: { scanId: result.scanId } })}>
            Certificat
          </Button>
        ) : null}
        <Button tone="ghost" onPress={() => router.replace("/scanner")}>
          {t("result.newScan")}
        </Button>
      </View>
    </Screen>
  );
}

function ScoreLine({ label, value, strong }: { label: string; value?: number; strong?: boolean }) {
  return (
    <View style={styles.scoreLine}>
      <AppText variant="body" style={strong ? styles.strong : undefined}>
        {value == null ? "--" : `${scoreToPercent(value)}%`}
      </AppText>
      <AppText variant="caption">{label}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  hero: {
    alignItems: "center",
    gap: spacing.md,
  },
  iconWrap: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: "center",
    justifyContent: "center",
  },
  score: {
    textAlign: "center",
  },
  scoreRows: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  scoreLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  strong: {
    fontWeight: "900",
    color: colors.orange,
  },
  notice: {
    backgroundColor: colors.muted,
  },
  actions: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
});
