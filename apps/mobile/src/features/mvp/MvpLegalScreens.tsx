import { router } from "expo-router";
import {
  Database,
  FileText,
  Globe,
  Mail,
  MapPin,
  RefreshCw,
  Settings2,
  Trash2,
  WifiOff,
} from "lucide-react-native";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";

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
};

type LegalKind = "about" | "terms" | "privacy" | "cookies";

const LEGAL_CONTENT: Record<
  LegalKind,
  {
    title: string;
    sections: Array<{ title: string; body: string | string[] }>;
    footer?: string;
  }
> = {
  about: {
    title: "عن Tissint",
    sections: [
      {
        title: "مهمتنا",
        body: "Tissint هو أول تطبيق مغربي للتعرف على النيازك بالذكاء الاصطناعي وربط جامعي الأحجار النادرة بسوق موثوق. نحوّل خبرة سنوات من البحث الميداني في الصحراء إلى تجربة بسيطة في جيبك.",
      },
      {
        title: "القصة",
        body: "وُلد Tissint من سقوط نيزك تيسينت الشهير سنة 2011 جنوب المغرب. منذ ذلك الحين، شغفنا هو حماية هذا التراث الكوني وجعله متاحاً للعالم.",
      },
      {
        title: "الفريق",
        body: "مهندسون، باحثون في علم النيازك، ومصممون من المغرب وفرنسا. أكثر من 20 ألف عينة دُرّب عليها النموذج.",
      },
      {
        title: "تواصل معنا",
        body: ["hello@tissint.ma", "الرباط، المغرب", "tissint.ma"],
      },
    ],
  },
  terms: {
    title: "شروط الاستخدام",
    sections: [
      {
        title: "1. القبول",
        body: "باستخدامك لتطبيق Tissint فإنك توافق على هذه الشروط. إذا كنت لا توافق، يرجى التوقف عن استخدام التطبيق.",
      },
      {
        title: "2. الحساب",
        body: "يجب أن يكون عمرك 18 سنة فأكثر. أنت مسؤول عن سرية كلمة المرور وعن جميع الأنشطة التي تتم عبر حسابك.",
      },
      {
        title: "3. الفحص بالذكاء الاصطناعي",
        body: "نتائج التحليل تقديرية وقد لا تكون دقيقة 100٪. تبقى مسؤوليتك التحقق العلمي قبل أي معاملة تجارية مهمة.",
      },
      {
        title: "4. السوق",
        body: "البائع مسؤول عن صحة المعلومات والصور. Tissint تأخذ عمولة 5٪ على كل صفقة وتحتفظ بحق رفض أي إعلان.",
      },
      {
        title: "5. المدفوعات",
        body: "المدفوعات تُعالج عبر Visa / CMI / المحفظة. الاشتراك Premium يتجدد تلقائياً ما لم يتم إلغاؤه.",
      },
    ],
  },
  privacy: {
    title: "سياسة الخصوصية",
    sections: [
      {
        title: "البيانات التي نجمعها",
        body: "الاسم، البريد، رقم الهاتف، الصور التي ترفعها، بيانات الموقع الجغرافي (إذا فعلتها)، وتاريخ الاستخدام.",
      },
      {
        title: "كيف نستخدمها",
        body: "لتشغيل خدمات الفحص، إدارة السوق، الإشعارات، الفوترة، وتحسين دقة نموذج الذكاء الاصطناعي.",
      },
      {
        title: "المشاركة مع الغير",
        body: "لا نبيع بياناتك. نتعاون فقط مع: مزودي الدفع (CMI)، خدمات الاستضافة، وعند طلب قضائي قانوني.",
      },
      {
        title: "حقوقك (CNDP)",
        body: "لك الحق في الوصول، التصحيح، الحذف، النقل، والاعتراض. تواصل: privacy@tissint.ma.",
      },
      {
        title: "مدة الحفظ",
        body: "بيانات الحساب: طول مدة الاشتراك + 3 سنوات. الفواتير: 10 سنوات (إلزامي قانونياً).",
      },
      {
        title: "الأمان",
        body: "تشفير TLS 1.3 أثناء النقل، AES-256 عند التخزين، ومراجعات أمنية دورية.",
      },
    ],
  },
  cookies: {
    title: "سياسة ملفات تعريف الارتباط",
    sections: [
      {
        title: "ما هي ملفات تعريف الارتباط؟",
        body: "ملفات صغيرة تُخزَّن على جهازك لحفظ تفضيلاتك وتحسين تجربة الاستخدام.",
      },
      {
        title: "الأنواع التي نستعملها",
        body: [
          "ضرورية: الجلسة، المصادقة، الأمان (لا يمكن تعطيلها).",
          "وظيفية: اللغة، السمة الداكنة، حالة المحفظة.",
          "تحليلية: إحصائيات مجهولة لتحسين الخدمة.",
          "تسويقية: اقتراحات Premium مخصصة (اختياري).",
        ],
      },
      {
        title: "إدارة ملفاتك",
        body: "يمكنك في أي وقت تغيير تفضيلاتك من الإعدادات أو حذف الملفات من إعدادات المتصفح.",
      },
    ],
    footer: "© 2026 Tissint · جميع الحقوق محفوظة",
  },
};

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

