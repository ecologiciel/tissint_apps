import { useQuery } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { BellPlus, Heart, Lock, MessageCircle, Phone, ShieldAlert, User } from "lucide-react-native";
import { Linking, Pressable, StyleSheet, View } from "react-native";
import { MeteoriteThumb } from "@/components/tissint/MeteoriteThumb";
import { AppText } from "@/components/ui/AppText";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { addFavorite, createAlert, getListing, removeFavorite } from "@/lib/api";
import { useEngagementStore } from "@/store/engagement-store";
import { useSessionStore } from "@/store/session-store";
import { colors, spacing } from "@/theme";
import { canRevealSellerContact, formatPrice, scoreToPercent } from "@tissint/shared";

export function ListingDetailScreen() {
  const params = useLocalSearchParams<{ listingId?: string }>();
  const listingId = params.listingId ?? "";
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const isFavorite = useEngagementStore((state) => state.isFavorite(listingId));
  const toggleFavoriteLocal = useEngagementStore((state) => state.toggleFavoriteLocal);
  const addAlertLocal = useEngagementStore((state) => state.addAlertLocal);
  const detail = useQuery({
    queryKey: ["listing", listingId, role],
    queryFn: () => getListing(listingId, role),
    enabled: Boolean(listingId),
  });

  const listing = detail.data;
  const canContact = listing ? canRevealSellerContact(role, listing.status) && listing.canContact : false;

  async function toggleFavorite() {
    if (role !== "premium" && role !== "admin") {
      router.push("/premium");
      return;
    }
    toggleFavoriteLocal(listingId);
    if (isFavorite) await removeFavorite(listingId);
    else await addFavorite(listingId);
  }

  async function addAlertFromListing() {
    if (!listing) return;
    if (role !== "premium" && role !== "admin") {
      router.push("/premium");
      return;
    }
    const alert = await createAlert({
      className: listing.dominantClass,
      region: listing.region,
      minScore: 0.85,
      rareOnly: listing.isRare,
      frequency: "instant",
    });
    addAlertLocal(alert);
    router.push("/alerts");
  }

  function callSeller() {
    if (!listing?.sellerPhone) return;
    void Linking.openURL(`tel:${listing.sellerPhone}`);
  }

  function openWhatsapp() {
    if (!listing?.sellerWhatsapp) return;
    const text = encodeURIComponent(`Bonjour, je suis interesse par votre annonce Tissint: ${listing.title}`);
    void Linking.openURL(`https://wa.me/${listing.sellerWhatsapp.replace(/\D/g, "")}?text=${text}`);
  }

  if (!listing) {
    return (
      <Screen>
        <Card>
          <AppText>{detail.isLoading ? "Chargement de l'annonce..." : "Annonce introuvable"}</AppText>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <MeteoriteThumb rare={listing.isRare} />

      <Card style={styles.headerCard}>
        <View style={styles.badges}>
          {listing.isRare ? <Badge label="Rare" tone="premium" /> : null}
          <Badge
            label={listing.status === "institutional_hold_24h" ? "Hold 24h" : "Publie"}
            tone={listing.status === "institutional_hold_24h" ? "warning" : "success"}
          />
        </View>
        <AppText variant="hero" color={colors.navy}>
          {listing.title}
        </AppText>
        <AppText variant="title" color={colors.orange}>
          {formatPrice(listing)}
        </AppText>
        <AppText variant="caption">
          {scoreToPercent(listing.confidence)}% - {listing.weightGram ?? "--"}g - {listing.region ?? "Region publique"}
        </AppText>
      </Card>

      <Card>
        <AppText variant="subtitle">Description</AppText>
        <AppText variant="body" color={colors.textMuted}>
          {listing.description ?? "Aucune description fournie."}
        </AppText>
      </Card>

      <Button
        tone="ghost"
        icon={User}
        onPress={() =>
          router.push({
            pathname: "/seller/[name]",
            params: { name: encodeURIComponent(listing.sellerName ?? listing.sellerMaskedName ?? "vendeur") },
          })
        }
      >
        Voir profil vendeur
      </Button>

      <Card style={styles.notice}>
        <ShieldAlert color={colors.warning} size={20} />
        <AppText variant="caption" color={colors.textMuted}>
          {listing.scientificNotice}
        </AppText>
      </Card>

      <View style={styles.actions}>
        <Button icon={Heart} tone={isFavorite ? "secondary" : "ghost"} onPress={toggleFavorite}>
          {isFavorite ? "Retirer favori" : "Favori Premium"}
        </Button>
        <Button icon={BellPlus} tone="ghost" onPress={addAlertFromListing}>
          Alerte similaire
        </Button>
      </View>

      {canContact ? (
        <View style={styles.actions}>
          <Button icon={Phone} tone="dark" onPress={callSeller}>
            Appeler vendeur
          </Button>
          <Button icon={MessageCircle} tone="secondary" onPress={openWhatsapp}>
            WhatsApp
          </Button>
        </View>
      ) : (
        <Pressable style={styles.locked} onPress={() => router.push("/premium")}>
          <Lock color={colors.orange} size={22} />
          <View style={styles.lockedText}>
            <AppText variant="subtitle">Contact verrouille</AppText>
            <AppText variant="caption">
              {listing.contactLockReason === "institutional_hold_24h"
                ? "Traitement institutionnel 24h avant ouverture du contact."
                : "Passe en Premium pour voir telephone et WhatsApp."}
            </AppText>
          </View>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  headerCard: {
    gap: spacing.sm,
  },
  badges: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  notice: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.muted,
  },
  actions: {
    gap: spacing.sm,
  },
  locked: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: 16,
    backgroundColor: "#FFF2E5",
    borderWidth: 1,
    borderColor: colors.orange,
  },
  lockedText: {
    flex: 1,
    alignItems: "flex-end",
  },
});
