import type { ReactNode } from "react";
import {
  Pressable,
  StyleSheet,
  View,
  type KeyboardTypeOptions,
  type ViewStyle,
} from "react-native";
import type { LucideIcon } from "lucide-react-native";
import { ArrowRight, Check } from "lucide-react-native";
import { router } from "expo-router";
import { AppText } from "@/components/ui/AppText";
import { Card } from "@/components/ui/Card";
import { ResponsiveTextInput as TextInput } from "@/components/ui/ResponsiveText";
import { colors, radius, spacing } from "@/theme";

export function HeaderBar({
  title,
  subtitle,
  backTo,
  right,
  dark = true,
}: {
  title: string;
  subtitle?: string;
  backTo?: string;
  right?: ReactNode;
  dark?: boolean;
}) {
  return (
    <View style={[styles.header, dark ? styles.headerDark : styles.headerLight]}>
      <View style={styles.headerTop}>
        {backTo ? (
          <IconCircle icon={ArrowRight} onPress={() => router.push(backTo as never)} dark={dark} />
        ) : (
          <View style={styles.headerSpacer} />
        )}
        <View style={styles.headerTitle}>
          <AppText variant="title" color={dark ? "#FFFFFF" : colors.navy}>
            {title}
          </AppText>
          {subtitle ? (
            <AppText variant="caption" color={dark ? "rgba(255,255,255,0.68)" : colors.textMuted}>
              {subtitle}
            </AppText>
          ) : null}
        </View>
        {right ?? <View style={styles.headerSpacer} />}
      </View>
    </View>
  );
}

export function IconCircle({
  icon: Icon,
  onPress,
  dark = false,
}: {
  icon: LucideIcon;
  onPress?: () => void;
  dark?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.iconCircle, dark ? styles.iconCircleDark : styles.iconCircleLight]}
    >
      <Icon color={dark ? "#FFFFFF" : colors.navy} size={19} />
    </Pressable>
  );
}

export function SectionCard({
  title,
  icon: Icon,
  children,
  style,
}: {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  style?: ViewStyle;
}) {
  return (
    <Card style={style}>
      <View style={styles.sectionHead}>
        {Icon ? <Icon color={colors.orange} size={18} /> : null}
        <AppText variant="subtitle">{title}</AppText>
      </View>
      <View style={styles.sectionBody}>{children}</View>
    </Card>
  );
}

export function Field({
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  multiline,
}: {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      keyboardType={keyboardType}
      secureTextEntry={secureTextEntry}
      multiline={multiline}
      textAlign="right"
      style={[styles.field, multiline ? styles.textarea : null]}
    />
  );
}

export function Chip({
  label,
  active,
  onPress,
  icon: Icon,
  count,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  count?: number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : null]}
    >
      {Icon ? <Icon color={active ? "#FFFFFF" : colors.navy} size={14} /> : null}
      <AppText variant="caption" color={active ? "#FFFFFF" : colors.text} style={styles.chipText}>
        {label}
        {typeof count === "number" ? ` (${count})` : ""}
      </AppText>
    </Pressable>
  );
}

export function ToggleLine({
  label,
  value,
  onPress,
  icon: Icon,
}: {
  label: string;
  value: boolean;
  onPress: () => void;
  icon?: LucideIcon;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={onPress}
      style={styles.toggleRow}
    >
      {Icon ? <Icon color={colors.textMuted} size={18} /> : null}
      <AppText style={styles.toggleLabel}>{label}</AppText>
      <View style={[styles.switchTrack, value ? styles.switchOn : null]}>
        <View style={[styles.switchKnob, value ? styles.switchKnobOn : null]} />
      </View>
    </Pressable>
  );
}

export function InfoLine({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon?: LucideIcon;
}) {
  return (
    <View style={styles.infoLine}>
      {Icon ? <Icon color={colors.textMuted} size={17} /> : null}
      <AppText variant="caption" style={styles.infoLabel}>
        {label}
      </AppText>
      <AppText variant="body" style={styles.infoValue} numberOfLines={1}>
        {value}
      </AppText>
    </View>
  );
}

export function LinkLine({
  label,
  route,
  icon: Icon,
  badge,
}: {
  label: string;
  route: string;
  icon?: LucideIcon;
  badge?: string | number;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(route as never)}
      style={styles.infoLine}
    >
      {Icon ? <Icon color={colors.navy} size={17} /> : null}
      <AppText variant="body" style={styles.linkLabel}>
        {label}
      </AppText>
      {badge !== undefined ? (
        <View style={styles.smallBadge}>
          <AppText variant="caption" color={colors.orange} style={styles.smallBadgeText}>
            {badge}
          </AppText>
        </View>
      ) : null}
      <ArrowRight color={colors.textMuted} size={16} />
    </Pressable>
  );
}

