import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import {
  BadgeCheck,
  Bell,
  CheckCheck,
  Crown,
  HelpCircle,
  Home,
  Info,
  Library,
  Lock,
  MessageCircle,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Store,
  ScanLine,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useSessionStore } from "@/store/session-store";
import { DEMO_CONVERSATIONS, DEMO_MESSAGES } from "@/features/parity/parity-data";

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
  dark: "#1B2025",
};

const gradient = ["#FF7A2A", "#F7C75E"] as const;

function useMvpMetrics() {
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
  subtitle,
  left,
  search,
}: {
  title: string;
  subtitle?: string;
  left?: ReactNode;
  search?: string;
}) {
  const m = useMvpMetrics();
  return (
    <View
      style={[
        styles.header,
        {
          height: m.y(search ? 160 : 132),
          borderBottomLeftRadius: m.z(26),
          borderBottomRightRadius: m.z(26),
        },
      ]}
    >
      <BackButton to="/dashboard" />
      {left}
      <Text style={[styles.headerTitle, { top: m.y(56), fontSize: m.z(22), lineHeight: m.z(31) }]}>
        {title}
      </Text>
      {subtitle ? (
        <Text
          style={[
            styles.headerSubtitle,
            { top: m.y(96), right: m.x(21), fontSize: m.z(13), lineHeight: m.z(20) },
          ]}
        >
          {subtitle}
        </Text>
      ) : null}
      {search ? (
        <View
          style={[
            styles.headerSearch,
            {
              left: m.x(20),
              right: m.x(20),
              top: m.y(100),
              height: m.y(40),
              borderRadius: m.z(20),
            },
          ]}
        >
          <Search color="rgba(255,255,255,0.56)" size={m.z(19)} />
          <TextInput
            placeholder={search}
            placeholderTextColor="rgba(255,255,255,0.43)"
            style={[styles.headerSearchInput, { fontSize: m.z(15) }]}
          />
        </View>
      ) : null}
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

function PurpleThumb({ seed = "thread", size = 48 }: { seed?: string; size?: number }) {
  const m = useMvpMetrics();
  const dots = useMemo(() => {
    const base = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return Array.from({ length: 5 }, (_, index) => ({
      left: 13 + ((base + index * 23) % 70),
      top: 13 + ((base * 2 + index * 31) % 70),
    }));
  }, [seed]);
  return (
    <LinearGradient
      colors={["#663368", "#351725", "#27131B"]}
      style={[styles.threadThumb, { width: m.z(size), height: m.z(size), borderRadius: m.z(16) }]}
    >
      {dots.map((dot, index) => (
        <View
          key={index}
          style={[
            styles.thumbDot,
            {
              left: `${dot.left}%` as `${number}%`,
              top: `${dot.top}%` as `${number}%`,
              width: m.z(3),
              height: m.z(3),
              borderRadius: m.z(2),
            },
          ]}
        />
      ))}
    </LinearGradient>
  );
}

export function MvpNotificationsScreen() {
  const m = useMvpMetrics();
  const items = [
    {
      title: "رسالة جديدة من محمد العلوي",
      body: "نعم، السعر قابل للتفاوض قليلاً.",
      age: "2 ي",
      icon: MessageCircle,
      unread: true,
    },
    {
      title: "تم قبول إعلانك",
      body: "Chondrite H5 - Tissint أصبح ظاهراً في السوق.",
      age: "3 ي",
      icon: ShieldCheck,
      unread: true,
      success: true,
    },
    { title: "اكتمل التحليل", body: "النتيجة: Chondrite H5 - 87/100.", age: "4 ي", icon: ScanLine },
    {
      title: "عرض Premium",
      body: "احصل على شهر مجاني عند الترقية اليوم.",
      age: "7 ي",
      icon: Crown,
    },
    { title: "صيانة قصيرة", body: "تم تحسين أداء المسح بنسبة 30٪.", age: "10 ي", icon: Info },
  ];
  return (
    <View style={styles.root}>
      <Header
        title="الإشعارات"
        subtitle="2 غير مقروءة"
        left={
          <Pressable
            style={[
              styles.markAll,
              {
                top: m.y(52),
                left: m.x(20),
                height: m.y(28),
                borderRadius: m.z(17),
                paddingHorizontal: m.x(13),
              },
            ]}
          >
            <CheckCheck color={UI.white} size={m.z(15)} />
            <Text style={[styles.markAllText, { fontSize: m.z(13), lineHeight: m.z(19) }]}>
              الكل
            </Text>
          </Pressable>
        }
      />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(12),
          paddingTop: m.y(14),
          paddingBottom: m.y(104),
        }}
      >
        {items.map((item, index) => (
          <NotificationRow key={item.title} {...item} index={index} />
        ))}
      </ScrollView>
      <ManualBottomNav active="home" />
    </View>
  );
}

