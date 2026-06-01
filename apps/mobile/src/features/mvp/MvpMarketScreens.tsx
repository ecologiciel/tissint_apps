import { useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  Award,
  BadgeCheck,
  BellPlus,
  Calendar,
  Check,
  CreditCard,
  Crown,
  Eye,
  Filter,
  Heart,
  Home,
  Library,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Scale,
  ScanLine,
  Search,
  Settings2,
  ShieldAlert,
  SlidersHorizontal,
  Smartphone,
  Star,
  Store,
  Target,
  TrendingUp,
  User,
  Wallet,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
} from "react-native";
import {
  ResponsiveText as Text,
  ResponsiveTextInput as TextInput,
} from "@/components/ui/ResponsiveText";
import { MvpEmptyActionScreen } from "@/features/mvp/MvpEmptyState";
import { createListing, getListing, listMarketplace } from "@/lib/api";
import { isHttpApiEnabled } from "@/lib/env";
import { useScanStore } from "@/store/scan-store";
import { useSessionStore } from "@/store/session-store";
import {
  containsContactLeak,
  formatPrice,
  type MarketplaceListing,
  type PriceMode,
} from "@tissint/shared";
import { DEMO_COLLECTION, DEMO_MARKETPLACE_LISTINGS } from "@/features/parity/parity-data";

const UI = {
  navy: "#1B4C66",
  navySoft: "#3B6075",
  cream: "#FBF4E6",
  orange: "#FF7A2A",
  gold: "#F7C75E",
  text: "#20252B",
  muted: "#65707B",
  border: "#DEDEDE",
  pale: "#F0EDE5",
  white: "#FFFFFF",
  success: "#2EAD64",
  danger: "#F42D3A",
};

const gradient = ["#FF7A2A", "#F7C75E"] as const;

type PrototypeMarketListing = MarketplaceListing & {
  displayTitle: string;
  displayMeta: string;
  displayPrice: string;
  verified?: boolean;
};

const MARKET_PROTOTYPE: PrototypeMarketListing[] = [
  {
    ...DEMO_MARKETPLACE_LISTINGS[5],
    displayTitle: "Chondrite H4 - مجموعة",
    displayMeta: "86g · طانطان",
    displayPrice: "2,100 د.م",
  },
  {
    ...DEMO_MARKETPLACE_LISTINGS[4],
    displayTitle: "Lunaire - شظية قمرية",
    displayMeta: "3g · أكادير",
    displayPrice: "24,000 د.م",
    verified: true,
  },
  {
    ...DEMO_MARKETPLACE_LISTINGS[3],
    displayTitle: "Shergottite (Martian)",
    displayMeta: "12g · الداخلة",
    displayPrice: "38,000 د.م",
    verified: true,
  },
  {
    ...DEMO_MARKETPLACE_LISTINGS[2],
    displayTitle: "Chondrite L6",
    displayMeta: "312g · زاكورة",
    displayPrice: "6,800 د.م",
  },
  {
    ...DEMO_MARKETPLACE_LISTINGS[0],
    displayTitle: "Chondrite H5 - Tissint",
    displayMeta: "124g · طاطا",
    displayPrice: "4,500 د.م",
    verified: true,
  },
  {
    ...DEMO_MARKETPLACE_LISTINGS[1],
    displayTitle: "Pallasite - شريحة",
    displayMeta: "48g · الرشيدية",
    displayPrice: "12,000 د.م",
    verified: true,
  },
];

function useMvpMetrics() {
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

function SettingsFab() {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={() => router.push("/settings" as never)}
      style={[
        styles.settingsFab,
        { left: m.x(16), bottom: m.y(17), width: m.z(48), height: m.z(48), borderRadius: m.z(24) },
      ]}
    >
      <Settings2 color={UI.white} size={m.z(21)} strokeWidth={2.5} />
    </Pressable>
  );
}

function BackButton({ to }: { to?: string }) {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={() => (to ? router.push(to as never) : router.back())}
      style={[
        styles.backButton,
        { top: m.y(50), right: m.x(20), width: m.z(39), height: m.z(39), borderRadius: m.z(20) },
      ]}
    >
      <Text style={[styles.chevron, { fontSize: m.z(32), lineHeight: m.z(36) }]}>›</Text>
    </Pressable>
  );
}