function LegalHeader({ title }: { title: string }) {
  const m = useMvpMetrics();
  return (
    <View
      style={[
        styles.legalHeader,
        { height: m.y(133), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
      ]}
    >
      <BackButton to="/profile" />
      <View
        style={[
          styles.headerIcon,
          { top: m.y(50), left: m.x(20), width: m.z(36), height: m.z(36), borderRadius: m.z(18) },
        ]}
      >
        <FileText color={UI.white} size={m.z(19)} />
      </View>
      <Text
        style={[styles.legalHeaderTitle, { top: m.y(56), fontSize: m.z(21), lineHeight: m.z(31) }]}
      >
        {title}
      </Text>
      <Text style={[styles.updatedAt, { top: m.y(97), fontSize: m.z(13), lineHeight: m.z(19) }]}>
        آخر تحديث: 1 يناير 2026
      </Text>
    </View>
  );
}

export function MvpOfflineScreen() {
  const m = useMvpMetrics();
  return (
    <View style={styles.root}>
      <View
        style={[
          styles.offlineHeader,
          { height: m.y(108), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
        ]}
      >
        <BackButton to="/profile" />
        <Text
          style={[
            styles.offlineTitle,
            { top: m.y(52), right: m.x(73), fontSize: m.z(25), lineHeight: m.z(35) },
          ]}
        >
          الوضع غير المتصل
        </Text>
        <Text
          style={[
            styles.offlineSubtitle,
            { top: m.y(79), right: m.x(73), fontSize: m.z(13), lineHeight: m.z(20) },
          ]}
        >
          إدارة الذاكرة المؤقتة
        </Text>
      </View>

      <View
        style={[
          styles.onlineCard,
          {
            top: m.y(128),
            left: m.x(20),
            right: m.x(20),
            height: m.y(68),
            borderRadius: m.z(22),
            paddingHorizontal: m.x(24),
          },
        ]}
      >
        <WifiOff color={UI.success} size={m.z(29)} strokeWidth={2.4} />
        <View style={styles.onlineText}>
          <Text style={[styles.onlineTitle, { fontSize: m.z(17), lineHeight: m.z(25) }]}>
            متصل بالإنترنت
          </Text>
          <Text style={[styles.onlineSubtitle, { fontSize: m.z(13), lineHeight: m.z(20) }]}>
            البيانات تُزامَن تلقائياً
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.cacheCard,
          {
            top: m.y(213),
            left: m.x(20),
            right: m.x(20),
            height: m.y(193),
            borderRadius: m.z(22),
            padding: m.z(18),
          },
        ]}
      >
        <View style={styles.cacheTitleRow}>
          <Database color={UI.navy} size={m.z(20)} />
          <Text style={[styles.cacheTitle, { fontSize: m.z(18), lineHeight: m.z(27) }]}>
            محتوى الذاكرة
          </Text>
        </View>
        <CacheLine label="آخر تحديث" value="08:35:17 2026/5/30" />
        <CacheLine label="آخر عمليات المسح" value="0" />
        <CacheLine label="مجموعتي" value="3" />
        <CacheLine label="إعلانات السوق" value="6" />
        <CacheLine label="الحجم" value="KB 3" />
      </View>

      <View
        style={[
          styles.offlineActions,
          { top: m.y(423), left: m.x(20), right: m.x(20), gap: m.x(12) },
        ]}
      >
        <Pressable style={[styles.actionButton, { height: m.y(47), borderRadius: m.z(18) }]}>
          <RefreshCw color={UI.text} size={m.z(20)} />
          <Text style={[styles.actionText, { fontSize: m.z(16), lineHeight: m.z(24) }]}>تحديث</Text>
        </Pressable>
        <Pressable style={[styles.clearButton, { height: m.y(47), borderRadius: m.z(18) }]}>
          <Trash2 color={UI.danger} size={m.z(20)} />
          <Text style={[styles.clearText, { fontSize: m.z(16), lineHeight: m.z(24) }]}>مسح</Text>
        </Pressable>
      </View>

      <Text
        style={[
          styles.offlineNote,
          { top: m.y(491), left: m.x(24), right: m.x(24), fontSize: m.z(14), lineHeight: m.z(24) },
        ]}
      >
        يتم حفظ آخر 10 عمليات مسح + مجموعتك + 50 إعلان من السوق محلياً لتصفحها بدون اتصال.
      </Text>
      <SettingsFab />
    </View>
  );
}

