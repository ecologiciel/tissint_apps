import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImageManipulator from "expo-image-manipulator";
import { router } from "expo-router";
import { Camera, Check, ChevronRight, Scale, Settings2, Sparkles } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { MobileImageFile } from "@tissint/api-client";
import { scanExterior } from "@/lib/api";
import { getOrCreateDeviceId } from "@/lib/device-id";
import { useScanStore } from "@/store/scan-store";
import { useSessionStore } from "@/store/session-store";

type Shot = {
  id: string;
  label: string;
  optional?: boolean;
  file?: MobileImageFile;
};

const scanShots: Shot[] = [
  { id: "front", label: "أمامية" },
  { id: "back", label: "خلفية" },
  { id: "side", label: "جانبية" },
  { id: "cut", label: "صورة مقطع", optional: true },
];

const UI = {
  dark: "#1C2024",
  card: "#03080E",
  orange: "#FF7A2A",
  gold: "#F7C75E",
  muted: "#B8B8B8",
  chip: "#14181C",
};

function useMetrics() {
  const { width, height } = useWindowDimensions();
  const sx = width / 360;
  const sy = height / 800;
  const s = Math.min(sx, sy);
  return {
    width,
    height,
    x: (value: number) => value * sx,
    y: (value: number) => value * sy,
    z: (value: number) => value * s,
  };
}

