import { router, useLocalSearchParams } from "expo-router";
import {
  AlertTriangle,
  Award,
  Bell,
  BookOpen,
  Calendar,
  Check,
  CheckCheck,
  Clock,
  Crown,
  Database,
  Download,
  FileText,
  Globe,
  HelpCircle,
  Languages,
  Library,
  Lock,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Phone,
  Search,
  Send,
  Settings,
  Shield,
  Smartphone,
  Star,
  Store,
  Trash2,
  TrendingUp,
  User,
  Wallet,
  WifiOff,
  RefreshCw,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { MeteoriteThumb } from "@/components/tissint/MeteoriteThumb";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { setApiAccessToken } from "@/lib/api";
import { clearSavedSession } from "@/lib/session-storage";
import { useEngagementStore } from "@/store/engagement-store";
import { useScanStore } from "@/store/scan-store";
import { useSessionStore } from "@/store/session-store";
import { colors, spacing } from "@/theme";
import { DEMO_COLLECTION, DEMO_MARKETPLACE_LISTINGS } from "./parity-data";
import { Field, HeaderBar, InfoLine, LinkLine, MetricTile, ProgressBar, SectionCard, ToggleLine } from "./parity-ui";
import {
  selectUnreadMessages,
  selectUnreadNotifications,
  selectWalletBalance,
  useParityStore,
} from "./parity-store";

export function ProfileScreen() {
  const { user, quota, clearSession, setRole } = useSessionStore();
  const wallet = useParityStore(selectWalletBalance);
  const unreadNotifications = useParityStore(selectUnreadNotifications);
  const unreadMessages = useParityStore(selectUnreadMessages);
  const name = `${user?.firstName ?? "Tissint"} ${user?.lastName ?? "User"}`;
  const role = user?.role ?? "guest";

  async function logout() {
    await clearSavedSession();
    setApiAccessToken(null);
    clearSession();
    router.replace("/onboarding");
  }

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title="الملف الشخصي" subtitle="معلومات الحساب والنشاط" backTo="/dashboard" />
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <User color="#FFFFFF" size={32} />
        </View>
        <AppText variant="title" color={colors.navy} style={styles.centerText}>{name}</AppText>
        <Badge label={role === "premium" ? "Premium" : role === "admin" ? "Admin" : "حساب مجاني"} tone={role === "premium" ? "premium" : "neutral"} />
        <AppText variant="caption" style={styles.centerText}>@tissint_user_2026</AppText>
      </Card>
      <View style={styles.metricRow}>
        <MetricTile label="مجموعة" value={DEMO_COLLECTION.length} icon={Library} />
        <MetricTile label="في السوق" value={DEMO_MARKETPLACE_LISTINGS.length} icon={Store} tone="orange" />
        <MetricTile label="اليوم" value={`${quota.remainingToday}/${quota.dailyLimit}`} icon={TrendingUp} tone="success" />
      </View>
      <SectionCard title="المعلومات الشخصية" icon={User}>
        <InfoLine icon={Mail} label="البريد" value={user?.email ?? "user@tissint.ma"} />
        <InfoLine icon={Phone} label="الهاتف" value={user?.phone ?? "+212 6 00 00 00 00"} />
        <InfoLine icon={MapPin} label="المنطقة" value="ورزازات، المغرب" />
        <InfoLine icon={Calendar} label="عضو منذ" value="يناير 2026" />
      </SectionCard>
      <SectionCard title="الحساب والاشتراك" icon={Shield}>
        <LinkLine icon={Wallet} label="المحفظة" route="/wallet" badge={`${wallet} DH`} />
        <LinkLine icon={FileText} label="الفوترة والفواتير" route="/billing" />
        <Button tone="secondary" icon={Crown} onPress={() => setRole(role === "premium" ? "free" : "premium")}>
          {role === "premium" ? "اختبار حساب مجاني" : "الترقية إلى Premium"}
        </Button>
      </SectionCard>
      <SectionCard title="نشاطي" icon={Star}>
        <LinkLine icon={Library} label="مجموعتي" route="/collection" badge={DEMO_COLLECTION.length} />
        <LinkLine icon={Star} label="المفضلات" route="/favorites" />
        <LinkLine icon={Store} label="إعلاناتي في السوق" route="/marketplace/my-listings" />
        <LinkLine icon={MessageCircle} label="الرسائل" route="/messages" badge={unreadMessages || undefined} />
        <LinkLine icon={Bell} label="الإشعارات" route="/notifications" badge={unreadNotifications || undefined} />
        <LinkLine icon={TrendingUp} label="إحصائياتي" route="/stats" />
      </SectionCard>
      <SectionCard title="التفضيلات والمساعدة" icon={Settings}>
        <LinkLine icon={Settings} label="الإعدادات المتقدمة" route="/settings" />
        <LinkLine icon={WifiOff} label="الوضع غير المتصل" route="/offline" />
        <LinkLine icon={HelpCircle} label="مركز المساعدة" route="/help" />
        <LinkLine icon={FileText} label="الشروط والخصوصية" route="/legal/terms" />
      </SectionCard>
      {role === "admin" ? <Button icon={Shield} tone="dark" onPress={() => router.push("/admin")}>لوحة الإدارة</Button> : null}
      <Button tone="danger" icon={LogOut} onPress={logout}>تسجيل الخروج</Button>
      <AppText variant="caption" style={styles.centerText}>Tissint v1.0.0 - جاهز للربط الإنتاجي</AppText>
    </Screen>
  );
}

