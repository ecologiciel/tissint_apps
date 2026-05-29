import { router } from "expo-router";
import { Check, CreditCard, Crown, ShieldCheck, Zap } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { t } from "@/i18n";
import { useSessionStore } from "@/store/session-store";
import { colors, spacing } from "@/theme";
import { PREMIUM_PLANS } from "@/features/parity/parity-data";

const features = [
  "10 scans par jour",
  "Telephone et WhatsApp vendeur",
  "Favoris et alertes",
  "Acces prioritaire aux nouvelles annonces",
  "Vente possible si pierre eligible",
];

export function PremiumScreen() {
  const { user, setRole } = useSessionStore();
  const premium = user?.role === "premium" || user?.role === "admin";

  return (
    <Screen contentStyle={styles.screen} dark>
      <View style={styles.hero}>
        <View style={styles.crown}>
          <Crown color={colors.stone} size={38} />
        </View>
        <Badge label={premium ? "Actif" : "100 DH / mois"} tone="premium" />
        <AppText variant="hero" color={colors.gold} style={styles.center}>
          {t("premium.title")}
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.72)" style={styles.center}>
          Debloque les contacts vendeurs, les alertes et les quotas premium.
        </AppText>
      </View>

      <Card style={styles.priceCard}>
        <AppText variant="hero" color={colors.navy} style={styles.center}>
          100 DH
        </AppText>
        <AppText variant="caption" style={styles.center}>
          par mois - paiement Stripe / PayPal / CMI prepare
        </AppText>
      </Card>

      <View style={styles.plans}>
        {PREMIUM_PLANS.map((plan) => (
          <Pressable
            key={plan.id}
            style={styles.planCard}
            onPress={() => router.push({ pathname: "/checkout", params: { plan: plan.id } })}
          >
            <AppText variant="subtitle">{plan.label}</AppText>
            <AppText variant="title" color={colors.orange}>
              {plan.priceDh} DH
            </AppText>
            <AppText variant="caption">{plan.period}{plan.hint ? ` - ${plan.hint}` : ""}</AppText>
          </Pressable>
        ))}
      </View>

      <Card>
        <View style={styles.featureList}>
          {features.map((feature) => (
            <View key={feature} style={styles.feature}>
              <Check color={colors.success} size={18} />
              <AppText variant="body">{feature}</AppText>
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.security}>
        <ShieldCheck color={colors.gold} size={24} />
        <AppText variant="caption" color="rgba(255,255,255,0.76)">
          Le statut Premium final doit venir du serveur et des webhooks paiement, jamais du mobile seul.
        </AppText>
      </Card>

      <Button icon={Zap} tone="secondary" onPress={() => setRole(premium ? "free" : "premium")}>
        {premium ? "Simuler expiration" : t("premium.cta")}
      </Button>
      <Button icon={CreditCard} onPress={() => router.push("/checkout")}>
        Ouvrir checkout simule
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
    backgroundColor: colors.stone,
  },
  hero: {
    alignItems: "center",
    gap: spacing.md,
    paddingTop: spacing.xl,
  },
  crown: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.gold,
  },
  center: {
    textAlign: "center",
  },
  priceCard: {
    alignItems: "center",
  },
  featureList: {
    gap: spacing.md,
  },
  feature: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: spacing.sm,
  },
  security: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
  },
  plans: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  planCard: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: colors.card,
    padding: spacing.lg,
    gap: spacing.xs,
    alignItems: "center",
  },
});
