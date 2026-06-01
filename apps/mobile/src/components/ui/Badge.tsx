import { StyleSheet, View } from "react-native";
import { AppText } from "./AppText";
import { colors, fontWeights, radius, spacing } from "@/theme";

export function Badge({
  label,
  tone = "neutral",
}: {
  label: string;
  tone?: "neutral" | "success" | "warning" | "premium" | "danger";
}) {
  const palette = palettes[tone];
  return (
    <View style={[styles.root, { backgroundColor: palette.background }]}>
      <AppText variant="caption" color={palette.foreground} style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const palettes = {
  neutral: { background: colors.muted, foreground: colors.text },
  success: { background: "#E5F4EC", foreground: colors.success },
  warning: { background: "#FFF2D4", foreground: colors.warning },
  premium: { background: "#FFF5D2", foreground: colors.stone },
  danger: { background: "#FDE7E5", foreground: colors.danger },
};

const styles = StyleSheet.create({
  root: {
    alignSelf: "flex-start",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  label: {
    fontWeight: fontWeights.bold,
  },
});
