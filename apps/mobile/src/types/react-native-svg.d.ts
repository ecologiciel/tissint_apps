declare module "react-native-svg" {
  export interface SvgProps {
    children?: import("react").ReactNode;
    color?: string;
    fill?: string;
    height?: number | string;
    opacity?: number | string;
    style?: import("react-native").StyleProp<import("react-native").ViewStyle>;
    stroke?: string;
    strokeLinecap?: "butt" | "round" | "square" | "inherit";
    strokeLinejoin?: "miter" | "round" | "bevel" | "inherit";
    strokeWidth?: number | string;
    testID?: string;
    width?: number | string;
  }
}
