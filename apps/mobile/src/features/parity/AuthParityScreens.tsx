import { router, useLocalSearchParams } from "expo-router";
import {
  Camera,
  Check,
  CheckCircle2,
  Languages,
  Lock,
  Mail,
  MapPin,
  RotateCcw,
  ScanLine,
  ShieldCheck,
  Sparkles,
  Store,
  User,
} from "lucide-react-native";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AppText } from "@/components/ui/AppText";
import { Screen } from "@/components/ui/Screen";
import { useSessionStore } from "@/store/session-store";
import { colors, spacing } from "@/theme";
import { Field, HeaderBar, ProgressBar, SelectCard } from "./parity-ui";
import { REGIONS } from "./parity-data";

const ONBOARD_FEATURES = [
  {
    icon: ScanLine,
    title: "افحص حجرك",
    body: "استعمل الكاميرا فقط. التطبيق يطلب 3 صور خارجية على الأقل مع إمكانية إضافة صورة مقطع.",
  },
  {
    icon: Sparkles,
    title: "نتيجة فورية",
    body: "يعرض التطبيق درجة الدمج، التصنيف المحتمل، وحالة البيع أو الحاجة إلى صورة مقطع.",
  },
  {
    icon: Store,
    title: "بع في السوق",
    body: "العينات المؤهلة تظهر في سوق منظم مع حجب بيانات التواصل عن الحسابات غير Premium.",
  },
];

export function OnboardingScreen() {
  const [step, setStep] = useState(0);
  const [locale, setLocale] = useState("ar");
  const [region, setRegion] = useState(REGIONS[0]);
  const [displayName, setDisplayName] = useState("باحث تيسينت");
  const total = 6;
  const isFeature = step >= 2 && step <= 4;
  const feature = isFeature ? ONBOARD_FEATURES[step - 2] : null;
  const canNext = step !== 5 || displayName.trim().length >= 2;

  function next() {
    if (!canNext) return;
    if (step === total - 1) router.push("/auth/register");
    else setStep((current) => current + 1);
  }

  return (
    <Screen dark contentStyle={styles.darkScreen}>
      <View style={styles.onboardingBody}>
        {step === 0 ? (
          <Card style={styles.darkCard}>
            <Languages color={colors.gold} size={34} />
            <AppText variant="hero" color={colors.gold} style={styles.center}>
              اختر لغتك
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.72)" style={styles.center}>
              الواجهة عربية RTL من البداية، مع تحضير الإنجليزية والفرنسية لاحقا.
            </AppText>
            {[
              { id: "ar", label: "العربية" },
              { id: "fr", label: "Français" },
              { id: "en", label: "English" },
            ].map((item) => (
              <SelectCard
                key={item.id}
                active={locale === item.id}
                title={item.label}
                onPress={() => setLocale(item.id)}
              />
            ))}
          </Card>
        ) : null}

        {step === 1 ? (
          <Card style={styles.darkCard}>
            <MapPin color={colors.gold} size={34} />
            <AppText variant="hero" color={colors.gold} style={styles.center}>
              منطقتك
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.72)" style={styles.center}>
              تظهر المنطقة العامة في السوق، أما الإحداثيات الدقيقة فتبقى محمية.
            </AppText>
            <View style={styles.regionGrid}>
              {REGIONS.map((item) => (
                <Pressable
                  key={item}
                  onPress={() => setRegion(item)}
                  style={[styles.regionButton, region === item ? styles.regionActive : null]}
                >
                  <AppText
                    color={region === item ? "#FFFFFF" : "rgba(255,255,255,0.8)"}
                    style={styles.center}
                  >
                    {item}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </Card>
        ) : null}

        {feature ? (
          <View style={styles.featureSlide}>
            <View style={styles.featureIcon}>
              <feature.icon color={colors.orange} size={54} />
            </View>
            <AppText variant="hero" color={colors.gold} style={styles.center}>
              {feature.title}
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.76)" style={styles.center}>
              {feature.body}
            </AppText>
          </View>
        ) : null}

        {step === 5 ? (
          <Card style={styles.darkCard}>
            <User color={colors.gold} size={34} />
            <AppText variant="hero" color={colors.gold} style={styles.center}>
              ما اسمك؟
            </AppText>
            <AppText variant="body" color="rgba(255,255,255,0.72)" style={styles.center}>
              سيظهر الاسم داخل الحساب والإعلانات، ويمكن تعديله لاحقا من الملف الشخصي.
            </AppText>
            <Field value={displayName} onChangeText={setDisplayName} placeholder="اسمك أو لقبك" />
          </Card>
        ) : null}
      </View>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {Array.from({ length: total }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index <= step ? styles.dotActive : null,
                index === step ? styles.dotWide : null,
              ]}
            />
          ))}
        </View>
        <View style={styles.footerActions}>
          {step > 0 ? (
            <Button tone="ghost" onPress={() => setStep((current) => Math.max(0, current - 1))}>
              السابق
            </Button>
          ) : null}
          <Button tone="secondary" onPress={next} disabled={!canNext}>
            {step === total - 1 ? "إنشاء حساب" : "التالي"}
          </Button>
        </View>
        <Button tone="ghost" onPress={() => router.push("/auth/login")}>
          لدي حساب - تسجيل الدخول
        </Button>
      </View>
    </Screen>
  );
}