export function SettingsScreen() {
  const [section, setSection] = useState<"security" | "appearance" | "notifications" | "privacy" | "devices">("security");
  const store = useParityStore();
  const [oldPwd, setOldPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title="الإعدادات" subtitle="الأمان، الخصوصية، اللغة، والأجهزة" backTo="/profile" />
      <View style={styles.chipRow}>
        {[
          ["security", "الأمان", Shield],
          ["appearance", "المظهر", Moon],
          ["notifications", "الإشعارات", Bell],
          ["privacy", "الخصوصية", Lock],
          ["devices", "الأجهزة", Smartphone],
        ].map(([id, label, Icon]) => (
          <Pressable key={id as string} onPress={() => setSection(id as typeof section)} style={[styles.tabChip, section === id ? styles.tabChipActive : null]}>
            <Icon color={section === id ? "#FFFFFF" : colors.navy} size={15} />
            <AppText variant="caption" color={section === id ? "#FFFFFF" : colors.text} style={styles.bold}>{label as string}</AppText>
          </Pressable>
        ))}
      </View>

      {section === "security" ? (
        <>
          <SectionCard title="المصادقة الثنائية" icon={Shield}>
            <ToggleLine label="تفعيل 2FA عبر SMS" value={store.smsEnabled} onPress={store.toggleSms} />
            <ToggleLine label="بصمة الإصبع / Face ID" value={store.biometricEnabled} onPress={store.toggleBiometric} />
          </SectionCard>
          <SectionCard title="تغيير كلمة المرور" icon={Lock}>
            <Field value={oldPwd} onChangeText={setOldPwd} placeholder="كلمة المرور الحالية" secureTextEntry />
            <Field value={newPwd} onChangeText={setNewPwd} placeholder="كلمة المرور الجديدة" secureTextEntry />
            <Button disabled={newPwd.length < 8}>تحديث</Button>
          </SectionCard>
        </>
      ) : null}

      {section === "appearance" ? (
        <SectionCard title="المظهر واللغة" icon={Languages}>
          {(["light", "dark", "auto"] as const).map((theme) => (
            <SelectSmall key={theme} label={theme === "light" ? "فاتح" : theme === "dark" ? "داكن" : "تلقائي"} active={store.themeMode === theme} onPress={() => store.setThemeMode(theme)} />
          ))}
          {(["ar", "fr", "en"] as const).map((locale) => (
            <SelectSmall key={locale} label={locale === "ar" ? "العربية" : locale === "fr" ? "Français" : "English"} active={store.locale === locale} onPress={() => store.setLocale(locale)} />
          ))}
        </SectionCard>
      ) : null}

      {section === "notifications" ? (
        <SectionCard title="قنوات الإشعارات" icon={Bell}>
          <ToggleLine label="Push" value={store.pushEnabled} onPress={store.togglePush} />
          <ToggleLine label="Email" value={store.emailEnabled} onPress={store.toggleEmail} />
          <ToggleLine label="SMS" value={store.smsEnabled} onPress={store.toggleSms} />
        </SectionCard>
      ) : null}

      {section === "privacy" ? (
        <>
          <SectionCard title="الخصوصية والبيانات" icon={Lock}>
            <ToggleLine label="مشاركة إحداثيات دقيقة مع الإدارة فقط" value={store.locationSharingEnabled} onPress={store.toggleLocationSharing} />
            <ToggleLine label="تحليلات لتحسين النماذج" value={store.analyticsEnabled} onPress={store.toggleAnalytics} />
            <Button tone="ghost" icon={Download}>تصدير بياناتي</Button>
          </SectionCard>
          <Card style={styles.cardGap}>
            <AppText variant="subtitle" color={colors.danger}>حذف الحساب</AppText>
            <AppText variant="caption">تتم معالجة طلب الحذف خلال 30 يوما.</AppText>
            <Button tone={confirmDelete ? "danger" : "ghost"} icon={Trash2} onPress={() => setConfirmDelete((current) => !current)}>
              {confirmDelete ? "تأكيد الحذف" : "طلب حذف الحساب"}
            </Button>
          </Card>
        </>
      ) : null}

      {section === "devices" ? (
        <SectionCard title="الأجهزة النشطة" icon={Smartphone}>
          {["Android 15 - هذا الجهاز", "Chrome Windows - منذ 3 ساعات", "Samsung Galaxy - منذ 5 أيام"].map((device) => (
            <View key={device} style={styles.compactLine}>
              <Smartphone color={colors.navy} size={18} />
              <AppText style={styles.flex}>{device}</AppText>
              <Button tone="ghost">إلغاء</Button>
            </View>
          ))}
        </SectionCard>
      ) : null}
    </Screen>
  );
}

