import { Tabs } from "expo-router";
import { Crown, Home, Library, ScanLine, Store } from "lucide-react-native";
import { colors } from "@/theme";
import { t } from "@/i18n";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.orange,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopColor: colors.border,
          height: 64,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("nav.dashboard"),
          tabBarIcon: ({ color }) => <Home color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: t("nav.scanner"),
          tabBarIcon: ({ color }) => <ScanLine color={color} size={23} />,
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: t("nav.collection"),
          tabBarIcon: ({ color }) => <Library color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="marketplace"
        options={{
          title: t("nav.market"),
          tabBarIcon: ({ color }) => <Store color={color} size={21} />,
        }}
      />
      <Tabs.Screen
        name="premium"
        options={{
          title: t("nav.premium"),
          tabBarIcon: ({ color }) => <Crown color={color} size={21} />,
        }}
      />
    </Tabs>
  );
}