function CacheLine({ label, value }: { label: string; value: string }) {
  const m = useMvpMetrics();
  return (
    <View style={[styles.cacheLine, { height: m.y(28) }]}>
      <Text style={[styles.cacheLabel, { fontSize: m.z(13.5), lineHeight: m.z(20) }]}>{label}</Text>
      <Text style={[styles.cacheValue, { fontSize: m.z(12.5), lineHeight: m.z(19) }]}>{value}</Text>
    </View>
  );
}

export function MvpLegalScreen({ kind }: { kind: LegalKind }) {
  const m = useMvpMetrics();
  const content = LEGAL_CONTENT[kind];

  return (
    <View style={styles.root}>
      <LegalHeader title={content.title} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: m.x(20),
          paddingTop: m.y(21),
          paddingBottom: m.y(52),
        }}
      >
        <View style={[styles.legalCard, { borderRadius: m.z(22), padding: m.z(22) }]}>
          {content.sections.map((section) => (
            <View key={section.title} style={{ marginBottom: m.y(kind === "about" ? 18 : 20) }}>
              <Text
                style={[
                  styles.legalSectionTitle,
                  { fontSize: m.z(20), lineHeight: m.z(30), marginBottom: m.y(9) },
                ]}
              >
                {section.title}
              </Text>
              {Array.isArray(section.body) ? (
                <LegalList lines={section.body} />
              ) : (
                <Text style={[styles.legalBody, { fontSize: m.z(16), lineHeight: m.z(29) }]}>
                  {section.body}
                </Text>
              )}
            </View>
          ))}
          {kind === "about" ? <AboutActions /> : null}
        </View>
        {content.footer ? (
          <Text
            style={[
              styles.legalFooter,
              { fontSize: m.z(12), lineHeight: m.z(18), marginTop: m.y(18) },
            ]}
          >
            {content.footer}
          </Text>
        ) : null}
      </ScrollView>
      <SettingsFab />
    </View>
  );
}

function LegalList({ lines }: { lines: string[] }) {
  const m = useMvpMetrics();
  return (
    <View style={{ gap: m.y(8) }}>
      {lines.map((line) => (
        <Text key={line} style={[styles.legalBody, { fontSize: m.z(16), lineHeight: m.z(29) }]}>
          • {line}
        </Text>
      ))}
    </View>
  );
}

