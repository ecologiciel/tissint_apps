import { router } from "expo-router";
import { Settings2 } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";

const CREAM = "#FBF4E6";
const ORANGE = "#FF7A2A";
const TEXT = "#68717A";

function useMetrics() {
  const { width, height } = useWindowDimensions();
  const sx = width / 360;
  const sy = height / 800;
  const s = Math.min(sx, sy);
  return {
    x: (value: number) => value * sx,
    y: (value: number) => value * sy,
    z: (value: number) => value * s,
  };
}

export function MvpEmptyActionScreen({
  message,
  buttonLabel,
  onPress,
  buttonWidth = 123,
}: {
  message: string;
  buttonLabel: string;
  onPress: () => void;
  buttonWidth?: number;
}) {
  const m = useMetrics();

  return (
    <View style={styles.root}>
      <View style={[styles.center, { top: m.y(365), left: 0, right: 0 }]}>
        <Text
          style={[
            styles.message,
            { fontSize: m.z(17), lineHeight: m.z(25), marginBottom: m.y(16) },
          ]}
        >
          {message}
        </Text>
        <Pressable
          onPress={onPress}
          style={[
            styles.button,
            { width: m.x(buttonWidth), height: m.y(36), borderRadius: m.z(18) },
          ]}
        >
          <Text style={[styles.buttonText, { fontSize: m.z(16), lineHeight: m.z(24) }]}>
            {buttonLabel}
          </Text>
        </Pressable>
      </View>
      <Pressable
        onPress={() => router.push("/settings")}
        style={[
          styles.settingsFab,
          {
            left: m.x(16),
            bottom: m.y(17),
            width: m.z(48),
            height: m.z(48),
            borderRadius: m.z(24),
          },
        ]}
      >
        <Settings2 color="#FFFFFF" size={m.z(21)} strokeWidth={2.5} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: CREAM,
  },
  center: {
    position: "absolute",
    alignItems: "center",
  },
  message: {
    color: TEXT,
    textAlign: "center",
    writingDirection: "rtl",
  },
  button: {
    backgroundColor: ORANGE,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    textAlign: "center",
    writingDirection: "rtl",
  },
  settingsFab: {
    position: "absolute",
    backgroundColor: "#111820",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 11,
  },
});
