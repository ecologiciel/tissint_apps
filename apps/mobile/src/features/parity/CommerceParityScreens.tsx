import { router, useLocalSearchParams } from "expo-router";
import {
  BadgeCheck,
  Banknote,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  CreditCard,
  Crown,
  Download,
  Eye,
  FileText,
  Plus,
  Receipt,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Star,
  Store,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  XCircle,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { Badge } from "@/components/ui/Badge";
import { useSessionStore } from "@/store/session-store";
import { colors, spacing } from "@/theme";
import { formatPrice } from "@tissint/shared";
import {
  DEMO_COLLECTION,
  DEMO_MARKETPLACE_LISTINGS,
  PREMIUM_PLANS,
  REGIONS,
  type PremiumPlanId,
} from "./parity-data";
import { Field, HeaderBar, MetricTile, ProgressBar, SelectCard } from "./parity-ui";
import { selectWalletBalance, useParityStore } from "./parity-store";
import { MeteoriteThumb } from "@/components/tissint/MeteoriteThumb";
import { MvpEmptyActionScreen } from "@/features/mvp/MvpEmptyState";
import { useScanStore } from "@/store/scan-store";

const statusLabels = {
  draft: "مسودة",
  pending_admin: "قيد المراجعة",
  institutional_hold_24h: "معالجة 24 ساعة",
  published: "نشط",
  admin_reserved: "محجوز إداريا",
  sold: "مباع",
  rejected: "مرفوض",
  archived: "مؤرشف",
};

export function MyListingsScreen() {
  const [tab, setTab] = useState<"all" | "published" | "pending_admin" | "sold" | "rejected">(
    "all",
  );
  const mine = DEMO_MARKETPLACE_LISTINGS.map((item, index) => ({
    ...item,
    status:
      index === 1 ? "pending_admin" : index === 2 ? "sold" : index === 4 ? "rejected" : item.status,
  }));
  const visible = tab === "all" ? mine : mine.filter((item) => item.status === tab);
  const counts = {
    all: mine.length,
    published: mine.filter((item) => item.status === "published").length,
    pending_admin: mine.filter((item) => item.status === "pending_admin").length,
    sold: mine.filter((item) => item.status === "sold").length,
    rejected: mine.filter((item) => item.status === "rejected").length,
  };

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar
        title="إعلاناتي"
        subtitle="إدارة البيع، السعر، الحذف، والأرشفة"
        backTo="/market"
        right={
          <Button tone="secondary" icon={Plus} onPress={() => router.push("/scan" as never)}>
            فحص
          </Button>
        }
      />

      <View style={styles.metricRow}>
        <MetricTile label="الإجمالي" value={counts.all} tone="navy" icon={Store} />
        <MetricTile label="نشط" value={counts.published} tone="success" icon={BadgeCheck} />
        <MetricTile label="مباع" value={counts.sold} tone="gold" icon={Banknote} />
        <MetricTile label="مراجعة" value={counts.pending_admin} tone="orange" icon={Clock} />
      </View>

      <View style={styles.chipRow}>
        {[
          ["all", "الكل"],
          ["pending_admin", "قيد المراجعة"],
          ["published", "نشط"],
          ["sold", "مباع"],
          ["rejected", "مرفوض"],
        ].map(([id, label]) => (
          <Pressable
            key={id}
            onPress={() => setTab(id as typeof tab)}
            style={[styles.tabChip, tab === id ? styles.tabChipActive : null]}
          >
            <AppText
              variant="caption"
              color={tab === id ? "#FFFFFF" : colors.text}
              style={styles.bold}
            >
              {label} ({counts[id as keyof typeof counts]})
            </AppText>
          </Pressable>
        ))}
      </View>

      {visible.map((listing) => (
        <Card key={listing.listingId} style={styles.cardGap}>
          <View style={styles.listingRow}>
            <View style={styles.thumbSm}>
              <MeteoriteThumb rare={listing.isRare} />
            </View>
            <View style={styles.flexEnd}>
              <Badge
                label={statusLabels[listing.status]}
                tone={
                  listing.status === "rejected"
                    ? "danger"
                    : listing.status === "sold"
                      ? "premium"
                      : listing.status === "published"
                        ? "success"
                        : "warning"
                }
              />
              <AppText variant="subtitle" numberOfLines={1}>
                {listing.title}
              </AppText>
              <AppText variant="caption">
                {listing.weightGram}g - {listing.region}
              </AppText>
              <AppText variant="title" color={colors.orange}>
                {formatPrice(listing)}
              </AppText>
            </View>
          </View>
          {listing.status === "pending_admin" ? (
            <AppText variant="caption">سيتم مراجعة الإعلان خلال 24 ساعة.</AppText>
          ) : null}
          {listing.status === "rejected" ? (
            <AppText variant="caption" color={colors.danger}>
              تم رفض الإعلان. راجع الصور أو الوصف.
            </AppText>
          ) : null}
          <View style={styles.buttonRow}>
            <Button
              tone="ghost"
              icon={Eye}
              onPress={() =>
                router.push({
                  pathname: "/market/[listingId]",
                  params: { listingId: listing.listingId },
                } as never)
              }
            >
              عرض
            </Button>
            <Button tone="ghost" icon={ChevronDown}>
              تعديل السعر
            </Button>
            {listing.status !== "sold" ? (
              <Button tone="danger" icon={Trash2}>
                حذف
              </Button>
            ) : null}
          </View>
        </Card>
      ))}
    </Screen>
  );
}

