import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Bell, BookOpen, Crown, Heart, ScanLine, Search } from "lucide-react-native";
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { MeteoriteThumb } from "@/components/tissint/MeteoriteThumb";
import { ResponsiveText as Text } from "@/components/ui/ResponsiveText";

const DASH = {
  navy: "#1B4C66",
  cream: "#FBF4E6",
  orange: "#FF7A2A",
  gold: "#F7C75E",
  text: "#1E242A",
  muted: "#68717A",
  cardBorder: "#DEDEDE",
  stat: "#365F76",
};

const scanGradient = ["#FF8228", "#F4C457"] as const;

function useDashMetrics() {
  const { width, height } = useWindowDimensions();
  const sx = Math.min(width / 360, 1);
  const sy = Math.min(height / 800, 1);
  const s = Math.min(sx, sy);
  return {
    width,
    height,
    x: (value: number) => value * sx,
    y: (value: number) => value * sy,
    z: (value: number) => value * s,
  };
}

export function DashboardScreen() {
  const m = useDashMetrics();

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: m.y(24) }}
      >
        <View
          style={[
            styles.header,
            {
              height: m.y(203),
              paddingHorizontal: m.x(20),
              borderBottomLeftRadius: m.z(26),
              borderBottomRightRadius: m.z(26),
            },
          ]}
        >
          <View style={[styles.headerTop, { top: m.y(48) }]}>
            <Pressable
              onPress={() => router.push("/profile")}
              style={[styles.avatar, { width: m.z(44), height: m.z(44), borderRadius: m.z(22) }]}
            >
              <Text style={[styles.avatarText, { fontSize: m.z(18) }]}>صا</Text>
            </Pressable>
            <View style={[styles.greeting, { right: m.x(82), top: m.y(3) }]}>
              <Text style={[styles.hello, { fontSize: m.z(13), lineHeight: m.z(18) }]}>مرحباً</Text>
              <Text style={[styles.friend, { fontSize: m.z(22), lineHeight: m.z(30) }]}>
                صديق النيازك
              </Text>
            </View>
            <View style={[styles.quickActions, { left: 0, gap: m.x(10) }]}>
              <HeaderIcon icon={Bell} badge="2" />
              <HeaderIcon icon={Heart} />
              <HeaderIcon icon={Search} />
            </View>
          </View>
          <View style={[styles.statRow, { top: m.y(112), gap: m.x(8) }]}>
            <StatCard value="3" label="في مجموعتي" />
            <StatCard value="2/5" label="مسح اليوم" />
            <StatCard value="6" label="في السوق" />
          </View>
        </View>

        <View style={{ paddingHorizontal: m.x(20), paddingTop: m.y(20), gap: m.y(24) }}>
          <Pressable onPress={() => router.push("/scan" as never)}>
            <LinearGradient
              colors={scanGradient}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[
                styles.scanCard,
                { height: m.y(104), borderRadius: m.z(19), paddingHorizontal: m.x(20) },
              ]}
            >
              <View
                style={[
                  styles.scanIconBubble,
                  { width: m.z(64), height: m.z(64), borderRadius: m.z(32) },
                ]}
              >
                <ScanLine color="#FFFFFF" size={m.z(35)} strokeWidth={2.5} />
              </View>
              <View style={styles.scanTextWrap}>
                <Text style={[styles.scanTitle, { fontSize: m.z(27), lineHeight: m.z(35) }]}>
                  امسح حجراً
                </Text>
                <Text style={[styles.scanSubtitle, { fontSize: m.z(17), lineHeight: m.z(25) }]}>
                  حلّل عينة جديدة في ثوانٍ
                </Text>
              </View>
            </LinearGradient>
          </Pressable>

          <Pressable
            onPress={() => router.push("/first-scan" as never)}
            style={[
              styles.guideCard,
              { height: m.y(63), borderRadius: m.z(19), paddingHorizontal: m.x(14) },
            ]}
          >
            <Text style={[styles.leftArrow, { fontSize: m.z(24) }]}>‹</Text>
            <View style={styles.guideCopy}>
              <Text style={[styles.guideTitle, { fontSize: m.z(18), lineHeight: m.z(26) }]}>
                دليل أول فحص
              </Text>
              <Text style={[styles.guideSubtitle, { fontSize: m.z(13.5), lineHeight: m.z(20) }]}>
                5 نصائح للحصول على أفضل نتيجة
              </Text>
            </View>
            <View
              style={[styles.guideIcon, { width: m.z(48), height: m.z(48), borderRadius: m.z(24) }]}
            >
              <BookOpen color={DASH.orange} size={m.z(20)} strokeWidth={2.5} />
            </View>
          </Pressable>

          <Pressable
            onPress={() => router.push("/premium" as never)}
            style={[
              styles.premiumCard,
              { height: m.y(72), borderRadius: m.z(20), paddingHorizontal: m.x(18) },
            ]}
          >
            <Text style={[styles.premiumArrow, { fontSize: m.z(20) }]}>←</Text>
            <View style={styles.premiumCopy}>
              <Text style={[styles.premiumTitle, { fontSize: m.z(18), lineHeight: m.z(25) }]}>
                ارفع الحد اليومي
              </Text>
              <Text style={[styles.premiumSubtitle, { fontSize: m.z(13.5), lineHeight: m.z(20) }]}>
                Premium بـ 100 درهم/شهر
              </Text>
            </View>
            <Crown color={DASH.gold} size={m.z(28)} strokeWidth={2.3} />
          </Pressable>

          <View style={styles.sectionHeader}>
            <Text style={[styles.showAll, { fontSize: m.z(15), lineHeight: m.z(22) }]}>
              عرض الكل
            </Text>
            <View style={styles.sectionTitleWrap}>
              <Text style={[styles.sectionTitle, { fontSize: m.z(21), lineHeight: m.z(30) }]}>
                آخر المسوحات
              </Text>
              <BookOpen color={DASH.orange} size={m.z(18)} strokeWidth={2.3} />
            </View>
          </View>

          <View style={[styles.scanGrid, { gap: m.x(8) }]}>
            {[
              { id: "sample-1", label: "العينة #1", score: "87/100" },
              { id: "sample-2", label: "العينة #2", score: "42/100" },
              { id: "sample-3", label: "العينة #3", score: "12/100" },
            ].map((item) => (
              <Pressable
                key={item.id}
                onPress={() =>
                  router.push({ pathname: "/collection/[scanId]", params: { scanId: item.id } })
                }
                style={styles.sampleItem}
              >
                <MeteoriteThumb
                  seed={item.id}
                  style={[styles.sampleThumb, { height: m.y(100), borderRadius: m.z(17) }]}
                />
                <Text style={[styles.sampleLabel, { fontSize: m.z(13.5), lineHeight: m.z(20) }]}>
                  {item.label}
                </Text>
                <Text style={[styles.sampleScore, { fontSize: m.z(12.5), lineHeight: m.z(18) }]}>
                  {item.score}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function HeaderIcon({ icon: Icon, badge }: { icon: typeof Bell; badge?: string }) {
  const m = useDashMetrics();
  return (
    <Pressable
      style={[styles.headerIcon, { width: m.z(40), height: m.z(40), borderRadius: m.z(20) }]}
    >
      <Icon color="#FFFFFF" size={m.z(22)} strokeWidth={2.2} />
      {badge ? (
        <View
          style={[
            styles.notificationBadge,
            { minWidth: m.z(20), height: m.z(20), borderRadius: m.z(10) },
          ]}
        >
          <Text style={[styles.notificationText, { fontSize: m.z(10.5) }]}>{badge}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  const m = useDashMetrics();
  return (
    <View style={[styles.statCard, { height: m.y(67), borderRadius: m.z(18) }]}>
      <Text style={[styles.statValue, { fontSize: m.z(18), lineHeight: m.z(24) }]}>{value}</Text>
      <Text style={[styles.statLabel, { fontSize: m.z(11.5), lineHeight: m.z(18) }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: DASH.cream,
  },
  header: {
    backgroundColor: DASH.navy,
    overflow: "hidden",
  },
  headerTop: {
    position: "absolute",
    left: 20,
    right: 20,
    height: 50,
  },
  avatar: {
    position: "absolute",
    right: 0,
    backgroundColor: "#FFA33A",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  greeting: {
    position: "absolute",
    alignItems: "flex-end",
  },
  hello: {
    color: DASH.gold,
    textAlign: "right",
    writingDirection: "rtl",
  },
  friend: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  quickActions: {
    position: "absolute",
    flexDirection: "row",
  },
  headerIcon: {
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    backgroundColor: DASH.orange,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  notificationText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },
  statRow: {
    position: "absolute",
    left: 20,
    right: 20,
    flexDirection: "row-reverse",
  },
  statCard: {
    flex: 1,
    backgroundColor: DASH.stat,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    color: DASH.gold,
    fontWeight: "900",
    textAlign: "center",
  },
  statLabel: {
    color: "rgba(255,255,255,0.68)",
    textAlign: "center",
    writingDirection: "rtl",
  },
  scanCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  scanIconBubble: {
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  scanTextWrap: {
    alignItems: "flex-end",
  },
  scanTitle: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  scanSubtitle: {
    color: "#FFFFFF",
    textAlign: "right",
    writingDirection: "rtl",
  },
  guideCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: DASH.cardBorder,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  leftArrow: {
    color: DASH.orange,
    fontWeight: "900",
  },
  guideCopy: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 14,
  },
  guideTitle: {
    color: DASH.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  guideSubtitle: {
    color: DASH.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  guideIcon: {
    backgroundColor: "#FFF1EA",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumCard: {
    borderWidth: 1.6,
    borderStyle: "dashed",
    borderColor: "#F2D47B",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  premiumArrow: {
    color: DASH.orange,
    fontWeight: "900",
  },
  premiumCopy: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 18,
  },
  premiumTitle: {
    color: DASH.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  premiumSubtitle: {
    color: DASH.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  showAll: {
    color: DASH.orange,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionTitle: {
    color: DASH.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  scanGrid: {
    flexDirection: "row-reverse",
  },
  sampleItem: {
    flex: 1,
    alignItems: "center",
  },
  sampleThumb: {
    width: "100%",
  },
  sampleLabel: {
    color: DASH.text,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
    marginTop: 5,
  },
  sampleScore: {
    color: DASH.muted,
    textAlign: "center",
  },
});