function HeaderPanel({
  title,
  subtitle,
  height = 108,
}: {
  title: string;
  subtitle?: string;
  height?: number;
}) {
  const m = useMvpMetrics();
  return (
    <View
      style={[
        styles.headerPanel,
        { height: m.y(height), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
      ]}
    >
      <BackButton />
      <Text
        style={[
          styles.headerTitle,
          { top: m.y(48), right: m.x(73), fontSize: m.z(27), lineHeight: m.z(39) },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.headerSubtitle,
            { top: m.y(82), right: m.x(74), fontSize: m.z(14), lineHeight: m.z(21) },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

function ManualBottomNav({
  active = "market",
}: {
  active?: "home" | "collection" | "market" | "scan" | "premium";
}) {
  const m = useMvpMetrics();
  const tabs = [
    { key: "home", label: "الرئيسية", icon: Home, to: "/dashboard", right: 22 },
    { key: "collection", label: "مجموعتي", icon: Library, to: "/collection", right: 128 },
    { key: "market", label: "السوق", icon: Store, to: "/market", left: 104 },
    { key: "premium", label: "Premium", icon: Crown, to: "/premium", left: 10 },
  ] as const;

  return (
    <View style={[styles.manualTabBar, { height: m.y(70) }]}>
      <SettingsFab />
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const selected = active === tab.key;
        const sideStyle = "right" in tab ? { right: m.x(tab.right) } : { left: m.x(tab.left) };
        return (
          <Pressable
            key={tab.key}
            onPress={() => router.push(tab.to as never)}
            style={[
              styles.manualTabItem,
              {
                bottom: m.y(10),
                width: m.x(72),
                ...sideStyle,
              },
            ]}
          >
            <Icon
              color={selected ? UI.navy : UI.muted}
              size={m.z(22)}
              strokeWidth={selected ? 2.7 : 2.3}
            />
            <Text
              style={[
                styles.manualTabText,
                selected ? styles.manualTabTextActive : null,
                { fontSize: m.z(11), lineHeight: m.z(16) },
              ]}
            >
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
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
        <ScanLine color={UI.white} size={m.z(28)} />
      </Pressable>
    </View>
  );
}

function PurpleThumb({ seed = "market", style }: { seed?: string; style?: object }) {
  const dots = useMemo(() => {
    const base = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return Array.from({ length: 24 }, (_, index) => ({
      left: 8 + ((base + index * 29) % 84),
      top: 8 + ((base * 3 + index * 37) % 84),
      opacity: index % 3 === 0 ? 0.25 : 0.14,
      size: index % 5 === 0 ? 4 : 3,
    }));
  }, [seed]);

  return (
    <LinearGradient
      colors={["#663368", "#351725", "#27131B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.marketThumb, style]}
    >
      {dots.map((dot, index) => (
        <View
          key={index}
          style={[
            styles.thumbDot,
            {
              top: `${dot.top}%` as `${number}%`,
              left: `${dot.left}%` as `${number}%`,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
              opacity: dot.opacity,
            },
          ]}
        />
      ))}
    </LinearGradient>
  );
}

function GreenThumb({ seed = "sample", style }: { seed?: string; style?: object }) {
  const dots = useMemo(() => {
    const base = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return Array.from({ length: 18 }, (_, index) => ({
      left: 8 + ((base + index * 37) % 84),
      top: 8 + ((base * 2 + index * 29) % 84),
      size: index % 4 === 0 ? 4 : 3,
    }));
  }, [seed]);

  return (
    <LinearGradient
      colors={["#2C604D", "#14353B", "#111C25"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.marketThumb, style]}
    >
      {dots.map((dot, index) => (
        <View
          key={index}
          style={[
            styles.thumbDot,
            {
              left: `${dot.left}%` as `${number}%`,
              top: `${dot.top}%` as `${number}%`,
              width: dot.size,
              height: dot.size,
              borderRadius: dot.size / 2,
            },
          ]}
        />
      ))}
    </LinearGradient>
  );
}

export function MvpStatsScreen() {
  const m = useMvpMetrics();
  const stats = [
    { label: "إجمالي العينات", value: "3", icon: Scale, tone: "blue" },
    { label: "احتمالات قوية", value: "1", icon: Award, tone: "green" },
    { label: "متوسط النقاط", value: "47/100", icon: Target, tone: "orange" },
    { label: "مبيعات", value: "0", icon: TrendingUp, tone: "gold" },
  ] as const;

  return (
    <View style={styles.root}>
      <HeaderPanel title="إحصائياتي" subtitle="نظرة شاملة على نشاطك" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(20),
          paddingTop: m.y(21),
          paddingBottom: m.y(42),
        }}
      >
        <View style={[styles.statGrid, { gap: m.x(13) }]}>
          {stats.map((item) => (
            <StatCard key={item.label} {...item} />
          ))}
        </View>

        <View
          style={[
            styles.statsWideCard,
            { height: m.y(201), borderRadius: m.z(22), marginTop: m.y(17), padding: m.z(18) },
          ]}
        >
          <View style={styles.statsCardTitleRow}>
            <Calendar color={UI.text} size={m.z(19)} strokeWidth={2.4} />
            <Text style={[styles.statsWideTitle, { fontSize: m.z(17), lineHeight: m.z(25) }]}>
              آخر 7 أيام
            </Text>
          </View>
          <View style={[styles.weekChart, { height: m.y(66), marginTop: m.y(78), gap: m.x(4) }]}>
            {["س", "ج", "خ", "ر", "ث", "ن", "ح"].map((day, index) => (
              <View key={day} style={styles.weekCol}>
                <View
                  style={[
                    styles.weekBar,
                    { width: m.x(37), height: m.y(index === 0 ? 8 : 7), borderRadius: m.z(4) },
                  ]}
                />
                <Text style={[styles.weekDay, { fontSize: m.z(12), lineHeight: m.z(18) }]}>
                  {day}
                </Text>
              </View>
            ))}
          </View>
          <Text
            style={[
              styles.todayText,
              { fontSize: m.z(14), lineHeight: m.z(21), marginTop: m.y(4) },
            ]}
          >
            اليوم: 2/5
          </Text>
        </View>

        <View
          style={[
            styles.classCard,
            { minHeight: m.y(164), borderRadius: m.z(22), marginTop: m.y(17), padding: m.z(18) },
          ]}
        >
          <Text style={[styles.classTitle, { fontSize: m.z(18), lineHeight: m.z(27) }]}>
            التصنيفات
          </Text>
          <ClassLine label="Chondrite H5" count="1" />
          <ClassLine label="غير محدد" count="1" />
          <ClassLine label="حجر أرضي" count="" />
        </View>
      </ScrollView>
      <SettingsFab />
    </View>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  icon: typeof Scale;
  tone: "blue" | "green" | "orange" | "gold";
}) {
  const m = useMvpMetrics();
  const color =
    tone === "green"
      ? UI.success
      : tone === "orange"
        ? UI.orange
        : tone === "gold"
          ? UI.gold
          : UI.navy;
  const background =
    tone === "green"
      ? "#E6F5EA"
      : tone === "orange"
        ? "#FDE8DC"
        : tone === "gold"
          ? "#FBF4DD"
          : "#EEF1F2";
  return (
    <View
      style={[
        styles.statCard,
        { width: m.x(154), height: m.y(129), borderRadius: m.z(22), padding: m.z(16) },
      ]}
    >
      <View
        style={[
          styles.statIcon,
          { width: m.z(40), height: m.z(40), borderRadius: m.z(20), backgroundColor: background },
        ]}
      >
        <Icon color={color} size={m.z(23)} strokeWidth={2.4} />
      </View>
      <Text
        style={[styles.statValue, { fontSize: m.z(28), lineHeight: m.z(35), marginTop: m.y(13) }]}
      >
        {value}
      </Text>
      <Text style={[styles.statLabel, { fontSize: m.z(13), lineHeight: m.z(19) }]}>{label}</Text>
    </View>
  );
}

function ClassLine({ label, count }: { label: string; count: string }) {
  const m = useMvpMetrics();
  return (
    <View style={{ marginTop: m.y(12) }}>
      <View style={styles.classLineTop}>
        <Text style={[styles.classLabel, { fontSize: m.z(14), lineHeight: m.z(20) }]}>{label}</Text>
        <Text style={[styles.classCount, { fontSize: m.z(13), lineHeight: m.z(19) }]}>{count}</Text>
      </View>
      <View
        style={[styles.classTrack, { height: m.y(8), borderRadius: m.z(4), marginTop: m.y(5) }]}
      >
        <View style={[styles.classFill, { width: "33%" }]} />
      </View>
    </View>
  );
}

export function MvpMarketplaceScreen() {
  const m = useMvpMetrics();
  const apiListings = useQuery({
    queryKey: ["marketplace"],
    queryFn: listMarketplace,
    enabled: isHttpApiEnabled(),
  });
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("كل المناطق");
  const regions = ["كل المناطق", "طانطا", "الرشيدية", "زاكورة"];
  const source =
    isHttpApiEnabled() && apiListings.data
      ? toPrototypeListings(apiListings.data)
      : MARKET_PROTOTYPE;
  const filtered = source.filter((item) => {
    const matchesRegion = region === "كل المناطق" || item.displayMeta.includes(region);
    const matchesQuery =
      !query.trim() ||
      `${item.displayTitle} ${item.displayMeta}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesRegion && matchesQuery;
  });

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.marketHeader,
          { height: m.y(180), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
        ]}
      >
        <Text
          style={[
            styles.marketTitle,
            { top: m.y(49), right: m.x(20), fontSize: m.z(30), lineHeight: m.z(42) },
          ]}
        >
          السوق
        </Text>
        <Text
          style={[
            styles.marketSubtitle,
            { top: m.y(89), right: m.x(22), fontSize: m.z(14), lineHeight: m.z(21) },
          ]}
        >
          6 إعلان متاح
        </Text>
        <View style={[styles.marketActions, { top: m.y(48), left: m.x(20), gap: m.x(8) }]}>
          <MarketPill
            label="إعلاناتي"
            active
            onPress={() => router.push("/market/my-listings" as never)}
          />
          <MarketPill label="الأسعار" icon onPress={() => router.push("/price-history" as never)} />
        </View>
        <Pressable
          onPress={() => setRegion("كل المناطق")}
          style={[
            styles.filterCircle,
            {
              top: m.y(116),
              left: m.x(20),
              width: m.z(44),
              height: m.z(44),
              borderRadius: m.z(22),
            },
          ]}
        >
          <SlidersHorizontal color={UI.white} size={m.z(22)} strokeWidth={2.4} />
        </Pressable>
        <View
          style={[
            styles.marketSearch,
            {
              top: m.y(116),
              left: m.x(72),
              right: m.x(20),
              height: m.y(40),
              borderRadius: m.z(20),
            },
          ]}
        >
          <Search color="rgba(255,255,255,0.58)" size={m.z(19)} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="إبحث في السوق..."
            placeholderTextColor="rgba(255,255,255,0.43)"
            style={[styles.marketSearchInput, { fontSize: m.z(15) }]}
          />
        </View>
      </View>

      <View style={[styles.marketRegions, { height: m.y(54), paddingTop: m.y(13) }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            flexDirection: "row-reverse",
            gap: m.x(8),
            paddingHorizontal: m.x(20),
          }}
        >
          {regions.map((item) => (
            <Pressable
              key={item}
              onPress={() => setRegion(item)}
              style={[
                styles.regionChip,
                {
                  height: m.y(28),
                  borderRadius: m.z(16),
                  paddingHorizontal: m.x(item === "كل المناطق" ? 18 : 20),
                  backgroundColor: region === item ? UI.orange : UI.pale,
                },
              ]}
            >
              <Text
                style={[
                  styles.regionText,
                  region === item ? styles.regionTextActive : null,
                  { fontSize: m.z(14), lineHeight: m.z(20) },
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: m.x(20), paddingBottom: m.y(104) }}
      >
        <View style={[styles.marketGrid, { gap: m.x(13) }]}>
          {filtered.map((listing) => (
            <MarketCard key={listing.listingId} listing={listing} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function toPrototypeListings(listings: MarketplaceListing[]): PrototypeMarketListing[] {
  return listings.map((listing) => ({
    ...listing,
    displayTitle: listing.title,
    displayMeta: `${listing.weightGram ?? "--"}g · ${listing.region ?? "غير محدد"}`,
    displayPrice: formatPrice(listing),
    verified: listing.sellerVerified,
  }));
}

function MarketPill({
  label,
  active,
  icon,
  onPress,
}: {
  label: string;
  active?: boolean;
  icon?: boolean;
  onPress: () => void;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.marketPill,
        {
          height: m.y(28),
          borderRadius: m.z(18),
          paddingHorizontal: m.x(14),
          backgroundColor: active ? UI.orange : "rgba(255,255,255,0.13)",
        },
      ]}
    >
      {icon ? <TrendingUp color={UI.white} size={m.z(15)} strokeWidth={2.4} /> : null}
      <Text style={[styles.marketPillText, { fontSize: m.z(14), lineHeight: m.z(20) }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function MarketCard({ listing }: { listing: PrototypeMarketListing }) {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/market/[listingId]",
          params: { listingId: listing.listingId },
        } as never)
      }
      style={[styles.marketCard, { width: m.x(153), height: m.y(227), borderRadius: m.z(22) }]}
    >
      <PurpleThumb
        seed={listing.listingId}
        style={{ width: "100%", height: m.y(152), borderRadius: 0 }}
      />
      <View style={[styles.marketCardBody, { paddingHorizontal: m.x(10), paddingTop: m.y(10) }]}>
        <Text
          numberOfLines={1}
          style={[styles.marketCardTitle, { fontSize: m.z(14), lineHeight: m.z(20) }]}
        >
          {listing.displayTitle}
        </Text>
        <View style={styles.marketMetaLine}>
          <MapPin color={UI.muted} size={m.z(13)} strokeWidth={2.3} />
          <Text
            numberOfLines={1}
            style={[styles.marketCardMeta, { fontSize: m.z(11.5), lineHeight: m.z(17) }]}
          >
            {listing.displayMeta}
          </Text>
        </View>
        <View style={styles.marketPriceLine}>
          <Text style={[styles.marketPrice, { fontSize: m.z(15), lineHeight: m.z(21) }]}>
            {listing.displayPrice}
          </Text>
          {listing.verified ? (
            <BadgeCheck color={UI.success} size={m.z(17)} strokeWidth={2.5} />
          ) : null}
        </View>
      </View>
    </Pressable>
  );
}

export function MvpListingDetailScreen() {
  const params = useLocalSearchParams<{ listingId?: string }>();
  const listingId = params.listingId ?? "";
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const demo = DEMO_MARKETPLACE_LISTINGS.find((item) => item.listingId === listingId);
  const detail = useQuery({
    queryKey: ["listing", listingId, role],
    queryFn: () => getListing(listingId, role),
    enabled: isHttpApiEnabled() && Boolean(listingId) && !demo,
    retry: false,
  });
  const listing = demo ?? detail.data;

  if (!listingId || (!listing && !detail.isLoading)) {
    return <TopRightEmpty message="غير موجود" action="العودة" to="/market" />;
  }

  if (!listing) {
    return (
      <View style={styles.root}>
        <TopRightEmpty message="جار التحميل" action="العودة" to="/market" />
      </View>
    );
  }

  const lockedByHold = listing.status === "institutional_hold_24h" && role !== "admin";
  const lockedByPremium = role !== "premium" && role !== "admin";
  const canContact = !lockedByHold && !lockedByPremium;

  return <CoherentListingDetail listing={listing} canContact={canContact} />;
}

function TopRightEmpty({ message, action, to }: { message: string; action: string; to: string }) {
  const m = useMvpMetrics();
  return (
    <View style={styles.root}>
      <View style={[styles.topRightEmpty, { top: m.y(25), right: m.x(29) }]}>
        <Text style={[styles.topRightMessage, { fontSize: m.z(18), lineHeight: m.z(28) }]}>
          {message}
        </Text>
        <Pressable onPress={() => router.replace(to as never)}>
          <Text style={[styles.topRightAction, { fontSize: m.z(17), lineHeight: m.z(26) }]}>
            {action}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

function CoherentListingDetail({
  listing,
  canContact,
}: {
  listing: MarketplaceListing;
  canContact: boolean;
}) {
  const m = useMvpMetrics();
  const displayTitle =
    MARKET_PROTOTYPE.find((item) => item.listingId === listing.listingId)?.displayTitle ??
    listing.title;
  const sellerName = listing.sellerName ?? listing.sellerMaskedName ?? "بائع موثق";

  function callSeller() {
    if (listing.sellerPhone) void Linking.openURL(`tel:${listing.sellerPhone}`);
  }

  function openWhatsapp() {
    if (!listing.sellerWhatsapp) return;
    const text = encodeURIComponent(
      `Bonjour, je suis interesse par votre annonce Tissint: ${listing.title}`,
    );
    void Linking.openURL(`https://wa.me/${listing.sellerWhatsapp.replace(/\D/g, "")}?text=${text}`);
  }

  return (
    <View style={styles.root}>
      <HeaderPanel title={displayTitle} subtitle={listing.region ?? "السوق"} height={118} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: m.x(20), paddingBottom: m.y(42) }}
      >
        <View style={[styles.detailHero, { borderRadius: m.z(24), padding: m.z(14) }]}>
          <PurpleThumb
            seed={listing.listingId}
            style={{ width: "100%", height: m.y(222), borderRadius: m.z(20) }}
          />
          <View style={[styles.detailPriceRow, { marginTop: m.y(14) }]}>
            <Text style={[styles.detailPrice, { fontSize: m.z(25), lineHeight: m.z(35) }]}>
              {formatPrice(listing)}
            </Text>
            {listing.sellerVerified ? <BadgeCheck color={UI.success} size={m.z(24)} /> : null}
          </View>
          <Text style={[styles.detailMeta, { fontSize: m.z(15), lineHeight: m.z(23) }]}>
            {listing.dominantClass} · {listing.weightGram ?? "--"}g ·{" "}
            {Math.round(listing.confidence * 100)}/100
          </Text>
        </View>

        <View
          style={[
            styles.detailCard,
            { borderRadius: m.z(22), padding: m.z(18), marginTop: m.y(14) },
          ]}
        >
          <Text style={[styles.detailSectionTitle, { fontSize: m.z(18), lineHeight: m.z(27) }]}>
            تفاصيل الإعلان
          </Text>
          <DetailLine label="المنطقة" value={listing.region ?? "غير محدد"} />
          <DetailLine label="البائع" value={sellerName} />
          <DetailLine
            label="الحالة"
            value={listing.status === "institutional_hold_24h" ? "معالجة 24 ساعة" : "منشور"}
          />
          <Text
            style={[
              styles.detailDescription,
              { fontSize: m.z(13.5), lineHeight: m.z(22), marginTop: m.y(10) },
            ]}
          >
            {listing.description ??
              "إعلان موثق داخل سوق تيسينت. الصور المعتمدة لا يمكن تعديلها بعد النشر."}
          </Text>
        </View>

        <View
          style={[
            styles.detailNotice,
            { borderRadius: m.z(18), padding: m.z(14), marginTop: m.y(14) },
          ]}
        >
          <ShieldAlert color={UI.orange} size={m.z(20)} />
          <Text style={[styles.detailNoticeText, { fontSize: m.z(12.5), lineHeight: m.z(19) }]}>
            هذه البيانات مساعدة بصرية ولا تعوض خبرة مخبرية رسمية.
          </Text>
        </View>

        {canContact ? (
          <View style={[styles.contactRow, { gap: m.x(10), marginTop: m.y(14) }]}>
            <GradientButton
              label="WhatsApp"
              icon={<MessageCircle color={UI.white} size={m.z(18)} />}
              onPress={openWhatsapp}
            />
            <GradientButton
              label="اتصال"
              icon={<Phone color={UI.white} size={m.z(18)} />}
              onPress={callSeller}
            />
          </View>
        ) : (
          <Pressable
            onPress={() => router.push("/premium" as never)}
            style={[
              styles.lockedCard,
              { borderRadius: m.z(20), padding: m.z(16), marginTop: m.y(14) },
            ]}
          >
            <Lock color={UI.orange} size={m.z(21)} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.lockedTitle, { fontSize: m.z(16), lineHeight: m.z(23) }]}>
                التواصل مقفل
              </Text>
              <Text style={[styles.lockedText, { fontSize: m.z(12.5), lineHeight: m.z(19) }]}>
                {listing.status === "institutional_hold_24h"
                  ? "العينة في معالجة مؤسساتية لمدة 24 ساعة."
                  : "الترقية إلى Premium تفتح الهاتف وواتساب."}
              </Text>
            </View>
          </Pressable>
        )}

        <View style={[styles.contactRow, { gap: m.x(10), marginTop: m.y(12) }]}>
          <OutlineButton
            label="تنبيه مشابه"
            icon={<BellPlus color={UI.navy} size={m.z(17)} />}
            onPress={() => router.push("/alerts" as never)}
          />
          <OutlineButton
            label="حفظ"
            icon={<Heart color={UI.navy} size={m.z(17)} />}
            onPress={() => router.push("/favorites" as never)}
          />
          <OutlineButton
            label="البائع"
            icon={<User color={UI.navy} size={m.z(17)} />}
            onPress={() => router.push("/seller/%D8%A8%D8%A7%D8%A6%D8%B9" as never)}
          />
        </View>
      </ScrollView>
      <SettingsFab />
    </View>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  const m = useMvpMetrics();
  return (
    <View style={[styles.detailLine, { paddingVertical: m.y(7) }]}>
      <Text style={[styles.detailLineLabel, { fontSize: m.z(14), lineHeight: m.z(21) }]}>
        {label}
      </Text>
      <Text style={[styles.detailLineValue, { fontSize: m.z(14), lineHeight: m.z(21) }]}>
        {value}
      </Text>
    </View>
  );
}

export function MvpMyListingsScreen() {
  const m = useMvpMetrics();
  const chips = ["الكل", "قيد المراجعة", "نشط", "مُباع", "مرفوض"];
  return (
    <View style={styles.root}>
      <View
        style={[
          styles.myListingsHeader,
          { height: m.y(170), borderBottomLeftRadius: m.z(24), borderBottomRightRadius: m.z(24) },
        ]}
      >
        <Pressable
          onPress={() => router.push("/scan" as never)}
          style={[
            styles.addListingButton,
            { top: m.y(49), left: m.x(20), width: m.z(40), height: m.z(40), borderRadius: m.z(20) },
          ]}
        >
          <Plus color={UI.white} size={m.z(28)} strokeWidth={2.2} />
        </Pressable>
        <BackButton to="/market" />
        <Text
          style={[
            styles.myListingsTitle,
            { top: m.y(58), right: m.x(139), fontSize: m.z(24), lineHeight: m.z(34) },
          ]}
        >
          إعلاناتي
        </Text>
        <View
          style={[styles.myMetrics, { top: m.y(100), left: m.x(20), right: m.x(20), gap: m.x(8) }]}
        >
          {["الإجمالي", "نشط", "مُباع", "مراجعة"].map((label) => (
            <View
              key={label}
              style={[styles.myMetricCard, { height: m.y(54), borderRadius: m.z(16) }]}
            >
              <Text style={[styles.myMetricValue, { fontSize: m.z(17), lineHeight: m.z(23) }]}>
                0
              </Text>
              <Text style={[styles.myMetricLabel, { fontSize: m.z(11.5), lineHeight: m.z(17) }]}>
                {label}
              </Text>
            </View>
          ))}
        </View>
      </View>
      <View style={[styles.myChips, { height: m.y(45), paddingHorizontal: m.x(20), gap: m.x(7) }]}>
        {chips.map((chip, index) => (
          <View
            key={chip}
            style={[
              styles.myChip,
              {
                height: m.y(28),
                borderRadius: m.z(16),
                paddingHorizontal: m.x(index === 1 ? 14 : 17),
                backgroundColor: index === 0 ? UI.orange : "#F7F4EF",
              },
            ]}
          >
            <Text
              style={[
                styles.myChipText,
                index === 0 ? styles.myChipTextActive : null,
                { fontSize: m.z(14), lineHeight: m.z(20) },
              ]}
            >
              {chip}
            </Text>
          </View>
        ))}
      </View>
      <View style={[styles.myEmpty, { top: m.y(307), left: 0, right: 0 }]}>
        <Eye color={UI.muted} size={m.z(40)} strokeWidth={2.4} />
        <Text
          style={[
            styles.myEmptyText,
            { fontSize: m.z(16), lineHeight: m.z(24), marginTop: m.y(38) },
          ]}
        >
          لا توجد إعلانات في هذه الفئة
        </Text>
        <Pressable onPress={() => router.push("/scan" as never)} style={{ marginTop: m.y(22) }}>
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={[
              styles.myEmptyButton,
              { width: m.x(137), height: m.y(36), borderRadius: m.z(18) },
            ]}
          >
            <Text style={[styles.myEmptyButtonText, { fontSize: m.z(16), lineHeight: m.z(24) }]}>
              ابدأ مسحاً جديداً
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
      <ManualBottomNav active="market" />
    </View>
  );
}

export function MvpPublishListingScreen() {
  const params = useLocalSearchParams<{ scanId?: string }>();
  const scanId = params.scanId;
  const lastResult = useScanStore((state) => state.lastResult);
  const demo = scanId ? DEMO_COLLECTION.find((item) => item.scanId === scanId) : undefined;
  const scan =
    demo ??
    (scanId && lastResult?.scanId === scanId
      ? {
          scanId: lastResult.scanId,
          className: lastResult.className,
          fusionScore: lastResult.fusionScore,
          weightGram: 120,
          region: "غير محدد",
        }
      : undefined);

  if (!scanId || !scan) {
    return (
      <MvpEmptyActionScreen
        message="لم يتم العثور على المسح"
        buttonLabel="العودة للمسح"
        buttonWidth={123}
        onPress={() => router.replace("/scan" as never)}
      />
    );
  }

  return <CoherentPublishForm scan={scan} />;
}

export function MvpSellerProfileScreen() {
  const m = useMvpMetrics();
  const params = useLocalSearchParams<{ name?: string }>();
  const sellerName = params.name ? decodeURIComponent(params.name) : "john";
  const bars = [
    { label: "5", value: 0, active: false },
    { label: "4", value: 1, active: true },
    { label: "3", value: 0, active: false },
    { label: "2", value: 0, active: false },
    { label: "1", value: 0, active: false },
  ];

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.sellerHeader,
          { height: m.y(263), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
        ]}
      >
        <BackButton to="/market" />
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.sellerAvatar,
            {
              top: m.y(100),
              right: m.x(40),
              width: m.z(64),
              height: m.z(64),
              borderRadius: m.z(32),
            },
          ]}
        >
          <Text style={[styles.sellerAvatarText, { fontSize: m.z(28), lineHeight: m.z(38) }]}>
            j
          </Text>
        </LinearGradient>
        <Text
          style={[
            styles.sellerName,
            { top: m.y(109), right: m.x(117), fontSize: m.z(23), lineHeight: m.z(33) },
          ]}
          numberOfLines={1}
        >
          {sellerName || "john"}
        </Text>
        <View style={[styles.sellerRatingLine, { top: m.y(144), right: m.x(118) }]}>
          <Text style={[styles.sellerRatingText, { fontSize: m.z(15), lineHeight: m.z(22) }]}>
            5 تقييم ·{" "}
          </Text>
          <Text style={[styles.sellerRatingValue, { fontSize: m.z(16), lineHeight: m.z(22) }]}>
            4.2
          </Text>
          <Star color={UI.gold} fill={UI.gold} size={m.z(20)} />
        </View>
        <View
          style={[
            styles.sellerStats,
            { top: m.y(180), left: m.x(20), right: m.x(20), gap: m.x(8) },
          ]}
        >
          <SellerMetric value="8" label="مبيعات" />
          <SellerMetric
            value="6س"
            label="استجابة"
            icon={<Calendar color={UI.white} size={m.z(14)} />}
          />
          <SellerMetric
            value="2025"
            label="انضم"
            icon={<Calendar color={UI.white} size={m.z(14)} />}
          />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(20),
          paddingTop: m.y(20),
          paddingBottom: m.y(114),
        }}
      >
        <View
          style={[styles.ratingCard, { height: m.y(161), borderRadius: m.z(22), padding: m.z(18) }]}
        >
          <Text style={[styles.ratingCardTitle, { fontSize: m.z(18), lineHeight: m.z(27) }]}>
            توزيع التقييمات
          </Text>
          <View style={[styles.ratingScoreBlock, { top: m.y(70), right: m.x(32) }]}>
            <Text style={[styles.ratingScore, { fontSize: m.z(34), lineHeight: m.z(43) }]}>
              4.2
            </Text>
            <View style={styles.ratingStars}>
              <Text style={[styles.fadedStar, { fontSize: m.z(15) }]}>☆</Text>
              {[1, 2, 3, 4].map((item) => (
                <Text key={item} style={[styles.goldStar, { fontSize: m.z(15) }]}>
                  ★
                </Text>
              ))}
            </View>
            <Text style={[styles.ratingCount, { fontSize: m.z(12.5), lineHeight: m.z(18) }]}>
              5 تقييم
            </Text>
          </View>
          <View style={[styles.ratingBars, { left: m.x(34), top: m.y(50), width: m.x(205) }]}>
            {bars.map((bar) => (
              <View key={bar.label} style={[styles.ratingBarLine, { height: m.y(20) }]}>
                <Text style={[styles.ratingBarCount, { fontSize: m.z(13), width: m.x(18) }]}>
                  {bar.value}
                </Text>
                <View style={[styles.ratingBarTrack, { height: m.y(8), borderRadius: m.z(5) }]}>
                  {bar.active ? <View style={styles.ratingBarFill} /> : null}
                </View>
                <Star color={UI.gold} fill={UI.gold} size={m.z(12)} />
                <Text style={[styles.ratingBarLabel, { fontSize: m.z(13), width: m.x(14) }]}>
                  {bar.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <Text
          style={[
            styles.reviewsTitle,
            { fontSize: m.z(18), lineHeight: m.z(27), marginTop: m.y(18) },
          ]}
        >
          الآراء (1)
        </Text>
        <View
          style={[
            styles.reviewCard,
            { height: m.y(122), borderRadius: m.z(22), padding: m.z(17), marginTop: m.y(12) },
          ]}
        >
          <View
            style={[
              styles.reviewAvatar,
              { width: m.z(32), height: m.z(32), borderRadius: m.z(16) },
            ]}
          >
            <Text style={[styles.reviewAvatarText, { fontSize: m.z(17) }]}>م</Text>
          </View>
          <Text
            style={[
              styles.reviewUser,
              { right: m.x(79), top: m.y(19), fontSize: m.z(17), lineHeight: m.z(25) },
            ]}
          >
            مستخدم
          </Text>
          <Text
            style={[
              styles.reviewDate,
              { right: m.x(79), top: m.y(45), fontSize: m.z(12.5), lineHeight: m.z(18) },
            ]}
          >
            2026/5/1
          </Text>
          <Text
            style={[
              styles.reviewStars,
              { left: m.x(17), top: m.y(28), fontSize: m.z(16), lineHeight: m.z(22) },
            ]}
          >
            ☆★★★★
          </Text>
          <Text
            style={[
              styles.reviewText,
              { right: m.x(21), top: m.y(72), fontSize: m.z(17), lineHeight: m.z(25) },
            ]}
          >
            تجربة جيدة بشكل عام.
          </Text>
          <Text
            style={[
              styles.reviewHelpful,
              { right: m.x(21), bottom: m.y(15), fontSize: m.z(12.5), lineHeight: m.z(18) },
            ]}
          >
            مفيد (2) ♡
          </Text>
        </View>
      </ScrollView>

      <View style={[styles.sellerCtaWrap, { height: m.y(81) }]}>
        <SettingsFab />
        <Pressable
          onPress={() => router.push("/messages" as never)}
          style={[
            styles.sellerCta,
            {
              left: m.x(16),
              right: m.x(16),
              bottom: m.y(18),
              height: m.y(47),
              borderRadius: m.z(24),
            },
          ]}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.sellerCtaGradient}
          >
            <MessageCircle color={UI.white} size={m.z(19)} />
            <Text style={[styles.sellerCtaText, { fontSize: m.z(18), lineHeight: m.z(27) }]}>
              راسل البائع
            </Text>
          </LinearGradient>
        </Pressable>
      </View>
    </View>
  );
}

function SellerMetric({ value, label, icon }: { value: string; label: string; icon?: ReactNode }) {
  const m = useMvpMetrics();
  return (
    <View style={[styles.sellerMetric, { height: m.y(58), borderRadius: m.z(17) }]}>
      <View style={styles.sellerMetricValueRow}>
        {icon}
        <Text style={[styles.sellerMetricValue, { fontSize: m.z(18), lineHeight: m.z(25) }]}>
          {value}
        </Text>
      </View>
      <Text style={[styles.sellerMetricLabel, { fontSize: m.z(12), lineHeight: m.z(17) }]}>
        {label}
      </Text>
    </View>
  );
}

export function MvpSearchScreen() {
  const m = useMvpMetrics();
  const [query, setQuery] = useState("");
  const topics = ["Chondrite", "تيسينت", "Pallasite", "Erfoud", "غير مصنف"];
  const actions = [
    { label: "فحص جديد", icon: ScanLine, route: "/scan" },
    { label: "تصفّح السوق", icon: Store, route: "/market" },
    { label: "مجموعتي", icon: Library, route: "/collection" },
    { label: "الرسائل", icon: MessageCircle, route: "/messages" },
  ] as const;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.searchHeader,
          { height: m.y(143), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
        ]}
      >
        <BackButton to="/dashboard" />
        <View
          style={[
            styles.globalSearchBox,
            { top: m.y(48), left: m.x(20), right: m.x(64), height: m.y(40), borderRadius: m.z(20) },
          ]}
        >
          <Search color="rgba(255,255,255,0.58)" size={m.z(18)} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="إبحث في كل التطبيق..."
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={[styles.globalSearchInput, { fontSize: m.z(15) }]}
          />
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.searchScopes, { paddingHorizontal: m.x(20), gap: m.x(7) }]}
          style={{ position: "absolute", top: m.y(100), left: 0, right: 0 }}
        >
          <SearchScope label="الكل" active icon={<Search color={UI.white} size={m.z(14)} />} />
          <SearchScope label="السوق" icon={<Store color={UI.white} size={m.z(15)} />} />
          <SearchScope label="المجموعة" icon={<Library color={UI.white} size={m.z(15)} />} />
          <SearchScope label="الرسائل" icon={<MessageCircle color={UI.white} size={m.z(15)} />} />
        </ScrollView>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(20),
          paddingTop: m.y(23),
          paddingBottom: m.y(101),
        }}
      >
        <Text style={[styles.searchSectionTitle, { fontSize: m.z(17), lineHeight: m.z(25) }]}>
          رائج الآن
        </Text>
        <View style={[styles.topicWrap, { gap: m.x(8), marginTop: m.y(11) }]}>
          {topics.map((topic) => (
            <View
              key={topic}
              style={[
                styles.topicChip,
                { height: m.y(30), borderRadius: m.z(16), paddingHorizontal: m.x(13) },
              ]}
            >
              <Text style={[styles.topicText, { fontSize: m.z(13.5), lineHeight: m.z(20) }]}>
                {topic}
              </Text>
            </View>
          ))}
        </View>
        <Text
          style={[
            styles.searchSectionTitle,
            { fontSize: m.z(17), lineHeight: m.z(25), marginTop: m.y(35) },
          ]}
        >
          إجراءات سريعة
        </Text>
        <View style={[styles.quickGrid, { gap: m.x(9), marginTop: m.y(11) }]}>
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Pressable
                key={action.label}
                onPress={() => router.push(action.route as never)}
                style={[
                  styles.quickAction,
                  {
                    width: m.x(150),
                    height: m.y(41),
                    borderRadius: m.z(20),
                    paddingHorizontal: m.x(15),
                  },
                ]}
              >
                <Icon color={UI.orange} size={m.z(17)} strokeWidth={2.5} />
                <Text style={[styles.quickActionText, { fontSize: m.z(15), lineHeight: m.z(22) }]}>
                  {action.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <ManualBottomNav active="home" />
    </View>
  );
}