function NotificationRow({
  title,
  body,
  age,
  icon: Icon,
  unread,
  success,
  index,
}: {
  title: string;
  body: string;
  age: string;
  icon: typeof Bell;
  unread?: boolean;
  success?: boolean;
  index: number;
}) {
  const m = useMvpMetrics();
  const toneColor = success
    ? UI.success
    : index === 3
      ? UI.gold
      : index === 4
        ? UI.muted
        : UI.orange;
  return (
    <View
      style={[
        styles.notificationRow,
        {
          height: m.y(64),
          borderRadius: m.z(18),
          borderColor: unread ? "#FFC7A7" : UI.border,
          marginBottom: m.y(9),
          paddingHorizontal: m.x(12),
        },
      ]}
    >
      <View
        style={[
          styles.notificationIcon,
          {
            width: m.z(40),
            height: m.z(40),
            borderRadius: m.z(20),
            backgroundColor: success ? "#E8F7EE" : index === 3 ? "#FFF6E3" : UI.pale,
          },
        ]}
      >
        <Icon color={toneColor} size={m.z(21)} strokeWidth={2.4} />
      </View>
      <View style={styles.notificationText}>
        <Text
          style={[styles.notificationTitle, { fontSize: m.z(15.5), lineHeight: m.z(23) }]}
          numberOfLines={1}
        >
          {title}
        </Text>
        <Text
          style={[styles.notificationBody, { fontSize: m.z(12.5), lineHeight: m.z(19) }]}
          numberOfLines={1}
        >
          {body}
        </Text>
      </View>
      <View style={styles.notificationAgeBlock}>
        {unread ? (
          <View
            style={[styles.unreadDot, { width: m.z(8), height: m.z(8), borderRadius: m.z(4) }]}
          />
        ) : null}
        <Text style={[styles.notificationAge, { fontSize: m.z(12), lineHeight: m.z(18) }]}>
          {age}
        </Text>
      </View>
    </View>
  );
}

export function MvpMessagesScreen() {
  const m = useMvpMetrics();
  const threads = [
    {
      id: "th-001",
      name: "محمد العلوي",
      listing: "Chondrite H5 - Tissint",
      body: "نعم، السعر قابل للتفاوض قليلاً.",
      age: "2 ي",
      unread: 2,
    },
    {
      id: "th-002",
      name: "ورشة الأطلس",
      listing: "Pallasite - شريحة مصقولة",
      body: "يمكنني إرسال صور إضافية اليوم.",
      age: "3 ي",
    },
    {
      id: "th-003",
      name: "د. كريم الفاسي",
      listing: "Shergottite (Martian)",
      body: "شكراً، سأراجع الشهادة وأعود إليك.",
      age: "5 ي",
    },
  ];
  return (
    <View style={styles.root}>
      <Header title="الرسائل" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(12),
          paddingTop: m.y(13),
          paddingBottom: m.y(104),
        }}
      >
        {threads.map((thread) => (
          <Pressable
            key={thread.id}
            onPress={() =>
              router.push({
                pathname: "/messages/[threadId]",
                params: { threadId: thread.id },
              } as never)
            }
          >
            <MessageRow {...thread} />
          </Pressable>
        ))}
      </ScrollView>
      <ManualBottomNav active="home" />
    </View>
  );
}

