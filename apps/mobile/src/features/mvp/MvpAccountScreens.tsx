import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Bell,
  Calendar,
  Check,
  CreditCard,
  Crown,
  Download,
  Edit3,
  Eye,
  Home,
  KeyRound,
  Library,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Plus,
  ScanLine,
  Settings2,
  Shield,
  Star,
  Store,
  Trash2,
  User,
  Wallet,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View, useWindowDimensions } from "react-native";
import { ResponsiveText as Text } from "@/components/ui/ResponsiveText";
import { logoutCurrentSession } from "@/lib/auth";
import { useSessionStore } from "@/store/session-store";

const UI = {
  navy: "#1B4C66",
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
  dark: "#1B2025",
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

function Header({
  title,
  height = 104,
  left,
}: {
  title: string;
  height?: number;
  left?: ReactNode;
}) {
  const m = useMvpMetrics();
  return (
    <View
      style={[
        styles.header,
        { height: m.y(height), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
      ]}
    >
      <BackButton to="/dashboard" />
      {left}
      <Text style={[styles.headerTitle, { top: m.y(56), fontSize: m.z(22), lineHeight: m.z(31) }]}>
        {title}
      </Text>
    </View>
  );
}

function ManualBottomNav({
  active = "home",
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
            style={[styles.manualTabItem, { bottom: m.y(10), width: m.x(72), ...sideStyle }]}
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

export function MvpWalletScreen() {
  const m = useMvpMetrics();
  const transactions = [
    { title: "شحن المحفظة", meta: "شحن · 2026/5/20", amount: "+200 د.م", tone: "in", icon: "↙" },
    {
      title: "اشتراك Premium شهري",
      meta: "Premium · 2026/5/21",
      amount: "-100 د.م",
      tone: "out",
      icon: "♕",
    },
    {
      title: "بيع: Chondrite H4",
      meta: "بيع · 2026/5/24",
      amount: "+1,995 د.م",
      tone: "in",
      icon: "↙",
    },
    {
      title: "شراء: شريحة مصقولة",
      meta: "شراء · 2026/5/26 · قيد التنفيذ",
      amount: "-250 د.م",
      tone: "out",
      icon: "▢",
    },
  ] as const;

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.walletHeader,
          { height: m.y(300), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
        ]}
      >
        <BackButton to="/profile" />
        <View
          style={[
            styles.walletHeaderIcon,
            { top: m.y(50), left: m.x(20), width: m.z(36), height: m.z(36), borderRadius: m.z(18) },
          ]}
        >
          <Wallet color={UI.white} size={m.z(19)} />
        </View>
        <Text
          style={[styles.headerTitle, { top: m.y(56), fontSize: m.z(22), lineHeight: m.z(31) }]}
        >
          المحفظة
        </Text>
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={[
            styles.balanceCard,
            {
              top: m.y(104),
              left: m.x(20),
              right: m.x(20),
              height: m.y(165),
              borderRadius: m.z(22),
              padding: m.z(20),
            },
          ]}
        >
          <View style={styles.balanceTitleRow}>
            <Wallet color={UI.white} size={m.z(18)} />
            <Text style={[styles.balanceLabel, { fontSize: m.z(14), lineHeight: m.z(21) }]}>
              الرصيد الحالي
            </Text>
          </View>
          <Text
            style={[
              styles.balanceValue,
              { fontSize: m.z(39), lineHeight: m.z(50), marginTop: m.y(10) },
            ]}
          >
            2,095 <Text style={{ fontSize: m.z(17) }}>د.م</Text>
          </Text>
          <View style={[styles.balanceSubRow, { gap: m.x(8), marginTop: m.y(20) }]}>
            <BalanceMini label="دخل" value="+2,195 د.م" />
            <BalanceMini label="مصروف" value="-100 د.م" />
          </View>
        </LinearGradient>
      </View>

      <View
        style={[
          styles.walletActions,
          { top: m.y(285), left: m.x(20), right: m.x(20), gap: m.x(8) },
        ]}
      >
        <WalletAction label="شحن" icon={<Plus color={UI.orange} size={m.z(20)} />} />
        <WalletAction
          label="سحب"
          icon={<Text style={[styles.withdrawArrow, { fontSize: m.z(22) }]}>↗</Text>}
        />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(20),
          paddingTop: m.y(358),
          paddingBottom: m.y(105),
        }}
      >
        <Text
          style={[
            styles.sectionTitle,
            { fontSize: m.z(16), lineHeight: m.z(24), marginBottom: m.y(12) },
          ]}
        >
          آخر الحركات
        </Text>
        <View style={[styles.transactionCard, { borderRadius: m.z(22) }]}>
          {transactions.map((tx, index) => (
            <View
              key={tx.title}
              style={[
                styles.transactionRow,
                {
                  height: m.y(65),
                  borderBottomWidth:
                    index === transactions.length - 1 ? 0 : StyleSheet.hairlineWidth,
                },
              ]}
            >
              <View
                style={[
                  styles.transactionIcon,
                  tx.tone === "in" ? styles.iconGreen : styles.iconRed,
                  { width: m.z(40), height: m.z(40), borderRadius: m.z(20) },
                ]}
              >
                <Text
                  style={[
                    styles.transactionIconText,
                    tx.tone === "in" ? styles.iconTextGreen : styles.iconTextRed,
                    { fontSize: m.z(23) },
                  ]}
                >
                  {tx.icon}
                </Text>
              </View>
              <View style={styles.transactionText}>
                <Text
                  style={[styles.transactionTitle, { fontSize: m.z(15.5), lineHeight: m.z(23) }]}
                >
                  {tx.title}
                </Text>
                <Text style={[styles.transactionMeta, { fontSize: m.z(12), lineHeight: m.z(18) }]}>
                  {tx.meta}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  tx.tone === "in" ? styles.amountGreen : styles.amountDark,
                  { fontSize: m.z(15), lineHeight: m.z(22) },
                ]}
              >
                {tx.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <ManualBottomNav active="home" />
    </View>
  );
}

function BalanceMini({ label, value }: { label: string; value: string }) {
  const m = useMvpMetrics();
  return (
    <View
      style={[
        styles.balanceMini,
        { height: m.y(49), borderRadius: m.z(13), paddingHorizontal: m.x(14) },
      ]}
    >
      <Text style={[styles.balanceMiniLabel, { fontSize: m.z(12), lineHeight: m.z(18) }]}>
        {label}
      </Text>
      <Text style={[styles.balanceMiniValue, { fontSize: m.z(12.5), lineHeight: m.z(19) }]}>
        {value}
      </Text>
    </View>
  );
}

function WalletAction({ label, icon }: { label: string; icon: ReactNode }) {
  const m = useMvpMetrics();
  return (
    <Pressable style={[styles.walletAction, { height: m.y(46), borderRadius: m.z(22) }]}>
      {icon}
      <Text style={[styles.walletActionText, { fontSize: m.z(16), lineHeight: m.z(24) }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function MvpBillingScreen() {
  const m = useMvpMetrics();
  return (
    <View style={styles.root}>
      <Header title="الفوترة والاشتراك" height={104} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(20),
          paddingTop: m.y(20),
          paddingBottom: m.y(104),
        }}
      >
        <SectionCard title="الاشتراك الحالي" icon={<Crown color={UI.orange} size={m.z(19)} />}>
          <Text
            style={[
              styles.billingEmpty,
              { fontSize: m.z(15), lineHeight: m.z(23), marginVertical: m.y(17) },
            ]}
          >
            لا يوجد اشتراك نشط.
          </Text>
          <GradientButton
            label="الترقية إلى Premium"
            onPress={() => router.push("/premium" as never)}
          />
        </SectionCard>

        <SectionCard
          title="طرق الدفع"
          icon={<CreditCard color={UI.orange} size={m.z(19)} />}
          right={<Text style={[styles.addText, { fontSize: m.z(13.5) }]}>+ إضافة</Text>}
        >
          <BillingMethod
            title="Visa •••• 4242"
            icon={<CreditCard color={UI.navy} size={m.z(20)} />}
            defaultMethod
          />
          <BillingMethod
            title="CMI Maroc •••• 1107"
            icon={<Phone color={UI.navy} size={m.z(20)} />}
            removable
          />
          <BillingMethod title="محفظة Tissint" icon={<Wallet color={UI.navy} size={m.z(20)} />} />
        </SectionCard>

        <SectionCard title="سجل الفواتير" icon={<Download color={UI.orange} size={m.z(19)} />}>
          <InvoiceRow title="Premium شهري ..." date="2026/4/INV-2026-0041 · 21" />
          <InvoiceRow title="Premium شهري ..." date="2026/5/INV-2026-0042 · 21" last />
        </SectionCard>
      </ScrollView>
      <ManualBottomNav active="home" />
    </View>
  );
}

function SectionCard({
  title,
  icon,
  right,
  children,
}: {
  title: string;
  icon?: ReactNode;
  right?: ReactNode;
  children: ReactNode;
}) {
  const m = useMvpMetrics();
  return (
    <View style={[styles.sectionCard, { borderRadius: m.z(22), marginBottom: m.y(21) }]}>
      <View style={[styles.sectionHeader, { height: m.y(45), paddingHorizontal: m.x(16) }]}>
        {icon}
        <Text style={[styles.sectionHeaderTitle, { fontSize: m.z(17), lineHeight: m.z(25) }]}>
          {title}
        </Text>
        {right}
      </View>
      <View>{children}</View>
    </View>
  );
}

function BillingMethod({
  title,
  icon,
  defaultMethod,
  removable,
}: {
  title: string;
  icon: ReactNode;
  defaultMethod?: boolean;
  removable?: boolean;
}) {
  const m = useMvpMetrics();
  return (
    <View style={[styles.billingMethod, { height: m.y(60), paddingHorizontal: m.x(16) }]}>
      <View
        style={[styles.billingIcon, { width: m.z(36), height: m.z(36), borderRadius: m.z(18) }]}
      >
        {icon}
      </View>
      <View style={styles.billingMethodText}>
        <Text style={[styles.billingMethodTitle, { fontSize: m.z(15), lineHeight: m.z(22) }]}>
          {title}
        </Text>
        {defaultMethod ? (
          <Text style={[styles.defaultMethod, { fontSize: m.z(12), lineHeight: m.z(18) }]}>
            الافتراضي
          </Text>
        ) : null}
      </View>
      {removable ? <Star color={UI.muted} size={m.z(18)} /> : null}
      {removable || defaultMethod ? (
        <Trash2 color={UI.danger} size={m.z(18)} />
      ) : (
        <Star color={UI.muted} size={m.z(18)} />
      )}
    </View>
  );
}

function InvoiceRow({ title, date, last }: { title: string; date: string; last?: boolean }) {
  const m = useMvpMetrics();
  return (
    <View
      style={[
        styles.invoiceRow,
        {
          height: m.y(64),
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          paddingHorizontal: m.x(16),
        },
      ]}
    >
      <View
        style={[styles.downloadIcon, { width: m.z(36), height: m.z(36), borderRadius: m.z(18) }]}
      >
        <Download color={UI.navy} size={m.z(18)} />
      </View>
      <Text style={[styles.invoiceAmount, { fontSize: m.z(15), lineHeight: m.z(22) }]}>
        100 د.م
      </Text>
      <View
        style={[
          styles.paidBadge,
          { height: m.y(24), borderRadius: m.z(12), paddingHorizontal: m.x(10) },
        ]}
      >
        <Text style={[styles.paidText, { fontSize: m.z(12), lineHeight: m.z(18) }]}>مدفوعة</Text>
      </View>
      <View style={styles.invoiceText}>
        <Text style={[styles.invoiceTitle, { fontSize: m.z(15), lineHeight: m.z(22) }]}>
          {title}
        </Text>
        <Text style={[styles.invoiceDate, { fontSize: m.z(11.5), lineHeight: m.z(17) }]}>
          {date}
        </Text>
      </View>
    </View>
  );
}

export function MvpPremiumScreen() {
  const m = useMvpMetrics();
  const [plan, setPlan] = useState<"monthly" | "yearly">("yearly");
  const price = plan === "yearly" ? "80" : "100";
  const cta = plan === "yearly" ? "اشترك بـ 960 د.م/سنة" : "اشترك بـ 100 د.م/شهر";
  const rows = [
    ["فحوصات يومياً", "3", "غير محدود"],
    ["أولوية تحليل AI", "×", "✓"],
    ["دقة النموذج", "أساسية", "متقدمة +12%"],
    ["إعلانات نشطة", "1", "20"],
  ];

  return (
    <View style={styles.premiumRoot}>
      <BackButton to="/dashboard" />
      <View
        style={[
          styles.moroccoBadge,
          {
            top: m.y(57),
            left: m.x(20),
            height: m.y(22),
            borderRadius: m.z(12),
            paddingHorizontal: m.x(12),
          },
        ]}
      >
        <Text style={[styles.moroccoText, { fontSize: m.z(11), lineHeight: m.z(17) }]}>
          حصرياً للمغرب
        </Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(20),
          paddingTop: m.y(104),
          paddingBottom: m.y(125),
        }}
      >
        <LinearGradient
          colors={gradient}
          style={[styles.premiumCrown, { width: m.z(80), height: m.z(80), borderRadius: m.z(40) }]}
        >
          <Crown color={UI.dark} size={m.z(44)} strokeWidth={2.6} />
        </LinearGradient>
        <Text
          style={[
            styles.premiumTitle,
            { fontSize: m.z(28), lineHeight: m.z(39), marginTop: m.y(25) },
          ]}
        >
          Tissint Premium
        </Text>
        <Text
          style={[
            styles.premiumSubtitle,
            { fontSize: m.z(14), lineHeight: m.z(22), marginTop: m.y(11) },
          ]}
        >
          ارتقِ بتجربتك في عالم النيازك
        </Text>
        <View
          style={[
            styles.premiumToggle,
            { height: m.y(44), borderRadius: m.z(22), marginTop: m.y(23) },
          ]}
        >
          <PremiumPlanToggle
            label="شهري"
            active={plan === "monthly"}
            onPress={() => setPlan("monthly")}
          />
          <PremiumPlanToggle
            label="سنوي"
            active={plan === "yearly"}
            onPress={() => setPlan("yearly")}
          />
          <View
            style={[
              styles.saveBubble,
              { left: m.x(0), top: m.y(-4), borderRadius: m.z(10), paddingHorizontal: m.x(8) },
            ]}
          >
            <Text style={[styles.saveBubbleText, { fontSize: m.z(10) }]}>20%-</Text>
          </View>
        </View>
        <View
          style={[
            styles.premiumPriceCard,
            { height: m.y(131), borderRadius: m.z(26), marginTop: m.y(20) },
          ]}
        >
          <Text style={[styles.premiumPrice, { fontSize: m.z(42), lineHeight: m.z(54) }]}>
            {price}
          </Text>
          <Text style={[styles.premiumCurrency, { fontSize: m.z(16) }]}>د.م</Text>
          <Text style={[styles.premiumPeriod, { fontSize: m.z(14), lineHeight: m.z(21) }]}>
            شهرياً · 960 د.م/سنة
          </Text>
          <Text style={[styles.premiumSave, { fontSize: m.z(13), lineHeight: m.z(19) }]}>
            ✓ وفر 240 د.م
          </Text>
        </View>
        <View style={[styles.compareTable, { borderRadius: m.z(20), marginTop: m.y(21) }]}>
          <View style={[styles.compareHeader, { height: m.y(43) }]}>
            <Text style={[styles.compareCellHead, { fontSize: m.z(12) }]}>الميزة</Text>
            <Text style={[styles.compareCellHead, { fontSize: m.z(12) }]}>مجاني</Text>
            <View style={[styles.premiumHeadPill, { borderRadius: m.z(13) }]}>
              <Text style={[styles.premiumHeadText, { fontSize: m.z(12) }]}>PREMIUM</Text>
            </View>
          </View>
          {rows.map(([label, free, premium], index) => (
            <View
              key={label}
              style={[
                styles.compareRowPremium,
                index % 2 === 0 ? styles.compareRowTintPremium : null,
                { height: m.y(37) },
              ]}
            >
              <Text style={[styles.compareLabelPremium, { fontSize: m.z(14) }]}>{label}</Text>
              <Text style={[styles.compareValuePremium, { fontSize: m.z(13) }]}>{free}</Text>
              <Text style={[styles.comparePremiumValue, { fontSize: m.z(13) }]}>{premium}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <View style={[styles.premiumFooter, { height: m.y(119) }]}>
        <SettingsFab />
        <Pressable
          onPress={() => router.push({ pathname: "/checkout", params: { plan } } as never)}
          style={[
            styles.premiumCta,
            { left: m.x(20), right: m.x(20), top: m.y(20), height: m.y(56), borderRadius: m.z(28) },
          ]}
        >
          <LinearGradient
            colors={gradient}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.premiumCtaGradient}
          >
            <Text style={[styles.premiumCtaText, { fontSize: m.z(18), lineHeight: m.z(27) }]}>
              {cta}
            </Text>
          </LinearGradient>
        </Pressable>
        <Text
          style={[styles.renewText, { bottom: m.y(24), fontSize: m.z(11), lineHeight: m.z(17) }]}
        >
          يبدأ التجديد تلقائياً · قابل للإلغاء
        </Text>
      </View>
    </View>
  );
}

function PremiumPlanToggle({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.premiumToggleButton,
        active ? styles.premiumToggleActive : null,
        { borderRadius: m.z(22) },
      ]}
    >
      <Text
        style={[
          styles.premiumToggleText,
          active ? styles.premiumToggleTextActive : null,
          { fontSize: m.z(15), lineHeight: m.z(22) },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function MvpProfileScreen() {
  const m = useMvpMetrics();
  return (
    <View style={styles.root}>
      <View
        style={[
          styles.profileHeader,
          { height: m.y(163), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
        ]}
      >
        <BackButton to="/dashboard" />
        <Pressable
          style={[
            styles.editButton,
            { top: m.y(50), left: m.x(20), width: m.z(36), height: m.z(36), borderRadius: m.z(18) },
          ]}
        >
          <Edit3 color={UI.white} size={m.z(20)} />
        </Pressable>
        <Text
          style={[styles.headerTitle, { top: m.y(56), fontSize: m.z(22), lineHeight: m.z(31) }]}
        >
          الملف الشخصي
        </Text>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(20),
          paddingTop: m.y(108),
          paddingBottom: m.y(105),
        }}
      >
        <View
          style={[
            styles.profileCard,
            { height: m.y(192), borderRadius: m.z(22), marginTop: m.y(-108), padding: m.z(20) },
          ]}
        >
          <LinearGradient
            colors={gradient}
            style={[
              styles.profileAvatar,
              {
                top: m.y(21),
                right: m.x(20),
                width: m.z(80),
                height: m.z(80),
                borderRadius: m.z(20),
              },
            ]}
          >
            <Text style={[styles.profileAvatarText, { fontSize: m.z(30), lineHeight: m.z(40) }]}>
              صا
            </Text>
          </LinearGradient>
          <View style={[styles.profileNameBlock, { top: m.y(29), right: m.x(118) }]}>
            <View style={styles.profileNameLine}>
              <Text style={[styles.profileName, { fontSize: m.z(21), lineHeight: m.z(30) }]}>
                صديق النيازك
              </Text>
              <BadgeCheckSmall />
            </View>
            <Text style={[styles.profileHandle, { fontSize: m.z(13), lineHeight: m.z(19) }]}>
              tissint_user_2026@
            </Text>
            <View
              style={[
                styles.freeBadge,
                {
                  height: m.y(24),
                  borderRadius: m.z(12),
                  marginTop: m.y(8),
                  paddingHorizontal: m.x(14),
                },
              ]}
            >
              <Text style={[styles.freeBadgeText, { fontSize: m.z(12), lineHeight: m.z(18) }]}>
                حساب مجاني
              </Text>
            </View>
          </View>
          <View style={[styles.profileDivider, { top: m.y(117), left: m.x(20), right: m.x(20) }]} />
          <View style={[styles.profileStats, { bottom: m.y(22), left: m.x(25), right: m.x(25) }]}>
            <ProfileStat value="3" label="مجموعة" />
            <ProfileStat value="6" label="في السوق" />
            <ProfileStat value="0" label="مُباع" />
            <ProfileStat value="2" label="مسح اليوم" />
          </View>
        </View>
        <ProfileSection title="المعلومات الشخصية" icon={<User color={UI.orange} size={m.z(19)} />}>
          <ProfileInfo
            label="البريد الإلكتروني"
            value="user@tissint.ma"
            icon={<Mail color={UI.muted} size={m.z(18)} />}
          />
          <ProfileInfo
            label="الهاتف"
            value="+212 6 12 34 56 78"
            icon={<Phone color={UI.muted} size={m.z(18)} />}
          />
          <ProfileInfo
            label="المنطقة"
            value="ورزازات، المغرب"
            icon={<MapPin color={UI.muted} size={m.z(18)} />}
          />
          <ProfileInfo
            label="عضو منذ"
            value="يناير 2026"
            icon={<Calendar color={UI.muted} size={m.z(18)} />}
            last
          />
        </ProfileSection>
        <ProfileSection title="الحساب والاشتراك" icon={<Shield color={UI.orange} size={m.z(19)} />}>
          <ProfileInfo
            label="الدور"
            value="حساب مجاني"
            icon={<Star color={UI.muted} size={m.z(18)} />}
          />
          <ProfileInfo
            label="الحد اليومي للمسح"
            value="5 / 2"
            icon={<ScanLine color={UI.muted} size={m.z(18)} />}
          />
          <ProfileInfo
            label="المحفظة"
            value="2,095 د.م"
            icon={<Wallet color={UI.navy} size={m.z(18)} />}
            last
            onPress={() => router.push("/wallet" as never)}
          />
        </ProfileSection>
      </ScrollView>
      <ManualBottomNav active="home" />
    </View>
  );
}

function BadgeCheckSmall() {
  return <Text style={styles.badgeCheckSmall}>✿</Text>;
}

function ProfileStat({ value, label }: { value: string; label: string }) {
  const m = useMvpMetrics();
  return (
    <View style={styles.profileStat}>
      <Text style={[styles.profileStatValue, { fontSize: m.z(17), lineHeight: m.z(24) }]}>
        {value}
      </Text>
      <Text style={[styles.profileStatLabel, { fontSize: m.z(11.5), lineHeight: m.z(17) }]}>
        {label}
      </Text>
    </View>
  );
}

function ProfileSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  const m = useMvpMetrics();
  return (
    <View style={[styles.profileSection, { borderRadius: m.z(22), marginTop: m.y(21) }]}>
      <View style={[styles.profileSectionHeader, { height: m.y(45), paddingHorizontal: m.x(16) }]}>
        {icon}
        <Text style={[styles.profileSectionTitle, { fontSize: m.z(17), lineHeight: m.z(25) }]}>
          {title}
        </Text>
      </View>
      {children}
    </View>
  );
}

function ProfileInfo({
  label,
  value,
  icon,
  last,
  onPress,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  last?: boolean;
  onPress?: () => void;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      style={[
        styles.profileInfo,
        {
          height: m.y(40),
          borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
          paddingHorizontal: m.x(16),
        },
      ]}
    >
      {icon}
      <Text style={[styles.profileInfoLabel, { fontSize: m.z(13.5), lineHeight: m.z(20) }]}>
        {label}
      </Text>
      <Text style={[styles.profileInfoValue, { fontSize: m.z(13.5), lineHeight: m.z(20) }]}>
        {value}
      </Text>
    </Pressable>
  );
}

export function MvpSettingsScreen() {
  const m = useMvpMetrics();
  const [sms, setSms] = useState(false);
  const [face, setFace] = useState(true);
  const refreshToken = useSessionStore((state) => state.refreshToken);
  const clearSession = useSessionStore((state) => state.clearSession);

  async function logoutAllDevices() {
    await logoutCurrentSession(refreshToken);
    clearSession();
    router.replace("/onboarding" as never);
  }

  return (
    <View style={styles.root}>
      <View
        style={[
          styles.settingsHeader,
          { height: m.y(136), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
        ]}
      >
        <BackButton to="/profile" />
        <Text
          style={[styles.headerTitle, { top: m.y(56), fontSize: m.z(22), lineHeight: m.z(31) }]}
        >
          الإعدادات
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={[styles.settingsTabs, { paddingHorizontal: m.x(20), gap: m.x(8) }]}
          style={{ position: "absolute", top: m.y(96), left: 0, right: 0 }}
        >
          <SettingsTab label="الأمان" active icon={<Shield color={UI.white} size={m.z(14)} />} />
          <SettingsTab label="المظهر" icon={<Monitor color={UI.white} size={m.z(14)} />} />
          <SettingsTab label="الإشعارات" icon={<Bell color={UI.white} size={m.z(14)} />} />
          <SettingsTab label="الخصوصية" icon={<Lock color={UI.white} size={m.z(14)} />} />
        </ScrollView>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(20),
          paddingTop: m.y(20),
          paddingBottom: m.y(42),
        }}
      >
        <SectionCard
          title="المصادقة الثنائية (2FA)"
          icon={<KeyRound color={UI.orange} size={m.z(19)} />}
        >
          <ToggleRow
            label="تفعيل 2FA عبر SMS"
            value={sms}
            onPress={() => setSms((current) => !current)}
          />
          <ToggleRow
            label="بصمة الإصبع / Face ID"
            value={face}
            onPress={() => setFace((current) => !current)}
          />
          <Text
            style={[
              styles.settingsHint,
              { fontSize: m.z(12.5), lineHeight: m.z(19), margin: m.z(16), marginTop: 0 },
            ]}
          >
            حماية إضافية ضد سرقة الحساب.
          </Text>
        </SectionCard>
        <SectionCard title="تغيير كلمة المرور" icon={<Lock color={UI.orange} size={m.z(19)} />}>
          <PasswordField label="الحالية" />
          <PasswordField label="الجديدة" />
          <Pressable
            style={[
              styles.updatePassword,
              {
                height: m.y(40),
                borderRadius: m.z(20),
                marginHorizontal: m.x(12),
                marginBottom: m.y(13),
              },
            ]}
          >
            <Text style={[styles.updatePasswordText, { fontSize: m.z(16), lineHeight: m.z(24) }]}>
              تحديث
            </Text>
          </Pressable>
        </SectionCard>
        <SectionCard title="الجلسات النشطة" icon={<Shield color={UI.orange} size={m.z(19)} />}>
          <Pressable
            onPress={logoutAllDevices}
            style={[styles.logoutAll, { height: m.y(40), borderRadius: m.z(20), margin: m.z(12) }]}
          >
            <LogOut color={UI.danger} size={m.z(18)} />
            <Text style={[styles.logoutAllText, { fontSize: m.z(15), lineHeight: m.z(22) }]}>
              تسجيل خروج من كل الأجهزة
            </Text>
          </Pressable>
        </SectionCard>
      </ScrollView>
      <SettingsFab />
    </View>
  );
}

function SettingsTab({
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
        styles.settingsTab,
        {
          height: m.y(28),
          borderRadius: m.z(17),
          paddingHorizontal: m.x(16),
          backgroundColor: active ? UI.orange : "rgba(255,255,255,0.12)",
        },
      ]}
    >
      {icon}
      <Text style={[styles.settingsTabText, { fontSize: m.z(14), lineHeight: m.z(20) }]}>
        {label}
      </Text>
    </Pressable>
  );
}

function ToggleRow({
  label,
  value,
  onPress,
}: {
  label: string;
  value: boolean;
  onPress: () => void;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.toggleRow, { height: m.y(44), paddingHorizontal: m.x(20) }]}
    >
      <Text style={[styles.toggleLabel, { fontSize: m.z(15), lineHeight: m.z(22) }]}>{label}</Text>
      <View
        style={[
          styles.switchTrack,
          value ? styles.switchActive : null,
          { width: m.x(36), height: m.y(20), borderRadius: m.z(10) },
        ]}
      >
        <View
          style={[
            styles.switchThumb,
            {
              width: m.z(17),
              height: m.z(17),
              borderRadius: m.z(9),
              left: value ? m.x(17) : m.x(2),
            },
          ]}
        />
      </View>
    </Pressable>
  );
}

