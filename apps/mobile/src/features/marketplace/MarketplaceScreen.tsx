import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { ArrowUpDown, Bell, BadgeCheck, Heart, Lock, Phone, Search, SlidersHorizontal, X } from "lucide-react-native";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { MeteoriteThumb } from "@/components/tissint/MeteoriteThumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { listMarketplace } from "@/lib/api";
import { useSessionStore } from "@/store/session-store";
import { colors, radius, spacing } from "@/theme";
import { canRevealSellerContact, formatPrice, scoreToPercent, type MarketplaceListing } from "@tissint/shared";

type SortMode = "recent" | "price_asc" | "price_desc" | "score" | "weight";

export function MarketplaceScreen() {
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const listings = useQuery({ queryKey: ["marketplace"], queryFn: listMarketplace });
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("all");
  const [classification, setClassification] = useState("all");
  const [minScore, setMinScore] = useState("85");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [weightMin, setWeightMin] = useState("");
  const [rareOnly, setRareOnly] = useState(false);
  const [negotiableOnly, setNegotiableOnly] = useState(false);
  const [openFilters, setOpenFilters] = useState(false);
  const [sort, setSort] = useState<SortMode>("recent");

  const all = listings.data ?? [];
  const regions = useMemo(() => ["all", ...Array.from(new Set(all.map((item) => item.region).filter(Boolean)))], [all]);
  const classes = useMemo(() => ["all", ...Array.from(new Set(all.map((item) => item.dominantClass).filter(Boolean)))], [all]);

  const filtered = useMemo(() => {
    const minScoreNumber = Number(minScore) || 0;
    const minPrice = Number(priceMin) || 0;
    const maxPrice = Number(priceMax) || Number.MAX_SAFE_INTEGER;
    const minWeight = Number(weightMin) || 0;
    const text = query.trim().toLowerCase();
    let output = all.filter((item) => {
      const price = item.priceValue ?? 0;
      if (region !== "all" && item.region !== region) return false;
      if (classification !== "all" && item.dominantClass !== classification) return false;
      if ((item.confidence ?? 0) * 100 < minScoreNumber) return false;
      if (price < minPrice || price > maxPrice) return false;
      if ((item.weightGram ?? 0) < minWeight) return false;
      if (rareOnly && !item.isRare) return false;
      if (negotiableOnly && item.priceMode !== "negotiable") return false;
      if (text && ![item.title, item.dominantClass, item.region ?? ""].some((value) => value.toLowerCase().includes(text))) return false;
      return true;
    });

    output = [...output].sort((a, b) => {
      if (a.isRare !== b.isRare) return a.isRare ? -1 : 1;
      if (sort === "price_asc") return (a.priceValue ?? 0) - (b.priceValue ?? 0);
      if (sort === "price_desc") return (b.priceValue ?? 0) - (a.priceValue ?? 0);
      if (sort === "score") return b.confidence - a.confidence;
      if (sort === "weight") return (b.weightGram ?? 0) - (a.weightGram ?? 0);
      return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
    });
    return output;
  }, [all, classification, minScore, negotiableOnly, priceMax, priceMin, query, rareOnly, region, sort, weightMin]);

  const activeFilters =
    (region !== "all" ? 1 : 0) +
    (classification !== "all" ? 1 : 0) +
    (Number(minScore) !== 85 ? 1 : 0) +
    (priceMin || priceMax ? 1 : 0) +
    (weightMin ? 1 : 0) +
    (rareOnly ? 1 : 0) +
    (negotiableOnly ? 1 : 0);

  function resetFilters() {
    setRegion("all");
    setClassification("all");
    setMinScore("85");
    setPriceMin("");
    setPriceMax("");
    setWeightMin("");
    setRareOnly(false);
    setNegotiableOnly(false);
  }

  function cycleSort() {
    const modes: SortMode[] = ["recent", "price_asc", "price_desc", "score", "weight"];
    setSort(modes[(modes.indexOf(sort) + 1) % modes.length]);
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <AppText variant="hero" color="#FFFFFF">
              السوق
            </AppText>
            <AppText variant="caption" color="rgba(255,255,255,0.72)">
              {filtered.length} إعلان متاح
            </AppText>
          </View>
          <View style={styles.headerActions}>
            <Button tone="secondary" onPress={() => router.push("/price-history")}>الأسعار</Button>
            <Button onPress={() => router.push("/marketplace/my-listings")}>إعلاناتي</Button>
          </View>
        </View>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Search color="rgba(255,255,255,0.62)" size={18} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="ابحث في السوق..."
              placeholderTextColor="rgba(255,255,255,0.48)"
              style={styles.searchInput}
            />
          </View>
          <Pressable style={styles.filterButton} onPress={() => setOpenFilters((current) => !current)}>
            <SlidersHorizontal color="#FFFFFF" size={20} />
            {activeFilters ? (
              <View style={styles.filterBadge}>
                <AppText variant="caption" color={colors.stone} style={styles.filterBadgeText}>
                  {activeFilters}
                </AppText>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <View style={styles.chips}>
        {regions.map((item) => (
          <ChipButton key={item} label={item === "all" ? "كل المناطق" : item ?? ""} active={region === item} onPress={() => setRegion(item ?? "all")} />
        ))}
        <ChipButton
          label={sort === "recent" ? "الأحدث" : sort === "price_asc" ? "السعر ↑" : sort === "price_desc" ? "السعر ↓" : sort === "score" ? "الجودة" : "الوزن"}
          active
          icon={<ArrowUpDown color="#FFFFFF" size={14} />}
          onPress={cycleSort}
        />
      </View>

      {openFilters ? (
        <Card style={styles.filters}>
          <View style={styles.rowBetween}>
            <AppText variant="subtitle">الفلاتر</AppText>
            <Pressable style={styles.closeButton} onPress={() => setOpenFilters(false)}>
              <X color={colors.navy} size={18} />
            </Pressable>
          </View>
          <AppText variant="caption">التصنيف</AppText>
          <View style={styles.chips}>
            {classes.map((item) => (
              <ChipButton key={item} label={item === "all" ? "الكل" : item} active={classification === item} onPress={() => setClassification(item)} />
            ))}
          </View>
          <View style={styles.formGrid}>
            <FilterInput label="Score min" value={minScore} onChangeText={setMinScore} />
            <FilterInput label="Prix min" value={priceMin} onChangeText={setPriceMin} />
            <FilterInput label="Prix max" value={priceMax} onChangeText={setPriceMax} />
            <FilterInput label="Poids min" value={weightMin} onChangeText={setWeightMin} />
          </View>
          <View style={styles.toggleLine}>
            <TogglePill label="Rare uniquement" active={rareOnly} onPress={() => setRareOnly((current) => !current)} />
            <TogglePill label="Négociable" active={negotiableOnly} onPress={() => setNegotiableOnly((current) => !current)} />
          </View>
          <View style={styles.filterActions}>
            <Button tone="ghost" onPress={resetFilters}>مسح</Button>
            <Button onPress={() => setOpenFilters(false)}>عرض {filtered.length} نتيجة</Button>
          </View>
        </Card>
      ) : null}

      {listings.isLoading ? (
        <Card>
          <AppText>Chargement du marketplace...</AppText>
        </Card>
      ) : null}

      <View style={styles.grid}>
        {filtered.map((listing) => (
          <ListingCard key={listing.listingId} listing={listing} role={role} />
        ))}
      </View>

      {filtered.length === 0 && !listings.isLoading ? (
        <Card style={styles.empty}>
          <Search color={colors.orange} size={28} />
          <AppText variant="subtitle">لا توجد نتائج</AppText>
          <Button tone="ghost" onPress={resetFilters}>مسح الفلاتر</Button>
        </Card>
      ) : null}
    </Screen>
  );
}

function ListingCard({ listing, role }: { listing: MarketplaceListing; role: string }) {
  const canContact = canRevealSellerContact(role, listing.status);
  return (
    <Pressable
      onPress={() => router.push({ pathname: "/marketplace/[listingId]", params: { listingId: listing.listingId } })}
      style={styles.cardPress}
    >
      <Card style={styles.listingCard}>
        <MeteoriteThumb rare={listing.isRare} />
        <View style={styles.badges}>
          {listing.isRare ? <Badge label="Rare" tone="premium" /> : null}
          <Badge
            label={listing.status === "institutional_hold_24h" ? "معالجة 24h" : "منشور"}
            tone={listing.status === "institutional_hold_24h" ? "warning" : "success"}
          />
        </View>
        <AppText variant="subtitle" numberOfLines={2}>
          {listing.title}
        </AppText>
        <AppText variant="caption">
          {scoreToPercent(listing.confidence)}% - {listing.weightGram ?? "--"}g - {listing.region}
        </AppText>
        <View style={styles.priceRow}>
          <AppText variant="title" color={colors.orange}>
            {formatPrice(listing)}
          </AppText>
          {listing.sellerVerified ? <BadgeCheck color={colors.success} size={18} /> : null}
        </View>
        <Button icon={canContact ? Phone : Lock} tone={canContact ? "dark" : "ghost"}>
          {canContact ? "Appel / WhatsApp" : "Contact Premium"}
        </Button>
      </Card>
    </Pressable>
  );
}

function ChipButton({
  label,
  active,
  onPress,
  icon,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  icon?: ReactNode;
}) {
  return (
    <Pressable style={[styles.chip, active ? styles.chipActive : null]} onPress={onPress}>
      {icon}
      <AppText variant="caption" color={active ? "#FFFFFF" : colors.text} style={styles.chipText}>
        {label}
      </AppText>
    </Pressable>
  );
}

function TogglePill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <ChipButton label={label} active={active} onPress={onPress} />;
}

function FilterInput({ label, value, onChangeText }: { label: string; value: string; onChangeText: (text: string) => void }) {
  return (
    <View style={styles.filterInputWrap}>
      <AppText variant="caption">{label}</AppText>
      <TextInput value={value} onChangeText={onChangeText} keyboardType="number-pad" style={styles.filterInput} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  header: {
    backgroundColor: colors.navy,
    borderRadius: 24,
    padding: spacing.lg,
    gap: spacing.md,
  },
  headerTop: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  headerActions: {
    gap: spacing.sm,
  },
  searchRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  searchBox: {
    flex: 1,
    minHeight: 46,
    borderRadius: radius.md,
    backgroundColor: "rgba(255,255,255,0.12)",
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    textAlign: "right",
  },
  filterButton: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  filterBadge: {
    position: "absolute",
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontWeight: "900",
    fontSize: 9,
  },
  chips: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.sm,
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
  filters: {
    gap: spacing.md,
  },
  rowBetween: {
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    alignItems: "center",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.muted,
  },
  formGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  filterInputWrap: {
    width: "48%",
    gap: spacing.xs,
  },
  filterInput: {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.warm,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: "center",
    color: colors.text,
  },
  toggleLine: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  filterActions: {
    gap: spacing.sm,
  },
  grid: {
    gap: spacing.md,
  },
  cardPress: {
    flex: 1,
  },
  listingCard: {
    gap: spacing.sm,
  },
  badges: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  priceRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  empty: {
    alignItems: "center",
    gap: spacing.md,
  },
});