function MessageRow({
  id,
  name,
  listing,
  body,
  age,
  unread,
}: {
  id: string;
  name: string;
  listing: string;
  body: string;
  age: string;
  unread?: number;
}) {
  const m = useMvpMetrics();
  return (
    <View
      style={[
        styles.messageRow,
        {
          height: m.y(80),
          borderRadius: m.z(19),
          marginBottom: m.y(9),
          paddingHorizontal: m.x(12),
        },
      ]}
    >
      <PurpleThumb seed={id} size={48} />
      <View style={styles.messageText}>
        <View style={styles.messageTitleLine}>
          <Text style={[styles.messageName, { fontSize: m.z(16), lineHeight: m.z(23) }]}>
            {name}
          </Text>
          <BadgeCheck color={UI.success} size={m.z(15)} />
        </View>
        <Text style={[styles.messageListing, { fontSize: m.z(12.5), lineHeight: m.z(18) }]}>
          {listing}
        </Text>
        <Text
          style={[styles.messageBody, { fontSize: m.z(13.5), lineHeight: m.z(20) }]}
          numberOfLines={1}
        >
          {body}
        </Text>
      </View>
      <View style={styles.messageSide}>
        <Text style={[styles.messageAge, { fontSize: m.z(12), lineHeight: m.z(18) }]}>{age}</Text>
        {unread ? (
          <View
            style={[styles.unreadBadge, { width: m.z(20), height: m.z(20), borderRadius: m.z(10) }]}
          >
            <Text style={[styles.unreadBadgeText, { fontSize: m.z(12), lineHeight: m.z(18) }]}>
              {unread}
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function MvpMessageThreadScreen() {
  const params = useLocalSearchParams<{ threadId?: string }>();
  const threadId = params.threadId;
  const conversation = DEMO_CONVERSATIONS.find((item) => item.id === threadId);

  if (!conversation) {
    return <TopRightEmpty message="محادثة غير موجودة" action="العودة" to="/messages" />;
  }

  return (
    <CoherentThread
      threadId={conversation.id}
      title={conversation.peerName}
      subtitle={conversation.listingTitle}
    />
  );
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
      <SettingsFab />
    </View>
  );
}

function CoherentThread({
  threadId,
  title,
  subtitle,
}: {
  threadId: string;
  title: string;
  subtitle: string;
}) {
  const m = useMvpMetrics();
  const messages = DEMO_MESSAGES.filter((message) => message.threadId === threadId);
  const [draft, setDraft] = useState("");
  return (
    <View style={styles.root}>
      <Header title={title} subtitle={subtitle} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: m.x(16), paddingBottom: m.y(98) }}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.bubble,
              message.fromMe ? styles.bubbleMe : styles.bubblePeer,
              { borderRadius: m.z(18), padding: m.z(12), marginBottom: m.y(9) },
            ]}
          >
            <Text
              style={[
                message.fromMe ? styles.bubbleTextMe : styles.bubbleTextPeer,
                { fontSize: m.z(14), lineHeight: m.z(22) },
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View
        style={[
          styles.threadComposer,
          { height: m.y(72), paddingHorizontal: m.x(12), gap: m.x(8) },
        ]}
      >
        <Pressable
          style={[styles.sendButton, { width: m.z(44), height: m.z(44), borderRadius: m.z(22) }]}
        >
          <Send color={UI.white} size={m.z(19)} />
        </Pressable>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          placeholder="اكتب رسالة..."
          placeholderTextColor={UI.muted}
          style={[
            styles.composerInput,
            { height: m.y(44), borderRadius: m.z(22), fontSize: m.z(14) },
          ]}
        />
      </View>
    </View>
  );
}

export function MvpHelpScreen() {
  const m = useMvpMetrics();
  const questions = [
    [
      "كيف أقوم بفحص نيزك؟",
      "افتح تبويب الفحص، صوّر الحجر من زاوية واضحة بإضاءة طبيعية، ثم انتظر 3 ثوان لتظهر النتيجة بنسبة الثقة.",
    ],
    ["لماذا النتيجة غير مؤكدة؟"],
    ["ما هو الحد اليومي للفحص؟"],
    ["كيف أنشر إعلاناً؟"],
    ["كم تأخذ Tissint كعمولة؟"],
    ["كيف أتواصل مع البائع؟"],
    ["كيف ألغي اشتراك Premium؟"],
    ["هل يمكنني استرداد المبلغ؟"],
    ["ما طرق الدفع المقبولة؟"],
  ];
  return (
    <View style={styles.root}>
      <Header title="مركز المساعدة" search="إبحث في الأسئلة..." />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[styles.helpChips, { paddingHorizontal: m.x(20), gap: m.x(8) }]}
        style={{ maxHeight: m.y(56), marginTop: m.y(20) }}
      >
        <HelpChip label="الكل" active icon={<HelpCircle color={UI.white} size={m.z(15)} />} />
        <HelpChip label="الفحص" icon={<ScanLine color={UI.text} size={m.z(15)} />} />
        <HelpChip label="السوق" icon={<Store color={UI.text} size={m.z(15)} />} />
        <HelpChip label="الفوترة" icon={<CreditCardMini />} />
      </ScrollView>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(20),
          paddingTop: m.y(10),
          paddingBottom: m.y(42),
        }}
      >
        {questions.map(([question, answer], index) => (
          <View
            key={question}
            style={[styles.faqCard, { borderRadius: m.z(18), marginBottom: m.y(9) }]}
          >
            <View style={[styles.faqQuestion, { minHeight: m.y(45), paddingHorizontal: m.x(18) }]}>
              <Text style={[styles.faqTitle, { fontSize: m.z(16), lineHeight: m.z(24) }]}>
                {question}
              </Text>
              <Text style={[styles.faqChevron, { fontSize: m.z(24) }]}>
                {index === 0 ? "⌃" : "⌄"}
              </Text>
            </View>
            {answer ? (
              <View
                style={[styles.faqAnswer, { paddingHorizontal: m.x(18), paddingVertical: m.y(14) }]}
              >
                <Text style={[styles.faqAnswerText, { fontSize: m.z(14), lineHeight: m.z(24) }]}>
                  {answer}
                </Text>
              </View>
            ) : null}
          </View>
        ))}
      </ScrollView>
      <SettingsFab />
    </View>
  );
}

