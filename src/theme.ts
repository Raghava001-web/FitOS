import { ThemeMode } from "./types";

export type AppPalette = {
  background: string;
  backgroundSoft: string;
  panel: string;
  panelAlt: string;
  panelMuted: string;
  line: string;
  text: string;
  textMuted: string;
  teal: string;
  lime: string;
  orange: string;
  red: string;
  blue: string;
  gold: string;
  clay: string;
  surfaceGlow: string;
  heroBadge: string;
  inputSurface: string;
  trackSurface: string;
  shareSurface: string;
  successSoft: string;
  warningSoft: string;
  dangerSoft: string;
  heatEmpty: string;
  heatLow: string;
  heatMid: string;
  heatHigh: string;
  reportCanvas: string;
  reportText: string;
  reportMute: string;
  reportBlue: string;
  reportMint: string;
  reportAmber: string;
  reportLilac: string;
  buttonTextOnAccent: string;
};

export const darkColors: AppPalette = {
  background: "#060a14",
  backgroundSoft: "#0a0e1a",
  panel: "rgba(17, 24, 39, 0.88)",
  panelAlt: "rgba(26, 34, 54, 0.78)",
  panelMuted: "rgba(36, 48, 73, 0.72)",
  line: "rgba(255, 255, 255, 0.06)",
  text: "#ffffff",
  textMuted: "#94a3b8",
  teal: "#22d3ee",
  lime: "#4ade80",
  orange: "#22d3ee",
  red: "#f87171",
  blue: "#0e7490",
  gold: "#facc15",
  clay: "#243049",
  surfaceGlow: "rgba(34, 211, 238, 0.12)",
  heroBadge: "rgba(17, 24, 39, 0.82)",
  inputSurface: "rgba(10, 14, 26, 0.92)",
  trackSurface: "rgba(10, 14, 26, 0.84)",
  shareSurface: "rgba(17, 24, 39, 0.9)",
  successSoft: "rgba(74, 222, 128, 0.12)",
  warningSoft: "rgba(250, 204, 21, 0.12)",
  dangerSoft: "rgba(248, 113, 113, 0.12)",
  heatEmpty: "rgba(255, 255, 255, 0.06)",
  heatLow: "rgba(34, 211, 238, 0.2)",
  heatMid: "rgba(34, 211, 238, 0.42)",
  heatHigh: "#22d3ee",
  reportCanvas: "rgba(17, 24, 39, 0.92)",
  reportText: "#ffffff",
  reportMute: "#94a3b8",
  reportBlue: "rgba(34, 211, 238, 0.12)",
  reportMint: "rgba(74, 222, 128, 0.12)",
  reportAmber: "rgba(250, 204, 21, 0.12)",
  reportLilac: "rgba(148, 163, 184, 0.12)",
  buttonTextOnAccent: "#ffffff"
};

export const lightColors: AppPalette = {
  background: "#f3f7fb",
  backgroundSoft: "#edf3f8",
  panel: "rgba(255, 255, 255, 0.94)",
  panelAlt: "rgba(248, 250, 252, 0.96)",
  panelMuted: "rgba(241, 245, 249, 0.96)",
  line: "rgba(15, 23, 42, 0.08)",
  text: "#0a0a0a",
  textMuted: "#475569",
  teal: "#22d3ee",
  lime: "#16a34a",
  orange: "#0891b2",
  red: "#dc2626",
  blue: "#0e7490",
  gold: "#ca8a04",
  clay: "#dbeafe",
  surfaceGlow: "rgba(34, 211, 238, 0.08)",
  heroBadge: "rgba(255, 255, 255, 0.82)",
  inputSurface: "#ffffff",
  trackSurface: "#f8fafc",
  shareSurface: "#ffffff",
  successSoft: "rgba(34, 197, 94, 0.08)",
  warningSoft: "rgba(234, 179, 8, 0.08)",
  dangerSoft: "rgba(239, 68, 68, 0.08)",
  heatEmpty: "rgba(15, 23, 42, 0.08)",
  heatLow: "rgba(34, 211, 238, 0.16)",
  heatMid: "rgba(34, 211, 238, 0.28)",
  heatHigh: "#0e7490",
  reportCanvas: "#ffffff",
  reportText: "#0a0a0a",
  reportMute: "#475569",
  reportBlue: "rgba(34, 211, 238, 0.08)",
  reportMint: "rgba(34, 197, 94, 0.08)",
  reportAmber: "rgba(234, 179, 8, 0.08)",
  reportLilac: "rgba(148, 163, 184, 0.08)",
  buttonTextOnAccent: "#ffffff"
};

export const colors = darkColors;

export const getThemePalette = (mode: ThemeMode) =>
  mode === "light" ? lightColors : darkColors;

export const spacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 16,
  pill: 999
};

export const shadows = {
  card: {
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.16,
    shadowRadius: 20,
    elevation: 4
  }
};