export function VerifyOtpScreen() {
  const params = useLocalSearchParams<{ phone?: string }>();
  const phone = params.phone ?? "+212 6 00 00 00 00";
  const [digits, setDigits] = useState(["1", "2", "3", "4", "5", "6"]);
  const setRole = useSessionStore((state) => state.setRole);

  function verify() {
    if (digits.join("").length !== 6) return;
    setRole("free");
    router.replace("/dashboard");
  }

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar
        title="تأكيد الرقم"
        subtitle={`أدخل الرمز المرسل إلى ${phone}`}
        backTo="/auth/register"
      />
      <Card style={styles.cardGap}>
        <View style={styles.otpRow}>
          {digits.map((digit, index) => (
            <Field
              key={index}
              value={digit}
              onChangeText={(value) =>
                setDigits((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? value.replace(/\D/g, "").slice(-1) : item,
                  ),
                )
              }
              placeholder="0"
              keyboardType="number-pad"
            />
          ))}
        </View>
        <AppText variant="caption" style={styles.center}>
          رمز التجربة: 123456
        </AppText>
        <Button icon={ShieldCheck} onPress={verify}>
          تأكيد
        </Button>
        <Button tone="ghost" icon={RotateCcw}>
          إعادة إرسال الرمز خلال 45 ثانية
        </Button>
      </Card>
    </Screen>
  );
}

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar
        title="نسيت كلمة المرور؟"
        subtitle="أدخل بريدك وسنرسل رابط إعادة التعيين"
        backTo="/auth/login"
      />
      <Card style={styles.cardGap}>
        {sent ? (
          <>
            <CheckCircle2 color={colors.success} size={42} />
            <AppText variant="title" color={colors.navy} style={styles.center}>
              تحقق من بريدك
            </AppText>
            <AppText variant="body" color={colors.textMuted} style={styles.center}>
              أرسلنا رابط إعادة التعيين إلى {email || "بريدك"}. الرابط صالح لمدة ساعة.
            </AppText>
            <Button onPress={() => router.push("/reset-password")}>محاكاة فتح الرابط</Button>
            <Button tone="ghost" onPress={() => setSent(false)}>
              تغيير البريد
            </Button>
          </>
        ) : (
          <>
            <Field
              value={email}
              onChangeText={setEmail}
              placeholder="exemple@tissint.ma"
              keyboardType="email-address"
            />
            <Button icon={Mail} onPress={() => setSent(true)} disabled={!email.trim()}>
              إرسال رابط الإعادة
            </Button>
          </>
        )}
      </Card>
    </Screen>
  );
}

export function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const strength = useMemo(
    () => (password.length >= 12 ? 100 : password.length >= 8 ? 66 : password.length > 0 ? 30 : 0),
    [password],
  );

  if (done) {
    return (
      <Screen contentStyle={styles.centerScreen}>
        <Card style={styles.successCard}>
          <CheckCircle2 color={colors.success} size={48} />
          <AppText variant="title" color={colors.navy} style={styles.center}>
            كلمة المرور محدثة
          </AppText>
          <Button onPress={() => router.replace("/auth/login")}>الذهاب لتسجيل الدخول</Button>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar
        title="كلمة مرور جديدة"
        subtitle="اختر كلمة قوية لحماية حسابك"
        backTo="/auth/login"
      />
      <Card style={styles.cardGap}>
        <Field
          value={password}
          onChangeText={setPassword}
          placeholder="كلمة المرور الجديدة"
          secureTextEntry
        />
        <ProgressBar value={strength} color={strength >= 66 ? colors.success : colors.warning} />
        <Field
          value={confirm}
          onChangeText={setConfirm}
          placeholder="تأكيد كلمة المرور"
          secureTextEntry
        />
        <AppText variant="caption">8 أحرف على الأقل، مع رقم أو رمز خاص.</AppText>
        <Button
          icon={Lock}
          disabled={password.length < 8 || password !== confirm}
          onPress={() => setDone(true)}
        >
          تحديث كلمة المرور
        </Button>
      </Card>
    </Screen>
  );
}

