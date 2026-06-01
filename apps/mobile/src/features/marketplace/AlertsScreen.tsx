import { router } from "expo-router";
import { Bell, Lock, Plus, Trash2 } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ResponsiveTextInput as TextInput } from "@/components/ui/ResponsiveText";
import { Screen } from "@/components/ui/Screen";
import { createAlert } from "@/lib/api";
import { useEngagementStore } from "@/store/engagement-store";
import { useSessionStore } from "@/store/session-store";
import { colors, radius, spacing } from "@/theme";

export function AlertsScreen() {
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const alerts = useEngagementStore((state) => state.alerts);
  const addAlertLocal = useEngagementStore((state) => state.addAlertLocal);
  const removeAlertLocal = useEngagementStore((state) => state.removeAlertLocal);
  const [className, setClassName] = useState("Chondrite");
  const [region, setRegion] = useState("Tata");
  const [rareOnly, setRareOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const allowed = role === "premium" || role === "admin";

  async function submit() {
    if (!allowed) {
      router.push("/premium");
      return;
    }
    setLoading(true);
    try {
      const alert = await createAlert({
        className,
        region,
        minScore: 0.85,
        rareOnly,
        frequency: "instant",
      });
      addAlertLocal(alert);
    } finally {
      setLoading(false);
    }
  }

  if (!allowed) {
    return (
      <Screen contentStyle={styles.screen}>
        <Card style={styles.center}>
          <Lock color={colors.orange} size={34} />
          <AppText variant="title" color={colors.navy}>
            Alertes Premium
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.textCenter}>
            Cree des alertes par classe, region ou rarete.
          </AppText>
          <Button onPress={() => router.push("/premium")}>Activer Premium</Button>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View>
        <AppText variant="hero" color={colors.navy}>
          Alertes
        </AppText>
        <AppText variant="caption">Regles locales pretes pour les notifications serveur.</AppText>
      </View>

      <Card style={styles.form}>
        <TextInput
          value={className}
          onChangeText={setClassName}
          placeholder="Classe"
          style={styles.input}
        />
        <TextInput
          value={region}
          onChangeText={setRegion}
          placeholder="Region"
          style={styles.input}
        />
        <Pressable
          onPress={() => setRareOnly((value) => !value)}
          style={[styles.toggle, rareOnly ? styles.toggleActive : null]}
        >
          <Bell color={rareOnly ? colors.stone : colors.orange} size={18} />
          <AppText variant="body" color={rareOnly ? colors.stone : colors.text}>
            Rare uniquement
          </AppText>
        </Pressable>
        <Button icon={Plus} loading={loading} onPress={submit}>
          Creer alerte
        </Button>
      </Card>

      {alerts.map((alert) => (
        <Card key={alert.id}>
          <View style={styles.alertRow}>
            <Pressable onPress={() => removeAlertLocal(alert.id)}>
              <Trash2 color={colors.danger} size={20} />
            </Pressable>
            <View style={styles.alertText}>
              <Badge label={alert.frequency} tone="premium" />
              <AppText variant="subtitle">{alert.className ?? "Toutes classes"}</AppText>
              <AppText variant="caption">
                {alert.region ?? "Toutes regions"} - score min{" "}
                {Math.round((alert.minScore ?? 0.85) * 100)}%
              </AppText>
            </View>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  center: {
    alignItems: "center",
    gap: spacing.md,
  },
  textCenter: {
    textAlign: "center",
  },
  form: {
    gap: spacing.md,
  },
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.warm,
    paddingHorizontal: spacing.md,
    textAlign: "right",
    color: colors.text,
  },
  toggle: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  toggleActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  alertRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
  },
  alertText: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xs,
  },
});
