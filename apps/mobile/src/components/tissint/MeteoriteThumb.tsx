import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { colors, radius } from "@/theme";

function hashSeed(seed = "tissint") {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 9973;
  }
  return hash;
}

function palette(seed?: string, rare?: boolean) {
  if (rare) return ["#123F5A", "#F7C75E", "#2A3A44"];
  const palettes = [
    ["#504236", "#A56B3F", "#211B17"],
    ["#303A42", "#6C7780", "#171C21"],
    ["#5B4B3D", "#D8891C", "#282018"],
    ["#3E454A", "#8A6A4E", "#20252B"],
  ];
  return palettes[hashSeed(seed) % palettes.length];
}

export function MeteoriteThumb({
  rare = false,
  seed,
  style,
}: {
  rare?: boolean;
  seed?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const [background, rock, shadow] = palette(seed, rare);
  return (
    <View style={[styles.root, { backgroundColor: background }, style]}>
      <View style={[styles.glow, { backgroundColor: rock }]} />
      <View
        style={[
          styles.rock,
          { backgroundColor: rock, borderColor: rare ? colors.gold : "rgba(255,255,255,0.12)" },
        ]}
      />
      <View style={[styles.craterOne, { backgroundColor: shadow }]} />
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
  glow: {
    position: "absolute",
    width: "92%",
    height: "92%",
    borderRadius: 999,
    opacity: 0.22,
  },
  rock: {
    width: "62%",
    height: "58%",
    borderRadius: 24,
    transform: [{ rotate: "-12deg" }],
    borderWidth: 2,
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
