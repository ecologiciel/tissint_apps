import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { router } from "expo-router";
import { Camera, Check, Crosshair, MapPin, RotateCcw, Scale, Sparkles, SunMedium } from "lucide-react-native";
import { useRef, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from "react-native";
import type { MobileImageFile } from "@tissint/api-client";
import { Button } from "@/components/ui/Button";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { t } from "@/i18n";
import { scanExterior } from "@/lib/api";
import { getOrCreateDeviceId } from "@/lib/device-id";
import { env } from "@/lib/env";
import { useScanStore } from "@/store/scan-store";
import { useSessionStore } from "@/store/session-store";
import { colors, radius, spacing } from "@/theme";

type Shot = {
  id: string;
  label: string;
  optional?: boolean;
  file?: MobileImageFile;
};

const initialShots: Shot[] = [
  { id: "front", label: "أمامية" },
  { id: "back", label: "خلفية" },
  { id: "side", label: "جانبية" },
  { id: "cut", label: "مقطع", optional: true },
];

export function ScannerScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [shots, setShots] = useState(initialShots);
  const [activeIndex, setActiveIndex] = useState(0);
  const [weight, setWeight] = useState("");
  const [magnetic, setMagnetic] = useState<boolean | undefined>(undefined);
  const [region, setRegion] = useState("Tata");
  const [locationReady, setLocationReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useSessionStore();
  const { mockScenario, cycleMockScenario, setLastResult } = useScanStore();

  const requiredCount = shots.filter((shot) => !shot.optional && shot.file).length;
  const canAnalyze = requiredCount >= 3 && !loading;
  const activeShot = shots[activeIndex];

  async function capture() {
    if (!permission?.granted) {
      await requestPermission();
      return;
    }

    const photo = await cameraRef.current?.takePictureAsync({
      quality: 0.85,
      skipProcessing: false,
    });
    if (!photo?.uri) return;

    const compressed = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 1440 } }],
      { compress: 0.78, format: ImageManipulator.SaveFormat.JPEG },
    );

    const file: MobileImageFile = {
      uri: compressed.uri,
      name: `${activeShot.id}-${Date.now()}.jpg`,
      type: "image/jpeg",
    };

    setShots((current) => current.map((shot, index) => (index === activeIndex ? { ...shot, file } : shot)));
    const next = shots.findIndex((shot, index) => index !== activeIndex && !shot.file);
    if (next >= 0) setActiveIndex(next);
  }

  async function analyze() {
    if (!canAnalyze) return;
    setLoading(true);
    try {
      const deviceId = await getOrCreateDeviceId();
      const exteriorFiles = shots.filter((shot) => !shot.optional && shot.file).map((shot) => shot.file!);
      const interiorFile = shots.find((shot) => shot.optional)?.file;
      const result = await scanExterior(
        {
          metadata: {
            clientUuid: `${deviceId}-${Date.now()}`,
            userId: user?.id ?? "anonymous",
            weightGram: Number(weight) || undefined,
            magnetic,
            latitude: locationReady ? 29.899 : undefined,
            longitude: locationReady ? -7.317 : undefined,
            region,
          },
          exteriorFiles,
          interiorFile,
        },
        mockScenario,
      );
      setLastResult(result);
      router.push("/scan/result");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen dark scroll={false} contentStyle={styles.root}>
      <View style={styles.header}>
        <View>
          <AppText variant="caption" color={colors.gold}>
            {env.apiMode === "mock" ? `${t("scanner.mock")} ${mockScenario}` : "API serveur"}
          </AppText>
          <AppText variant="title" color="#FFFFFF">
            {t("scanner.title")}
          </AppText>
        </View>
        <Pressable style={styles.mockButton} onPress={cycleMockScenario}>
          <AppText variant="caption" color="#FFFFFF">
            {mockScenario}
          </AppText>
        </Pressable>
      </View>

      <View style={styles.cameraBox}>
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
        ) : (
          <View style={styles.permissionBox}>
            <Camera color={colors.gold} size={42} />
            <AppText variant="body" color="#FFFFFF" style={styles.permissionText}>
              Tissint doit utiliser la camera. Aucun upload galerie n'est autorise.
            </AppText>
            <Button tone="secondary" onPress={requestPermission}>
              {t("scanner.permission")}
            </Button>
          </View>
        )}

        <View style={styles.frameGuide}>
          <View style={[styles.corner, styles.cornerTopRight]} />
          <View style={[styles.corner, styles.cornerTopLeft]} />
          <View style={[styles.corner, styles.cornerBottomRight]} />
          <View style={[styles.corner, styles.cornerBottomLeft]} />
        </View>

        <View style={styles.counter}>
          <AppText variant="caption" color="#FFFFFF">
            {requiredCount}/3 {t("scanner.required")}
          </AppText>
        </View>
      </View>

      <View style={styles.shots}>
        {shots.map((shot, index) => (
          <Pressable
            key={shot.id}
            onPress={() => setActiveIndex(index)}
            style={[styles.shot, activeIndex === index ? styles.shotActive : null, shot.file ? styles.shotDone : null]}
          >
            {shot.file ? <Check color={colors.success} size={18} /> : <Camera color="rgba(255,255,255,0.6)" size={18} />}
            <AppText variant="caption" color="#FFFFFF" style={styles.shotLabel}>
              {shot.label}
            </AppText>
            {shot.file ? (
              <Pressable
                onPress={() => setShots((current) => current.map((item) => (item.id === shot.id ? { ...item, file: undefined } : item)))}
              >
                <RotateCcw color="#FFFFFF" size={14} />
              </Pressable>
            ) : null}
          </Pressable>
        ))}
      </View>

      <View style={styles.qualityPanel}>
        <View style={styles.qualityItem}>
          <Check color={colors.success} size={15} />
          <AppText variant="caption" color="#FFFFFF">
            Stable
          </AppText>
        </View>
        <View style={styles.qualityItem}>
          <SunMedium color={colors.gold} size={15} />
          <AppText variant="caption" color="#FFFFFF">
            Lumiere OK
          </AppText>
        </View>
        <View style={styles.qualityItem}>
          <Crosshair color={colors.gold} size={15} />
          <AppText variant="caption" color="#FFFFFF">
            Pierre cadree
          </AppText>
        </View>
      </View>

      <View style={styles.metadata}>
        <View style={styles.inputWrap}>
          <Scale color={colors.gold} size={16} />
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
            placeholder="الوزن بالغرام"
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={styles.input}
          />
        </View>
        <View style={styles.inputWrap}>
          <MapPin color={colors.gold} size={16} />
          <TextInput
            value={region}
            onChangeText={setRegion}
            placeholder="المنطقة"
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.magnetic}>
        <Pressable style={[styles.magneticChoice, magnetic === false ? styles.magneticActive : null]} onPress={() => setMagnetic(false)}>
          <AppText variant="caption" color="#FFFFFF">
            غير مغناطيسي
          </AppText>
        </Pressable>
        <Pressable style={[styles.magneticChoice, magnetic === true ? styles.magneticActive : null]} onPress={() => setMagnetic(true)}>
          <AppText variant="caption" color="#FFFFFF">
            مغناطيسي
          </AppText>
        </Pressable>
      </View>

      <Pressable style={[styles.locationButton, locationReady ? styles.locationReady : null]} onPress={() => setLocationReady(true)}>
        <MapPin color={locationReady ? "#FFFFFF" : colors.gold} size={16} />
        <AppText variant="caption" color="#FFFFFF">
          {locationReady ? "GPS approximatif ajoute" : "Ajouter position GPS"}
        </AppText>
      </Pressable>

      <View style={styles.actions}>
        <Button icon={Camera} tone="ghost" onPress={capture} disabled={loading}>
          {t("scanner.capture")}
        </Button>
        <Button icon={Sparkles} tone="primary" onPress={analyze} disabled={!canAnalyze} loading={loading}>
          {loading ? "Analyse..." : t("scanner.analyze")}
        </Button>
      </View>

      {loading ? (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator color={colors.gold} size="large" />
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: spacing.md,
    backgroundColor: colors.stone,
  },
  header: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mockButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  cameraBox: {
    flex: 1,
    minHeight: 330,
    borderRadius: 28,
    overflow: "hidden",
    backgroundColor: "#10161D",
  },
  permissionBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.xl,
    gap: spacing.lg,
  },
  permissionText: {
    textAlign: "center",
  },
  frameGuide: {
    position: "absolute",
    top: 56,
    bottom: 56,
    left: 34,
    right: 34,
    borderRadius: 24,
  },
  corner: {
    position: "absolute",
    width: 34,
    height: 34,
    borderColor: colors.gold,
  },
  cornerTopRight: {
    right: 0,
    top: 0,
    borderRightWidth: 4,
    borderTopWidth: 4,
  },
  cornerTopLeft: {
    left: 0,
    top: 0,
    borderLeftWidth: 4,
    borderTopWidth: 4,
  },
  cornerBottomRight: {
    right: 0,
    bottom: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  cornerBottomLeft: {
    left: 0,
    bottom: 0,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
  },
  counter: {
    position: "absolute",
    top: 14,
    alignSelf: "center",
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  shots: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  shot: {
    flex: 1,
    minHeight: 62,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    backgroundColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  shotActive: {
    borderColor: colors.orange,
  },
  shotDone: {
    borderColor: colors.success,
  },
  shotLabel: {
    textAlign: "center",
  },
  qualityPanel: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  qualityItem: {
    flex: 1,
    minHeight: 34,
    borderRadius: radius.pill,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  metadata: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  inputWrap: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    paddingHorizontal: spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    color: "#FFFFFF",
    textAlign: "right",
    writingDirection: "rtl",
  },
  magnetic: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  magneticChoice: {
    flex: 1,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  magneticActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  locationButton: {
    minHeight: 40,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  locationReady: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  actions: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
    paddingBottom: spacing.sm,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: colors.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
});