export function SellerProfileScreen() {
  const params = useLocalSearchParams<{ name?: string }>();
  const name = params.name ? decodeURIComponent(params.name) : "بائع موثق";
  const sellerListings = DEMO_MARKETPLACE_LISTINGS.slice(0, 3);

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar
        title="ملف البائع"
        subtitle="معلومات عامة بدون كشف الهاتف إلا ل Premium"
        backTo="/market"
      />
      <Card style={styles.centerCard}>
        <View style={styles.avatar}>
          <AppText color="#FFFFFF" variant="title" style={styles.centerText}>
            {name.slice(0, 2)}
          </AppText>
        </View>
        <View style={styles.rowCenter}>
          <BadgeCheck color={colors.success} size={18} />
          <AppText variant="title" color={colors.navy}>
            {name}
          </AppText>
        </View>
        <AppText variant="caption" style={styles.centerText}>
          عضو منذ يناير 2026 - المنطقة العامة: تاتا
        </AppText>
      </Card>
      <View style={styles.metricRow}>
        <MetricTile label="إعلانات" value={sellerListings.length} icon={Store} />
        <MetricTile label="متوسط score" value="91%" icon={ShieldCheck} tone="success" />
        <MetricTile label="تقييم" value="4.8" icon={Star} tone="gold" />
      </View>
      <Card style={styles.cardGap}>
        <AppText variant="subtitle">إعلانات البائع</AppText>
        {sellerListings.map((listing) => (
          <Pressable
            key={listing.listingId}
            onPress={() =>
              router.push({
                pathname: "/market/[listingId]",
                params: { listingId: listing.listingId },
              } as never)
            }
            style={styles.compactLine}
          >
            <AppText style={styles.flex}>{listing.title}</AppText>
            <AppText color={colors.orange} style={styles.bold}>
              {formatPrice(listing)}
            </AppText>
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}

export function PriceHistoryScreen() {
  const classes = Array.from(new Set(DEMO_MARKETPLACE_LISTINGS.map((item) => item.dominantClass)));
  const [selected, setSelected] = useState(classes[0]);
  const matching = DEMO_MARKETPLACE_LISTINGS.filter((item) => item.dominantClass === selected);
  const avg = matching.length
    ? Math.round(
        matching.reduce(
          (sum, item) => sum + (item.priceValue ?? 0) / Math.max(item.weightGram ?? 1, 1),
          0,
        ) / matching.length,
      )
    : 220;
  const history = Array.from({ length: 14 }, (_, index) =>
    Math.max(50, Math.round(avg + Math.sin(index * 0.8 + selected.length) * 45)),
  );
  const min = Math.min(...history);
  const max = Math.max(...history);
  const trend = history[history.length - 1] - history[0];

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title="سجل الأسعار" subtitle="متوسط آخر 30 يوم حسب التصنيف" backTo="/market" />
      <View style={styles.chipRow}>
        {classes.map((classification) => (
          <Pressable
            key={classification}
            onPress={() => setSelected(classification)}
            style={[styles.tabChip, selected === classification ? styles.tabChipActive : null]}
          >
            <AppText
              variant="caption"
              color={selected === classification ? "#FFFFFF" : colors.text}
              style={styles.bold}
            >
              {classification}
            </AppText>
          </Pressable>
        ))}
      </View>
      <Card style={styles.cardGap}>
        <View style={styles.rowBetween}>
          <AppText variant="caption">متوسط السعر DH/g</AppText>
          <View style={styles.rowCenter}>
            {trend >= 0 ? (
              <TrendingUp color={colors.success} size={16} />
            ) : (
              <TrendingDown color={colors.danger} size={16} />
            )}
            <AppText color={trend >= 0 ? colors.success : colors.danger} style={styles.bold}>
              {trend >= 0 ? "+" : ""}
              {trend} DH
            </AppText>
          </View>
        </View>
        <AppText variant="hero" color={colors.navy}>
          {avg} DH/g
        </AppText>
        <View style={styles.chart}>
          {history.map((value, index) => (
            <View key={index} style={styles.chartCol}>
              <View
                style={[
                  styles.chartBar,
                  { height: `${22 + ((value - min) / Math.max(max - min, 1)) * 78}%` },
                  index === history.length - 1 ? styles.chartBarActive : null,
                ]}
              />
            </View>
          ))}
        </View>
        <View style={styles.rowBetween}>
          <AppText variant="caption">أدنى {min} DH</AppText>
          <AppText variant="caption">أعلى {max} DH</AppText>
        </View>
      </Card>
      <Card style={styles.cardGap}>
        <AppText variant="subtitle">إعلانات مماثلة</AppText>
        {matching.length === 0 ? (
          <AppText variant="caption">لا توجد بيانات لهذا التصنيف.</AppText>
        ) : null}
        {matching.map((listing) => (
          <Pressable
            key={listing.listingId}
            onPress={() =>
              router.push({
                pathname: "/market/[listingId]",
                params: { listingId: listing.listingId },
              } as never)
            }
            style={styles.compactLine}
          >
            <AppText style={styles.flex}>{listing.title}</AppText>
            <AppText color={colors.orange} style={styles.bold}>
              {formatPrice(listing)}
            </AppText>
          </Pressable>
        ))}
      </Card>
    </Screen>
  );
}

export function CheckoutScreen() {
  const params = useLocalSearchParams<{ plan?: PremiumPlanId }>();
  const initialPlan = params.plan === "yearly" ? "yearly" : "monthly";
  const [plan, setPlan] = useState<PremiumPlanId>(initialPlan);
  const [coupon, setCoupon] = useState("");
  const [accepted, setAccepted] = useState(true);
  const methods = useParityStore((state) => state.paymentMethods);
  const wallet = useParityStore(selectWalletBalance);
  const subscribePremium = useParityStore((state) => state.subscribePremium);
  const setRole = useSessionStore((state) => state.setRole);
  const [methodId, setMethodId] = useState(
    methods.find((method) => method.isDefault)?.id ?? methods[0]?.id,
  );
  const planObj = PREMIUM_PLANS.find((item) => item.id === plan) ?? PREMIUM_PLANS[0];
  const discount =
    coupon.trim().toUpperCase() === "TISSINT10" ? Math.round(planObj.priceDh * 0.1) : 0;
  const total = planObj.priceDh - discount;

  function pay() {
    if (!methodId || !accepted) return;
    const invoice = subscribePremium(plan, total, methodId);
    setRole("premium");
    router.replace({ pathname: "/checkout/success", params: { invoice: invoice.id } });
  }

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title="الدفع" subtitle="SSL - CMI / Visa / PayPal / Wallet" backTo="/premium" />
      <Card style={styles.cardGap}>
        <AppText variant="subtitle">اختر الخطة</AppText>
        <View style={styles.twoCol}>
          {PREMIUM_PLANS.map((item) => (
            <SelectCard
              key={item.id}
              active={plan === item.id}
              title={`${item.priceDh} DH`}
              body={`${item.label} ${item.period}${item.hint ? ` - ${item.hint}` : ""}`}
              onPress={() => setPlan(item.id)}
            />
          ))}
        </View>
      </Card>
      <Card style={styles.cardGap}>
        <AppText variant="subtitle">طريقة الدفع</AppText>
        {methods.map((method) => {
          const insufficient = method.kind === "wallet" && wallet < total;
          return (
            <SelectCard
              key={method.id}
              active={methodId === method.id}
              title={`${method.label}${method.last4 ? ` **** ${method.last4}` : ""}`}
              body={
                method.kind === "wallet"
                  ? `الرصيد: ${wallet} DH${insufficient ? " - غير كاف" : ""}`
                  : "جاهزة للدفع المحاكى"
              }
              onPress={() => !insufficient && setMethodId(method.id)}
            />
          );
        })}
        <Button tone="ghost" icon={CreditCard} onPress={() => router.push("/billing")}>
          إدارة طرق الدفع
        </Button>
      </Card>
      <Card style={styles.cardGap}>
        <Field value={coupon} onChangeText={setCoupon} placeholder="رمز الخصم TISSINT10" />
        <View style={styles.summaryLine}>
          <AppText>المجموع الفرعي</AppText>
          <AppText>{planObj.priceDh} DH</AppText>
        </View>
        {discount ? (
          <View style={styles.summaryLine}>
            <AppText color={colors.success}>خصم</AppText>
            <AppText color={colors.success}>-{discount} DH</AppText>
          </View>
        ) : null}
        <View style={styles.summaryLine}>
          <AppText variant="caption">منها TVA 20%</AppText>
          <AppText variant="caption">{(total - total / 1.2).toFixed(2)} DH</AppText>
        </View>
        <View style={styles.summaryLine}>
          <AppText variant="title">المجموع</AppText>
          <AppText variant="title" color={colors.orange}>
            {total} DH
          </AppText>
        </View>
        <Pressable style={styles.acceptRow} onPress={() => setAccepted((current) => !current)}>
          <View style={[styles.checkbox, accepted ? styles.checkboxActive : null]}>
            {accepted ? <Check color="#FFFFFF" size={14} /> : null}
          </View>
          <AppText style={styles.flex}>أوافق على شروط الاشتراك المتجدد تلقائيا.</AppText>
        </Pressable>
      </Card>
      <Button icon={Crown} tone="secondary" disabled={!accepted || !methodId} onPress={pay}>
        ادفع {total} DH
      </Button>
    </Screen>
  );
}

export function CheckoutSuccessScreen() {
  const params = useLocalSearchParams<{ invoice?: string }>();
  const invoices = useParityStore((state) => state.invoices);
  const renewsAt = useParityStore((state) => state.premiumRenewsAt);
  const invoice = invoices.find((item) => item.id === params.invoice) ?? invoices[0];

  return (
    <Screen dark contentStyle={styles.darkSuccess}>
      <View style={styles.successIcon}>
        <Check color="#FFFFFF" size={48} />
      </View>
      <AppText variant="hero" color={colors.gold} style={styles.centerText}>
        مرحبا في Premium
      </AppText>
      <AppText variant="body" color="rgba(255,255,255,0.74)" style={styles.centerText}>
        تم تفعيل الاشتراك بنجاح.
      </AppText>
      <Card style={styles.darkCard}>
        <AppText color="#FFFFFF">رقم الفاتورة: {invoice?.number}</AppText>
        <AppText color={colors.gold}>المبلغ: {invoice?.totalDh} DH</AppText>
        {renewsAt ? (
          <AppText color="rgba(255,255,255,0.72)">
            التجديد التالي: {new Date(renewsAt).toLocaleDateString("ar-MA")}
          </AppText>
        ) : null}
      </Card>
      <Button tone="secondary" icon={Receipt} onPress={() => router.push("/billing")}>
        عرض الفواتير
      </Button>
      <Button tone="ghost" icon={Download}>
        تنزيل الفاتورة PDF
      </Button>
      <Button onPress={() => router.replace("/dashboard")}>الرئيسية</Button>
    </Screen>
  );
}

export function CheckoutFailedScreen() {
  return (
    <Screen contentStyle={styles.centerScreen}>
      <Card style={styles.centerCard}>
        <XCircle color={colors.danger} size={52} />
        <AppText variant="hero" color={colors.navy} style={styles.centerText}>
          فشل الدفع
        </AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.centerText}>
          لم نتمكن من معالجة الدفع. لم يتم خصم أي مبلغ.
        </AppText>
        <Badge label="CARD_DECLINED" tone="danger" />
        <Button icon={RefreshCw} onPress={() => router.replace("/checkout")}>
          إعادة المحاولة
        </Button>
        <Button tone="ghost" onPress={() => router.push("/help")}>
          تواصل مع الدعم
        </Button>
      </Card>
    </Screen>
  );
}

