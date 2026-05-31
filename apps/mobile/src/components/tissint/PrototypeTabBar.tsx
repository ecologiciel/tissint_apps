import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Crown, Home, Library, ScanLine, Settings2, Store } from "lucide-react-native";
import { Pressable, StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors, spacing } from "@/theme";

type PrototypeTab = {
  name: string;
  href: string;
  label: string;
  icon: typeof Home;
  primary?: boolean;
};

const tabs: PrototypeTab[] = [
  { name: "dashboard", href: "/dashboard", label: "الرئيسية", icon: Home },
  { name: "scan", href: "/scan", label: "مسح", icon: ScanLine, primary: true },
  { name: "collection", href: "/collection", label: "مجموعتي", icon: Library },
  { name: "market", href: "/market", label: "السوق", icon: Store },
  { name: "premium", href: "/premium", label: "Premium", icon: Crown },
];

export function PrototypeTabBar({
  state,
}: {
  state: { routes: { name: string }[]; index: number };
}) {
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View style={styles.root}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const active =
          activeRoute === tab.name || (tab.name === "market" && activeRoute === "marketplace");

        if (tab.primary) {
          return (
            <Pressable
              key={tab.name}
              style={styles.primaryItem}
              onPress={() => router.push(tab.href as never)}
            >
              <LinearGradient
                colors={["#FF7A2A", "#F7C75E"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.primaryButton}
              >
                <Icon color="#FFFFFF" size={25} />
              </LinearGradient>
              <AppText variant="caption" color={colors.orange} style={styles.primaryLabel}>
                {tab.label}
              </AppText>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={tab.name}
            style={styles.item}
            onPress={() => router.push(tab.href as never)}
          >
            <Icon color={active ? colors.navy : colors.textMuted} size={21} />
            <AppText
              variant="caption"
              color={active ? colors.navy : colors.textMuted}
              style={active ? styles.activeLabel : styles.label}
            >
              {tab.label}
            </AppText>
          </Pressable>
        );
      })}
      <Pressable style={styles.settingsFab} onPress={() => router.push("/settings")}>
        <Settings2 color="#FFFFFF" size={21} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    minHeight: 70,
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: "rgba(255,255,255,0.96)",
    flexDirection: "row-reverse",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  item: {
    flex: 1,
    minHeight: 50,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  primaryItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
  },
  primaryButton: {
    width: 62,
    height: 62,
    borderRadius: 31,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: colors.warm,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 7,
  },
  label: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
  },
  activeLabel: {
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
  },
  primaryLabel: {
    fontSize: 10,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 2,
  },
  settingsFab: {
    position: "absolute",
    left: 16,
    bottom: 15,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#1B1F23",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 11,
  },
});