function SelectSmall({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.selectSmall, active ? styles.selectSmallActive : null]}>
      <AppText color={active ? colors.orange : colors.text} style={styles.bold}>{label}</AppText>
      {active ? <Check color={colors.orange} size={16} /> : null}
    </Pressable>
  );
}

export function NotificationsScreen() {
  const notifications = useParityStore((state) => state.notifications);
  const markAll = useParityStore((state) => state.markAllNotificationsRead);
  const markRead = useParityStore((state) => state.markNotificationRead);
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar
        title="الإشعارات"
        subtitle={unread ? `${unread} غير مقروءة` : "كل الإشعارات مقروءة"}
        backTo="/dashboard"
        right={<Button tone="ghost" icon={CheckCheck} onPress={markAll}>الكل</Button>}
      />
      {notifications.map((notification) => (
        <Pressable
          key={notification.id}
          onPress={() => {
            markRead(notification.id);
            if (notification.route) router.push(notification.route as never);
          }}
        >
          <Card style={[styles.notificationCard, !notification.read ? styles.notificationUnread : null]}>
            <Bell color={notification.read ? colors.textMuted : colors.orange} size={22} />
            <View style={styles.flex}>
              <View style={styles.rowBetween}>
                <AppText variant="subtitle">{notification.title}</AppText>
                <AppText variant="caption">{new Date(notification.createdAt).toLocaleDateString("ar-MA")}</AppText>
              </View>
              <AppText variant="body" color={colors.textMuted}>{notification.body}</AppText>
            </View>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

export function SearchScreen() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<"all" | "market" | "collection" | "messages">("all");
  const conversations = useParityStore((state) => state.conversations);
  const market = DEMO_MARKETPLACE_LISTINGS.filter((item) => matches(query, item.title, item.dominantClass, item.region ?? ""));
  const collection = DEMO_COLLECTION.filter((item) => matches(query, item.name, item.className, item.region));
  const messages = conversations.filter((item) => matches(query, item.peerName, item.listingTitle, item.lastMessage));
  const total = market.length + collection.length + messages.length;
  const show = (target: typeof scope) => scope === "all" || scope === target;

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title="البحث" subtitle="ابحث في السوق، المجموعة، والرسائل" backTo="/dashboard" />
      <Field value={query} onChangeText={setQuery} placeholder="ابحث في كل التطبيق..." />
      <View style={styles.chipRow}>
        {[
          ["all", "الكل", total],
          ["market", "السوق", market.length],
          ["collection", "المجموعة", collection.length],
          ["messages", "الرسائل", messages.length],
        ].map(([id, label, count]) => (
          <Pressable key={id as string} onPress={() => setScope(id as typeof scope)} style={[styles.tabChip, scope === id ? styles.tabChipActive : null]}>
            <AppText variant="caption" color={scope === id ? "#FFFFFF" : colors.text} style={styles.bold}>{label as string} ({count as number})</AppText>
          </Pressable>
        ))}
      </View>
      {!query ? (
        <SectionCard title="رائج الآن" icon={Search}>
          <View style={styles.chipRow}>
            {["Chondrite", "Tissint", "Pallasite", "Shergottite", "تاتا"].map((term) => (
              <Button key={term} tone="ghost" onPress={() => setQuery(term)}>{term}</Button>
            ))}
          </View>
          <Button icon={Store} onPress={() => router.push("/marketplace")}>تصفح السوق</Button>
        </SectionCard>
      ) : null}
      {query && total === 0 ? <Card><AppText style={styles.centerText}>لا توجد نتائج.</AppText></Card> : null}
      {query && show("market") && market.length ? <SearchSection title="السوق" items={market.map((item) => ({ id: item.listingId, title: item.title, body: item.dominantClass, route: `/marketplace/${item.listingId}` }))} /> : null}
      {query && show("collection") && collection.length ? <SearchSection title="مجموعتي" items={collection.map((item) => ({ id: item.id, title: item.name, body: item.className, route: `/collection/${item.scanId}` }))} /> : null}
      {query && show("messages") && messages.length ? <SearchSection title="الرسائل" items={messages.map((item) => ({ id: item.id, title: item.peerName, body: item.lastMessage, route: `/messages/${item.id}` }))} /> : null}
    </Screen>
  );
}

function matches(q: string, ...values: string[]) {
  if (!q.trim()) return true;
  const needle = q.trim().toLowerCase();
  return values.some((value) => value.toLowerCase().includes(needle));
}

function SearchSection({ title, items }: { title: string; items: { id: string; title: string; body: string; route: string }[] }) {
  return (
    <SectionCard title={title}>
      {items.map((item) => (
        <Pressable key={item.id} onPress={() => router.push(item.route as never)} style={styles.compactLine}>
          <View style={styles.thumbTiny}>
            <MeteoriteThumb rare={item.title.includes("Shergottite")} />
          </View>
          <View style={styles.flex}>
            <AppText>{item.title}</AppText>
            <AppText variant="caption">{item.body}</AppText>
          </View>
        </Pressable>
      ))}
    </SectionCard>
  );
}

export function StatsScreen() {
  const quota = useSessionStore((state) => state.quota);
  const wallet = useParityStore(selectWalletBalance);
  const likely = DEMO_COLLECTION.filter((item) => item.fusionScore >= 0.85).length;
  const avg = Math.round((DEMO_COLLECTION.reduce((sum, item) => sum + item.fusionScore, 0) / DEMO_COLLECTION.length) * 100);
  const byClass = DEMO_COLLECTION.reduce<Record<string, number>>((acc, item) => {
    acc[item.className] = (acc[item.className] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title="إحصائياتي" subtitle="نظرة شاملة على نشاطك" backTo="/profile" />
      <View style={styles.metricGrid}>
        <MetricTile label="العينات" value={DEMO_COLLECTION.length} icon={Library} />
        <MetricTile label="قوية" value={likely} icon={Award} tone="success" />
        <MetricTile label="متوسط score" value={`${avg}%`} icon={TrendingUp} tone="orange" />
        <MetricTile label="رصيد" value={`${wallet} DH`} icon={Wallet} tone="gold" />
      </View>
      <SectionCard title="آخر 7 أيام" icon={Calendar}>
        <View style={styles.chart}>
          {[2, 1, 3, 0, 4, 2, quota.dailyLimit - quota.remainingToday].map((value, index) => (
            <View key={index} style={styles.chartCol}>
              <View style={[styles.chartBar, { height: `${Math.max(8, value * 18)}%` }]} />
              <AppText variant="caption" style={styles.centerText}>{index + 1}</AppText>
            </View>
          ))}
        </View>
      </SectionCard>
      <SectionCard title="التصنيفات" icon={Database}>
        {Object.entries(byClass).map(([classification, value]) => (
          <View key={classification} style={styles.cardGap}>
            <View style={styles.rowBetween}><AppText>{classification}</AppText><AppText>{value}</AppText></View>
            <ProgressBar value={(value / DEMO_COLLECTION.length) * 100} color={colors.navy} />
          </View>
        ))}
      </SectionCard>
    </Screen>
  );
}

export function HelpScreen() {
  const [open, setOpen] = useState("scan");
  const faqs = [
    ["scan", "كيف أحصل على أفضل فحص؟", "استعمل إضاءة طبيعية، صور 3 زوايا، ولا تستعمل صور المعرض."],
    ["market", "لماذا التواصل مقفل؟", "أرقام الهاتف وWhatsApp متاحة فقط للحسابات Premium أو الإدارة."],
    ["rare", "ما معنى معالجة 24 ساعة؟", "العينات النادرة تخضع لرادار إداري قبل فتح التواصل."],
    ["payment", "هل الدفع حقيقي الآن؟", "في MVP الدفع محاكى، لكن الشاشات جاهزة للربط مع CMI/Stripe/PayPal."],
  ];
  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title="مركز المساعدة" subtitle="دعم الفحص والسوق والحساب" backTo="/profile" />
      <View style={styles.metricRow}>
        <Button icon={MessageCircle}>تواصل معنا</Button>
        <Button tone="ghost" icon={BookOpen}>دليل الاستخدام</Button>
      </View>
      {faqs.map(([id, title, body]) => (
        <Card key={id} style={styles.cardGap}>
          <Pressable onPress={() => setOpen(open === id ? "" : id)} style={styles.rowBetween}>
            <AppText variant="subtitle">{title}</AppText>
            <HelpCircle color={colors.orange} size={18} />
          </Pressable>
          {open === id ? <AppText variant="body" color={colors.textMuted}>{body}</AppText> : null}
        </Card>
      ))}
    </Screen>
  );
}

export function OfflineScreen() {
  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title="الوضع غير المتصل" subtitle="جاهزية ميدانية للمناطق بدون شبكة" backTo="/profile" />
      <Card style={styles.centerCard}>
        <WifiOff color={colors.orange} size={46} />
        <AppText variant="title" color={colors.navy} style={styles.centerText}>قائمة انتظار الرفع</AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.centerText}>
          في الإنتاج، سيتم حفظ الصور والطلبات محليا بشكل مشفر ثم رفعها عند عودة الشبكة.
        </AppText>
      </Card>
      <SectionCard title="الحالة الحالية" icon={Database}>
        <InfoLine label="صور معلقة" value="0" />
        <InfoLine label="فحوص معلقة" value="0" />
        <InfoLine label="آخر مزامنة" value="اليوم 09:30" />
      </SectionCard>
      <Button icon={RefreshCw}>مزامنة الآن</Button>
    </Screen>
  );
}

export function LegalScreen({ kind }: { kind: "about" | "terms" | "privacy" | "cookies" }) {
  const content = {
    about: ["عن Tissint", "Tissint تطبيق مغربي لمساعدة الباحثين والمشترين على تنظيم فحص النيازك والسوق."],
    terms: ["شروط الاستخدام", "التحليل مساعدة بصرية وليس خبرة مخبرية. يمنع نشر أرقام الهاتف داخل الوصف أو الصور."],
    privacy: ["سياسة الخصوصية", "نحمي الهاتف، WhatsApp، والإحداثيات الدقيقة. المنطقة العامة فقط تظهر للعموم."],
    cookies: ["ملفات تعريف الارتباط", "تطبيق الهاتف يستعمل تخزينا آمنا للجلسة ومعرف الجهاز، وليس cookies الويب التقليدية."],
  }[kind];

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title={content[0]} subtitle="نسخة تطبيق الهاتف" backTo="/profile" />
      <Card style={styles.cardGap}>
        <FileText color={colors.orange} size={34} />
        <AppText variant="body" color={colors.textMuted}>{content[1]}</AppText>
        <AppText variant="caption">آخر تحديث: 29 مايو 2026</AppText>
      </Card>
    </Screen>
  );
}