function PasswordField({ label }: { label: string }) {
  const m = useMvpMetrics();
  return (
    <View style={{ paddingHorizontal: m.x(13), marginTop: m.y(12) }}>
      <Text
        style={[
          styles.passwordLabel,
          { fontSize: m.z(13.5), lineHeight: m.z(20), marginBottom: m.y(7) },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.passwordInput,
          { height: m.y(37), borderRadius: m.z(19), paddingHorizontal: m.x(14) },
        ]}
      >
        <Eye color={UI.muted} size={m.z(17)} />
      </View>
    </View>
  );
}

function GradientButton({ label, onPress }: { label: string; onPress: () => void }) {
  const m = useMvpMetrics();
  return (
    <Pressable onPress={onPress} style={{ marginHorizontal: m.x(16), marginBottom: m.y(16) }}>
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.gradientButton, { height: m.y(40), borderRadius: m.z(20) }]}
      >
        <Text style={[styles.gradientButtonText, { fontSize: m.z(15), lineHeight: m.z(22) }]}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI.cream,
  },
  header: {
    backgroundColor: UI.navy,
    overflow: "hidden",
  },
  headerTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
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
  walletHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: UI.navy,
  },
  walletHeaderIcon: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceCard: {
    position: "absolute",
  },
  balanceTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 7,
    alignSelf: "flex-end",
  },
  balanceLabel: {
    color: UI.white,
    textAlign: "right",
    writingDirection: "rtl",
  },
  balanceValue: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  balanceSubRow: {
    flexDirection: "row-reverse",
  },
  balanceMini: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.18)",
    justifyContent: "center",
  },
  balanceMiniLabel: {
    color: "rgba(255,255,255,0.85)",
    textAlign: "right",
    writingDirection: "rtl",
  },
  balanceMiniValue: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  walletActions: {
    position: "absolute",
    flexDirection: "row-reverse",
    zIndex: 5,
  },
  walletAction: {
    flex: 1,
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  walletActionText: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  withdrawArrow: {
    color: UI.navy,
    fontWeight: "900",
  },
  sectionTitle: {
    color: UI.muted,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  transactionCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    overflow: "hidden",
  },
  transactionRow: {
    borderBottomColor: UI.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 13,
    gap: 12,
  },
  transactionIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  iconGreen: {
    backgroundColor: "#E9F6EE",
  },
  iconRed: {
    backgroundColor: "#FCE6E9",
  },
  transactionIconText: {
    fontWeight: "900",
  },
  iconTextGreen: {
    color: UI.success,
  },
  iconTextRed: {
    color: UI.danger,
  },
  transactionText: {
    flex: 1,
    alignItems: "flex-end",
  },
  transactionTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  transactionMeta: {
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  transactionAmount: {
    width: 82,
    fontWeight: "900",
    textAlign: "left",
    writingDirection: "rtl",
  },
  amountGreen: {
    color: UI.success,
  },
  amountDark: {
    color: UI.text,
  },
  sectionCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    overflow: "hidden",
  },
  sectionHeader: {
    borderBottomWidth: 1,
    borderBottomColor: UI.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  sectionHeaderTitle: {
    flex: 1,
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  billingEmpty: {
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  gradientButton: {
    alignItems: "center",
    justifyContent: "center",
  },
  gradientButtonText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  addText: {
    color: UI.orange,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  billingMethod: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: UI.border,
    gap: 13,
  },
  billingIcon: {
    backgroundColor: UI.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  billingMethodText: {
    flex: 1,
    alignItems: "flex-end",
  },
  billingMethodTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  defaultMethod: {
    color: UI.success,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  invoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: UI.border,
    gap: 12,
  },
  downloadIcon: {
    backgroundColor: UI.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  invoiceAmount: {
    color: UI.orange,
    fontWeight: "900",
    width: 70,
    textAlign: "center",
    writingDirection: "rtl",
  },
  paidBadge: {
    backgroundColor: "#E6F5EA",
    alignItems: "center",
    justifyContent: "center",
  },
  paidText: {
    color: UI.success,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  invoiceText: {
    flex: 1,
    alignItems: "flex-end",
  },
  invoiceTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  invoiceDate: {
    color: UI.muted,
    textAlign: "right",
  },
  premiumRoot: {
    flex: 1,
    backgroundColor: UI.dark,
  },
  moroccoBadge: {
    position: "absolute",
    zIndex: 4,
    backgroundColor: "rgba(247,199,94,0.18)",
    justifyContent: "center",
  },
  moroccoText: {
    color: UI.gold,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  premiumCrown: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumTitle: {
    color: UI.gold,
    fontWeight: "900",
    textAlign: "center",
  },
  premiumSubtitle: {
    color: "rgba(255,255,255,0.65)",
    textAlign: "center",
    writingDirection: "rtl",
  },
  premiumToggle: {
    backgroundColor: "rgba(255,255,255,0.06)",
    flexDirection: "row-reverse",
    padding: 4,
    position: "relative",
  },
  premiumToggleButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumToggleActive: {
    backgroundColor: UI.orange,
  },
  premiumToggleText: {
    color: "rgba(255,255,255,0.68)",
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  premiumToggleTextActive: {
    color: UI.white,
  },
  saveBubble: {
    position: "absolute",
    backgroundColor: UI.success,
  },
  saveBubbleText: {
    color: UI.white,
    fontWeight: "900",
  },
  premiumPriceCard: {
    borderWidth: 1,
    borderColor: "rgba(247,199,94,0.36)",
    backgroundColor: "rgba(247,199,94,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  premiumPrice: {
    color: UI.gold,
    fontWeight: "900",
    textAlign: "center",
  },
  premiumCurrency: {
    position: "absolute",
    top: "43%",
    left: "37%",
    color: "rgba(255,255,255,0.76)",
    fontWeight: "900",
  },
  premiumPeriod: {
    color: "rgba(255,255,255,0.54)",
    textAlign: "center",
    writingDirection: "rtl",
  },
  premiumSave: {
    color: UI.success,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  compareTable: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  compareHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  compareCellHead: {
    flex: 1,
    color: "rgba(255,255,255,0.55)",
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  premiumHeadPill: {
    flex: 1,
    backgroundColor: "rgba(247,199,94,0.18)",
    paddingVertical: 5,
  },
  premiumHeadText: {
    color: UI.gold,
    fontWeight: "900",
    textAlign: "center",
  },
  compareRowPremium: {
    flexDirection: "row-reverse",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  compareRowTintPremium: {
    backgroundColor: "rgba(247,199,94,0.06)",
  },
  compareLabelPremium: {
    flex: 1,
    color: UI.white,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  compareValuePremium: {
    flex: 1,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
    writingDirection: "rtl",
  },
  comparePremiumValue: {
    flex: 1,
    color: UI.gold,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  premiumFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: UI.dark,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.08)",
  },
  premiumCta: {
    position: "absolute",
    overflow: "hidden",
  },
  premiumCtaGradient: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  premiumCtaText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  renewText: {
    position: "absolute",
    left: 0,
    right: 0,
    color: "rgba(255,255,255,0.42)",
    textAlign: "center",
    writingDirection: "rtl",
  },
  profileHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: UI.navy,
  },
  editButton: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  profileCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    position: "relative",
    shadowColor: "#000",
    shadowOpacity: 0.11,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  profileAvatar: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  profileAvatarText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
  },
  profileNameBlock: {
    position: "absolute",
    alignItems: "flex-end",
  },
  profileNameLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 6,
  },
  profileName: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  badgeCheckSmall: {
    color: UI.orange,
    fontSize: 18,
  },
  profileHandle: {
    color: UI.muted,
    textAlign: "right",
  },
  freeBadge: {
    backgroundColor: UI.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  freeBadgeText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  profileDivider: {
    position: "absolute",
    height: StyleSheet.hairlineWidth,
    backgroundColor: UI.border,
  },
  profileStats: {
    position: "absolute",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
  },
  profileStat: {
    alignItems: "center",
    width: "24%",
  },
  profileStatValue: {
    color: UI.navy,
    fontWeight: "900",
    textAlign: "center",
  },
  profileStatLabel: {
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  profileSection: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    overflow: "hidden",
  },
  profileSectionHeader: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: UI.border,
  },
  profileSectionTitle: {
    flex: 1,
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  profileInfo: {
    flexDirection: "row-reverse",
    alignItems: "center",
    borderBottomColor: UI.border,
    gap: 12,
  },
  profileInfoLabel: {
    flex: 1,
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  profileInfoValue: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "left",
    writingDirection: "rtl",
  },
  settingsHeader: {
    backgroundColor: UI.navy,
    overflow: "hidden",
  },
  settingsTabs: {
    flexDirection: "row-reverse",
  },
  settingsTab: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  settingsTabText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  toggleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleLabel: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  switchTrack: {
    backgroundColor: UI.pale,
    position: "relative",
  },
  switchActive: {
    backgroundColor: UI.orange,
  },
  switchThumb: {
    position: "absolute",
    top: 1.5,
    backgroundColor: UI.white,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  settingsHint: {
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  passwordLabel: {
    color: UI.muted,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  passwordInput: {
    backgroundColor: UI.cream,
    borderWidth: 1,
    borderColor: UI.border,
    justifyContent: "center",
  },
  updatePassword: {
    backgroundColor: UI.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  updatePasswordText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  logoutAll: {
    backgroundColor: "#FCE6E9",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutAllText: {
    color: UI.danger,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
});
