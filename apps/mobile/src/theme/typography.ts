import { Platform, type TextStyle } from "react-native";

export const fontFamilies = {
  webDisplay: '"Tajawal", "Noto Sans Arabic", system-ui, sans-serif',
  nativeDisplay: "Tajawal",
  nativeArabicFallback: "NotoSansArabic",
} as const;

export const typeSize = {
  legal: 10,
  meta: 11,
  caption: 12,
  body: 14,
  section: 16,
  price: 18,
  header: 20,
  screen: 24,
  hero: 30,
  error: 72,
} as const;

export const typeLineHeight = {
  legal: 14,
  meta: 16,
  caption: 18,
  body: 22,
  section: 24,
  price: 26,
  header: 28,
  screen: 34,
  hero: 40,
  legalLong: 28,
  error: 82,
} as const;

export const fontWeights = {
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
  black: "900",
} satisfies Record<string, NonNullable<TextStyle["fontWeight"]>>;

export const typography = {
  // Native font files are wired in the next tranche. Web can safely use a full CSS font stack now.
  fontFamily: Platform.select({
    web: fontFamilies.webDisplay,
    default: undefined,
  }),
  fallbackFontFamily: Platform.select({
    web: fontFamilies.webDisplay,
    default: undefined,
  }),
  maxFontSizeMultiplier: 1.15,
  sizes: typeSize,
  lineHeights: typeLineHeight,
  weights: fontWeights,
} as const;

export type TypeSizeName = keyof typeof typeSize;
export type TextVariant =
  | "legal"
  | "meta"
  | "caption"
  | "body"
  | "label"
  | "button"
  | "section"
  | "price"
  | "header"
  | "screen"
  | "hero"
  | "error";

export const textVariants = {
  legal: {
    fontSize: typeSize.legal,
    lineHeight: typeLineHeight.legal,
    fontWeight: fontWeights.regular,
  },
  meta: {
    fontSize: typeSize.meta,
    lineHeight: typeLineHeight.meta,
    fontWeight: fontWeights.regular,
  },
  caption: {
    fontSize: typeSize.caption,
    lineHeight: typeLineHeight.caption,
    fontWeight: fontWeights.medium,
  },
  body: {
    fontSize: typeSize.body,
    lineHeight: typeLineHeight.body,
    fontWeight: fontWeights.regular,
  },
  label: {
    fontSize: typeSize.body,
    lineHeight: typeLineHeight.body,
    fontWeight: fontWeights.medium,
  },
  button: {
    fontSize: typeSize.body,
    lineHeight: typeLineHeight.body,
    fontWeight: fontWeights.bold,
  },
  section: {
    fontSize: typeSize.section,
    lineHeight: typeLineHeight.section,
    fontWeight: fontWeights.semibold,
  },
  price: {
    fontSize: typeSize.price,
    lineHeight: typeLineHeight.price,
    fontWeight: fontWeights.bold,
  },
  header: {
    fontSize: typeSize.header,
    lineHeight: typeLineHeight.header,
    fontWeight: fontWeights.bold,
  },
  screen: {
    fontSize: typeSize.screen,
    lineHeight: typeLineHeight.screen,
    fontWeight: fontWeights.black,
  },
  hero: {
    fontSize: typeSize.hero,
    lineHeight: typeLineHeight.hero,
    fontWeight: fontWeights.black,
  },
  error: {
    fontSize: typeSize.error,
    lineHeight: typeLineHeight.error,
    fontWeight: fontWeights.black,
  },
} satisfies Record<TextVariant, TextStyle>;

export const legacyTextVariantMap = {
  title: "header",
  subtitle: "section",
} as const;

export const arabicTextBase: TextStyle = {
  fontFamily: typography.fontFamily,
  textAlign: "right",
  writingDirection: "rtl",
};
