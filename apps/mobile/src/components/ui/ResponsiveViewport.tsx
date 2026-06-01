import { Platform, StyleSheet, View, type ViewStyle } from "react-native";
import type { ReactNode } from "react";
import { colors, layout } from "@/theme";

export function ResponsiveViewport({ children }: { children: ReactNode }) {
  if (Platform.OS !== "web") {
    return children;
  }

  return (
    <View style={styles.webShell}>
      <View style={styles.webViewport}>{children}</View>
    </View>
  );
}

const viewportStyle: ViewStyle = {
  flex: 1,
  width: "100%",
  maxWidth: layout.maxMobileWidth,
  backgroundColor: colors.warm,
  overflow: "hidden",
};

const styles = StyleSheet.create({
  webShell: {
    flex: 1,
    alignItems: "center",
    backgroundColor: colors.stone,
  },
  webViewport: viewportStyle,
});