export function CompareScreen() {
  const [left, setLeft] = useState(DEMO_COLLECTION[0].scanId);
  const [right, setRight] = useState(DEMO_COLLECTION[1].scanId);
  const a = DEMO_COLLECTION.find((item) => item.scanId === left) ?? DEMO_COLLECTION[0];
  const b = DEMO_COLLECTION.find((item) => item.scanId === right) ?? DEMO_COLLECTION[1];

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title="مقارنة العينات" subtitle="قارن التصنيف والscore والوزن" backTo="/collection" />
      <View style={styles.twoCol}>
        {[a, b].map((item, index) => (
          <Card key={index} style={styles.compareCard}>
            <MeteoriteThumb rare={item.isRare} />
            <AppText variant="subtitle" style={styles.centerText}>{item.name}</AppText>
            <AppText color={colors.orange} style={styles.centerText}>{Math.round(item.fusionScore * 100)}%</AppText>
            <AppText variant="caption" style={styles.centerText}>{item.className}</AppText>
            <AppText variant="caption" style={styles.centerText}>{item.weightGram}g</AppText>
          </Card>
        ))}
      </View>
      <SectionCard title="اختيار العينات" icon={Library}>
        {DEMO_COLLECTION.map((item) => (
          <View key={item.scanId} style={styles.compactLine}>
            <AppText style={styles.flex}>{item.name}</AppText>
            <Button tone={left === item.scanId ? "secondary" : "ghost"} onPress={() => setLeft(item.scanId)}>A</Button>
            <Button tone={right === item.scanId ? "secondary" : "ghost"} onPress={() => setRight(item.scanId)}>B</Button>
          </View>
        ))}
      </SectionCard>
    </Screen>
  );
}