function SearchScope({
  label,
  active,
  icon,
}: {
  label: string;
  active?: boolean;
  icon?: ReactNode;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      style={[
        styles.searchScope,
        {
          height: m.y(28),
          borderRadius: m.z(18),
          paddingHorizontal: m.x(active ? 16 : 17),
          backgroundColor: active ? UI.orange : "rgba(255,255,255,0.12)",
        },
      ]}
    >
      {icon}
      <Text style={[styles.searchScopeText, { fontSize: m.z(14), lineHeight: m.z(20) }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function MvpCheckoutScreen() {
  const params = useLocalSearchParams<{ plan?: string }>();
  const [plan, setPlan] = useState(params.plan === "yearly" ? "yearly" : "monthly");
  const [method, setMethod] = useState("visa");
  const [coupon, setCoupon] = useState("TISSINT10");
  const total = plan === "yearly" ? 960 : 100;

  return (
    <CheckoutScaffold
      plan={plan}
      setPlan={setPlan}
      method={method}
      setMethod={setMethod}
      coupon={coupon}
      setCoupon={setCoupon}
      total={total}
      onPay={() => router.replace("/checkout/success" as never)}
    />
  );
}

export function MvpCheckoutSuccessScreen() {
  return (
    <CheckoutScaffold
      plan="monthly"
      setPlan={() => {}}
      method="visa"
      setMethod={() => {}}
      coupon="TISSINT10"
      setCoupon={() => {}}
      total={100}
      status="success"
      onPay={() => router.replace("/dashboard" as never)}
    />
  );
}

export function MvpCheckoutFailedScreen() {
  return (
    <CheckoutScaffold
      plan="monthly"
      setPlan={() => {}}
      method="visa"
      setMethod={() => {}}
      coupon="TISSINT10"
      setCoupon={() => {}}
      total={100}
      status="failed"
      onPay={() => router.replace("/checkout" as never)}
    />
  );
}

function CheckoutScaffold({
  plan,
  setPlan,
  method,
  setMethod,
  coupon,
  setCoupon,
  total,
  status,
  onPay,
}: {
  plan: string;
  setPlan: (value: string) => void;
  method: string;
  setMethod: (value: string) => void;
  coupon: string;
  setCoupon: (value: string) => void;
  total: number;
  status?: "success" | "failed";
  onPay: () => void;
}) {
  const m = useMvpMetrics();
  const methods = [
    { id: "visa", title: "Visa •••• 4242", icon: CreditCard, subtitle: "" },
    { id: "cmi", title: "CMI Maroc •••• 1107", icon: Smartphone, subtitle: "" },
    { id: "wallet", title: "محفظة Tissint", icon: Wallet, subtitle: "الرصيد: 2,095 د.م" },
  ];
  const cta =
    status === "success"
      ? "تم الدفع 100 د.م"
      : status === "failed"
        ? "إعادة الدفع 100 د.م"
        : `ادفع ${total} د.م`;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.checkoutHeader,
          { height: m.y(104), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
        ]}
      >
        <BackButton to="/premium" />
        <Text
          style={[styles.checkoutTitle, { top: m.y(55), fontSize: m.z(23), lineHeight: m.z(32) }]}
        >
          الدفع
        </Text>
        <View style={[styles.secureMini, { top: m.y(62), left: m.x(20) }]}>
          <Lock color={UI.gold} size={m.z(13)} strokeWidth={2.2} />
          <Text style={[styles.secureMiniText, { fontSize: m.z(11.5), lineHeight: m.z(17) }]}>
            آمن
          </Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(20),
          paddingTop: m.y(20),
          paddingBottom: m.y(154),
        }}
      >
        {status ? (
          <View
            style={[
              status === "success" ? styles.checkoutStatusOk : styles.checkoutStatusBad,
              { borderRadius: m.z(18), padding: m.z(12), marginBottom: m.y(12) },
            ]}
          >
            {status === "success" ? (
              <BadgeCheck color={UI.success} size={m.z(20)} />
            ) : (
              <ShieldAlert color={UI.danger} size={m.z(20)} />
            )}
            <Text style={[styles.checkoutStatusText, { fontSize: m.z(13.5), lineHeight: m.z(20) }]}>
              {status === "success"
                ? "تم تفعيل Premium بنجاح."
                : "تعذر تنفيذ الدفع. لم يتم خصم أي مبلغ."}
            </Text>
          </View>
        ) : null}

        <Text
          style={[
            styles.checkoutSection,
            { fontSize: m.z(16), lineHeight: m.z(24), marginBottom: m.y(13) },
          ]}
        >
          اختر الخطة
        </Text>
        <View style={[styles.planRow, { gap: m.x(10) }]}>
          <PlanCard
            id="monthly"
            selected={plan === "monthly"}
            title="شهري"
            price="100"
            period="د.م/شهر"
            onPress={() => setPlan("monthly")}
          />
          <PlanCard
            id="yearly"
            selected={plan === "yearly"}
            title="سنوي"
            price="960"
            period="د.م/سنة"
            badge="وفر 20٪"
            onPress={() => setPlan("yearly")}
          />
        </View>

        <Text
          style={[
            styles.checkoutSection,
            { fontSize: m.z(16), lineHeight: m.z(24), marginTop: m.y(21), marginBottom: m.y(10) },
          ]}
        >
          طريقة الدفع
        </Text>
        <View style={{ gap: m.y(9) }}>
          {methods.map((item) => (
            <PaymentMethod
              key={item.id}
              id={item.id}
              title={item.title}
              subtitle={item.subtitle}
              icon={item.icon}
              selected={method === item.id}
              onPress={() => setMethod(item.id)}
            />
          ))}
        </View>

        <Pressable onPress={() => router.push("/billing" as never)}>
          <Text
            style={[
              styles.managePayment,
              { fontSize: m.z(13.5), lineHeight: m.z(20), marginTop: m.y(10) },
            ]}
          >
            إدارة طرق الدفع ←
          </Text>
        </Pressable>

        <Text
          style={[
            styles.checkoutSection,
            { fontSize: m.z(16), lineHeight: m.z(24), marginTop: m.y(20), marginBottom: m.y(9) },
          ]}
        >
          رمز الخصم
        </Text>
        <View style={[styles.couponRow, { gap: m.x(8) }]}>
          <TextInput
            value={coupon}
            onChangeText={setCoupon}
            style={[
              styles.couponInput,
              {
                height: m.y(41),
                borderRadius: m.z(20),
                fontSize: m.z(14),
                paddingHorizontal: m.x(16),
              },
            ]}
          />
          <Pressable
            style={[styles.applyCoupon, { width: m.x(71), height: m.y(41), borderRadius: m.z(20) }]}
          >
            <Text style={[styles.applyCouponText, { fontSize: m.z(15), lineHeight: m.z(22) }]}>
              تطبيق
            </Text>
          </Pressable>
        </View>

        <View
          style={[
            styles.summaryCard,
            { height: m.y(118), borderRadius: m.z(22), padding: m.z(18), marginTop: m.y(21) },
          ]}
        >
          <SummaryLine label="المجموع الفرعي" value={`${total} د.م`} />
          <SummaryLine
            label="منها TVA 20%"
            value={plan === "yearly" ? "160 د.م" : "16.67 د.م"}
            muted
          />
          <View style={[styles.summaryDivider, { marginTop: m.y(13) }]} />
          <SummaryLine label="المجموع" value={`${total} د.م`} strong />
        </View>
      </ScrollView>

      <View style={[styles.payFooter, { height: m.y(103) }]}>
        <Pressable
          onPress={onPay}
          style={[
            styles.payButton,
            { left: m.x(12), right: m.x(12), top: m.y(13), height: m.y(56), borderRadius: m.z(24) },
          ]}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.payGradient}
          >
            <Crown color={UI.white} size={m.z(21)} strokeWidth={2.2} />
            <Text style={[styles.payText, { fontSize: m.z(18), lineHeight: m.z(27) }]}>{cta}</Text>
          </LinearGradient>
        </Pressable>
        <Text
          style={[
            styles.secureFooter,
            { bottom: m.y(12), fontSize: m.z(11.5), lineHeight: m.z(17) },
          ]}
        >
          تشفير SSL · الدفع عبر CMI / Visa 🔒
        </Text>
        <SettingsFab />
      </View>
    </View>
  );
}

