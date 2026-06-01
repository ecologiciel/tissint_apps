import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ChevronRight,
  Download,
  Filter,
  Heart,
  Plus,
  Search,
  Settings2,
  Store,
  GitCompare,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import {
  ResponsiveText as Text,
  ResponsiveTextInput as TextInput,
} from "@/components/ui/ResponsiveText";
import { MeteoriteThumb } from "@/components/tissint/MeteoriteThumb";
import {
  DEMO_COLLECTION,
  DEMO_MARKETPLACE_LISTINGS,
  type DemoCollectionItem,
} from "@/features/parity/parity-data";

const UI = {
  navy: "#1B4C66",
  cream: "#FBF4E6",
  orange: "#FF7A2A",
  gold: "#F7C75E",
  text: "#1E242A",
  muted: "#68717A",
  border: "#DEDEDE",
  pale: "#F0EDE5",
};

const gradient = ["#FF7A2A", "#F7C75E"] as const;

function useMvpMetrics() {
  const { width, height } = useWindowDimensions();
  const sx = Math.min(width / 360, 1);
  const sy = Math.min(height / 800, 1);
  const s = Math.min(sx, sy);
  return {
    x: (value: number) => value * sx,
    y: (value: number) => value * sy,
    z: (value: number) => value * s,
  };
}

function SettingsFab() {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={() => router.push("/settings")}
      style={[
        styles.settingsFab,
        { left: m.x(16), bottom: m.y(17), width: m.z(48), height: m.z(48), borderRadius: m.z(24) },
      ]}
    >
      <Settings2 color="#FFFFFF" size={m.z(21)} strokeWidth={2.5} />
    </Pressable>
  );
}

function Header({
  title,
  subtitle,
  right,
  left,
  compact = false,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode | null;
  left?: ReactNode;
  compact?: boolean;
}) {
  const m = useMvpMetrics();
  return (
    <View
      style={[
        styles.header,
        {
          height: m.y(compact ? 108 : 176),
          borderBottomLeftRadius: m.z(26),
          borderBottomRightRadius: m.z(26),
          paddingHorizontal: m.x(20),
        },
      ]}
    >
      {right !== null
        ? (right ?? (
            <Pressable
              onPress={() => router.back()}
              style={[
                styles.headerBack,
                {
                  top: m.y(50),
                  right: m.x(20),
                  width: m.z(39),
                  height: m.z(39),
                  borderRadius: m.z(20),
                },
              ]}
            >
              <ChevronRight color="#FFFFFF" size={m.z(25)} strokeWidth={3} />
            </Pressable>
          ))
        : null}
      {left}
      <Text
        style={[
          styles.headerTitle,
          {
            top: m.y(compact ? 52 : 49),
            right: m.x(20),
            fontSize: m.z(compact ? 22 : 28),
            lineHeight: m.z(compact ? 31 : 39),
          },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.headerSubtitle,
            {
              top: m.y(compact ? 81 : 85),
              right: m.x(22),
              fontSize: m.z(14),
              lineHeight: m.z(21),
            },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function PillButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onPress?: () => void;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.pillButton,
        {
          minHeight: m.y(28),
          borderRadius: m.z(18),
          paddingHorizontal: m.x(14),
          gap: m.x(6),
          backgroundColor: active ? UI.orange : "rgba(255,255,255,0.12)",
        },
      ]}
    >
      {icon}
      <Text style={[styles.pillText, { fontSize: m.z(14), lineHeight: m.z(20) }]}>{label}</Text>
    </Pressable>
  );
}