export function MessagesScreen() {
  const conversations = useParityStore((state) => state.conversations);
  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title="الرسائل" subtitle="Messagerie prévue, non prioritaire MVP" backTo="/profile" />
      {conversations.map((conversation) => (
        <Pressable
          key={conversation.id}
          onPress={() => router.push({ pathname: "/messages/[threadId]", params: { threadId: conversation.id } })}
        >
          <Card style={styles.notificationCard}>
            <MessageCircle color={colors.orange} size={22} />
            <View style={styles.flex}>
              <View style={styles.rowBetween}>
                <AppText variant="subtitle">{conversation.peerName}</AppText>
                {conversation.unread ? <Badge label={String(conversation.unread)} tone="warning" /> : null}
              </View>
              <AppText variant="caption">{conversation.listingTitle}</AppText>
              <AppText variant="body" color={colors.textMuted}>{conversation.lastMessage}</AppText>
            </View>
          </Card>
        </Pressable>
      ))}
    </Screen>
  );
}

export function ThreadScreen() {
  const params = useLocalSearchParams<{ threadId?: string }>();
  const threadId = params.threadId ?? "th-001";
  const conversations = useParityStore((state) => state.conversations);
  const messages = useParityStore((state) => state.messages.filter((message) => message.threadId === threadId));
  const sendMessage = useParityStore((state) => state.sendMessage);
  const [draft, setDraft] = useState("");
  const conversation = conversations.find((item) => item.id === threadId);
  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title={conversation?.peerName ?? "رسالة"} subtitle={conversation?.listingTitle} backTo="/messages" />
      <View style={styles.messageList}>
        {messages.map((message) => (
          <View key={message.id} style={[styles.bubble, message.fromMe ? styles.bubbleMine : styles.bubblePeer]}>
            <AppText color={message.fromMe ? "#FFFFFF" : colors.text}>{message.text}</AppText>
          </View>
        ))}
      </View>
      <Card style={styles.composer}>
        <View style={styles.flex}><Field value={draft} onChangeText={setDraft} placeholder="اكتب رسالة..." /></View>
        <Button icon={Send} onPress={() => { sendMessage(threadId, draft); setDraft(""); }} disabled={!draft.trim()}>إرسال</Button>
      </Card>
    </Screen>
  );
}

