import { Platform, useWindowDimensions } from "react-native";
import { typeSize, type TypeSizeName } from "./typography";

export const layout = {
  prototypeWidth: 360,
  prototypeHeight: 800,
  maxMobileWidth: 420,
  minReadableWidth: 320,
  maxUpscale: 1,
  maxFontUpscale: 1,
} as const;

const allowedTypeSizes = Object.values(typeSize);

function roundLayout(value: number) {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function scaleFactor(value: number, allowUpscale = false) {
  return allowUpscale ? Math.min(value, 1.08) : Math.min(value, layout.maxUpscale);
}

export function nearestTypeSize(value: number) {
  return allowedTypeSizes.reduce((closest, candidate) =>
    Math.abs(candidate - value) < Math.abs(closest - value) ? candidate : closest,
  );
}

export function createResponsiveMetrics({
  width,
  height,
  allowUpscale = false,
}: {
  width: number;
  height: number;
  allowUpscale?: boolean;
}) {
  const viewportWidth = Platform.OS === "web" ? Math.min(width, layout.maxMobileWidth) : width;
  const sx = scaleFactor(viewportWidth / layout.prototypeWidth, allowUpscale);
  const sy = scaleFactor(height / layout.prototypeHeight, allowUpscale);
  const s = Math.min(sx, sy);

  return {
    width,
    height,
    viewportWidth,
    scaleX: sx,
    scaleY: sy,
    scale: s,
    isCompactWidth: viewportWidth < layout.prototypeWidth,
    isCompactHeight: height < 760,
    isTall: height > 860,
    x: (value: number) => roundLayout(value * sx),
    y: (value: number) => roundLayout(value * sy),
    z: (value: number) => roundLayout(value * s),
    font: (size: TypeSizeName | number) => {
      const base = typeof size === "number" ? size : typeSize[size];
      const scaled = base * Math.min(s, layout.maxFontUpscale);
      return nearestTypeSize(scaled);
    },
    rawFont: (size: number) => roundLayout(size * Math.min(s, layout.maxFontUpscale)),
    clamp,
  };
}

export function useResponsiveMetrics(options?: { allowUpscale?: boolean }) {
  const { width, height } = useWindowDimensions();
  return createResponsiveMetrics({
    width,
    height,
    allowUpscale: options?.allowUpscale,
  });
}

export type ResponsiveMetrics = ReturnType<typeof createResponsiveMetrics>;