function PlanCard({
  selected,
  title,
  price,
  period,
  badge,
  onPress,
}: {
  id: string;
  selected: boolean;
  title: string;
  price: string;
  period: string;
  badge?: string;
  onPress: () => void;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.planCard,
        {
          height: m.y(83),
          borderRadius: m.z(22),
          borderWidth: selected ? m.z(1.6) : m.z(1.3),
          borderColor: selected ? UI.orange : UI.border,
          backgroundColor: selected ? "#FCE8D0" : UI.white,
        },
      ]}
    >
      {badge ? (
        <View
          style={[
            styles.planBadge,
            { top: m.y(14), left: m.x(14), borderRadius: m.z(13), paddingHorizontal: m.x(9) },
          ]}
        >
          <Text style={[styles.planBadgeText, { fontSize: m.z(11), lineHeight: m.z(17) }]}>
            {badge}
          </Text>
        </View>
      ) : null}
      <Text
        style={[
          styles.planTitle,
          { top: m.y(17), right: m.x(14), fontSize: m.z(16), lineHeight: m.z(24) },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.planPrice,
          { top: m.y(43), right: m.x(14), fontSize: m.z(22), lineHeight: m.z(30) },
        ]}
      >
        {price}
      </Text>
      <Text
        style={[
          styles.planPeriod,
          { top: m.y(51), right: m.x(73), fontSize: m.z(12.5), lineHeight: m.z(18) },
        ]}
      >
        {period}
      </Text>
    </Pressable>
  );
}