export function AdminDashboardScreen() {
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const setRole = useSessionStore((state) => state.setRole);
  const rare = DEMO_MARKETPLACE_LISTINGS.filter((item) => item.isRare);
  const lastResult = useScanStore((state) => state.lastResult);

  if (role !== "admin") {
    return (
      <Screen contentStyle={styles.centerScreen}>
        <Card style={styles.centerCard}>
          <Shield color={colors.warning} size={42} />
          <AppText variant="title" style={styles.centerText}>Accès admin requis</AppText>
          <Button tone="dark" onPress={() => setRole("admin")}>Activer mode admin test</Button>
          <Button tone="ghost" onPress={() => router.back()}>Retour</Button>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar title="لوحة الإدارة" subtitle="Radar rare, décisions, audit" backTo="/profile" />
      <View style={styles.metricRow}>
        <MetricTile label="Rares" value={rare.length} icon={AlertTriangle} tone="gold" />
        <MetricTile label="Hold 24h" value={rare.filter((item) => item.status === "institutional_hold_24h").length} icon={Clock} tone="orange" />
        <MetricTile label="Dernier scan" value={lastResult ? Math.round(lastResult.fusionScore * 100) : "--"} icon={Shield} />
      </View>
      {rare.map((listing) => (
        <Card key={listing.listingId} style={styles.cardGap}>
          <Badge label={listing.status === "institutional_hold_24h" ? "institutional_hold_24h" : "rare"} tone="premium" />
          <AppText variant="title">{listing.title}</AppText>
          <AppText variant="caption">{listing.region} - {Math.round(listing.confidence * 100)}%</AppText>
          <View style={styles.buttonRow}>
            <Button tone="dark">Réserver</Button>
            <Button tone="secondary">Contacter</Button>
            <Button tone="danger">Rejeter</Button>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  profileCard: {
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 28,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  centerText: {
    textAlign: "center",
  },
  metricRow: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  metricGrid: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chipRow: {
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  tabChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.xs,
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
  bold: {
    fontWeight: "900",
  },
  cardGap: {
    gap: spacing.md,
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
  selectSmall: {
    minHeight: 44,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.warm,
  },
  selectSmallActive: {
    borderWidth: 1,
    borderColor: colors.orange,
    backgroundColor: "#FFF2E5",
  },
  notificationCard: {
    flexDirection: "row-reverse",
    alignItems: "flex-start",
    gap: spacing.md,
  },
  notificationUnread: {
    borderColor: colors.orange,
    backgroundColor: "#FFF8EE",
  },
  rowBetween: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
  },
  thumbTiny: {
    width: 48,
    height: 48,
    borderRadius: 10,
  },
  chart: {
    height: 120,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  chartCol: {
    flex: 1,
    height: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: spacing.xs,
  },
  chartBar: {
    width: "80%",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    backgroundColor: colors.orange,
  },
  centerCard: {
    alignItems: "center",
    gap: spacing.md,
  },
  centerScreen: {
    justifyContent: "center",
  },
  twoCol: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  compareCard: {
    flex: 1,
    gap: spacing.sm,
    alignItems: "center",
  },
  messageList: {
    gap: spacing.sm,
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 18,
    padding: spacing.md,
  },
  bubbleMine: {
    alignSelf: "flex-start",
    backgroundColor: colors.navy,
  },
  bubblePeer: {
    alignSelf: "flex-end",
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  composer: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  buttonRow: {
    gap: spacing.sm,
  },
});
