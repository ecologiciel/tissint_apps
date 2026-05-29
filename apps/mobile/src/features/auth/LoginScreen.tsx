import { Link, router } from "expo-router";
import { Eye, EyeOff, LogIn, ShieldCheck } from "lucide-react-native";
import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { TissintLogo } from "@/components/tissint/TissintLogo";
import { AppText } from "@/components/ui/AppText";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { loginWithCredentials } from "@/lib/auth";
import { setApiAccessToken } from "@/lib/api";
import { saveSession } from "@/lib/session-storage";
import { useSessionStore } from "@/store/session-store";
import { colors, radius, spacing } from "@/theme";

export function LoginScreen() {
  const setSession = useSessionStore((state) => state.setSession);
  const [phoneOrEmail, setPhoneOrEmail] = useState("+212600000000");
  const [password, setPassword] = useState("demo-password");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setLoading(true);
    setError(null);
    try {
      const session = await loginWithCredentials({ phoneOrEmail, password });
      await saveSession(session);
      setApiAccessToken(session.tokens.accessToken);
      setSession(session);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.logo}>
        <TissintLogo />
      </View>

      <Card style={styles.card}>
        <View style={styles.icon}>
          <ShieldCheck color={colors.gold} size={30} />
        </View>
        <AppText variant="hero" color={colors.navy} style={styles.center}>
          مرحبا بعودتك
        </AppText>
        <AppText variant="body" color={colors.textMuted} style={styles.center}>
          سجل الدخول للوصول إلى مجموعتك وسوق النيازك.
        </AppText>

        <TextInput
          value={phoneOrEmail}
          onChangeText={setPhoneOrEmail}
          placeholder="البريد الإلكتروني أو الهاتف"
          autoCapitalize="none"
          style={styles.input}
        />
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="كلمة المرور"
          secureTextEntry={!showPassword}
          style={styles.input}
        />
        <Pressable style={styles.passwordTools} onPress={() => setShowPassword((current) => !current)}>
          {showPassword ? <EyeOff color={colors.textMuted} size={17} /> : <Eye color={colors.textMuted} size={17} />}
          <AppText variant="caption">{showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}</AppText>
        </Pressable>
        <Link href="/forgot-password" style={styles.smallLink}>
          نسيت كلمة المرور؟
        </Link>
        {error ? <AppText color={colors.danger}>{error}</AppText> : null}
        <Button icon={LogIn} loading={loading} onPress={submit}>
          تسجيل الدخول
        </Button>
        <Button tone="ghost" onPress={() => router.replace("/dashboard")}>
          متابعة بحساب Google
        </Button>
      </Card>

      <Link href="/auth/register" style={styles.link}>
        ليس لديك حساب؟ أنشئ حسابا
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "center",
    gap: spacing.xl,
  },
  logo: {
    alignItems: "center",
  },
  card: {
    gap: spacing.md,
    alignItems: "stretch",
  },
  icon: {
    alignSelf: "center",
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    textAlign: "center",
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
  link: {
    color: colors.orange,
    fontWeight: "800",
    textAlign: "center",
  },
  smallLink: {
    color: colors.orange,
    fontWeight: "800",
    textAlign: "right",
  },
  passwordTools: {
    flexDirection: "row-reverse",
    alignItems: "center",
    gap: spacing.sm,
    justifyContent: "flex-start",
  },
});