export function CameraPermissionsScreen() {
  return (
    <Screen dark contentStyle={styles.darkScreen}>
      <Card style={styles.darkCard}>
        <Camera color={colors.gold} size={48} />
        <AppText variant="hero" color={colors.gold} style={styles.center}>
          الكاميرا مطلوبة
        </AppText>
        <AppText variant="body" color="rgba(255,255,255,0.76)" style={styles.center}>
          لا يسمح التطبيق برفع الصور من المعرض. يجب التقاط الصور مباشرة لحماية جودة الفحص ومنع
          الاحتيال.
        </AppText>
        <View style={styles.qualityList}>
          {[
            "3 صور خارجية على الأقل",
            "صورة مقطع اختيارية",
            "فحص إضاءة وثبات ميداني",
            "حفظ معرف الجهاز بشكل آمن",
          ].map((item) => (
            <View key={item} style={styles.qualityLine}>
              <Check color={colors.success} size={18} />
              <AppText color="#FFFFFF">{item}</AppText>
            </View>
          ))}
        </View>
        <Button tone="secondary" icon={Camera} onPress={() => router.replace("/scan" as never)}>
          السماح وفتح الفاحص
        </Button>
      </Card>
    </Screen>
  );
}

export function FirstScanGuideScreen() {
  return (
    <Screen contentStyle={styles.screen}>
      <HeaderBar
        title="دليل أول فحص"
        subtitle="5 نصائح للحصول على أفضل نتيجة"
        backTo="/dashboard"
      />
      {[
        ["ضع الحجر على سطح ثابت", "تجنب حمل الحجر في اليد أثناء التصوير حتى لا تهتز الصورة."],
        ["استعمل ضوءا طبيعيا", "الصورة المظلمة تقلل جودة التحليل وتخفض درجة الثقة."],
        ["اقترب بما يكفي", "يجب أن يملأ الحجر معظم إطار الفحص دون قطع الحواف."],
        ["صور 3 زوايا", "أمامية، خلفية، وجانبية. أضف صورة ماكرو إذا أمكن."],
        ["أضف صورة مقطع", "المقطع يحسن score وقد يفتح البيع في السوق."],
      ].map(([title, body], index) => (
        <Card key={title} style={styles.tipCard}>
          <View style={styles.stepNumber}>
            <AppText color="#FFFFFF" style={styles.center}>
              {index + 1}
            </AppText>
          </View>
          <View style={styles.flex}>
            <AppText variant="subtitle">{title}</AppText>
            <AppText variant="body" color={colors.textMuted}>
              {body}
            </AppText>
          </View>
        </Card>
      ))}
      <Button icon={ScanLine} onPress={() => router.push("/scan" as never)}>
        بدء فحص جديد
      </Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  darkScreen: {
    gap: spacing.lg,
    backgroundColor: colors.stone,
  },
  onboardingBody: {
    flex: 1,
    justifyContent: "center",
  },
  darkCard: {
    gap: spacing.lg,
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderColor: "rgba(255,255,255,0.14)",
  },
  center: {
    textAlign: "center",
  },
  regionGrid: {
    width: "100%",
    flexDirection: "row-reverse",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  regionButton: {
    width: "48%",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.14)",
    paddingVertical: spacing.sm,
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  regionActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  featureSlide: {
    alignItems: "center",
    gap: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  featureIcon: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: "rgba(244,138,42,0.16)",
    alignItems: "center",
    justifyContent: "center",
  },
  footer: {
    gap: spacing.md,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.24)",
  },
  dotActive: {
    backgroundColor: colors.orange,
  },
  dotWide: {
    width: 28,
  },
  footerActions: {
    flexDirection: "row-reverse",
    gap: spacing.sm,
  },
  cardGap: {
    gap: spacing.md,
  },
  otpRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  centerScreen: {
    justifyContent: "center",
  },
  successCard: {
    alignItems: "center",
    gap: spacing.md,
  },
  qualityList: {
    alignSelf: "stretch",
    gap: spacing.sm,
  },
  qualityLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  tipCard: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.md,
  },
  stepNumber: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.orange,
    alignItems: "center",
    justifyContent: "center",
  },
  flex: {
    flex: 1,
  },
});
