import {
  Tajawal_400Regular,
  Tajawal_500Medium,
  Tajawal_700Bold,
  Tajawal_900Black,
} from "@expo-google-fonts/tajawal";
import {
  NotoSansArabic_400Regular,
  NotoSansArabic_600SemiBold,
  NotoSansArabic_800ExtraBold,
} from "@expo-google-fonts/noto-sans-arabic";
import { fontFamilies } from "./typography";

export const appFontAssets = {
  [fontFamilies.tajawalRegular]: Tajawal_400Regular,
  [fontFamilies.tajawalMedium]: Tajawal_500Medium,
  [fontFamilies.tajawalBold]: Tajawal_700Bold,
  [fontFamilies.tajawalBlack]: Tajawal_900Black,
  [fontFamilies.notoRegular]: NotoSansArabic_400Regular,
  [fontFamilies.notoSemiBold]: NotoSansArabic_600SemiBold,
  [fontFamilies.notoExtraBold]: NotoSansArabic_800ExtraBold,
} as const;