function AboutActions() {
  const m = useMvpMetrics();
  return (
    <>
      <View style={{ gap: m.y(11), marginBottom: m.y(18) }}>
        <ContactLine icon={<Mail color={UI.orange} size={m.z(18)} />} text="hello@tissint.ma" />
        <ContactLine icon={<MapPin color={UI.orange} size={m.z(18)} />} text="الرباط، المغرب" />
        <ContactLine icon={<Globe color={UI.orange} size={m.z(18)} />} text="tissint.ma" />
      </View>
      <View style={[styles.aboutButtons, { gap: m.x(8) }]}>
        <Pressable
          onPress={() => router.push("/help" as never)}
          style={[styles.aboutButtonPrimary, { height: m.y(40), borderRadius: m.z(21) }]}
        >
          <Text
            style={[styles.aboutButtonPrimaryText, { fontSize: m.z(14.5), lineHeight: m.z(22) }]}
          >
            مركز المساعدة
          </Text>
        </Pressable>
        <Pressable
          onPress={() => router.push("/legal/terms" as never)}
          style={[styles.aboutButtonGhost, { height: m.y(40), borderRadius: m.z(21) }]}
        >
          <Text style={[styles.aboutButtonGhostText, { fontSize: m.z(14.5), lineHeight: m.z(22) }]}>
            الشروط
          </Text>
        </Pressable>
      </View>
    </>
  );
}

function ContactLine({ icon, text }: { icon: ReactNode; text: string }) {
  const m = useMvpMetrics();
  return (
    <View style={styles.contactLine}>
      {icon}
      <Text style={[styles.contactText, { fontSize: m.z(15), lineHeight: m.z(22) }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI.cream,
  },
  offlineHeader: {
    backgroundColor: UI.navy,
    overflow: "hidden",
  },
  legalHeader: {
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
  headerIcon: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  offlineTitle: {
    position: "absolute",
    color: UI.white,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  offlineSubtitle: {
    position: "absolute",
    color: "rgba(255,255,255,0.56)",
    textAlign: "right",
    writingDirection: "rtl",
  },
  legalHeaderTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  updatedAt: {
    position: "absolute",
    left: 0,
    right: 0,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    writingDirection: "rtl",
  },
  onlineCard: {
    position: "absolute",
    backgroundColor: "#DCEED3",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 16,
  },
  onlineText: {
    flex: 1,
    alignItems: "flex-end",
  },
  onlineTitle: {
    color: UI.success,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  onlineSubtitle: {
    color: UI.success,
    textAlign: "right",
    writingDirection: "rtl",
  },
  cacheCard: {
    position: "absolute",
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
  },
  cacheTitleRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
    marginBottom: 15,
  },
  cacheTitle: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  cacheLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cacheLabel: {
    color: UI.muted,
    textAlign: "right",
    writingDirection: "rtl",
  },
  cacheValue: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "left",
  },
  offlineActions: {
    position: "absolute",
    flexDirection: "row-reverse",
  },
  actionButton: {
    flex: 1,
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  clearButton: {
    flex: 1,
    backgroundColor: "#F9D8D2",
    borderWidth: 1,
    borderColor: "#F2A19B",
    flexDirection: "row-reverse",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  actionText: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  clearText: {
    color: UI.danger,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  offlineNote: {
    position: "absolute",
    color: UI.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  legalCard: {
    backgroundColor: UI.white,
    borderWidth: 1,
    borderColor: UI.border,
  },
  legalSectionTitle: {
    color: UI.orange,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  legalBody: {
    color: "#3A3F44",
    textAlign: "right",
    writingDirection: "rtl",
  },
  contactLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  contactText: {
    color: UI.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  aboutButtons: {
    flexDirection: "row-reverse",
  },
  aboutButtonPrimary: {
    flex: 1,
    backgroundColor: UI.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutButtonPrimaryText: {
    color: UI.white,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  aboutButtonGhost: {
    flex: 1,
    backgroundColor: UI.pale,
    alignItems: "center",
    justifyContent: "center",
  },
  aboutButtonGhostText: {
    color: UI.text,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  legalFooter: {
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
    zIndex: 20,
  },
});
