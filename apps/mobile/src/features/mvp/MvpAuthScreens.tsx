import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  Bell,
  Camera,
  ChevronDown,
  ChevronRight,
  Check,
  Eye,
  Languages,
  Lock,
  Mail,
  MapPin,
  Phone,
  Settings2,
  Sparkles,
  Sun,
  User,
} from "lucide-react-native";
import { useState, type ComponentType, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  useWindowDimensions,
  type KeyboardTypeOptions,
  type TextInputProps,
} from "react-native";
import {
  ResponsiveText as Text,
  ResponsiveTextInput as TextInput,
} from "@/components/ui/ResponsiveText";
import { setApiAccessToken } from "@/lib/api";
import { authErrorMessage, loginWithCredentials, registerAccount } from "@/lib/auth";
import { saveSession } from "@/lib/session-storage";
import { useSessionStore } from "@/store/session-store";

type IconComponent = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

const MVP = {
  dark: "#1C2024",
  panel: "#24292E",
  selected: "#332923",
  cream: "#FBF4E6",
  orange: "#FF7A2A",
  orange2: "#F67824",
  gold: "#F7C75E",
  text: "#1F252A",
  muted: "#B9B7B1",
  fieldBorder: "#DADDE0",
  fieldIcon: "#8A8E91",
  fieldText: "#22282D",
};

const gradientColors = [MVP.orange2, MVP.gold] as const;
const iconGradient = ["#FF8A2B", "#F7C75E"] as const;

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

function MvpRoot({ children }: { children: ReactNode }) {
  return <View style={styles.root}>{children}</View>;
}

function TopIcon({ icon: Icon = Sparkles, top = 64 }: { icon?: IconComponent; top?: number }) {
  const m = useMvpMetrics();
  const size = m.z(64);
  return (
    <LinearGradient
      colors={iconGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.topIcon,
        {
          top: m.y(top),
          left: (m.width - size) / 2,
          width: size,
          height: size,
          borderRadius: m.z(22),
        },
      ]}
    >
      <Icon color="#FFFFFF" size={m.z(38)} strokeWidth={2.6} />
    </LinearGradient>
  );
}

function ScreenTitle({
  title,
  subtitle,
  titleTop,
  subtitleTop,
}: {
  title: string;
  subtitle: string;
  titleTop: number;
  subtitleTop: number;
}) {
  const m = useMvpMetrics();
  return (
    <>
      <Text
        style={[
          styles.title,
          {
            top: m.y(titleTop),
            fontSize: m.z(28),
            lineHeight: m.z(38),
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.subtitle,
          {
            top: m.y(subtitleTop),
            fontSize: m.z(17),
            lineHeight: m.z(27),
          },
        ]}
      >
        {subtitle}
      </Text>
    </>
  );
}

function SettingsFab() {
  const m = useMvpMetrics();
  const size = m.z(48);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push("/settings" as never)}
      style={[
        styles.settingsFab,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          left: m.x(24),
          bottom: m.y(20),
        },
      ]}
    >
      <Settings2 color="#FFFFFF" size={m.z(21)} strokeWidth={2.6} />
    </Pressable>
  );
}

function BackCircle({ to = "/auth/login" }: { to?: string }) {
  const m = useMvpMetrics();
  const size = m.z(36);
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.replace(to as never)}
      style={[
        styles.backCircle,
        {
          top: m.y(40),
          right: m.x(40),
          width: size,
          height: size,
          borderRadius: size / 2,
        },
      ]}
    >
      <ChevronRight color="#FFFFFF" size={m.z(25)} strokeWidth={3} />
    </Pressable>
  );
}

function GradientButton({
  children,
  onPress,
  top,
  disabled = false,
  loading = false,
}: {
  children: string;
  onPress: () => void;
  top?: number;
  disabled?: boolean;
  loading?: boolean;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.gradientPressable,
        top !== undefined
          ? {
              position: "absolute",
              top: m.y(top),
              left: m.x(24),
              width: m.x(312),
            }
          : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[
          styles.gradientButton,
          {
            minHeight: m.z(56),
            borderRadius: m.z(28),
          },
        ]}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={[styles.buttonText, { fontSize: m.z(18), lineHeight: m.z(27) }]}>
            {children}
          </Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

function LanguageOption({
  active,
  label,
  suffix,
  top,
  onPress,
}: {
  active: boolean;
  label: string;
  suffix: string;
  top: number;
  onPress: () => void;
}) {
  const m = useMvpMetrics();
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[
        styles.languageOption,
        {
          top: m.y(top),
          left: m.x(24),
          width: m.x(312),
          minHeight: m.z(67),
          borderRadius: m.z(33),
          borderWidth: m.z(active ? 2 : 1.8),
        },
        active ? styles.languageActive : styles.languageIdle,
      ]}
    >
      <Text style={[styles.languageCheck, { fontSize: m.z(28), lineHeight: m.z(32) }]}>
        {active ? "✓" : ""}
      </Text>
      <Text style={[styles.languageText, { fontSize: m.z(17), lineHeight: m.z(25) }]}>
        {label} <Text style={styles.flag}>{suffix}</Text>
      </Text>
    </Pressable>
  );
}

