import type { ReactNode } from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";
import {
  arabicTextBase,
  colors,
  legacyTextVariantMap,
  textVariants,
  typography,
  type TextVariant,
} from "@/theme";

type LegacyTextVariant = "title" | "subtitle";
type AppTextVariant = TextVariant | "title" | "subtitle";

export function AppText({
  children,
  variant = "body",
  color,
  style,
  numberOfLines,
  maxFontSizeMultiplier = typography.maxFontSizeMultiplier,
}: {
  children: ReactNode;
  variant?: AppTextVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
  numberOfLines?: number;
  maxFontSizeMultiplier?: number;
}) {
  const resolvedVariant = resolveVariant(variant);
  return (
    <Text
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      numberOfLines={numberOfLines}
      style={[styles.base, textVariants[resolvedVariant], color ? { color } : null, style]}
    >
      {children}
    </Text>
  );
}

function resolveVariant(variant: AppTextVariant): TextVariant {
  return variant in legacyTextVariantMap
    ? legacyTextVariantMap[variant as LegacyTextVariant]
    : (variant as TextVariant);
}

const styles = StyleSheet.create({
  base: {
    ...arabicTextBase,
    color: colors.text,
  },
});
