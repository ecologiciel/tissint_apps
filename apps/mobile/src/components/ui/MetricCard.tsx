import { StyleSheet, View } from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { AppText } from "./AppText";
import { colors, radius, spacing } from "@/theme";

export function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <View style={styles.root}>
      <View style={styles.icon}>
        <Icon color={colors.orange} size={18} />
      </View>
      <AppText variant="title" color={colors.navy} style={styles.value}>
        {value}
      </AppText>
      <AppText variant="caption" style={styles.label}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    minHeight: 112,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "flex-end",
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    backgroundColor: "#FFF1E4",
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    marginTop: spacing.sm,
  },
  label: {
    marginTop: spacing.xs,
  },
});