function Dots({ active = 5 }: { active?: number }) {
  const m = useMvpMetrics();
  return (
    <View style={[styles.dots, { top: m.y(660), gap: m.z(6) }]}>
      {[0, 1, 2, 3, 4].map((index) => (
        <View
          key={index}
          style={[
            styles.dot,
            {
              width: m.z(index === active ? 32 : 7),
              height: m.z(7),
              borderRadius: m.z(4),
              backgroundColor: index === active ? MVP.orange : "#555B5E",
            },
          ]}
        />
      ))}
    </View>
  );
}

function BottomLoginLink({ top = 746 }: { top?: number }) {
  const m = useMvpMetrics();
  return (
    <Pressable
      onPress={() => router.push("/auth/login" as never)}
      style={[styles.bottomLinkWrap, { top: m.y(top) }]}
    >
      <Text style={[styles.bottomLinkText, { fontSize: m.z(16), lineHeight: m.z(24) }]}>
        لدي حساب - <Text style={styles.bottomLinkStrong}>تسجيل الدخول</Text>
      </Text>
    </Pressable>
  );
}

function AuthCard({
  children,
  top,
  height,
}: {
  children: ReactNode;
  top: number;
  height?: number;
}) {
  const m = useMvpMetrics();
  return (
    <View
      style={[
        styles.authCard,
        {
          top: m.y(top),
          left: m.x(20),
          width: m.x(320),
          minHeight: height ? m.y(height) : undefined,
          borderRadius: m.z(24),
          paddingHorizontal: m.x(20),
          paddingTop: m.y(20),
          paddingBottom: m.y(20),
        },
      ]}
    >
      {children}
    </View>
  );
}

function MvpInput({
  label,
  value,
  onChangeText,
  placeholder,
  icon: Icon,
  leftIcon: LeftIcon,
  secureTextEntry,
  keyboardType,
  editable = true,
  trailing,
  compact = false,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  icon: IconComponent;
  leftIcon?: IconComponent;
  secureTextEntry?: TextInputProps["secureTextEntry"];
  keyboardType?: KeyboardTypeOptions;
  editable?: boolean;
  trailing?: ReactNode;
  compact?: boolean;
}) {
  const m = useMvpMetrics();
  return (
    <View style={[styles.fieldBlock, { marginBottom: m.y(compact ? 9 : 13) }]}>
      <Text
        style={[
          styles.fieldLabel,
          {
            fontSize: m.z(14.5),
            lineHeight: m.z(compact ? 20 : 22),
            marginBottom: m.y(compact ? 5 : 7),
          },
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.inputShell,
          {
            minHeight: m.z(compact ? 42 : 43),
            borderRadius: m.z(22),
            paddingLeft: m.x(14),
            paddingRight: m.x(14),
          },
        ]}
      >
        {LeftIcon ? <LeftIcon color={MVP.fieldIcon} size={m.z(17)} strokeWidth={2.2} /> : null}
        <TextInput
          editable={editable}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#A9ADAF"
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize="none"
          style={[styles.textInput, { fontSize: m.z(15.5), lineHeight: m.z(22) }]}
        />
        {trailing}
        <Icon color={MVP.fieldIcon} size={m.z(18)} strokeWidth={2.2} />
      </View>
    </View>
  );
}

function Divider() {
  const m = useMvpMetrics();
  return (
    <View style={[styles.dividerRow, { marginTop: m.y(4), marginBottom: m.y(15) }]}>
      <View style={styles.dividerLine} />
      <Text style={[styles.dividerText, { fontSize: m.z(13.5) }]}>أو</Text>
      <View style={styles.dividerLine} />
    </View>
  );
}

