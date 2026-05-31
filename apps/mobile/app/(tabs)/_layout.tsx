import { Tabs } from "expo-router";
import { PrototypeTabBar } from "@/components/tissint/PrototypeTabBar";
import { t } from "@/i18n";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
      }}
      tabBar={(props) => <PrototypeTabBar {...props} />}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: t("nav.dashboard"),
        }}
      />
      <Tabs.Screen name="scanner" options={{ href: null }} />
      <Tabs.Screen
        name="collection"
        options={{
          title: t("nav.collection"),
        }}
      />
      <Tabs.Screen
        name="market"
        options={{
          title: t("nav.market"),
        }}
      />
      <Tabs.Screen name="marketplace" options={{ href: null }} />
      <Tabs.Screen
        name="premium"
        options={{
          title: t("nav.premium"),
        }}
      />
    </Tabs>
  );
}
