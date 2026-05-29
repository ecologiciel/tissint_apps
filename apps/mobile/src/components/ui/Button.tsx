import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, StyleSheet, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "./AppText";
import { colors, radius, spacing } from "@/theme";

type ButtonTone = "primary" | "secondary" | "dark" | "ghost" | "danger";

export function Button({
  children,
  onPress,
  disabled,
  loading,
  tone = "primary",
  icon: Icon,
}: {
  children: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  tone?: ButtonTone;
  icon?: LucideIcon;
}) {
  const palette = palettes[tone];
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.root,
        { backgroundColor: palette.background, borderColor: palette.border },
        (disabled || loading) && styles.disabled,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      <View style={styles.inner}>
        {loading ? <ActivityIndicator color={palette.foreground} /> : null}
        {!loading && Icon ? <Icon color={palette.foreground} size={18} /> : null}
        <AppText style={styles.label} color={palette.foreground}>
          {children}
        </AppText>
      </View>
    </Pressable>
  );
}

const palettes: Record<ButtonTone, { background: string; foreground: string; border: string }> = {
  primary: { background: colors.orange, foreground: "#FFFFFF", border: colors.orange },
  secondary: { background: colors.gold, foreground: colors.stone, border: colors.gold },
  dark: { background: colors.navy, foreground: "#FFFFFF", border: colors.navy },
  ghost: { background: "transparent", foreground: colors.navy, border: colors.border },
  danger: { background: colors.danger, foreground: "#FFFFFF", border: colors.danger },
};

const styles = StyleSheet.create({
  root: {
    borderWidth: 1,
    borderRadius: radius.pill,
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
  },
  inner: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  label: {
    fontWeight: "800",
    textAlign: "center",
  },
  pressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
  },
});