function GoogleButton() {
  const m = useMvpMetrics();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: true }}
      disabled
      style={[
        styles.googleButton,
        {
          minHeight: m.z(46),
          borderRadius: m.z(23),
        },
        styles.disabled,
      ]}
    >
      <Text style={[styles.googleText, { fontSize: m.z(16), lineHeight: m.z(23) }]}>
        متابعة بحساب Google <Text style={styles.googleMark}>G</Text>
      </Text>
    </Pressable>
  );
}

export function LanguageChoiceScreen() {
  const [locale, setLocale] = useState("ar");

  return (
    <MvpRoot>
      <TopIcon icon={Languages} top={48} />
      <ScreenTitle
        title="اختر لغتك"
        subtitle="يمكنك تغييرها لاحقاً من الإعدادات"
        titleTop={126}
        subtitleTop={169}
      />
      <LanguageOption
        active={locale === "ar"}
        label="العربية"
        suffix="🇲🇦"
        top={193}
        onPress={() => setLocale("ar")}
      />
      <LanguageOption
        active={locale === "fr"}
        label="Français"
        suffix="🇫🇷"
        top={268}
        onPress={() => setLocale("fr")}
      />
      <LanguageOption
        active={locale === "en"}
        label="English"
        suffix="🇬🇧"
        top={345}
        onPress={() => setLocale("en")}
      />
      <Dots active={5} />
      <GradientButton top={680} onPress={() => router.push("/auth/login" as never)}>
        التالي
      </GradientButton>
      <BottomLoginLink />
      <SettingsFab />
    </MvpRoot>
  );
}