export function BillingScreen() {
  const methods = useParityStore((state) => state.paymentMethods);
  const invoices = useParityStore((state) => state.invoices);
  const setDefaultPaymentMethod = useParityStore((state) => state.setDefaultPaymentMethod);
  const removePaymentMethod = useParityStore((state) => state.removePaymentMethod);
  const premiumPlan = useParityStore((state) => state.premiumPlan);
  const cancelPremium = useParityStore((state) => state.cancelPremium);
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const setRole = useSessionStore((state) => state.setRole);

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar
        title="الفوترة والاشتراك"
        subtitle="طرق الدفع، الفواتير، والتجديد"
        backTo="/profile"
      />
      <Card style={styles.cardGap}>
        <View style={styles.rowBetween}>
          <AppText variant="subtitle">الاشتراك الحالي</AppText>
          <Crown color={colors.orange} size={22} />
        </View>
        {role === "premium" || premiumPlan ? (
          <>
            <Badge label="نشط" tone="success" />
            <AppText>Premium {premiumPlan === "yearly" ? "سنوي" : "شهري"}</AppText>
            <Button
              tone="danger"
              onPress={() => {
                cancelPremium();
                setRole("free");
              }}
            >
              إلغاء التجديد التلقائي
            </Button>
          </>
        ) : (
          <>
            <AppText variant="caption">لا يوجد اشتراك نشط.</AppText>
            <Button tone="secondary" icon={Crown} onPress={() => router.push("/premium")}>
              الترقية إلى Premium
            </Button>
          </>
        )}
      </Card>
      <Card style={styles.cardGap}>
        <View style={styles.rowBetween}>
          <AppText variant="subtitle">طرق الدفع</AppText>
          <Button tone="ghost" icon={Plus}>
            إضافة
          </Button>
        </View>
        {methods.map((method) => (
          <View key={method.id} style={styles.compactLine}>
            <CreditCard color={colors.navy} size={18} />
            <View style={styles.flex}>
              <AppText>
                {method.label}
                {method.last4 ? ` **** ${method.last4}` : ""}
              </AppText>
              {method.isDefault ? (
                <AppText variant="caption" color={colors.success}>
                  افتراضي
                </AppText>
              ) : null}
            </View>
            {!method.isDefault ? (
              <Button tone="ghost" icon={Star} onPress={() => setDefaultPaymentMethod(method.id)}>
                افتراضي
              </Button>
            ) : null}
            {method.kind !== "wallet" ? (
              <Button tone="ghost" icon={Trash2} onPress={() => removePaymentMethod(method.id)}>
                حذف
              </Button>
            ) : null}
          </View>
        ))}
      </Card>
      <Card style={styles.cardGap}>
        <AppText variant="subtitle">سجل الفواتير</AppText>
        {invoices.map((invoice) => (
          <View key={invoice.id} style={styles.compactLine}>
            <FileText color={colors.orange} size={18} />
            <View style={styles.flex}>
              <AppText>{invoice.label}</AppText>
              <AppText variant="caption">
                {invoice.number} - {new Date(invoice.createdAt).toLocaleDateString("ar-MA")}
              </AppText>
            </View>
            <AppText color={colors.orange} style={styles.bold}>
              {invoice.totalDh} DH
            </AppText>
            <Download color={colors.navy} size={18} />
          </View>
        ))}
      </Card>
      <Button icon={Wallet} tone="ghost" onPress={() => router.push("/wallet")}>
        فتح المحفظة
      </Button>
    </Screen>
  );
}

