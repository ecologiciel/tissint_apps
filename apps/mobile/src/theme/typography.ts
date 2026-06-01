import { Platform, type TextStyle } from "react-native";

export const fontFamilies = {
  webDisplay: '"Tajawal", "Noto Sans Arabic", system-ui, sans-serif',
  tajawalRegular: "Tajawal_400Regular",
  tajawalMedium: "Tajawal_500Medium",
  tajawalBold: "Tajawal_700Bold",
  tajawalBlack: "Tajawal_900Black",
  notoRegular: "NotoSansArabic_400Regular",
  notoSemiBold: "NotoSansArabic_600SemiBold",
  notoExtraBold: "NotoSansArabic_800ExtraBold",
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
  fontFamily: Platform.select({
    web: fontFamilies.webDisplay,
    default: fontFamilies.tajawalRegular,
  }),
  fallbackFontFamily: Platform.select({
    web: fontFamilies.webDisplay,
    default: fontFamilies.notoRegular,
  }),
  maxFontSizeMultiplier: 1.15,
  sizes: typeSize,
  lineHeights: typeLineHeight,
  weights: fontWeights,
} as const;

export function fontFamilyForWeight(weight: NonNullable<TextStyle["fontWeight"]>) {
  return Platform.select({
    web: fontFamilies.webDisplay,
    default:
      weight === fontWeights.black
        ? fontFamilies.tajawalBlack
        : weight === fontWeights.bold || weight === fontWeights.semibold
          ? fontFamilies.tajawalBold
          : weight === fontWeights.medium
            ? fontFamilies.tajawalMedium
            : fontFamilies.tajawalRegular,
  });
}

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
    fontFamily: fontFamilyForWeight(fontWeights.regular),
    fontSize: typeSize.legal,
    lineHeight: typeLineHeight.legal,
    fontWeight: fontWeights.regular,
  },
  meta: {
    fontFamily: fontFamilyForWeight(fontWeights.regular),
    fontSize: typeSize.meta,
    lineHeight: typeLineHeight.meta,
    fontWeight: fontWeights.regular,
  },
  caption: {
    fontFamily: fontFamilyForWeight(fontWeights.medium),
    fontSize: typeSize.caption,
    lineHeight: typeLineHeight.caption,
    fontWeight: fontWeights.medium,
  },
  body: {
    fontFamily: fontFamilyForWeight(fontWeights.regular),
    fontSize: typeSize.body,
    lineHeight: typeLineHeight.body,
    fontWeight: fontWeights.regular,
  },
  label: {
    fontFamily: fontFamilyForWeight(fontWeights.medium),
    fontSize: typeSize.body,
    lineHeight: typeLineHeight.body,
    fontWeight: fontWeights.medium,
  },
  button: {
    fontFamily: fontFamilyForWeight(fontWeights.bold),
    fontSize: typeSize.body,
    lineHeight: typeLineHeight.body,
    fontWeight: fontWeights.bold,
  },
  section: {
    fontFamily: fontFamilyForWeight(fontWeights.semibold),
    fontSize: typeSize.section,
    lineHeight: typeLineHeight.section,
    fontWeight: fontWeights.semibold,
  },
  price: {
    fontFamily: fontFamilyForWeight(fontWeights.bold),
    fontSize: typeSize.price,
    lineHeight: typeLineHeight.price,
    fontWeight: fontWeights.bold,
  },
  header: {
    fontFamily: fontFamilyForWeight(fontWeights.bold),
    fontSize: typeSize.header,
    lineHeight: typeLineHeight.header,
    fontWeight: fontWeights.bold,
  },
  screen: {
    fontFamily: fontFamilyForWeight(fontWeights.black),
    fontSize: typeSize.screen,
    lineHeight: typeLineHeight.screen,
    fontWeight: fontWeights.black,
  },
  hero: {
    fontFamily: fontFamilyForWeight(fontWeights.black),
    fontSize: typeSize.hero,
    lineHeight: typeLineHeight.hero,
    fontWeight: fontWeights.black,
  },
  error: {
    fontFamily: fontFamilyForWeight(fontWeights.black),
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
