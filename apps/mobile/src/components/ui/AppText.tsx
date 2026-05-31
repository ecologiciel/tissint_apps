import type { ReactNode } from "react";
import { StyleSheet, Text, type TextStyle } from "react-native";
import { colors } from "@/theme";

export function AppText({
  children,
  variant = "body",
  color,
  style,
  numberOfLines,
}: {
  children: ReactNode;
  variant?: "hero" | "title" | "subtitle" | "body" | "caption";
  color?: string;
  style?: TextStyle;
  numberOfLines?: number;
}) {
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[styles.base, styles[variant], color ? { color } : null, style]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  hero: {
    fontSize: 30,
    lineHeight: 38,
    fontWeight: "900",
  },
  title: {
    fontSize: 22,
    lineHeight: 30,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "700",
  },
  body: {
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  caption: {
    fontSize: 12,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
