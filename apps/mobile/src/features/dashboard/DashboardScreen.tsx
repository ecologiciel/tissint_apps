import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { Bell, BookOpen, Crown, Gauge, Heart, Library, LogOut, Search, ShieldCheck, Store, User } from "lucide-react-native";
import { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { TissintLogo } from "@/components/tissint/TissintLogo";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";
import { MetricCard } from "@/components/ui/MetricCard";
import { Screen } from "@/components/ui/Screen";
import { t } from "@/i18n";
import { clearSavedSession } from "@/lib/session-storage";
import { getQuota, listMarketplace, setApiAccessToken } from "@/lib/api";
import { useSessionStore } from "@/store/session-store";
import { colors, spacing } from "@/theme";
import { Badge } from "@/components/ui/Badge";
import { DEMO_COLLECTION } from "@/features/parity/parity-data";
import { selectUnreadNotifications, useParityStore } from "@/features/parity/parity-store";

export function DashboardScreen() {
  const { user, quota, setQuota, setRole, clearSession } = useSessionStore();
  const unreadNotifications = useParityStore(selectUnreadNotifications);
  const listings = useQuery({ queryKey: ["marketplace", "preview"], queryFn: listMarketplace });
  const quotaQuery = useQuery({
    queryKey: ["quota", user?.role],
    enabled: Boolean(user),
    queryFn: () => getQuota(user?.role ?? "guest"),
  });
  const latest = listings.data?.slice(0, 2) ?? [];

  useEffect(() => {
    if (quotaQuery.data) setQuota(quotaQuery.data);
  }, [quotaQuery.data, setQuota]);

  async function logout() {
    await clearSavedSession();
    setApiAccessToken(null);
    clearSession();
    router.replace("/auth/login");
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.profileButton} onPress={() => router.push("/profile")}>
          <View style={styles.avatar}>
            <User color="#FFFFFF" size={19} />
          </View>
          <View>
            <AppText variant="caption" color={colors.gold}>
              مرحبا
            </AppText>
            <AppText color="#FFFFFF" style={styles.userName} numberOfLines={1}>
              {user?.firstName ?? "Tissint"} {user?.lastName ?? "User"}
            </AppText>
          </View>
        </Pressable>
        <View style={styles.headerIcons}>
          <Pressable style={styles.iconButton} onPress={() => router.push("/search")}>
            <Search color="#FFFFFF" size={19} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => router.push("/favorites")}>
            <Heart color="#FFFFFF" size={19} />
          </Pressable>
          <Pressable style={styles.iconButton} onPress={() => router.push("/notifications")}>
            <Bell color="#FFFFFF" size={19} />
            {unreadNotifications > 0 ? (
              <View style={styles.notificationDot}>
                <AppText variant="caption" color="#FFFFFF" style={styles.notificationText}>
                  {unreadNotifications}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <View style={styles.hero}>
        <TissintLogo />
        <Badge label={user?.role === "premium" ? "Premium" : user?.role === "admin" ? "Admin" : "Free"} tone="premium" />
      </View>

      <Button icon={Gauge} onPress={() => router.push("/scanner")}>
        {t("dashboard.scanCta")}
      </Button>

      <View style={styles.metrics}>
        <MetricCard icon={Gauge} label={t("dashboard.quota")} value={`${quota.remainingToday}/${quota.dailyLimit}`} />
        <MetricCard icon={Library} label="مجموعتي" value={DEMO_COLLECTION.length} />
        <MetricCard icon={Store} label={t("nav.market")} value={listings.data?.length ?? 0} />
      </View>

      <Pressable style={styles.guideCard} onPress={() => router.push("/first-scan")}>
        <BookOpen color={colors.orange} size={22} />
        <View style={styles.flex}>
          <AppText variant="subtitle">دليل أول فحص</AppText>
          <AppText variant="caption">5 نصائح للحصول على أفضل نتيجة ميدانية</AppText>
        </View>
      </Pressable>

      <Card>
        <View style={styles.rowBetween}>
          <View>
            <AppText variant="subtitle">{t("dashboard.latest")}</AppText>
            <AppText variant="caption">Mode API et marketplace synchronises via client serveur</AppText>
          </View>
          <Store color={colors.orange} size={22} />
        </View>

        <View style={styles.list}>
          {latest.map((item) => (
            <View key={item.listingId} style={styles.listingLine}>
              <View style={styles.dot} />
              <View style={styles.listingText}>
                <AppText variant="body" numberOfLines={1}>
                  {item.title}
                </AppText>
                <AppText variant="caption">
                  {Math.round(item.confidence * 100)}% - {item.region ?? "Region publique"}
                </AppText>
              </View>
              {item.isRare ? <Badge label="Rare" tone="premium" /> : null}
            </View>
          ))}
        </View>
      </Card>

      <Card style={styles.productionCard}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <AppText variant="subtitle" color="#FFFFFF">
              Socle production actif
            </AppText>
            <AppText variant="caption" color="rgba(255,255,255,0.75)">
              Secure Store, API client, RTL, quotas serveur et contrats partages sont prets a etre branches.
            </AppText>
          </View>
          <ShieldCheck color={colors.gold} size={28} />
        </View>
      </Card>

      <View style={styles.quickLinks}>
        <Button tone="ghost" icon={Heart} onPress={() => router.push("/favorites")}>
          Favoris
        </Button>
        <Button tone="ghost" icon={Bell} onPress={() => router.push("/alerts")}>
          Alertes
        </Button>
        {user?.role === "admin" ? (
          <Button tone="ghost" icon={ShieldCheck} onPress={() => router.push("/admin")}>
            Admin
          </Button>
        ) : null}
      </View>

      <View style={styles.roleSwitch}>
        <Button tone="ghost" icon={Crown} onPress={() => setRole(user?.role === "premium" ? "free" : "premium")}>
          {user?.role === "premium" ? "Tester Free" : "Tester Premium"}
        </Button>
        <Button tone="ghost" icon={LogOut} onPress={logout}>
          Deconnexion
        </Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  header: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.navy,
    borderRadius: 24,
    padding: spacing.md,
  },
  profileButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    fontWeight: "900",
    maxWidth: 142,
  },
  headerIcons: {
    flexDirection: "row-reverse",
    gap: spacing.xs,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  notificationDot: {
    position: "absolute",
    top: -3,
    right: -3,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  notificationText: {
    fontSize: 9,
    fontWeight: "900",
  },
  hero: {
    backgroundColor: colors.navy,
    borderRadius: 24,
    padding: spacing.xl,
    gap: spacing.lg,
    alignItems: "center",
  },
  metrics: {
    flexDirection: "row-reverse",
    gap: spacing.md,
  },
  rowBetween: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md,
  },
  list: {
    marginTop: spacing.md,
    gap: spacing.md,
  },
  listingLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.orange,
  },
  listingText: {
    flex: 1,
  },
  productionCard: {
    backgroundColor: colors.stone,
    borderColor: colors.stone,
  },
  flex: {
    flex: 1,
  },
  guideCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
  },
  roleSwitch: {
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  quickLinks: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
});
