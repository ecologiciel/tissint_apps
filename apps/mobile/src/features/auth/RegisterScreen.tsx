import { Link, router } from "expo-router";
import { MapPin, UserPlus } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import type { RegisterInput } from "@tissint/shared";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { setApiAccessToken } from "@/lib/api";
import { registerAccount } from "@/lib/auth";
import { saveSession } from "@/lib/session-storage";
import { useSessionStore } from "@/store/session-store";
import { colors, radius, spacing } from "@/theme";

type DesiredRole = RegisterInput["desiredRole"];

export function RegisterScreen() {
  const setSession = useSessionStore((state) => state.setSession);
  const [firstName, setFirstName] = useState("Tissint");
  const [lastName, setLastName] = useState("User");
  const [phone, setPhone] = useState("+212600000000");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("demo-password");
  const [region, setRegion] = useState("ورزازات");
  const [accept, setAccept] = useState(true);
  const [desiredRole, setDesiredRole] = useState<DesiredRole>("free");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const session = await registerAccount({
        firstName,
        lastName,
        phone,
        email: email || undefined,
        password,
        desiredRole,
      });
      await saveSession(session);
      setApiAccessToken(session.tokens.accessToken);
      setSession(session);
      router.replace({ pathname: "/verify-otp", params: { phone } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Creation impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View>
        <AppText variant="hero" color={colors.navy}>
          إنشاء حساب
        </AppText>
        <AppText variant="caption">انضم إلى مجتمع باحثي النيازك في المغرب.</AppText>
      </View>

      <Card style={styles.card}>
        <TextInput value={firstName} onChangeText={setFirstName} placeholder="الاسم الشخصي" style={styles.input} />
        <TextInput value={lastName} onChangeText={setLastName} placeholder="الاسم العائلي" style={styles.input} />
        <TextInput value={phone} onChangeText={setPhone} placeholder="رقم الهاتف" keyboardType="phone-pad" style={styles.input} />
        <TextInput value={email} onChangeText={setEmail} placeholder="البريد الإلكتروني" keyboardType="email-address" style={styles.input} />
        <View style={styles.regionField}>
          <MapPin color={colors.textMuted} size={17} />
          <TextInput value={region} onChangeText={setRegion} placeholder="المنطقة" style={styles.regionInput} />
        </View>
        <TextInput value={password} onChangeText={setPassword} placeholder="كلمة المرور" secureTextEntry style={styles.input} />

        <View style={styles.roles}>
          <RoleChoice
            active={desiredRole === "free"}
            title="باحث / بائع مجاني"
            body="5 فحوص يوميا، مجموعة شخصية، ونشر مجاني إذا كانت العينة مؤهلة."
            onPress={() => setDesiredRole("free")}
          />
          <RoleChoice
            active={desiredRole === "premium"}
            title="مشتري Premium"
            body="أرقام البائعين، WhatsApp، تنبيهات، و10 فحوص يوميا."
            onPress={() => setDesiredRole("premium")}
          />
        </View>

        <Pressable style={styles.acceptRow} onPress={() => setAccept((current) => !current)}>
          <View style={[styles.checkbox, accept ? styles.checkboxActive : null]} />
          <AppText variant="caption" style={styles.acceptText}>
            أوافق على الشروط وسياسة الخصوصية.
          </AppText>
        </Pressable>

        {error ? <AppText color={colors.danger}>{error}</AppText> : null}
        <Button icon={UserPlus} loading={loading} onPress={submit} disabled={!accept}>
          إنشاء الحساب
        </Button>
        <Button tone="ghost" onPress={() => router.replace("/dashboard")}>
          متابعة بحساب Google
        </Button>
      </Card>
      <Link href="/auth/login" style={styles.loginLink}>
        لديك حساب؟ سجل الدخول
      </Link>
    </Screen>
  );
}

function RoleChoice({
  active,
  title,
  body,
  onPress,
}: {
  active: boolean;
  title: string;
  body: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.roleChoice, active ? styles.roleActive : null]}>
      <AppText variant="subtitle" color={active ? colors.navy : colors.text}>
        {title}
      </AppText>
      <AppText variant="caption">{body}</AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg,
  },
  card: {
    gap: spacing.md,
  },
  input: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.warm,
    paddingHorizontal: spacing.md,
    textAlign: "right",
    color: colors.text,
  },
  roles: {
    gap: spacing.sm,
  },
  regionField: {
    minHeight: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.warm,
    paddingHorizontal: spacing.md,
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  regionInput: {
    flex: 1,
    textAlign: "right",
    color: colors.text,
  },
  roleChoice: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    backgroundColor: colors.card,
  },
  roleActive: {
    borderColor: colors.orange,
    backgroundColor: "#FFF2E5",
  },
  acceptRow: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.border,
  },
  checkboxActive: {
    backgroundColor: colors.orange,
    borderColor: colors.orange,
  },
  acceptText: {
    flex: 1,
  },
  loginLink: {
    color: colors.orange,
    fontWeight: "800",
    textAlign: "center",
  },
});
