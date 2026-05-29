import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Heart, Lock } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { MeteoriteThumb } from "@/components/tissint/MeteoriteThumb";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { listMarketplace } from "@/lib/api";
import { useEngagementStore } from "@/store/engagement-store";
import { useSessionStore } from "@/store/session-store";
import { colors, spacing } from "@/theme";
import { formatPrice } from "@tissint/shared";

export function FavoritesScreen() {
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const favoriteIds = useEngagementStore((state) => state.favoriteIds);
  const marketplace = useQuery({ queryKey: ["marketplace", "favorites"], queryFn: listMarketplace });
  const favorites = (marketplace.data ?? []).filter((listing) => favoriteIds.includes(listing.listingId));
  const allowed = role === "premium" || role === "admin";

  if (!allowed) {
    return (
      <Screen contentStyle={styles.screen}>
        <Card style={styles.center}>
          <Lock color={colors.orange} size={34} />
          <AppText variant="title" color={colors.navy}>
            Favoris Premium
          </AppText>
          <AppText variant="body" color={colors.textMuted} style={styles.textCenter}>
            Les favoris font partie des outils acheteur Premium.
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
          Favoris
        </AppText>
        <AppText variant="caption">Annonces surveillees par ton compte Premium.</AppText>
      </View>

      {favorites.length === 0 ? (
        <Card style={styles.center}>
          <Heart color={colors.orange} size={32} />
          <AppText variant="subtitle">Aucun favori</AppText>
        </Card>
      ) : (
        favorites.map((listing) => (
          <Pressable
            key={listing.listingId}
            onPress={() => router.push({ pathname: "/marketplace/[listingId]", params: { listingId: listing.listingId } })}
          >
            <Card>
              <View style={styles.item}>
                <View style={styles.thumb}>
                  <MeteoriteThumb rare={listing.isRare} />
                </View>
                <View style={styles.content}>
                  <AppText variant="subtitle">{listing.title}</AppText>
                  <AppText variant="caption">{listing.region ?? "Region publique"}</AppText>
                  <AppText variant="title" color={colors.orange}>
                    {formatPrice(listing)}
                  </AppText>
                </View>
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
  center: {
    alignItems: "center",
    gap: spacing.md,
  },
  textCenter: {
    textAlign: "center",
  },
  item: {
    flexDirection: "row-reverse",
    gap: spacing.md,
  },
  thumb: {
    width: 96,
  },
  content: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xs,
  },
});