export function MvpCollectionScreen() {
  const m = useMvpMetrics();
  const items = DEMO_COLLECTION.slice(0, 3);
  return (
    <View style={styles.root}>
      <Header
        title="مجموعتي"
        subtitle="3 عينة"
        right={null}
        left={
          <View style={[styles.collectionActions, { top: m.y(48), left: m.x(20), gap: m.x(8) }]}>
            <PillButton
              label="تصدير"
              icon={<Download color="#FFFFFF" size={m.z(15)} strokeWidth={2.4} />}
            />
            <PillButton
              label="مقارنة"
              active
              icon={<GitCompare color="#FFFFFF" size={m.z(15)} strokeWidth={2.4} />}
              onPress={() => router.push("/compare")}
            />
          </View>
        }
      />
      <View
        style={[
          styles.searchBox,
          { top: m.y(116), left: m.x(20), right: m.x(20), height: m.y(40), borderRadius: m.z(20) },
        ]}
      >
        <Search color="rgba(255,255,255,0.56)" size={m.z(19)} />
        <TextInput
          placeholder="إبحث..."
          placeholderTextColor="rgba(255,255,255,0.45)"
          style={[styles.searchInput, { fontSize: m.z(15) }]}
        />
      </View>

      <View style={[styles.filters, { top: m.y(188), left: m.x(20), right: m.x(20), gap: m.x(8) }]}>
        {["الكل", "احتمال قوي", "متوسط", "مرفوض"].map((filter, index) => (
          <View
            key={filter}
            style={[
              styles.filterChip,
              {
                height: m.y(28),
                borderRadius: m.z(16),
                paddingHorizontal: m.x(index === 1 ? 16 : 17),
              },
              index === 0 ? styles.filterActive : null,
            ]}
          >
            <Text
              style={[
                styles.filterText,
                index === 0 ? styles.filterTextActive : null,
                { fontSize: m.z(14), lineHeight: m.z(20) },
              ]}
            >
              {filter}
            </Text>
          </View>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: m.y(229),
          paddingHorizontal: m.x(20),
          paddingBottom: m.y(110),
        }}
      >
        <View style={[styles.collectionGrid, { gap: m.x(13) }]}>
          {items.map((item, index) => (
            <CollectionTile key={item.scanId} item={item} index={index} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function CollectionTile({ item, index }: { item: DemoCollectionItem; index: number }) {
  const m = useMvpMetrics();
  const label = index === 0 ? "العينة #1" : index === 1 ? "العينة #2" : "العينة #3";
  const className = index === 1 ? "غير محدد" : index === 2 ? "حجر أرضي" : "Chondrite H5";
  return (
    <Pressable
      onPress={() =>
        router.push({ pathname: "/collection/[scanId]", params: { scanId: item.scanId } })
      }
      style={[
        styles.collectionTile,
        {
          width: m.x(153),
          height: m.y(224),
          borderRadius: m.z(22),
          marginLeft: index === 2 ? m.x(166) : 0,
        },
      ]}
    >
      <MeteoriteThumb
        seed={item.scanId}
        rare={item.isRare}
        style={[styles.collectionThumb, { height: m.y(152) }]}
      />
      <View style={[styles.collectionBody, { paddingHorizontal: m.x(11), paddingTop: m.y(9) }]}>
        <Text style={[styles.tileTitle, { fontSize: m.z(14), lineHeight: m.z(20) }]}>{label}</Text>
        <Text style={[styles.tileClass, { fontSize: m.z(11.5), lineHeight: m.z(17) }]}>
          {className}
        </Text>
        <View style={styles.tileMeta}>
          <Text style={[styles.tileWeight, { fontSize: m.z(12.5) }]}>
            {index === 0 ? "145g" : index === 1 ? "60g" : "230g"}
          </Text>
          <Text style={[styles.tileScore, { fontSize: m.z(13.5) }]}>
            {index === 0 ? "87" : index === 1 ? "42" : "12"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

export function MvpCollectionDetailScreen({ hasItem }: { hasItem: boolean }) {
  if (!hasItem) {
    return <TopEmpty message="غير موجود" action="العودة" to="/collection" />;
  }
  return (
    <View style={styles.root}>
      <Header title="العينة #1" subtitle="Chondrite H5" compact />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.detailPlaceholder}>
          <MeteoriteThumb seed="mock-scan-001" style={{ height: 220, borderRadius: 24 }} />
          <Text style={styles.detailTitle}>Chondrite H5</Text>
          <Text style={styles.detailText}>87/100 · 145g · طاطا</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function TopEmpty({ message, action, to }: { message: string; action: string; to: string }) {
  const m = useMvpMetrics();
  return (
    <View style={styles.root}>
      <View style={[styles.topEmpty, { top: m.y(27) }]}>
        <Text style={[styles.topEmptyText, { fontSize: m.z(18), lineHeight: m.z(28) }]}>
          {message}
        </Text>
        <Pressable onPress={() => router.replace(to as never)}>
          <Text style={[styles.topEmptyAction, { fontSize: m.z(17), lineHeight: m.z(26) }]}>
            {action}
          </Text>
        </Pressable>
      </View>
      <SettingsFab />
    </View>
  );
}

export function MvpFavoritesScreen() {
  const m = useMvpMetrics();
  return (
    <View style={styles.root}>
      <Header
        title="المفضّلات"
        subtitle="0 عينة محفوظة"
        compact
        left={
          <Heart
            color={UI.orange}
            fill={UI.orange}
            size={m.z(22)}
            style={{ position: "absolute", top: m.y(61), left: m.x(21) }}
          />
        }
      />
      <View
        style={[
          styles.favoriteCard,
          { top: m.y(127), left: m.x(20), right: m.x(20), height: m.y(266), borderRadius: m.z(24) },
        ]}
      >
        <View
          style={[
            styles.favoriteIcon,
            { width: m.z(64), height: m.z(64), borderRadius: m.z(22), marginBottom: m.y(24) },
          ]}
        >
          <Heart color={UI.orange} size={m.z(35)} strokeWidth={2.4} />
        </View>
        <Text style={[styles.favoriteTitle, { fontSize: m.z(20), lineHeight: m.z(29) }]}>
          لا توجد مفضلات بعد
        </Text>
        <Text
          style={[
            styles.favoriteBody,
            { fontSize: m.z(15), lineHeight: m.z(25), marginTop: m.y(9) },
          ]}
        >
          اضغط على ❤ في أي إعلان لحفظه هنا والرجوع إليه لاحقاً.
        </Text>
        <Pressable onPress={() => router.push("/market" as never)} style={{ marginTop: m.y(24) }}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[
              styles.favoriteButton,
              { width: m.x(112), height: m.y(36), borderRadius: m.z(18) },
            ]}
          >
            <Text style={[styles.favoriteButtonText, { fontSize: m.z(16), lineHeight: m.z(24) }]}>
              تصفّح السوق
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
      <ManualBottomNav />
    </View>
  );
}

function ManualBottomNav() {
  const m = useMvpMetrics();
  return (
    <View style={[styles.manualTabBar, { height: m.y(70) }]}>
      <SettingsFab />
      <Text style={[styles.manualTabText, { right: m.x(22), bottom: m.y(18), fontSize: m.z(11) }]}>
        الرئيسية
      </Text>
      <Text style={[styles.manualTabText, { right: m.x(128), bottom: m.y(18), fontSize: m.z(11) }]}>
        مجموعتي
      </Text>
      <Text style={[styles.manualTabText, { left: m.x(104), bottom: m.y(18), fontSize: m.z(11) }]}>
        السوق
      </Text>
      <Pressable
        onPress={() => router.push("/scan" as never)}
        style={[
          styles.manualScan,
          {
            width: m.z(62),
            height: m.z(62),
            borderRadius: m.z(31),
            bottom: m.y(24),
            left: m.x(224),
          },
        ]}
      >
        <Search color="#FFFFFF" size={m.z(28)} />
      </Pressable>
    </View>
  );
}

export function MvpCompareScreen() {
  const m = useMvpMetrics();
  const rows: Array<[string, string, string, boolean]> = [
    ["التصنيف", "Chondrite H5", "غير محدد", false],
    ["نقاط الجودة", "87/100 ✓", "42/100", true],
    ["الحكم", "احتمال قوي", "متوسط", false],
    ["الوزن", "145 غ ✓", "60 غ", true],
    ["المصدر", "طاطا", "زاكورة", false],
    ["التاريخ", "2026/5/1", "2026/5/10", false],
  ];

  return (
    <View style={styles.root}>
      <Header title="مقارنة العيّنات" subtitle="حتى 3 عناصر" compact />
      <View
        style={[styles.compareTop, { top: m.y(125), left: m.x(16), right: m.x(16), gap: m.x(8) }]}
      >
        <View
          style={[styles.addCompare, { width: m.x(59), height: m.y(90), borderRadius: m.z(18) }]}
        >
          <Plus color="#5D6670" size={m.z(27)} />
        </View>
        {[DEMO_COLLECTION[1], DEMO_COLLECTION[0]].map((item, index) => (
          <View
            key={item.scanId}
            style={[styles.compareMini, { width: m.x(72), height: m.y(90), borderRadius: m.z(17) }]}
          >
            <View style={styles.compareBadge} />
            <MeteoriteThumb
              seed={item.scanId}
              style={[
                styles.compareMiniThumb,
                { width: m.x(54), height: m.y(54), borderRadius: m.z(13) },
              ]}
            />
            <Text style={[styles.compareMiniText, { fontSize: m.z(12), lineHeight: m.z(18) }]}>
              العينة #{index === 0 ? "2" : "1"}
            </Text>
          </View>
        ))}
      </View>
      <View
        style={[
          styles.compareTable,
          { top: m.y(228), left: m.x(16), right: m.x(16), borderRadius: m.z(20) },
        ]}
      >
        {rows.map(([label, a, b, green], index) => (
          <View
            key={label}
            style={[
              styles.compareRow,
              index % 2 ? styles.compareRowTint : null,
              { height: m.y(40) },
            ]}
          >
            <Text style={[styles.compareLabel, { fontSize: m.z(14.5) }]}>{label}</Text>
            <Text
              style={[
                styles.compareValue,
                green ? styles.compareGreen : null,
                { fontSize: m.z(14.5) },
              ]}
            >
              {a}
            </Text>
            <Text style={[styles.compareValue, { fontSize: m.z(14.5) }]}>{b}</Text>
          </View>
        ))}
      </View>
      <SettingsFab />
    </View>
  );
}

export function MvpPriceHistoryScreen() {
  const m = useMvpMetrics();
  return (
    <View style={styles.root}>
      <Header title="سجل الأسعار" subtitle="آخر 30 يوم" compact />
      <View
        style={[
          styles.priceFilter,
          { top: m.y(129), left: m.x(20), right: m.x(20), height: m.y(75), borderRadius: m.z(22) },
        ]}
      >
        <View style={styles.priceFilterHeader}>
          <Filter color="#5E6872" size={m.z(17)} />
          <Text style={[styles.priceFilterTitle, { fontSize: m.z(15), lineHeight: m.z(22) }]}>
            اختر التصنيف
          </Text>
        </View>
        <View style={[styles.priceChipRow, { gap: m.x(8) }]}>
          <View
            style={[
              styles.priceChip,
              styles.priceChipActive,
              { height: m.y(27), borderRadius: m.z(14), paddingHorizontal: m.x(14) },
            ]}
          >
            <Text style={[styles.priceChipTextActive, { fontSize: m.z(13), lineHeight: m.z(19) }]}>
              Chondrite ordinaire H5
            </Text>
          </View>
          <View
            style={[
              styles.priceChip,
              { height: m.y(27), borderRadius: m.z(14), paddingHorizontal: m.x(12) },
            ]}
          >
            <Text style={[styles.priceChipText, { fontSize: m.z(12.5), lineHeight: m.z(19) }]}>
              Pallasite (Stony-iron)
            </Text>
          </View>
        </View>
      </View>
      <View
        style={[
          styles.chartCard,
          { top: m.y(220), left: m.x(20), right: m.x(20), height: m.y(265), borderRadius: m.z(22) },
        ]}
      >
        <Text style={[styles.trend, { top: m.y(18), left: m.x(18), fontSize: m.z(13.5) }]}>
          37%- ↘
        </Text>
        <Text style={[styles.chartLabel, { top: m.y(17), right: m.x(32), fontSize: m.z(15) }]}>
          متوسط السعر (د.م/غ)
        </Text>
        <Text
          style={[
            styles.chartValue,
            { top: m.y(38), right: m.x(32), fontSize: m.z(32), lineHeight: m.z(42) },
          ]}
        >
          36
        </Text>
        <Text style={[styles.chartUnit, { top: m.y(55), right: m.x(94), fontSize: m.z(22) }]}>
          د.م/غ
        </Text>
        <PriceLine />
        <Text style={[styles.chartMin, { bottom: m.y(18), right: m.x(18), fontSize: m.z(13) }]}>
          أدنى 50 د.م
        </Text>
        <Text style={[styles.chartMin, { bottom: m.y(18), left: m.x(18), fontSize: m.z(13) }]}>
          أعلى 93 د.م
        </Text>
      </View>
      <View
        style={[
          styles.similarCard,
          { top: m.y(503), left: m.x(20), right: m.x(20), height: m.y(117), borderRadius: m.z(22) },
        ]}
      >
        <Text
          style={[
            styles.similarTitle,
            { top: m.y(20), right: m.x(20), fontSize: m.z(18), lineHeight: m.z(26) },
          ]}
        >
          إعلانات مماثلة (1)
        </Text>
        <Text
          style={[
            styles.similarName,
            { top: m.y(60), right: m.x(20), fontSize: m.z(18), lineHeight: m.z(26) },
          ]}
        >
          Chondrite H5 – Tissint
        </Text>
        <Text
          style={[
            styles.similarMeta,
            { top: m.y(88), right: m.x(20), fontSize: m.z(14), lineHeight: m.z(20) },
          ]}
        >
          124غ · طاطا
        </Text>
        <Text
          style={[
            styles.similarPrice,
            { top: m.y(69), left: m.x(19), fontSize: m.z(19), lineHeight: m.z(27) },
          ]}
        >
          4500 د.م
        </Text>
      </View>
      <SettingsFab />
    </View>
  );
}

function PriceLine() {
  return (
    <View style={styles.lineChart}>
      <View
        style={[
          styles.lineSegment,
          { left: 25, top: 116, width: 72, transform: [{ rotate: "-74deg" }] },
        ]}
      />
      <View
        style={[
          styles.lineSegment,
          { left: 35, top: 106, width: 34, transform: [{ rotate: "15deg" }] },
        ]}
      />
      <View
        style={[
          styles.lineSegment,
          { left: 71, top: 121, width: 70, transform: [{ rotate: "78deg" }] },
        ]}
      />
      <View style={[styles.lineSegment, { left: 102, top: 159, width: 66 }]} />
      <View style={[styles.lineSegment, { left: 168, top: 159, width: 66 }]} />
      <View
        style={[
          styles.lineSegment,
          { left: 230, top: 150, width: 47, transform: [{ rotate: "-64deg" }] },
        ]}
      />
      <View
        style={[
          styles.lineSegment,
          { left: 260, top: 104, width: 53, transform: [{ rotate: "-75deg" }] },
        ]}
      />
      <View
        style={[
          styles.lineSegment,
          { left: 278, top: 107, width: 33, transform: [{ rotate: "18deg" }] },
        ]}
      />
      <View
        style={[
          styles.lineSegment,
          { left: 305, top: 124, width: 74, transform: [{ rotate: "76deg" }] },
        ]}
      />
      <View style={[styles.lineSegment, { left: 338, top: 159, width: 42 }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: UI.cream },
  header: { backgroundColor: UI.navy, overflow: "hidden" },
  headerBack: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  headerTitle: {
    position: "absolute",
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  headerSubtitle: {
    position: "absolute",
    color: "rgba(255,255,255,0.64)",
    textAlign: "right",
    writingDirection: "rtl",
  },
  collectionActions: { position: "absolute", flexDirection: "row" },
  pillButton: { flexDirection: "row-reverse", alignItems: "center", justifyContent: "center" },
  pillText: { color: "#FFFFFF", fontWeight: "900", textAlign: "center", writingDirection: "rtl" },
  searchBox: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    textAlign: "right",
    writingDirection: "rtl",
    paddingVertical: 0,
  },
  filters: { position: "absolute", flexDirection: "row-reverse", justifyContent: "space-between" },
  filterChip: { backgroundColor: UI.pale, alignItems: "center", justifyContent: "center" },
  filterActive: { backgroundColor: UI.orange },
  filterText: { color: UI.text, fontWeight: "900", textAlign: "center", writingDirection: "rtl" },
  filterTextActive: { color: "#FFFFFF" },
  collectionGrid: { flexDirection: "row-reverse", flexWrap: "wrap" },
  collectionTile: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: UI.border,
    overflow: "hidden",
  },
  collectionThumb: { borderRadius: 0 },
  collectionBody: { flex: 1 },
  tileTitle: { color: UI.text, fontWeight: "900", textAlign: "right", writingDirection: "rtl" },
  tileClass: { color: UI.muted, textAlign: "right", writingDirection: "rtl" },
  tileMeta: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginTop: 9,
  },
  tileWeight: { color: UI.muted },
  tileScore: { color: UI.navy, fontWeight: "900" },
  topEmpty: { position: "absolute", left: 0, right: 0, alignItems: "center" },
  topEmptyText: { color: UI.text, textAlign: "center", writingDirection: "rtl" },
  topEmptyAction: { color: UI.orange, textAlign: "center", writingDirection: "rtl" },
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
  detailPlaceholder: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: UI.border,
  },
  detailTitle: { color: UI.text, fontSize: 24, fontWeight: "900", textAlign: "center" },
  detailText: { color: UI.muted, fontSize: 16, textAlign: "center" },
  favoriteCard: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: UI.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
  },
  favoriteIcon: { backgroundColor: "#FFF1EA", alignItems: "center", justifyContent: "center" },
  favoriteTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  favoriteBody: { color: UI.muted, textAlign: "center", writingDirection: "rtl" },
  favoriteButton: { alignItems: "center", justifyContent: "center" },
  favoriteButtonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  manualTabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: UI.border,
  },
  manualTabText: {
    position: "absolute",
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  manualScan: {
    position: "absolute",
    backgroundColor: UI.orange,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: UI.cream,
  },
  compareTop: { position: "absolute", flexDirection: "row" },
  addCompare: {
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: UI.border,
    alignItems: "center",
    justifyContent: "center",
  },
  compareMini: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: UI.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  compareBadge: {
    position: "absolute",
    top: 5,
    left: 7,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFC7D0",
  },
  compareMiniThumb: {},
  compareMiniText: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
    marginTop: 4,
  },
  compareTable: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: UI.border,
    overflow: "hidden",
  },
  compareRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
  },
  compareRowTint: { backgroundColor: "#F8F7F5" },
  compareLabel: {
    flex: 0.9,
    color: UI.muted,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  compareValue: { flex: 1, color: UI.text, textAlign: "center", writingDirection: "rtl" },
  compareGreen: { color: "#31A961", fontWeight: "900" },
  priceFilter: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: UI.border,
    paddingHorizontal: 18,
    paddingVertical: 13,
  },
  priceFilterHeader: { flexDirection: "row-reverse", alignItems: "center", gap: 8 },
  priceFilterTitle: { color: UI.muted, textAlign: "right", writingDirection: "rtl" },
  priceChipRow: { flexDirection: "row-reverse", marginTop: 10 },
  priceChip: {
    borderWidth: 1,
    borderColor: UI.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
  },
  priceChipActive: { backgroundColor: UI.orange, borderColor: UI.orange },
  priceChipText: { color: UI.text, fontWeight: "900", textAlign: "center" },
  priceChipTextActive: { color: "#FFFFFF", fontWeight: "900", textAlign: "center" },
  chartCard: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: UI.border,
  },
  trend: { position: "absolute", color: "#F42D3A", fontWeight: "900" },
  chartLabel: {
    position: "absolute",
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  chartValue: { position: "absolute", color: UI.navy, fontWeight: "900" },
  chartUnit: { position: "absolute", color: UI.muted, fontWeight: "900", writingDirection: "rtl" },
  lineChart: {
    position: "absolute",
    left: 22,
    right: 22,
    bottom: 50,
    height: 145,
    overflow: "hidden",
  },
  lineSegment: { position: "absolute", height: 2, backgroundColor: UI.orange },
  chartMin: { position: "absolute", color: UI.muted, writingDirection: "rtl" },
  similarCard: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: UI.border,
  },
  similarTitle: {
    position: "absolute",
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  similarName: { position: "absolute", color: UI.text, fontWeight: "900", textAlign: "right" },
  similarMeta: {
    position: "absolute",
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  similarPrice: {
    position: "absolute",
    color: UI.orange,
    fontWeight: "900",
    textAlign: "left",
    writingDirection: "rtl",
  },
});