function CreditCardMini() {
  const m = useMvpMetrics();
  return (
    <View
      style={[styles.cardMiniIcon, { width: m.z(17), height: m.z(12), borderRadius: m.z(2) }]}
    />
  );
}

function HelpChip({ label, active, icon }: { label: string; active?: boolean; icon?: ReactNode }) {
  const m = useMvpMetrics();
  return (
    <Pressable
      style={[
        styles.helpChip,
        {
          height: m.y(30),
          borderRadius: m.z(16),
          paddingHorizontal: m.x(16),
          backgroundColor: active ? UI.navy : UI.white,
        },
      ]}
    >
      {icon}
      <Text
        style={[
          styles.helpChipText,
          active ? styles.helpChipActiveText : null,
          { fontSize: m.z(14), lineHeight: m.z(20) },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function MvpAdminScreen() {
  const m = useMvpMetrics();
  const role = useSessionStore((state) => state.user?.role ?? "guest");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  return (
    <View style={styles.adminRoot}>
      <View style={[styles.adminCenter, { top: m.y(278), left: m.x(32), right: m.x(32) }]}>
        <ShieldCheck color={UI.gold} size={m.z(50)} strokeWidth={2.2} />
        <Text
          style={[
            styles.adminTitle,
            { fontSize: m.z(25), lineHeight: m.z(36), marginTop: m.y(24) },
          ]}
        >
          لوحة الإدارة
        </Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="كلمة المرور"
          placeholderTextColor="rgba(255,255,255,0.38)"
          style={[
            styles.adminInput,
            {
              height: m.y(48),
              borderRadius: m.z(24),
              fontSize: m.z(16),
              marginTop: m.y(22),
              paddingHorizontal: m.x(20),
            },
          ]}
        />
        <Pressable
          onPress={() => {
            if (role === "admin") {
              router.push("/admin/radar" as never);
              return;
            }
            setError(true);
          }}
          style={[
            styles.adminButton,
            { height: m.y(48), borderRadius: m.z(24), marginTop: m.y(16) },
          ]}
        >
          <Text style={[styles.adminButtonText, { fontSize: m.z(20), lineHeight: m.z(30) }]}>
            دخول
          </Text>
        </Pressable>
        {error ? (
          <Text
            style={[
              styles.adminError,
              { fontSize: m.z(13), lineHeight: m.z(19), marginTop: m.y(12) },
            ]}
          >
            الوصول للإدارة يتطلب دور Admin صادر من الخادم.
          </Text>
        ) : null}
        <Pressable onPress={() => router.push("/profile" as never)}>
          <Text
            style={[
              styles.adminBack,
              { fontSize: m.z(13), lineHeight: m.z(19), marginTop: m.y(19) },
            ]}
          >
            العودة
          </Text>
        </Pressable>
      </View>
      <SettingsFab />
    </View>
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
  headerSubtitle: {
    position: "absolute",
    color: UI.gold,
    textAlign: "right",
    writingDirection: "rtl",
  },
  headerSearch: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
  },
  headerSearchInput: {
    flex: 1,
    color: UI.white,
    textAlign: "right",
    writingDirection: "rtl",
    paddingVertical: 0,
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
  markAll: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },
  markAllText: {
    color: UI.white,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  notificationRow: {
    backgroundColor: UI.white,
    borderWidth: 1,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  notificationIcon: {
    alignItems: "center",
    justifyContent: "center",
  },
  notificationText: {
    flex: 1,
    alignItems: "flex-end",
  },
  notificationTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  notificationBody: {
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  notificationAgeBlock: {
    width: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  notificationAge: {
    color: UI.muted,
  },
  unreadDot: {
    backgroundColor: UI.orange,
  },
  messageRow: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 12,
  },
  threadThumb: {
    overflow: "hidden",
  },
  thumbDot: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.34)",
  },
  messageText: {
    flex: 1,
    alignItems: "flex-end",
  },
  messageTitleLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 5,
  },
  messageName: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  messageListing: {
    color: UI.muted,
    textAlign: "right",
  },
  messageBody: {
    color: UI.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  messageSide: {
    width: 36,
    alignItems: "center",
    gap: 10,
  },
  messageAge: {
    color: UI.muted,
  },
  unreadBadge: {
    backgroundColor: UI.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: {
    color: UI.white,
    fontWeight: "900",
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
  bubble: {
    maxWidth: "82%",
  },
  bubbleMe: {
    alignSelf: "flex-start",
    backgroundColor: UI.navy,
  },
  bubblePeer: {
    alignSelf: "flex-end",
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
  },
  bubbleTextMe: {
    color: UI.white,
    textAlign: "right",
    writingDirection: "rtl",
  },
  bubbleTextPeer: {
    color: UI.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  threadComposer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: UI.white,
    borderTopWidth: 1,
    borderTopColor: UI.border,
    flexDirection: "row",
    alignItems: "center",
  },
  sendButton: {
    backgroundColor: UI.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  composerInput: {
    flex: 1,
    backgroundColor: UI.cream,
    color: UI.text,
    textAlign: "right",
    paddingHorizontal: 16,
  },
  helpChips: {
    flexDirection: "row-reverse",
    alignItems: "center",
  },
  helpChip: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: UI.border,
  },
  helpChipText: {
    color: UI.text,
    fontWeight: "900",
    writingDirection: "rtl",
  },
  helpChipActiveText: {
    color: UI.white,
  },
  cardMiniIcon: {
    borderWidth: 1.5,
    borderColor: UI.text,
  },
  faqCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    overflow: "hidden",
  },
  faqQuestion: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  faqTitle: {
    flex: 1,
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  faqChevron: {
    color: UI.muted,
  },
  faqAnswer: {
    borderTopWidth: 1,
    borderTopColor: UI.border,
  },
  faqAnswerText: {
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  adminRoot: {
    flex: 1,
    backgroundColor: UI.dark,
  },
  adminCenter: {
    position: "absolute",
    alignItems: "center",
  },
  adminTitle: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  adminInput: {
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: UI.white,
    textAlign: "center",
    writingDirection: "rtl",
  },
  adminButton: {
    alignSelf: "stretch",
    backgroundColor: UI.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  adminButtonText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  adminBack: {
    color: "rgba(255,255,255,0.38)",
    textAlign: "center",
    writingDirection: "rtl",
  },
  adminError: {
    color: "#F7C75E",
    textAlign: "center",
    writingDirection: "rtl",
  },
});
