import {
  StyleSheet,
  Text as NativeText,
  TextInput as NativeTextInput,
  type TextInputProps,
  type TextProps,
  type TextStyle,
} from "react-native";
import { arabicTextBase, colors, fontFamilyForWeight, typography } from "@/theme";

function resolveFontFamily(style?: TextProps["style"]) {
  const flattened = StyleSheet.flatten(style) as TextStyle | undefined;
  return flattened?.fontFamily ?? fontFamilyForWeight(flattened?.fontWeight);
}

export function ResponsiveText({
  style,
  maxFontSizeMultiplier = typography.maxFontSizeMultiplier,
  ...props
}: TextProps) {
  const fontFamily = resolveFontFamily(style);
  return (
    <NativeText
      {...props}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      style={[styles.text, style, fontFamily ? { fontFamily } : null]}
    />
  );
}

export function ResponsiveTextInput({
  style,
  maxFontSizeMultiplier = typography.maxFontSizeMultiplier,
  placeholderTextColor = colors.textMuted,
  textAlign = "right",
  ...props
}: TextInputProps) {
  const fontFamily = resolveFontFamily(style);
  return (
    <NativeTextInput
      {...props}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      placeholderTextColor={placeholderTextColor}
      textAlign={textAlign}
      style={[styles.input, style, fontFamily ? { fontFamily } : null]}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    ...arabicTextBase,
    includeFontPadding: false,
  },
  input: {
    ...arabicTextBase,
    color: colors.text,
    includeFontPadding: false,
  },
});
