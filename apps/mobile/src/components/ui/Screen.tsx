import type { ReactNode } from "react";
import { ScrollView, StyleSheet, View, type ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing } from "@/theme";

export function Screen({
  children,
  scroll = true,
  dark = false,
  contentStyle,
}: {
  children: ReactNode;
  scroll?: boolean;
  dark?: boolean;
  contentStyle?: ViewStyle;
}) {
  const backgroundColor = dark ? colors.stone : colors.warm;
  if (!scroll) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor }]}>
        <View style={[styles.content, contentStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor }]}>
      <ScrollView contentContainerStyle={[styles.content, contentStyle]} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    padding: spacing.lg,
  },
});
