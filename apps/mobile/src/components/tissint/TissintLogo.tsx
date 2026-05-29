import { StyleSheet, View } from "react-native";
import { AppText } from "@/components/ui/AppText";
import { colors, radius } from "@/theme";

export function TissintLogo({ compact = false }: { compact?: boolean }) {
  return (
    <View style={styles.row}>
      <View style={[styles.mark, compact ? styles.compactMark : null]}>
        <View style={styles.core} />
      </View>
      {!compact ? (
        <AppText variant="title" color={colors.navy} style={styles.text}>
          Tissint
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  mark: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  compactMark: {
    width: 34,
    height: 34,
  },
  core: {
    width: 18,
    height: 18,
    borderRadius: 6,
    backgroundColor: colors.orange,
    transform: [{ rotate: "18deg" }],
    borderWidth: 2,
    borderColor: colors.gold,
  },
  text: {
    letterSpacing: 0,
  },
});