function PaymentMethod({
  id,
  title,
  subtitle,
  icon: Icon,
  selected,
  onPress,
}: {
  id: string;
  title: string;
  subtitle?: string;
  icon: typeof CreditCard;
  selected: boolean;
  onPress: () => void;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.paymentMethod,
        {
          height: m.y(68),
          borderRadius: m.z(22),
          borderWidth: selected ? m.z(1.6) : m.z(1.3),
          borderColor: selected ? UI.orange : UI.border,
          backgroundColor: selected ? "#FCE8D0" : UI.white,
        },
      ]}
    >
      <View
        style={[
          styles.radioCircle,
          selected ? styles.radioActive : null,
          { left: m.x(14), width: m.z(20), height: m.z(20), borderRadius: m.z(10) },
        ]}
      >
        {selected ? <Check color={UI.white} size={m.z(13)} strokeWidth={2.5} /> : null}
      </View>
      <View
        style={[
          styles.paymentIcon,
          { right: m.x(14), width: m.z(40), height: m.z(40), borderRadius: m.z(20) },
        ]}
      >
        <Icon color={UI.navy} size={m.z(id === "wallet" ? 23 : 21)} strokeWidth={2.4} />
      </View>
      <Text
        style={[
          styles.paymentTitle,
          { right: m.x(70), top: m.y(subtitle ? 17 : 24), fontSize: m.z(15), lineHeight: m.z(22) },
        ]}
      >
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.paymentSubtitle,
            { right: m.x(70), top: m.y(40), fontSize: m.z(12), lineHeight: m.z(18) },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
    </Pressable>
  );
}

