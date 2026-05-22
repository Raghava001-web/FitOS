export type ThemeMode = "dark" | "light";

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
  background: "#0A0A0A",
  backgroundSoft: "#121212",
  panel: "#111111",
  panelAlt: "#151515",
  panelMuted: "#1B1B1B",
  line: "#1F1F1F",
  text: "#FFFFFF",
  textMuted: "#A1A1AA",
  teal: "#38BDF8",
  lime: "#84CC16",
  orange: "#F97316",
  red: "#EF4444",
  blue: "#60A5FA",
  gold: "#F59E0B",
  clay: "#171717",
  surfaceGlow: "rgba(249, 115, 22, 0.10)",
  heroBadge: "rgba(17, 17, 17, 0.92)",
  inputSurface: "#131313",
  trackSurface: "#101010",
  shareSurface: "#111111",
  successSoft: "rgba(132, 204, 22, 0.12)",
  warningSoft: "rgba(245, 158, 11, 0.12)",
  dangerSoft: "rgba(239, 68, 68, 0.12)",
  heatEmpty: "#181818",
  heatLow: "rgba(249, 115, 22, 0.28)",
  heatMid: "rgba(249, 115, 22, 0.5)",
  heatHigh: "#F97316",
  reportCanvas: "#0F0F0F",
  reportText: "#FFFFFF",
  reportMute: "#A1A1AA",
  reportBlue: "rgba(96, 165, 250, 0.14)",
  reportMint: "rgba(132, 204, 22, 0.14)",
  reportAmber: "rgba(245, 158, 11, 0.14)",
  reportLilac: "rgba(168, 85, 247, 0.14)",
  buttonTextOnAccent: "#FFFFFF",
};

export const lightColors: AppPalette = {
  background: "#F5F5F5",
  backgroundSoft: "#FFFFFF",
  panel: "#FFFFFF",
  panelAlt: "#FAFAFA",
  panelMuted: "#F0F0F0",
  line: "#E5E5E5",
  text: "#0A0A0A",
  textMuted: "#71717A",
  teal: "#0EA5E9",
  lime: "#65A30D",
  orange: "#F97316",
  red: "#DC2626",
  blue: "#2563EB",
  gold: "#D97706",
  clay: "#EFEFEF",
  surfaceGlow: "rgba(249, 115, 22, 0.08)",
  heroBadge: "rgba(255, 255, 255, 0.94)",
  inputSurface: "#FFFFFF",
  trackSurface: "#FFFFFF",
  shareSurface: "#FFFFFF",
  successSoft: "rgba(101, 163, 13, 0.12)",
  warningSoft: "rgba(217, 119, 6, 0.12)",
  dangerSoft: "rgba(220, 38, 38, 0.12)",
  heatEmpty: "#EAEAEA",
  heatLow: "rgba(249, 115, 22, 0.22)",
  heatMid: "rgba(249, 115, 22, 0.42)",
  heatHigh: "#F97316",
  reportCanvas: "#FFFFFF",
  reportText: "#0A0A0A",
  reportMute: "#71717A",
  reportBlue: "rgba(37, 99, 235, 0.10)",
  reportMint: "rgba(101, 163, 13, 0.10)",
  reportAmber: "rgba(217, 119, 6, 0.10)",
  reportLilac: "rgba(168, 85, 247, 0.10)",
  buttonTextOnAccent: "#FFFFFF",
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
  hero: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.18,
    shadowRadius: 28,
    elevation: 6
  },
  card: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 18,
    elevation: 3
  }
};
