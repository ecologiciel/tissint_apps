import { StyleSheet, View } from "react-native";
import { colors, radius } from "@/theme";

export function MeteoriteThumb({ rare = false }: { rare?: boolean }) {
  return (
    <View style={[styles.root, rare ? styles.rare : null]}>
      <View style={styles.rock} />
      <View style={styles.craterOne} />
      <View style={styles.craterTwo} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    aspectRatio: 1,
    borderRadius: radius.md,
    backgroundColor: colors.stone,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  rare: {
    backgroundColor: colors.navy,
  },
  rock: {
    width: "62%",
    height: "58%",
    borderRadius: 24,
    backgroundColor: "#4E4339",
    transform: [{ rotate: "-12deg" }],
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.12)",
  },
  craterOne: {
    position: "absolute",
    width: 22,
    height: 14,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.35)",
    right: "35%",
    top: "38%",
  },
  craterTwo: {
    position: "absolute",
    width: 14,
    height: 10,
    borderRadius: 8,
    backgroundColor: "rgba(247,199,94,0.24)",
    left: "34%",
    bottom: "32%",
  },
});