export function WalletScreen() {
  const wallet = useParityStore(selectWalletBalance);
  const transactions = useParityStore((state) => state.transactions);
  const methods = useParityStore((state) =>
    state.paymentMethods.filter((method) => method.kind !== "wallet"),
  );
  const topUpWallet = useParityStore((state) => state.topUpWallet);
  const [amount, setAmount] = useState("100");
  const [methodId, setMethodId] = useState(methods[0]?.id ?? "");
  const inflow = transactions
    .filter((tx) => tx.amountDh > 0 && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amountDh, 0);
  const outflow = -transactions
    .filter((tx) => tx.amountDh < 0 && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amountDh, 0);

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar
        title="المحفظة"
        subtitle="شحن، سحب، وسجل الحركات"
        backTo="/profile"
        right={
          <Button tone="ghost" icon={Receipt} onPress={() => router.push("/billing")}>
            فوترة
          </Button>
        }
      />
      <Card style={styles.walletHero}>
        <Wallet color="#FFFFFF" size={28} />
        <AppText variant="hero" color="#FFFFFF" style={styles.centerText}>
          {wallet.toLocaleString()} DH
        </AppText>
        <View style={styles.metricRow}>
          <MetricTile label="دخل" value={`+${inflow}`} tone="success" />
          <MetricTile label="مصروف" value={`-${outflow}`} tone="orange" />
        </View>
      </Card>
      <Card style={styles.cardGap}>
        <AppText variant="subtitle">شحن المحفظة</AppText>
        <View style={styles.chipRow}>
          {[50, 100, 200, 500].map((preset) => (
            <Button
              key={preset}
              tone={amount === String(preset) ? "secondary" : "ghost"}
              onPress={() => setAmount(String(preset))}
            >
              {preset} DH
            </Button>
          ))}
        </View>
        <Field
          value={amount}
          onChangeText={setAmount}
          placeholder="المبلغ"
          keyboardType="number-pad"
        />
        {methods.map((method) => (
          <SelectCard
            key={method.id}
            active={methodId === method.id}
            title={`${method.label}${method.last4 ? ` **** ${method.last4}` : ""}`}
            onPress={() => setMethodId(method.id)}
          />
        ))}
        <Button
          icon={Plus}
          onPress={() => topUpWallet(Number(amount) || 0, methodId)}
          disabled={!methodId || Number(amount) <= 0}
        >
          تأكيد الشحن
        </Button>
      </Card>
      <Card style={styles.cardGap}>
        <AppText variant="subtitle">آخر الحركات</AppText>
        {transactions.map((transaction) => (
          <View key={transaction.id} style={styles.compactLine}>
            {transaction.amountDh >= 0 ? (
              <TrendingUp color={colors.success} size={18} />
            ) : (
              <ShoppingBag color={colors.orange} size={18} />
            )}
            <View style={styles.flex}>
              <AppText>{transaction.label}</AppText>
              <AppText variant="caption">
                {new Date(transaction.createdAt).toLocaleDateString("ar-MA")} - {transaction.status}
              </AppText>
            </View>
            <AppText
              color={transaction.amountDh >= 0 ? colors.success : colors.text}
              style={styles.bold}
            >
              {transaction.amountDh >= 0 ? "+" : ""}
              {transaction.amountDh} DH
            </AppText>
          </View>
        ))}
      </Card>
    </Screen>
  );
}

