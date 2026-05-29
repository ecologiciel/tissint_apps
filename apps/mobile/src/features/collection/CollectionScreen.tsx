import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { Download, FilePlus2, GitCompare, Scissors, Store } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { MeteoriteThumb } from "@/components/tissint/MeteoriteThumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { t } from "@/i18n";
import { listCollection } from "@/lib/api";
import { useScanStore } from "@/store/scan-store";
import { colors, spacing } from "@/theme";
import { scoreToPercent } from "@tissint/shared";

export function CollectionScreen() {
  const lastResult = useScanStore((state) => state.lastResult);
  const collection = useQuery({
    queryKey: ["collection", lastResult?.scanId],
    queryFn: () => listCollection(lastResult),
  });
  const items = collection.data ?? [];

  return (
    <Screen contentStyle={styles.screen}>
      <View>
        <AppText variant="hero" color={colors.navy}>
          {t("nav.collection")}
        </AppText>
        <AppText variant="caption">Coffre-fort personnel synchronise serveur.</AppText>
      </View>

      <View style={styles.topActions}>
        <Button tone="ghost" icon={GitCompare} onPress={() => router.push("/compare")}>
          Comparer
        </Button>
        <Button tone="ghost" icon={Download}>
          Export
        </Button>
      </View>

      {items.length === 0 ? (
        <Card style={styles.empty}>
          <FilePlus2 color={colors.orange} size={36} />
          <AppText variant="subtitle">Aucune pierre enregistree</AppText>
          <AppText variant="body" color={colors.textMuted}>
            Les scans avec score inferieur a 50% ne sont pas sauvegardes. Lance un scan eligible pour alimenter la collection.
          </AppText>
          <Button onPress={() => router.push("/scanner")}>Scanner maintenant</Button>
        </Card>
      ) : (
        items.map((item) => (
          <Pressable
            key={item.scanId}
            onPress={() => router.push({ pathname: "/collection/[scanId]", params: { scanId: item.scanId } })}
          >
            <Card>
              <View style={styles.item}>
                <View style={styles.thumb}>
                  <MeteoriteThumb rare={item.status === "pending_validation"} />
                </View>
                <View style={styles.itemContent}>
                  <Badge
                    label={
                      item.status === "needs_cut"
                        ? "En attente de coupe"
                        : item.status === "pending_validation"
                          ? "Traitement admin"
                          : "Eligible"
                    }
                    tone={item.status === "needs_cut" ? "warning" : item.status === "pending_validation" ? "premium" : "success"}
                  />
                  <AppText variant="subtitle" numberOfLines={2}>
                    {item.className}
                  </AppText>
                  <AppText variant="caption">Score fusion: {scoreToPercent(item.fusionScore)}%</AppText>
                </View>
              </View>
              <View style={styles.actions}>
                {item.status === "needs_cut" ? (
                  <Button tone="ghost" icon={Scissors}>
                    Ajouter coupe
                  </Button>
                ) : null}
                {item.status === "eligible" ? (
                  <Button tone="secondary" icon={Store} onPress={() => router.push({ pathname: "/marketplace/publish", params: { scanId: item.scanId } })}>
                    Vendre
                  </Button>
                ) : null}
              </View>
            </Card>
          </Pressable>
        ))
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  empty: {
    alignItems: "center",
    gap: spacing.md,
  },
  item: {
    flexDirection: "row-reverse",
    gap: spacing.md,
  },
  thumb: {
    width: 110,
  },
  itemContent: {
    flex: 1,
    gap: spacing.sm,
    alignItems: "flex-end",
  },
  actions: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  topActions: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
});