export function ScannerScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [shots, setShots] = useState(scanShots);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const { user } = useSessionStore();
  const { mockScenario, cycleMockScenario, setLastResult } = useScanStore();
  const m = useMetrics();

  const requiredCount = shots.filter((shot) => !shot.optional && shot.file).length;
  const canAnalyze = requiredCount >= 3 && !loading;
  const activeShot = shots[activeIndex] ?? shots[0];

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

    setShots((current) => {
      const updated = current.map((shot, index) =>
        index === activeIndex ? { ...shot, file } : shot,
      );
      const next = updated.findIndex((shot, index) => index !== activeIndex && !shot.file);
      if (next >= 0) setActiveIndex(next);
      return updated;
    });
  }

  async function analyze() {
    if (!canAnalyze) return;
    setLoading(true);
    try {
      const deviceId = await getOrCreateDeviceId();
      const exteriorFiles = shots
        .filter((shot) => !shot.optional && shot.file)
        .map((shot) => shot.file!);
      const interiorFile = shots.find((shot) => shot.optional)?.file;
      const result = await scanExterior(
        {
          metadata: {
            clientUuid: `${deviceId}-${Date.now()}`,
            userId: user?.id ?? "anonymous",
          },
          exteriorFiles,
          interiorFile,
        },
        mockScenario,
      );
      setLastResult(result);
      router.push("/scan/result" as never);
    } finally {
      setLoading(false);
    }
  }

  async function primaryAction() {
    if (canAnalyze) await analyze();
    else await capture();
  }

  return (
    <View style={styles.root}>
      <Pressable
        style={[
          styles.stepPill,
          { top: m.y(55), left: m.x(20), width: m.x(39), height: m.y(28), borderRadius: m.z(15) },
        ]}
      >
        <Text style={[styles.stepText, { fontSize: m.z(12.5) }]}>2/5</Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace("/dashboard" as never)}
        style={[
          styles.backButton,
          { top: m.y(48), right: m.x(20), width: m.z(40), height: m.z(40), borderRadius: m.z(20) },
        ]}
      >
        <ChevronRight color="#FFFFFF" size={m.z(26)} strokeWidth={3} />
      </Pressable>

      <Text style={[styles.title, { top: m.y(50), fontSize: m.z(18.5), lineHeight: m.z(27) }]}>
        التقاط العينة
      </Text>
      <Text style={[styles.subtitle, { top: m.y(73), fontSize: m.z(13.5), lineHeight: m.z(19) }]}>
        صورة {requiredCount}/3 إلزامية
      </Text>

      <View
        style={[
          styles.cameraCard,
          {
            top: m.y(100),
            left: m.x(12),
            width: m.x(336),
            height: m.y(564),
            borderRadius: m.z(24),
          },
        ]}
      >
        {permission?.granted ? (
          <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing="back" />
        ) : null}
        <View style={[styles.cameraShade, !permission?.granted ? styles.cameraShadeDark : null]} />

        <View
          style={[
            styles.instructionPill,
            {
              top: m.y(19),
              alignSelf: "center",
              borderRadius: m.z(17),
              paddingHorizontal: m.x(14),
            },
          ]}
        >
          <Text style={[styles.instructionText, { fontSize: m.z(13.5), lineHeight: m.z(22) }]}>
            ضع الحجر داخل الإطار - {activeShot.label}
          </Text>
        </View>

        {!permission?.granted ? (
          <View style={[styles.permissionCenter, { top: m.y(188), left: m.x(20), right: m.x(20) }]}>
            <View
              style={[
                styles.permissionIcon,
                { width: m.z(64), height: m.z(64), borderRadius: m.z(32) },
              ]}
            >
              <Camera color="#FF3D4D" size={m.z(29)} strokeWidth={2.7} />
            </View>
            <Text
              style={[
                styles.permissionTitle,
                { fontSize: m.z(18), lineHeight: m.z(28), marginTop: m.y(16) },
              ]}
            >
              الكاميرا غير مفعلة
            </Text>
            <Text
              style={[
                styles.permissionBody,
                { fontSize: m.z(14.5), lineHeight: m.z(24), marginTop: m.y(10) },
              ]}
            >
              يحتاج تيسنت للوصول إلى الكاميرا لالتقاط صور العينة. لا يمكن رفع صور من المعرض لضمان
              جودة التحليل.
            </Text>
            <Pressable
              onPress={requestPermission}
              style={[
                styles.permissionButton,
                { marginTop: m.y(18), width: m.x(143), height: m.y(36), borderRadius: m.z(19) },
              ]}
            >
              <Text
                style={[styles.permissionButtonText, { fontSize: m.z(17), lineHeight: m.z(24) }]}
              >
                السماح بالوصول
              </Text>
            </Pressable>
          </View>
        ) : (
          <View
            style={[
              styles.cameraGuide,
              { top: m.y(165), left: m.x(78), right: m.x(78), bottom: m.y(151) },
            ]}
          >
            <Corner position="topRight" />
            <Corner position="topLeft" />
            <Corner position="bottomRight" />
            <Corner position="bottomLeft" />
          </View>
        )}

        <View
          style={[styles.shotRow, { left: m.x(12), right: m.x(12), bottom: m.y(12), gap: m.x(8) }]}
        >
          {shots.map((shot, index) => (
            <Pressable
              key={shot.id}
              onPress={() => setActiveIndex(index)}
              style={[
                styles.shotCard,
                {
                  height: m.y(64),
                  borderRadius: m.z(17),
                  borderWidth: m.z(activeIndex === index ? 1.8 : 1.5),
                },
                activeIndex === index ? styles.shotCardActive : null,
                shot.file ? styles.shotCardDone : null,
              ]}
            >
              {shot.optional ? (
                <View
                  style={[
                    styles.optionalPill,
                    {
                      top: m.y(7),
                      right: m.x(6),
                      borderRadius: m.z(12),
                      paddingHorizontal: m.x(7),
                    },
                  ]}
                >
                  <Text style={[styles.optionalText, { fontSize: m.z(10.5) }]}>اختياري ✂</Text>
                </View>
              ) : null}
              {shot.file ? <Check color="#2E8B57" size={m.z(16)} /> : null}
              <Text
                style={[
                  styles.shotLabel,
                  {
                    fontSize: m.z(13),
                    lineHeight: m.z(20),
                    marginTop: shot.optional ? m.y(14) : 0,
                  },
                ]}
              >
                {shot.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.bottomControls, { top: m.y(680), left: 0, right: 0 }]}>
        <Pressable
          style={[
            styles.sideAction,
            styles.sideActionOrange,
            { width: m.z(48), height: m.z(48), borderRadius: m.z(24) },
          ]}
        >
          <Sparkles color="rgba(255,255,255,0.58)" size={m.z(27)} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          onPress={primaryAction}
          disabled={loading}
          style={[
            styles.captureOuter,
            { width: m.z(80), height: m.z(80), borderRadius: m.z(40), borderWidth: m.z(4) },
            canAnalyze ? styles.captureReady : null,
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <View
              style={[
                styles.captureInner,
                { width: m.z(64), height: m.z(64), borderRadius: m.z(32) },
              ]}
            />
          )}
        </Pressable>
        <Pressable
          onPress={cycleMockScenario}
          style={[styles.sideAction, { width: m.z(48), height: m.z(48), borderRadius: m.z(24) }]}
        >
          <Scale color="#FFFFFF" size={m.z(25)} strokeWidth={2.3} />
        </Pressable>
      </View>

      <Text
        style={[styles.footerText, { top: m.y(773), fontSize: m.z(13.5), lineHeight: m.z(20) }]}
      >
        {canAnalyze ? "اضغط لتحليل الصور" : "التقط 3 صور إضافية لتفعيل التحليل"}
      </Text>

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

function Corner({ position }: { position: "topRight" | "topLeft" | "bottomRight" | "bottomLeft" }) {
  return <View style={[styles.corner, styles[position]]} />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI.dark,
  },
  stepPill: {
    position: "absolute",
    backgroundColor: "#34383D",
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: {
    color: "#D8D8D8",
    fontWeight: "500",
  },
  backButton: {
    position: "absolute",
    backgroundColor: "#34383D",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5,
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    color: "#FFF8EC",
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  subtitle: {
    position: "absolute",
    left: 0,
    right: 0,
    color: UI.gold,
    textAlign: "center",
    writingDirection: "rtl",
  },
  cameraCard: {
    position: "absolute",
    backgroundColor: UI.card,
    overflow: "hidden",
  },
  cameraShade: {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  cameraShadeDark: {
    backgroundColor: "#050A10",
  },
  instructionPill: {
    position: "absolute",
    backgroundColor: "rgba(0,0,0,0.38)",
  },
  instructionText: {
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  permissionCenter: {
    position: "absolute",
    alignItems: "center",
  },
  permissionIcon: {
    backgroundColor: "rgba(255,61,77,0.24)",
    alignItems: "center",
    justifyContent: "center",
  },
  permissionTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  permissionBody: {
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  permissionButton: {
    backgroundColor: UI.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  cameraGuide: {
    position: "absolute",
  },
  corner: {
    position: "absolute",
    width: 30,
    height: 30,
    borderColor: "rgba(255,255,255,0.84)",
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  shotRow: {
    position: "absolute",
    flexDirection: "row-reverse",
  },
  shotCard: {
    flex: 1,
    backgroundColor: UI.chip,
    borderColor: "#484C50",
    alignItems: "center",
    justifyContent: "center",
  },
  shotCardActive: {
    borderColor: UI.orange,
  },
  shotCardDone: {
    borderColor: "#2E8B57",
  },
  optionalPill: {
    position: "absolute",
    backgroundColor: UI.gold,
  },
  optionalText: {
    color: "#1D242A",
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  shotLabel: {
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  bottomControls: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  sideAction: {
    backgroundColor: "#34383D",
    alignItems: "center",
    justifyContent: "center",
  },
  sideActionOrange: {
    backgroundColor: "#894E22",
  },
  captureOuter: {
    borderColor: "#8D9297",
    alignItems: "center",
    justifyContent: "center",
  },
  captureReady: {
    borderColor: UI.orange,
  },
  captureInner: {
    backgroundColor: "#8D9297",
  },
  footerText: {
    position: "absolute",
    left: 0,
    right: 0,
    color: UI.muted,
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