export function MetricTile({
  label,
  value,
  icon: Icon,
  tone = "navy",
}: {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  tone?: "navy" | "orange" | "success" | "gold";
}) {
  const color =
    tone === "orange"
      ? colors.orange
      : tone === "success"
        ? colors.success
        : tone === "gold"
          ? colors.gold
          : colors.navy;
  return (
    <View style={styles.metricTile}>
      {Icon ? <Icon color={color} size={18} /> : null}
      <AppText variant="title" color={color} style={styles.metricValue}>
        {value}
      </AppText>
      <AppText variant="caption" style={styles.metricLabel}>
        {label}
      </AppText>
    </View>
  );
}

export function SelectCard({
  active,
  title,
  body,
  onPress,
}: {
  active: boolean;
  title: string;
  body?: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.selectCard, active ? styles.selectCardActive : null]}
    >
      <View style={styles.selectTop}>
        <AppText variant="subtitle" color={active ? colors.navy : colors.text}>
          {title}
        </AppText>
        <View style={[styles.radio, active ? styles.radioActive : null]}>
          {active ? <Check color="#FFFFFF" size={13} /> : null}
        </View>
      </View>
      {body ? <AppText variant="caption">{body}</AppText> : null}
    </Pressable>
  );
}

export function ProgressBar({ value, color = colors.orange }: { value: number; color?: string }) {
  return (
    <View style={styles.progressTrack}>
      <View
        style={[
          styles.progressFill,
          { width: `${Math.max(4, Math.min(value, 100))}%`, backgroundColor: color },
        ]}
      />
    </View>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body?: string;
}) {
  return (
    <Card style={styles.empty}>
      <Icon color={colors.orange} size={34} />
      <AppText variant="subtitle" style={styles.centerText}>
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" color={colors.textMuted} style={styles.centerText}>
          {body}
        </AppText>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  headerDark: {
    backgroundColor: colors.navy,
  },
  headerLight: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerTitle: {
    flex: 1,
    alignItems: "flex-end",
  },
  headerSpacer: {
    width: 40,
    height: 40,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCircleDark: {
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  iconCircleLight: {
    backgroundColor: colors.muted,
  },
  sectionHead: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionBody: {
    gap: spacing.sm,
  },
  field: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.warm,
    color: colors.text,
    paddingHorizontal: spacing.md,
    writingDirection: "rtl",
  },
  textarea: {
    minHeight: 106,
    paddingTop: spacing.md,
    textAlignVertical: "top",
  },
  chip: {
    minHeight: 34,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
  },
  chipActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  chipText: {
    fontWeight: "800",
  },
  toggleRow: {
    minHeight: 44,
    borderRadius: radius.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  toggleLabel: {
    flex: 1,
    fontWeight: "700",
  },
  switchTrack: {
    width: 42,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.muted,
    padding: 3,
  },
  switchOn: {
    backgroundColor: colors.orange,
  },
  switchKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
  },
  switchKnobOn: {
    marginLeft: 18,
  },
  infoLine: {
    minHeight: 44,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
  },
  infoLabel: {
    flex: 1,
  },
  infoValue: {
    maxWidth: "54%",
    fontWeight: "800",
    textAlign: "left",
    writingDirection: "ltr",
  },
  linkLabel: {
    flex: 1,
    fontWeight: "800",
  },
  smallBadge: {
    minWidth: 24,
    minHeight: 22,
    borderRadius: 11,
    backgroundColor: "#FFF2E5",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.sm,
  },
  smallBadgeText: {
    fontWeight: "900",
  },
  metricTile: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    padding: spacing.md,
    alignItems: "center",
    gap: spacing.xs,
  },
  metricValue: {
    textAlign: "center",
  },
  metricLabel: {
    textAlign: "center",
  },
  selectCard: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: spacing.md,
    gap: spacing.sm,
  },
  selectCardActive: {
    borderColor: colors.orange,
    backgroundColor: "#FFF2E5",
  },
  selectTop: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    borderColor: colors.orange,
    backgroundColor: colors.orange,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: colors.muted,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  empty: {
    alignItems: "center",
    gap: spacing.md,
  },
  centerText: {
    textAlign: "center",
  },
});
