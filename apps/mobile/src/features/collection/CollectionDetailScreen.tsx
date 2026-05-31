import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { Award, Download, Scissors, Store } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { MeteoriteThumb } from "@/components/tissint/MeteoriteThumb";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { DEMO_COLLECTION } from "@/features/parity/parity-data";
import { MvpCollectionDetailScreen } from "@/features/mvp/MvpLibraryScreens";
import { getCollectionItem } from "@/lib/api";
import { useScanStore } from "@/store/scan-store";
import { colors, spacing } from "@/theme";
import { scoreToPercent } from "@tissint/shared";

export function CollectionDetailScreen() {
  const params = useLocalSearchParams<{ scanId?: string }>();
  const scanId = params.scanId ?? "";
  const [cutAdded, setCutAdded] = useState(false);
  const lastResult = useScanStore((state) => state.lastResult);
  const knownItem =
    DEMO_COLLECTION.some((entry) => entry.scanId === scanId) || lastResult?.scanId === scanId;
  const item = useQuery({
    queryKey: ["collection-item", scanId, lastResult?.scanId],
    queryFn: () => getCollectionItem(scanId, lastResult),
    enabled: Boolean(scanId),
  });

  if (!knownItem) {
    return <MvpCollectionDetailScreen hasItem={false} />;
  }

  if (!item.data) {
    return (
      <Screen>
        <Card>
          <AppText>{item.isLoading ? "Chargement de la pierre..." : "Pierre introuvable"}</AppText>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <MeteoriteThumb rare={item.data.status === "pending_validation"} />
      <Card style={styles.card}>
        <Badge
          label={
            item.data.status === "needs_cut"
              ? "Coupe requise"
              : item.data.status === "listed"
                ? "Sur le marche"
                : item.data.status === "sold"
                  ? "Vendue"
                  : "Eligible"
          }
          tone={item.data.status === "needs_cut" ? "warning" : "success"}
        />
        <AppText variant="hero" color={colors.navy}>
          {item.data.className}
        </AppText>
        <AppText variant="caption">Scan {item.data.scanId}</AppText>
        <AppText variant="title" color={colors.orange}>
          {scoreToPercent(item.data.fusionScore)}%
        </AppText>
      </Card>

      <Card>
        <AppText variant="subtitle">Actions terrain</AppText>
        <View style={styles.actions}>
          {item.data.status === "needs_cut" && !cutAdded ? (
            <Button icon={Scissors} tone="ghost" onPress={() => setCutAdded(true)}>
              Ajouter photo de coupe
            </Button>
          ) : null}
          {cutAdded ? (
            <AppText variant="caption" color={colors.success}>
              Photo de coupe ajoutee en mode UI. Le serveur relancera la fusion IA en production.
            </AppText>
          ) : null}
          {item.data.status === "eligible" || cutAdded ? (
            <Button
              icon={Store}
              tone="secondary"
              onPress={() =>
                router.push({
                  pathname: "/market/publish/[scanId]",
                  params: { scanId: item.data.scanId },
                } as never)
              }
            >
              Publier dans le marche
            </Button>
          ) : null}
          <Button
            icon={Award}
            tone="ghost"
            onPress={() =>
              router.push({
                pathname: "/certificate/[scanId]",
                params: { scanId: item.data.scanId },
              })
            }
          >
            Certificat
          </Button>
          <Button icon={Download} tone="ghost">
            Exporter
          </Button>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  card: {
    gap: spacing.sm,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
});