export function MvpLoginScreen() {
  const setSession = useSessionStore((state) => state.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const m = useMvpMetrics();

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const session = await loginWithCredentials({ phoneOrEmail: email, password });
      await saveSession(session);
      setApiAccessToken(session.tokens.accessToken);
      setSession(session);
      router.replace("/dashboard" as never);
    } catch (err) {
      setError(authErrorMessage(err, "تعذر تسجيل الدخول"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <MvpRoot>
      <TopIcon top={64} />
      <ScreenTitle
        title="مرحباً بعودتك"
        subtitle="سجل الدخول للوصول إلى مجموعتك وسوق النيازك"
        titleTop={139}
        subtitleTop={187}
      />
      <AuthCard top={228} height={358}>
        <MvpInput
          label="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
          icon={Mail}
          keyboardType="email-address"
        />
        <MvpInput
          label="كلمة المرور"
          value={password}
          onChangeText={setPassword}
          icon={Lock}
          leftIcon={Eye}
          secureTextEntry
        />
        <Pressable onPress={() => router.push("/forgot-password" as never)}>
          <Text
            style={[
              styles.forgotText,
              { fontSize: m.z(14.5), lineHeight: m.z(22), marginTop: -m.y(5) },
            ]}
          >
            نسيت كلمة المرور؟
          </Text>
        </Pressable>
        {error ? <Text style={[styles.errorText, { fontSize: m.z(12.5) }]}>{error}</Text> : null}
        <View style={{ marginTop: m.y(11) }}>
          <GradientButton onPress={submit} loading={loading}>
            تسجيل الدخول
          </GradientButton>
        </View>
        <Divider />
        <GoogleButton />
      </AuthCard>
      <Pressable
        onPress={() => router.push("/auth/register" as never)}
        style={[styles.registerLink, { top: m.y(603) }]}
      >
        <Text style={[styles.bottomLinkText, { fontSize: m.z(17), lineHeight: m.z(25) }]}>
          ليس لديك حساب؟ <Text style={styles.bottomLinkStrong}>أنشئ حساباً</Text>
        </Text>
      </Pressable>
      <SettingsFab />
    </MvpRoot>
  );
}

export function MvpRegisterScreen() {
  const setSession = useSessionStore((state) => state.setSession);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("+212");
  const [region, setRegion] = useState("ورزازات");
  const [password, setPassword] = useState("");
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const m = useMvpMetrics();

  async function submit() {
    if (!accept) return;
    setLoading(true);
    setError(null);
    try {
      const [firstName, ...rest] = fullName.trim().split(/\s+/);
      const session = await registerAccount({
        firstName: firstName || "Tissint",
        lastName: rest.join(" ") || "User",
        phone,
        email: email || undefined,
        password,
        desiredRole: "free",
      });
      await saveSession(session);
      setApiAccessToken(session.tokens.accessToken);
      setSession(session);
      router.replace({ pathname: "/verify-otp", params: { phone } } as never);
    } catch (err) {
      setError(authErrorMessage(err, "تعذر إنشاء الحساب"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <MvpRoot>
      <BackCircle />
      <TopIcon top={64} />
      <ScreenTitle
        title="إنشاء حساب"
        subtitle="انضم إلى مجتمع باحثي النيازك في المغرب"
        titleTop={140}
        subtitleTop={188}
      />
      <AuthCard top={228} height={476}>
        <MvpInput
          label="الاسم الكامل"
          value={fullName}
          onChangeText={setFullName}
          placeholder="محمد العلوي"
          icon={User}
        />
        <MvpInput
          label="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
          placeholder="exemple@tissint.ma"
          icon={Mail}
          keyboardType="email-address"
        />
        <MvpInput
          label="رقم الهاتف"
          value={phone}
          onChangeText={setPhone}
          icon={Phone}
          keyboardType="phone-pad"
        />
        <MvpInput
          label="المنطقة"
          value={region}
          onChangeText={setRegion}
          icon={MapPin}
          leftIcon={ChevronDown}
          editable={false}
        />
        <MvpInput
          label="كلمة المرور (8 أحرف على الأقل)"
          value={password}
          onChangeText={setPassword}
          icon={Lock}
          secureTextEntry
        />
        <Pressable
          onPress={() => setAccept((current) => !current)}
          style={[styles.acceptRow, { marginTop: -m.y(2), marginBottom: m.y(13) }]}
        >
          <View
            style={[
              styles.checkbox,
              { width: m.z(16), height: m.z(16), borderRadius: m.z(3) },
              accept ? styles.checkboxActive : null,
            ]}
          />
          <Text style={[styles.acceptText, { fontSize: m.z(13.5), lineHeight: m.z(22) }]}>
            أوافق على <Text style={styles.orangeText}>الشروط والأحكام وسياسة الخصوصية</Text>
          </Text>
        </Pressable>
        {error ? <Text style={[styles.errorText, { fontSize: m.z(12.5) }]}>{error}</Text> : null}
        <GradientButton onPress={submit} disabled={!accept} loading={loading}>
          إنشاء الحساب
        </GradientButton>
      </AuthCard>
      <Pressable
        onPress={() => router.replace("/auth/login" as never)}
        style={[styles.registerLink, { top: m.y(744) }]}
      >
        <Text style={[styles.bottomLinkText, { fontSize: m.z(17), lineHeight: m.z(25) }]}>
          لديك حساب؟ <Text style={styles.bottomLinkStrong}>سجل الدخول.</Text>
        </Text>
      </Pressable>
      <SettingsFab />
    </MvpRoot>
  );
}

export function MvpForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const m = useMvpMetrics();

  return (
    <MvpRoot>
      <BackCircle />
      <TopIcon top={64} />
      <ScreenTitle
        title="نسيت كلمة المرور؟"
        subtitle="أدخل بريدك وسنرسل لك رابطاً لإعادة التعيين"
        titleTop={145}
        subtitleTop={190}
      />
      <AuthCard top={228} height={160}>
        <MvpInput
          label="البريد الإلكتروني"
          value={email}
          onChangeText={setEmail}
          placeholder="exemple@tissint.ma"
          icon={Mail}
          keyboardType="email-address"
        />
        <GradientButton onPress={() => setSent(true)}>
          {sent ? "تم إرسال رابط الإعادة" : "إرسال رابط الإعادة"}
        </GradientButton>
      </AuthCard>
      <Pressable
        onPress={() => router.replace("/auth/login" as never)}
        style={[styles.registerLink, { top: m.y(410) }]}
      >
        <Text style={[styles.bottomLinkText, { fontSize: m.z(17), lineHeight: m.z(25) }]}>
          تذكرت كلمة المرور؟ <Text style={styles.bottomLinkStrong}>عودة إلى الدخول.</Text>
        </Text>
      </Pressable>
      <SettingsFab />
    </MvpRoot>
  );
}

export function MvpVerifyOtpScreen() {
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const m = useMvpMetrics();
  const isComplete = digits.every((digit) => digit.length === 1);

  function submit() {
    if (!isComplete) return;
    router.replace("/dashboard" as never);
  }

  return (
    <MvpRoot>
      <BackCircle />
      <TopIcon top={64} />
      <ScreenTitle
        title="تأكيد الرقم"
        subtitle="أدخل الرمز المرسل عبر SMS إلى 212+ 6 12 34 56 78"
        titleTop={146}
        subtitleTop={187}
      />
      <AuthCard top={228} height={217}>
        <View style={[styles.otpBoxes, { gap: m.x(10), marginBottom: m.y(20) }]}>
          {digits.map((digit, index) => (
            <TextInput
              key={index}
              value={digit}
              onChangeText={(value) =>
                setDigits((current) =>
                  current.map((item, itemIndex) =>
                    itemIndex === index ? value.replace(/\D/g, "").slice(-1) : item,
                  ),
                )
              }
              keyboardType="number-pad"
              maxLength={1}
              style={[
                styles.otpInput,
                {
                  width: m.x(39),
                  height: m.y(47),
                  borderRadius: m.z(19),
                  fontSize: m.z(20),
                },
              ]}
            />
          ))}
        </View>
        <Text
          style={[
            styles.otpHint,
            { fontSize: m.z(14), lineHeight: m.z(22), marginBottom: m.y(19) },
          ]}
        >
          أدخل الرمز المكون من 6 أرقام
        </Text>
        <GradientButton onPress={submit} disabled={!isComplete}>
          تأكيد
        </GradientButton>
        <Pressable style={{ marginTop: m.y(16) }}>
          <Text style={[styles.resendText, { fontSize: m.z(14.5), lineHeight: m.z(23) }]}>
            إعادة الإرسال خلال <Text style={styles.resendStrong}>44s</Text>
          </Text>
        </Pressable>
      </AuthCard>
      <SettingsFab />
    </MvpRoot>
  );
}

export function MvpResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const m = useMvpMetrics();

  return (
    <MvpRoot>
      <BackCircle />
      <TopIcon top={64} />
      <ScreenTitle
        title="كلمة مرور جديدة"
        subtitle="اختر كلمة مرور قوية لحماية حسابك"
        titleTop={145}
        subtitleTop={190}
      />
      <AuthCard top={228} height={310}>
        <MvpInput
          label="كلمة المرور الجديدة"
          value={password}
          onChangeText={setPassword}
          icon={Lock}
          secureTextEntry
          compact
        />
        <MvpInput
          label="تأكيد كلمة المرور"
          value={confirm}
          onChangeText={setConfirm}
          icon={Lock}
          secureTextEntry
          compact
        />
        <View style={[styles.passwordRules, { marginBottom: m.y(15), gap: m.y(3) }]}>
          {["8 أحرف على الأقل", "حرف كبير وصغير", "رقم أو رمز خاص"].map((rule) => (
            <Text
              key={rule}
              style={[styles.passwordRule, { fontSize: m.z(13.5), lineHeight: m.z(18) }]}
            >
              • {rule}
            </Text>
          ))}
        </View>
        <GradientButton
          onPress={() => router.replace("/auth/login" as never)}
          disabled={password.length < 8 || password !== confirm}
        >
          تحديث كلمة المرور
        </GradientButton>
      </AuthCard>
      <SettingsFab />
    </MvpRoot>
  );
}

function LightRoot({ children }: { children: ReactNode }) {
  return <View style={styles.lightRoot}>{children}</View>;
}

function LightBack({ dark = false, to }: { dark?: boolean; to?: string }) {
  const m = useMvpMetrics();
  const size = m.z(39);
  return (
    <Pressable
      onPress={() => (to ? router.replace(to as never) : router.back())}
      style={[
        styles.lightBack,
        {
          top: m.y(dark ? 48 : 49),
          right: m.x(20),
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: dark ? "rgba(255,255,255,0.12)" : "#FFFFFF",
        },
      ]}
    >
      <ChevronRight color={dark ? "#FFFFFF" : MVP.text} size={m.z(24)} strokeWidth={3} />
    </Pressable>
  );
}

function PermissionRow({
  icon: Icon,
  title,
  body,
  required = false,
}: {
  icon: IconComponent;
  title: string;
  body: string;
  required?: boolean;
}) {
  const m = useMvpMetrics();
  return (
    <View
      style={[
        styles.permissionCard,
        {
          height: m.y(84),
          borderRadius: m.z(22),
          paddingHorizontal: m.x(18),
        },
      ]}
    >
      <View
        style={[styles.permissionIcon, { width: m.z(48), height: m.z(48), borderRadius: m.z(18) }]}
      >
        <Icon color="#174762" size={m.z(25)} strokeWidth={2.7} />
      </View>
      <View style={styles.permissionText}>
        <View style={styles.permissionTitleRow}>
          {required ? (
            <View
              style={[
                styles.requiredPill,
                { borderRadius: m.z(11), paddingHorizontal: m.x(9), paddingVertical: m.y(3) },
              ]}
            >
              <Text style={[styles.requiredText, { fontSize: m.z(11) }]}>إلزامي</Text>
            </View>
          ) : null}
          <Text style={[styles.permissionTitle, { fontSize: m.z(17), lineHeight: m.z(24) }]}>
            {title}
          </Text>
        </View>
        <Text style={[styles.permissionBody, { fontSize: m.z(13.5), lineHeight: m.z(20) }]}>
          {body}
        </Text>
      </View>
      <Pressable
        style={[styles.allowButton, { width: m.x(73), height: m.y(32), borderRadius: m.z(18) }]}
      >
        <Text style={[styles.allowText, { fontSize: m.z(14.5) }]}>السماح</Text>
      </Pressable>
    </View>
  );
}

export function MvpCameraPermissionsScreen() {
  const m = useMvpMetrics();
  return (
    <LightRoot>
      <Text
        style={[
          styles.permissionsTitle,
          { top: m.y(58), right: m.x(72), fontSize: m.z(20), lineHeight: m.z(28) },
        ]}
      >
        الأذونات
      </Text>
      <LightBack to="/auth/login" />
      <Text
        style={[
          styles.permissionsSubtitle,
          { top: m.y(107), fontSize: m.z(16), lineHeight: m.z(25) },
        ]}
      >
        يحتاج تيسنت لبعض الأذونات للعمل بأفضل شكل
      </Text>
      <View
        style={[
          styles.permissionsList,
          { top: m.y(133), left: m.x(20), right: m.x(20), gap: m.y(13) },
        ]}
      >
        <PermissionRow
          icon={Camera}
          title="الكاميرا"
          body="لمسح الأحجار وتحليلها بصرياً"
          required
        />
        <PermissionRow icon={MapPin} title="الموقع" body="لتحديد منطقة الاكتشاف (اختياري)" />
        <PermissionRow icon={Bell} title="الإشعارات" body="تنبيهات الرسائل والصفقات" />
      </View>
      <Pressable
        style={[
          styles.disabledContinue,
          { left: m.x(20), right: m.x(20), top: m.y(692), height: m.y(48), borderRadius: m.z(24) },
        ]}
      >
        <Text style={[styles.disabledContinueText, { fontSize: m.z(18), lineHeight: m.z(27) }]}>
          متابعة
        </Text>
      </Pressable>
      <Pressable
        onPress={() => router.replace("/first-scan" as never)}
        style={[styles.skipLink, { top: m.y(760) }]}
      >
        <Text style={[styles.skipText, { fontSize: m.z(16), lineHeight: m.z(24) }]}>تخطي الآن</Text>
      </Pressable>
      <SettingsFab />
    </LightRoot>
  );
}

export function MvpFirstScanGuideScreen() {
  const m = useMvpMetrics();
  return (
    <LightRoot>
      <View
        style={[
          styles.guideHeader,
          { height: m.y(124), borderBottomLeftRadius: m.z(26), borderBottomRightRadius: m.z(26) },
        ]}
      >
        <Text style={[styles.guideCounter, { top: m.y(59), left: m.x(20), fontSize: m.z(13.5) }]}>
          1/5
        </Text>
        <Text
          style={[
            styles.guideHeaderTitle,
            { top: m.y(55), fontSize: m.z(20), lineHeight: m.z(28) },
          ]}
        >
          دليل أول فحص
        </Text>
        <LightBack dark to="/dashboard" />
        <View
          style={[
            styles.progressSegments,
            { left: m.x(20), right: m.x(20), top: m.y(100), gap: m.x(4) },
          ]}
        >
          {[0, 1, 2, 3, 4].map((segment) => (
            <View
              key={segment}
              style={[
                styles.progressSegment,
                {
                  height: m.y(4),
                  borderRadius: m.z(4),
                  backgroundColor: segment === 4 ? MVP.orange : "rgba(255,255,255,0.28)",
                },
              ]}
            />
          ))}
        </View>
      </View>
      <View
        style={[
          styles.firstScanCard,
          { top: m.y(145), left: m.x(20), right: m.x(20), height: m.y(229), borderRadius: m.z(24) },
        ]}
      >
        <LinearGradient
          colors={iconGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.firstScanIcon,
            { width: m.z(80), height: m.z(80), borderRadius: m.z(22), marginBottom: m.y(18) },
          ]}
        >
          <Sun color="#FFFFFF" size={m.z(44)} strokeWidth={2.5} />
        </LinearGradient>
        <Text style={[styles.firstScanTitle, { fontSize: m.z(25), lineHeight: m.z(35) }]}>
          إضاءة طبيعية
        </Text>
        <Text style={[styles.firstScanBody, { fontSize: m.z(17), lineHeight: m.z(28) }]}>
          صوّر في النهار بالقرب من نافذة. تجنب الظلال القوية والفلاش المباشر.
        </Text>
      </View>
      <View
        style={[styles.doDontRow, { top: m.y(394), left: m.x(20), right: m.x(20), gap: m.x(15) }]}
      >
        <View style={[styles.tipBox, styles.goodBox, { height: m.y(61), borderRadius: m.z(20) }]}>
          <Text style={[styles.goodSmall, { fontSize: m.z(13.5) }]}>✓ افعل</Text>
          <Text style={[styles.tipStrong, { fontSize: m.z(17), lineHeight: m.z(24) }]}>
            ضوء جانبي طبيعي
          </Text>
        </View>
        <View style={[styles.tipBox, styles.badBox, { height: m.y(61), borderRadius: m.z(20) }]}>
          <Text style={[styles.badSmall, { fontSize: m.z(13.5) }]}>× تجنب</Text>
          <Text style={[styles.tipStrong, { fontSize: m.z(17), lineHeight: m.z(24) }]}>
            ظل أو فلاش
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.checkListCard,
          { top: m.y(476), left: m.x(20), right: m.x(20), height: m.y(89), borderRadius: m.z(19) },
        ]}
      >
        {[
          "دقة 92% في الظروف الجيدة",
          "الصور لا تُحفظ بدون موافقتك",
          "يمكنك إعادة الفحص بدون تكلفة",
        ].map((item) => (
          <View key={item} style={styles.checkLine}>
            <Check color="#28A85D" size={m.z(16)} strokeWidth={2.8} />
            <Text style={[styles.checkText, { fontSize: m.z(14.5), lineHeight: m.z(23) }]}>
              {item}
            </Text>
          </View>
        ))}
      </View>
      <View style={[styles.guideFooter, { height: m.y(92) }]} />
      <GradientButton top={730} onPress={() => router.replace("/camera-permissions" as never)}>
        التالي
      </GradientButton>
      <SettingsFab />
    </LightRoot>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: MVP.dark,
  },
  topIcon: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 18 },
    elevation: 12,
  },
  title: {
    position: "absolute",
    left: 0,
    right: 0,
    color: MVP.gold,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  subtitle: {
    position: "absolute",
    left: 24,
    right: 24,
    color: MVP.muted,
    fontWeight: "400",
    textAlign: "center",
    writingDirection: "rtl",
  },
  settingsFab: {
    position: "absolute",
    backgroundColor: "#1B1F23",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 11,
  },
  backCircle: {
    position: "absolute",
    backgroundColor: "#34383D",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 3,
  },
  gradientPressable: {
    width: "100%",
  },
  gradientButton: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#C96820",
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
  disabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  languageOption: {
    position: "absolute",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 33,
    paddingRight: 33,
  },
  languageActive: {
    backgroundColor: MVP.selected,
    borderColor: MVP.orange,
  },
  languageIdle: {
    backgroundColor: MVP.panel,
    borderColor: "#454B50",
  },
  languageCheck: {
    color: MVP.orange,
    fontWeight: "500",
  },
  languageText: {
    color: "#FFF8EC",
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  flag: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  dots: {
    position: "absolute",
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {},
  bottomLinkWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  bottomLinkText: {
    color: MVP.muted,
    textAlign: "center",
    writingDirection: "rtl",
  },
  bottomLinkStrong: {
    color: MVP.gold,
    fontWeight: "900",
    textDecorationLine: "underline",
  },
  authCard: {
    position: "absolute",
    backgroundColor: MVP.cream,
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 16 },
    elevation: 9,
  },
  fieldBlock: {
    width: "100%",
  },
  fieldLabel: {
    color: "#55595C",
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  inputShell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: MVP.fieldBorder,
  },
  textInput: {
    flex: 1,
    color: MVP.fieldText,
    paddingVertical: 0,
    textAlign: "right",
    writingDirection: "rtl",
  },
  forgotText: {
    color: MVP.orange,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  errorText: {
    color: "#B94A48",
    textAlign: "right",
    writingDirection: "rtl",
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDD5C5",
  },
  dividerText: {
    color: "#AAA39A",
    fontWeight: "500",
  },
  googleButton: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DCDCDC",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  googleText: {
    color: "#20252B",
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  googleMark: {
    color: "#4285F4",
    fontWeight: "900",
  },
  registerLink: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  acceptRow: {
    width: "100%",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 8,
  },
  checkbox: {
    borderWidth: 1.5,
    borderColor: "#8D9194",
    backgroundColor: "#FFFFFF",
  },
  checkboxActive: {
    backgroundColor: MVP.orange,
    borderColor: MVP.orange,
  },
  acceptText: {
    flex: 1,
    color: "#5A5D60",
    textAlign: "right",
    writingDirection: "rtl",
  },
  orangeText: {
    color: MVP.orange,
    fontWeight: "900",
  },
  otpBoxes: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  otpInput: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1.8,
    borderColor: MVP.fieldBorder,
    color: MVP.text,
    textAlign: "center",
    fontWeight: "900",
    paddingVertical: 0,
  },
  otpHint: {
    color: "#85817A",
    textAlign: "center",
    writingDirection: "rtl",
  },
  otpCode: {
    color: MVP.orange,
    fontWeight: "900",
  },
  resendText: {
    color: "#8A8580",
    textAlign: "center",
    writingDirection: "rtl",
  },
  resendStrong: {
    color: MVP.text,
    fontWeight: "900",
  },
  passwordRules: {
    alignSelf: "flex-end",
    paddingRight: 24,
  },
  passwordRule: {
    color: "#77736E",
    textAlign: "right",
    writingDirection: "rtl",
  },
  lightRoot: {
    flex: 1,
    backgroundColor: MVP.cream,
  },
  lightBack: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DEDEDE",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    zIndex: 3,
  },
  permissionsTitle: {
    position: "absolute",
    color: MVP.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  permissionsSubtitle: {
    position: "absolute",
    left: 20,
    right: 20,
    color: "#69717A",
    textAlign: "center",
    writingDirection: "rtl",
  },
  permissionsList: {
    position: "absolute",
  },
  permissionCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEDEDE",
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 14,
  },
  permissionIcon: {
    backgroundColor: "#E9EEF1",
    alignItems: "center",
    justifyContent: "center",
  },
  permissionText: {
    flex: 1,
    alignItems: "flex-end",
  },
  permissionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },
  requiredPill: {
    backgroundColor: "#FFE8D8",
  },
  requiredText: {
    color: MVP.orange,
    fontWeight: "800",
  },
  permissionTitle: {
    color: MVP.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  permissionBody: {
    color: "#69717A",
    textAlign: "right",
    writingDirection: "rtl",
  },
  allowButton: {
    backgroundColor: "#174762",
    alignItems: "center",
    justifyContent: "center",
  },
  allowText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
  },
  disabledContinue: {
    position: "absolute",
    backgroundColor: "#F7BF96",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledContinueText: {
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
  },
  skipLink: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
  },
  skipText: {
    color: "#69717A",
    textAlign: "center",
    writingDirection: "rtl",
  },
  guideHeader: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "#1B4C66",
  },
  guideCounter: {
    position: "absolute",
    color: "rgba(255,255,255,0.66)",
    fontWeight: "700",
  },
  guideHeaderTitle: {
    position: "absolute",
    left: 0,
    right: 0,
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  progressSegments: {
    position: "absolute",
    flexDirection: "row",
  },
  progressSegment: {
    flex: 1,
  },
  firstScanCard: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEDEDE",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  firstScanIcon: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.14,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 16 },
    elevation: 8,
  },
  firstScanTitle: {
    color: MVP.text,
    fontWeight: "900",
    textAlign: "center",
    writingDirection: "rtl",
  },
  firstScanBody: {
    color: "#69717A",
    textAlign: "center",
    writingDirection: "rtl",
  },
  doDontRow: {
    position: "absolute",
    flexDirection: "row-reverse",
  },
  tipBox: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  goodBox: {
    backgroundColor: "#E9F2DC",
    borderColor: "#9BD8AA",
    alignItems: "flex-end",
  },
  badBox: {
    backgroundColor: "#F9DED4",
    borderColor: "#F5A2A6",
    alignItems: "flex-end",
  },
  goodSmall: {
    color: "#30A960",
    fontWeight: "900",
    textAlign: "right",
  },
  badSmall: {
    color: "#EF3E41",
    fontWeight: "900",
    textAlign: "right",
  },
  tipStrong: {
    color: MVP.text,
    fontWeight: "900",
    textAlign: "right",
    writingDirection: "rtl",
  },
  checkListCard: {
    position: "absolute",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DEDEDE",
    justifyContent: "center",
    paddingHorizontal: 27,
    gap: 5,
  },
  checkLine: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: 10,
  },
  checkText: {
    flex: 1,
    color: MVP.text,
    textAlign: "right",
    writingDirection: "rtl",
  },
  guideFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2DFD7",
  },
});
