import { router, useLocalSearchParams } from "expo-router";
import { CheckCircle2, ShieldAlert, Store } from "lucide-react-native";
import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import type { PriceMode } from "@tissint/shared";
import { containsContactLeak } from "@tissint/shared";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { createListing } from "@/lib/api";
import { colors, radius, spacing } from "@/theme";

const priceModes: { id: PriceMode; label: string }[] = [
  { id: "fixed_total", label: "Prix total" },
  { id: "price_per_gram", label: "DH/g" },
  { id: "negotiable", label: "Negociable" },
  { id: "on_request", label: "Sur demande" },
];

export function PublishListingScreen() {
  const params = useLocalSearchParams<{ scanId?: string }>();
  const scanId = params.scanId ?? "last-scan";
  const [title, setTitle] = useState("Chondrite H5");
  const [description, setDescription] = useState("");
  const [priceMode, setPriceMode] = useState<PriceMode>("fixed_total");
  const [priceValue, setPriceValue] = useState("4500");
  const [weightGram, setWeightGram] = useState("120");
  const [region, setRegion] = useState("Tata");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const leak = containsContactLeak(description);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      await createListing({
        scanId,
        title,
        description,
        priceMode,
        priceValue: priceMode === "on_request" ? undefined : Number(priceValue) || undefined,
        weightGram: Number(weightGram) || 0,
        region,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publication impossible");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <Screen contentStyle={styles.center}>
        <Card style={styles.success}>
          <CheckCircle2 color={colors.success} size={42} />
          <AppText variant="title" color={colors.navy} style={styles.textCenter}>
            Annonce envoyee
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.textCenter}>
            Le serveur production appliquera le statut final: pending_admin ou hold rare 24h.
          </AppText>
          <Button onPress={() => router.replace("/marketplace")}>Retour au marche</Button>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View>
        <AppText variant="hero" color={colors.navy}>
          Publier
        </AppText>
        <AppText variant="caption">Scan: {scanId}</AppText>
      </View>

      <Card style={styles.form}>
        <TextInput value={title} onChangeText={setTitle} placeholder="Titre annonce" style={styles.input} />
        <TextInput value={weightGram} onChangeText={setWeightGram} placeholder="Poids en grammes" keyboardType="decimal-pad" style={styles.input} />
        <TextInput value={region} onChangeText={setRegion} placeholder="Region publique" style={styles.input} />

        <View style={styles.modes}>
          {priceModes.map((mode) => (
            <Button key={mode.id} tone={priceMode === mode.id ? "secondary" : "ghost"} onPress={() => setPriceMode(mode.id)}>
              {mode.label}
            </Button>
          ))}
        </View>

        {priceMode !== "on_request" ? (
          <TextInput value={priceValue} onChangeText={setPriceValue} placeholder="Prix" keyboardType="decimal-pad" style={styles.input} />
        ) : null}

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Description sans telephone, WhatsApp ou email"
          multiline
          style={[styles.input, styles.textarea]}
        />

        {leak ? (
          <View style={styles.warning}>
            <ShieldAlert color={colors.warning} size={20} />
            <AppText variant="caption" color={colors.warning}>
              Contact detecte. Le marketplace protege les coordonnees via Premium.
            </AppText>
          </View>
        ) : (
          <Badge label="Anti-fraude description OK" tone="success" />
        )}

        {error ? <AppText color={colors.danger}>{error}</AppText> : null}

        <Button icon={Store} loading={loading} disabled={leak || !title || !weightGram || !region} onPress={submit}>
          Soumettre annonce
        </Button>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  center: {
    justifyContent: "center",
  },
  success: {
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
  textarea: {
    minHeight: 110,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  modes: {
    gap: spacing.sm,
  },
  warning: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
});
