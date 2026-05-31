import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useSessionStore } from "@/store/session-store";
import { colors } from "@/theme";

export default function Index() {
  const status = useSessionStore((state) => state.status);
  if (status === "booting") {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: colors.warm,
        }}
      >
        <ActivityIndicator color={colors.orange} />
      </View>
    );
  }
  return <Redirect href={status === "authenticated" ? "/dashboard" : "/onboarding"} />;
}