export function CertificateScreen() {
  const params = useLocalSearchParams<{ scanId?: string }>();
  const scanId = params.scanId;
  const lastResult = useScanStore((state) => state.lastResult);
  const item =
    (scanId ? DEMO_COLLECTION.find((entry) => entry.scanId === scanId) : undefined) ??
    (scanId && lastResult?.scanId === scanId
      ? {
          scanId: lastResult.scanId,
          className: lastResult.className,
          fusionScore: lastResult.fusionScore,
          weightGram: undefined,
          region: "غير محددة",
        }
      : undefined);

  if (!scanId || !item) {
    return (
      <MvpEmptyActionScreen
        message="لم يتم العثور على الفحص"
        buttonLabel="العودة للمجموعة"
        buttonWidth={138}
        onPress={() => router.replace("/collection")}
      />
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar
        title="شهادة التحليل"
        subtitle="وثيقة مساعدة لا تعوض المختبر"
        backTo={`/collection/${scanId}`}
      />
      <Card style={styles.certificateCard}>
        <Badge label="Tissint AI Aid" tone="premium" />
        <AppText variant="hero" color={colors.navy} style={styles.centerText}>
          {item.className}
        </AppText>
        <AppText variant="title" color={colors.orange} style={styles.centerText}>
          {Math.round(item.fusionScore * 100)}%
        </AppText>
        <ProgressBar
          value={Math.round(item.fusionScore * 100)}
          color={item.fusionScore >= 0.85 ? colors.success : colors.warning}
        />
        <View style={styles.summaryLine}>
          <AppText>Scan ID</AppText>
          <AppText>{item.scanId}</AppText>
        </View>
        <View style={styles.summaryLine}>
          <AppText>الوزن</AppText>
          <AppText>{item.weightGram ?? "--"}g</AppText>
        </View>
        <View style={styles.summaryLine}>
          <AppText>المنطقة</AppText>
          <AppText>{item.region ?? "--"}</AppText>
        </View>
        <AppText variant="caption" style={styles.centerText}>
          هذه الشهادة تعرض نتيجة مساعدة بصرية ولا تمثل اعتمادا مخبريا أو وثيقة بيع رسمية.
        </AppText>
      </Card>
      <Button icon={Download}>تنزيل PDF</Button>
      <Button tone="ghost" icon={FileText}>
        مشاركة الشهادة
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  cardGap: {
    gap: spacing.md,
  },
  metricRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tabChip: {
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabChipActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  listingRow: {
    flexDirection: "row-reverse",
    gap: spacing.md,
  },
  thumbSm: {
    width: 96,
  },
  flexEnd: {
    flex: 1,
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  buttonRow: {
    gap: spacing.sm,
  },
  centerCard: {
    alignItems: "center",
    gap: spacing.md,
  },
  centerText: {
    textAlign: "center",
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  rowCenter: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  compactLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  flex: {
    flex: 1,
  },
  bold: {
    fontWeight: "900",
  },
  rowBetween: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  chart: {
    height: 140,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  chartCol: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
  },
  chartBar: {
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors.gold,
  },
  chartBarActive: {
    backgroundColor: colors.orange,
  },
  twoCol: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  summaryLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  acceptRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  centerScreen: {
    justifyContent: "center",
  },
  darkSuccess: {
    backgroundColor: colors.stone,
    justifyContent: "center",
    gap: spacing.lg,
  },
  successIcon: {
    alignSelf: "center",
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.success,
    alignItems: "center",
    justifyContent: "center",
  },
  darkCard: {
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.12)",
    gap: spacing.sm,
  },
  walletHero: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
    alignItems: "center",
    gap: spacing.md,
  },
  certificateCard: {
    gap: spacing.md,
    borderWidth: 2,
    borderColor: colors.gold,
  },
});