function SummaryLine({
  label,
  value,
  muted,
  strong,
}: {
  label: string;
  value: string;
  muted?: boolean;
  strong?: boolean;
}) {
  const m = useMvpMetrics();
  return (
    <View style={[styles.summaryLine, { marginTop: strong ? m.y(8) : 0 }]}>
      <Text
        style={[
          styles.summaryLabel,
          muted ? styles.summaryMuted : null,
          strong ? styles.summaryStrong : null,
          { fontSize: m.z(strong ? 16 : 14), lineHeight: m.z(22) },
        ]}
      >
        {label}
      </Text>
      <Text
        style={[
          styles.summaryValue,
          muted ? styles.summaryMuted : null,
          strong ? styles.summaryStrong : null,
          { fontSize: m.z(strong ? 16 : 14), lineHeight: m.z(22) },
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function CoherentPublishForm({
  scan,
}: {
  scan: {
    scanId: string;
    className: string;
    fusionScore: number;
    weightGram?: number;
    region?: string;
  };
}) {
  const m = useMvpMetrics();
  const [title, setTitle] = useState(scan.className);
  const [weight, setWeight] = useState(String(scan.weightGram ?? 120));
  const [region, setRegion] = useState(scan.region ?? "طاطا");
  const [priceMode, setPriceMode] = useState<PriceMode>("fixed_total");
  const [price, setPrice] = useState("4500");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const leak = containsContactLeak(description);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      await createListing({
        scanId: scan.scanId,
        title,
        description,
        priceMode,
        priceValue: priceMode === "on_request" ? undefined : Number(price) || undefined,
        weightGram: Number(weight) || 0,
        region,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publication impossible");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <View style={styles.root}>
        <HeaderPanel title="نشر الإعلان" subtitle="تم إرسال الإعلان للمراجعة" />
        <View
          style={[
            styles.publishDone,
            {
              top: m.y(250),
              left: m.x(20),
              right: m.x(20),
              borderRadius: m.z(24),
              padding: m.z(24),
            },
          ]}
        >
          <BadgeCheck color={UI.success} size={m.z(48)} />
          <Text style={[styles.publishDoneTitle, { fontSize: m.z(22), lineHeight: m.z(32) }]}>
            تم إرسال الإعلان
          </Text>
          <Text style={[styles.publishDoneText, { fontSize: m.z(14), lineHeight: m.z(22) }]}>
            سيتم تطبيق المراجعة أو المعالجة 24 ساعة حسب نتيجة الخادم.
          </Text>
          <GradientButton label="العودة للسوق" onPress={() => router.replace("/market" as never)} />
        </View>
        <SettingsFab />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <HeaderPanel title="نشر إعلان" subtitle={`الفحص ${Math.round(scan.fusionScore * 100)}/100`} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: m.x(20), paddingBottom: m.y(40) }}
      >
        <View
          style={[styles.publishCard, { borderRadius: m.z(24), padding: m.z(18), gap: m.y(12) }]}
        >
          <Field label="العنوان" value={title} onChangeText={setTitle} />
          <Field
            label="الوزن بالغرام"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
          <Field label="المنطقة" value={region} onChangeText={setRegion} />
          <Text style={[styles.formLabel, { fontSize: m.z(14), lineHeight: m.z(21) }]}>
            طريقة السعر
          </Text>
          <View style={[styles.modeRow, { gap: m.x(7) }]}>
            {[
              ["fixed_total", "ثابت"],
              ["price_per_gram", "د.م/غ"],
              ["negotiable", "تفاوض"],
              ["on_request", "طلب"],
            ].map(([id, label]) => (
              <Pressable
                key={id}
                onPress={() => setPriceMode(id as PriceMode)}
                style={[
                  styles.modeButton,
                  {
                    height: m.y(38),
                    borderRadius: m.z(18),
                    backgroundColor: priceMode === id ? UI.orange : UI.pale,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    priceMode === id ? styles.modeButtonTextActive : null,
                    { fontSize: m.z(12.5) },
                  ]}
                >
                  {label}
                </Text>
              </Pressable>
            ))}
          </View>
          {priceMode !== "on_request" ? (
            <Field label="السعر" value={price} onChangeText={setPrice} keyboardType="decimal-pad" />
          ) : null}
          <Field label="الوصف" value={description} onChangeText={setDescription} multiline />
          {leak ? (
            <View style={styles.formWarning}>
              <ShieldAlert color={UI.orange} size={m.z(18)} />
              <Text style={[styles.formWarningText, { fontSize: m.z(12.5), lineHeight: m.z(19) }]}>
                لا تضع رقم هاتف أو WhatsApp داخل الوصف.
              </Text>
            </View>
          ) : (
            <View style={styles.formOk}>
              <Check color={UI.success} size={m.z(17)} />
              <Text style={[styles.formOkText, { fontSize: m.z(12.5), lineHeight: m.z(19) }]}>
                الوصف جاهز للنشر
              </Text>
            </View>
          )}
          {error ? (
            <Text style={[styles.formError, { fontSize: m.z(12.5), lineHeight: m.z(19) }]}>
              {error}
            </Text>
          ) : null}
          <GradientButton
            label={loading ? "جار الإرسال..." : "إرسال للمراجعة"}
            disabled={leak || !title || !weight || !region || loading}
            onPress={submit}
          />
        </View>
      </ScrollView>
      <SettingsFab />
    </View>
  );
}

function Field({
  label,
  value,
  onChangeText,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "decimal-pad";
  multiline?: boolean;
}) {
  const m = useMvpMetrics();
  return (
    <View>
      <Text
        style={[styles.formLabel, { fontSize: m.z(14), lineHeight: m.z(21), marginBottom: m.y(5) }]}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        placeholderTextColor="#A4A7AA"
        style={[
          styles.fieldInput,
          {
            minHeight: m.y(multiline ? 88 : 46),
            borderRadius: m.z(18),
            fontSize: m.z(14),
            lineHeight: m.z(21),
            paddingHorizontal: m.x(15),
            paddingTop: multiline ? m.y(11) : 0,
          },
        ]}
      />
    </View>
  );
}

function GradientButton({
  label,
  icon,
  onPress,
  disabled,
}: {
  label: string;
  icon?: ReactNode;
  onPress: () => void;
  disabled?: boolean;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[styles.gradientButtonWrap, disabled ? styles.disabled : null]}
    >
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          styles.gradientButton,
          { height: m.y(46), borderRadius: m.z(23), paddingHorizontal: m.x(18) },
        ]}
      >
        {icon}
        <Text style={[styles.gradientButtonText, { fontSize: m.z(16), lineHeight: m.z(24) }]}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

function OutlineButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon?: ReactNode;
  onPress: () => void;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.outlineButton,
        { minHeight: m.y(40), borderRadius: m.z(20), paddingHorizontal: m.x(11) },
      ]}
    >
      {icon}
      <Text style={[styles.outlineButtonText, { fontSize: m.z(12.5), lineHeight: m.z(19) }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI.cream,
  },
  headerPanel: {
    backgroundColor: UI.navy,
    overflow: "hidden",
  },
  backButton: {
    position: "absolute",
    zIndex: 4,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    color: UI.white,
    fontWeight: "400",
    marginTop: -3,
  },
  headerTitle: {
    position: "absolute",
    color: UI.white,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  headerSubtitle: {
    position: "absolute",
    color: "rgba(255,255,255,0.62)",
    textAlign: "right",
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
    zIndex: 20,
  },
  manualTabBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: UI.border,
    zIndex: 12,
  },
  manualTabItem: {
    position: "absolute",
    alignItems: "center",
    gap: 2,
  },
  manualTabText: {
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  manualTabTextActive: {
    color: UI.navy,
    fontWeight: "900",
  },
  manualScan: {
    position: "absolute",
    backgroundColor: UI.orange,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    borderColor: UI.cream,
  },
  marketThumb: {
    overflow: "hidden",
  },
  thumbDot: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.54)",
  },
  statGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  statCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    alignItems: "flex-end",
  },
  statIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
  },
  statLabel: {
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  statsWideCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
  },
  statsCardTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  statsWideTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  weekChart: {
    flexDirection: "row-reverse",
    alignItems: "flex-end",
  },
  weekCol: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },
  weekBar: {
    backgroundColor: UI.orange,
  },
  weekDay: {
    color: UI.muted,
    textAlign: "center",
    marginTop: 5,
  },
  todayText: {
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  classCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
  },
  classTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  classLineTop: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  classLabel: {
    color: UI.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  classCount: {
    color: UI.muted,
    textAlign: "left",
  },
  classTrack: {
    backgroundColor: "#E8E5DF",
    overflow: "hidden",
  },
  classFill: {
    height: "100%",
    backgroundColor: UI.navy,
    borderRadius: 999,
  },
  marketHeader: {
    backgroundColor: UI.navy,
    overflow: "hidden",
  },
  marketTitle: {
    position: "absolute",
    color: UI.white,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  marketSubtitle: {
    position: "absolute",
    color: UI.gold,
    textAlign: "right",
    writingDirection: "rtl",
  },
  marketActions: {
    position: "absolute",
    flexDirection: "row",
  },
  marketPill: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  marketPillText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  filterCircle: {
    position: "absolute",
    backgroundColor: UI.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  marketSearch: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  marketSearchInput: {
    flex: 1,
    color: UI.white,
    textAlign: "right",
    writingDirection: "rtl",
    paddingVertical: 0,
  },
  marketRegions: {
    backgroundColor: UI.cream,
  },
  regionChip: {
    alignItems: "center",
    justifyContent: "center",
  },
  regionText: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  regionTextActive: {
    color: UI.white,
  },
  marketGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  marketCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    overflow: "hidden",
  },
  marketCardBody: {
    flex: 1,
  },
  marketCardTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  marketMetaLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 3,
    marginTop: 4,
  },
  marketCardMeta: {
    flex: 1,
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  marketPriceLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 7,
  },
  marketPrice: {
    color: UI.orange,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  topRightEmpty: {
    position: "absolute",
    alignItems: "flex-end",
  },
  topRightMessage: {
    color: UI.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  topRightAction: {
    color: UI.orange,
    textAlign: "right",
    writingDirection: "rtl",
  },
  detailHero: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
  },
  detailPriceRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  detailPrice: {
    color: UI.orange,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  detailMeta: {
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  detailCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
  },
  detailSectionTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  detailLine: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: UI.border,
    gap: 12,
  },
  detailLineLabel: {
    color: UI.muted,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  detailLineValue: {
    flex: 1,
    color: UI.text,
    textAlign: "left",
    writingDirection: "rtl",
  },
  detailDescription: {
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  detailNotice: {
    backgroundColor: "#FFF2E5",
    borderWidth: 1,
    borderColor: "#FFD4B8",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  detailNoticeText: {
    flex: 1,
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  contactRow: {
    flexDirection: "row-reverse",
  },
  lockedCard: {
    backgroundColor: "#FFF2E5",
    borderWidth: 1,
    borderColor: UI.orange,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  lockedTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  lockedText: {
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  gradientButtonWrap: {
    flex: 1,
  },
  gradientButton: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  gradientButtonText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  outlineButton: {
    flex: 1,
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  outlineButtonText: {
    color: UI.navy,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  myListingsHeader: {
    backgroundColor: UI.navy,
    overflow: "hidden",
  },
  addListingButton: {
    position: "absolute",
    backgroundColor: UI.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  myListingsTitle: {
    position: "absolute",
    color: UI.white,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  myMetrics: {
    position: "absolute",
    flexDirection: "row-reverse",
  },
  myMetricCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  myMetricValue: {
    color: UI.gold,
    fontWeight: "900",
    textAlign: "center",
  },
  myMetricLabel: {
    color: "rgba(255,255,255,0.64)",
    textAlign: "center",
    writingDirection: "rtl",
  },
  myChips: {
    flexDirection: "row-reverse",
    alignItems: "center",
    backgroundColor: UI.white,
    borderBottomWidth: 1,
    borderBottomColor: UI.border,
  },
  myChip: {
    alignItems: "center",
    justifyContent: "center",
  },
  myChipText: {
    color: UI.muted,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  myChipTextActive: {
    color: UI.white,
  },
  myEmpty: {
    position: "absolute",
    alignItems: "center",
  },
  myEmptyText: {
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  myEmptyButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  myEmptyButtonText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  publishCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
  },
  formLabel: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  fieldInput: {
    backgroundColor: "#FAFAFA",
    borderWidth: 1,
    borderColor: UI.border,
    color: UI.text,
    textAlign: "right",
    writingDirection: "rtl",
    textAlignVertical: "top",
  },
  modeRow: {
    flexDirection: "row-reverse",
  },
  modeButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modeButtonText: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  modeButtonTextActive: {
    color: UI.white,
  },
  formWarning: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  formWarningText: {
    color: UI.orange,
    textAlign: "right",
    writingDirection: "rtl",
  },
  formOk: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  formOkText: {
    color: UI.success,
    textAlign: "right",
    writingDirection: "rtl",
  },
  formError: {
    color: UI.danger,
    textAlign: "right",
    writingDirection: "rtl",
  },
  disabled: {
    opacity: 0.45,
  },
  publishDone: {
    position: "absolute",
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    alignItems: "center",
    gap: 12,
  },
  publishDoneTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  publishDoneText: {
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  sellerHeader: {
    backgroundColor: UI.navy,
    overflow: "hidden",
  },
  sellerAvatar: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  sellerAvatarText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
  },
  sellerName: {
    position: "absolute",
    maxWidth: "45%",
    color: UI.white,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  sellerRatingLine: {
    position: "absolute",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 4,
  },
  sellerRatingText: {
    color: "rgba(255,255,255,0.63)",
    textAlign: "right",
    writingDirection: "rtl",
  },
  sellerRatingValue: {
    color: UI.white,
    fontWeight: "900",
  },
  sellerStats: {
    position: "absolute",
    flexDirection: "row-reverse",
  },
  sellerMetric: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.13)",
    alignItems: "center",
    justifyContent: "center",
  },
  sellerMetricValueRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },
  sellerMetricValue: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
  },
  sellerMetricLabel: {
    color: "rgba(255,255,255,0.58)",
    textAlign: "center",
    writingDirection: "rtl",
  },
  ratingCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    position: "relative",
  },
  ratingCardTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  ratingScoreBlock: {
    position: "absolute",
    alignItems: "center",
  },
  ratingScore: {
    color: UI.navy,
    fontWeight: "900",
    textAlign: "center",
  },
  ratingStars: {
    flexDirection: "row",
    gap: 2,
  },
  fadedStar: {
    color: "#E6E2DB",
  },
  goldStar: {
    color: UI.gold,
  },
  ratingCount: {
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  ratingBars: {
    position: "absolute",
    gap: 3,
  },
  ratingBarLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingBarCount: {
    color: UI.muted,
    textAlign: "left",
  },
  ratingBarTrack: {
    flex: 1,
    backgroundColor: "#E9E5DD",
    overflow: "hidden",
  },
  ratingBarFill: {
    width: "100%",
    height: "100%",
    backgroundColor: UI.gold,
  },
  ratingBarLabel: {
    color: UI.text,
    textAlign: "center",
  },
  reviewsTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  reviewCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    position: "relative",
  },
  reviewAvatar: {
    position: "absolute",
    right: 17,
    top: 18,
    backgroundColor: UI.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  reviewAvatarText: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "center",
  },
  reviewUser: {
    position: "absolute",
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  reviewDate: {
    position: "absolute",
    color: UI.muted,
    textAlign: "right",
  },
  reviewStars: {
    position: "absolute",
    color: UI.gold,
    letterSpacing: 1,
  },
  reviewText: {
    position: "absolute",
    color: UI.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  reviewHelpful: {
    position: "absolute",
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  sellerCtaWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: UI.border,
  },
  sellerCta: {
    position: "absolute",
    overflow: "hidden",
  },
  sellerCtaGradient: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  sellerCtaText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  searchHeader: {
    backgroundColor: UI.navy,
    overflow: "hidden",
  },
  globalSearchBox: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  globalSearchInput: {
    flex: 1,
    color: UI.white,
    textAlign: "right",
    writingDirection: "rtl",
    paddingVertical: 0,
  },
  searchScopes: {
    flexDirection: "row-reverse",
  },
  searchScope: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  searchScopeText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  searchSectionTitle: {
    color: UI.muted,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  topicWrap: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  topicChip: {
    backgroundColor: "#FFF0D8",
    borderWidth: 1,
    borderColor: "#F7DDAA",
    alignItems: "center",
    justifyContent: "center",
  },
  topicText: {
    color: UI.orange,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  quickGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
  },
  quickAction: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quickActionText: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  checkoutHeader: {
    backgroundColor: UI.navy,
    overflow: "hidden",
  },
  checkoutTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  secureMini: {
    position: "absolute",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },
  secureMiniText: {
    color: UI.gold,
    textAlign: "left",
    writingDirection: "rtl",
  },
  checkoutStatusOk: {
    backgroundColor: "#EAF7EF",
    borderWidth: 1,
    borderColor: "#BFE8CC",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
  },
  checkoutStatusBad: {
    backgroundColor: "#FFF0EC",
    borderWidth: 1,
    borderColor: "#F8C6B7",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 9,
  },
  checkoutStatusText: {
    flex: 1,
    color: UI.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  checkoutSection: {
    color: UI.muted,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  planRow: {
    flexDirection: "row-reverse",
  },
  planCard: {
    flex: 1,
    position: "relative",
  },
  planBadge: {
    position: "absolute",
    backgroundColor: "#FFF5DE",
  },
  planBadgeText: {
    color: UI.gold,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  planTitle: {
    position: "absolute",
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  planPrice: {
    position: "absolute",
    color: UI.orange,
    fontWeight: "900",
    textAlign: "right",
  },
  planPeriod: {
    position: "absolute",
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  paymentMethod: {
    position: "relative",
  },
  radioCircle: {
    position: "absolute",
    top: "50%",
    marginTop: -10,
    borderWidth: 1.7,
    borderColor: UI.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: {
    backgroundColor: UI.orange,
    borderColor: UI.orange,
  },
  paymentIcon: {
    position: "absolute",
    top: "50%",
    marginTop: -20,
    backgroundColor: UI.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentTitle: {
    position: "absolute",
    left: 54,
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  paymentSubtitle: {
    position: "absolute",
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  managePayment: {
    color: UI.orange,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  couponRow: {
    flexDirection: "row-reverse",
  },
  couponInput: {
    flex: 1,
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    color: UI.text,
    textAlign: "right",
  },
  applyCoupon: {
    backgroundColor: UI.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  applyCouponText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  summaryCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
  },
  summaryLine: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  summaryLabel: {
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  summaryValue: {
    color: UI.text,
    textAlign: "left",
    writingDirection: "rtl",
  },
  summaryMuted: {
    color: UI.muted,
  },
  summaryStrong: {
    color: UI.text,
    fontWeight: "900",
  },
  summaryDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: UI.border,
  },
  payFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.96)",
    borderTopWidth: 1,
    borderTopColor: UI.border,
  },
  payButton: {
    position: "absolute",
    overflow: "hidden",
  },
  payGradient: {
    flex: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  payText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  secureFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
});
