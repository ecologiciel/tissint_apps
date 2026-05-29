import { router } from "expo-router";
import { ArrowRight, ShieldAlert } from "lucide-react-native";
import { StyleSheet, View } from "react-native";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { t } from "@/i18n";
import { useScanStore } from "@/store/scan-store";
import { useSessionStore } from "@/store/session-store";
import { colors, spacing } from "@/theme";
import { scoreToPercent } from "@tissint/shared";

export function AdminRadarScreen() {
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const result = useScanStore((state) => state.lastResult);
  const rare = result?.verdict === "rare_hold" ? result : null;

  if (role !== "admin") {
    return (
      <Screen>
        <Card style={styles.center}>
          <ShieldAlert color={colors.warning} size={34} />
          <AppText variant="subtitle">Acces admin requis</AppText>
          <Button onPress={() => router.back()}>Retour</Button>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <Button tone="ghost" icon={ArrowRight} onPress={() => router.back()}>
          Retour
        </Button>
        <View style={styles.title}>
          <AppText variant="hero" color={colors.navy}>
            {t("admin.radar")}
          </AppText>
          <AppText variant="caption">Actions reservees aux comptes internes.</AppText>
        </View>
      </View>

      {rare ? (
        <Card>
          <Badge label="institutional_hold_24h" tone="premium" />
          <AppText variant="title">{rare.className}</AppText>
          <AppText variant="body">Score: {scoreToPercent(rare.fusionScore)}%</AppText>
          <View style={styles.actions}>
            <Button tone="dark">Reserver</Button>
            <Button tone="secondary">Contacter</Button>
            <Button tone="danger">Rejeter</Button>
          </View>
        </Card>
      ) : (
        <Card style={styles.center}>
          <ShieldAlert color={colors.orange} size={34} />
          <AppText variant="subtitle">Aucune alerte rare locale</AppText>
          <AppText variant="caption">Le serveur Telegram prendra le relais en production.</AppText>
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  title: {
    flex: 1,
    alignItems: "flex-end",
  },
  center: {
    alignItems: "center",
    gap: spacing.md,
  },
  actions: {
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
