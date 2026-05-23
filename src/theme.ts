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
  background: "#121210",
  backgroundSoft: "#181816",
  panel: "#1E1E1C",
  panelAlt: "#262622",
  panelMuted: "#2D2D29",
  line: "transparent",
  text: "#F4F4EC",
  textMuted: "#8E8F83",
  teal: "#C59E6F",
  lime: "#81A675",
  orange: "#D19C60",
  red: "#B84F4F",
  blue: "#7992B4",
  gold: "#DFB15B",
  clay: "#2D2D29",
  surfaceGlow: "rgba(209, 156, 96, 0.08)",
  heroBadge: "rgba(30, 30, 28, 0.92)",
  inputSurface: "#181816",
  trackSurface: "#121210",
  shareSurface: "#1E1E1C",
  successSoft: "rgba(129, 166, 117, 0.12)",
  warningSoft: "rgba(223, 177, 91, 0.12)",
  dangerSoft: "rgba(184, 79, 79, 0.12)",
  heatEmpty: "#1E1E1C",
  heatLow: "rgba(209, 156, 96, 0.28)",
  heatMid: "rgba(209, 156, 96, 0.5)",
  heatHigh: "#D19C60",
  reportCanvas: "#121210",
  reportText: "#F4F4EC",
  reportMute: "#8E8F83",
  reportBlue: "rgba(121, 146, 180, 0.14)",
  reportMint: "rgba(129, 166, 117, 0.14)",
  reportAmber: "rgba(223, 177, 91, 0.14)",
  reportLilac: "rgba(168, 85, 247, 0.14)",
  buttonTextOnAccent: "#121210",
};

export const lightColors: AppPalette = {
  background: "#F4F4EC",
  backgroundSoft: "#F9F9F4",
  panel: "#FFFFFF",
  panelAlt: "#FAF9F5",
  panelMuted: "#EFECE3",
  line: "transparent",
  text: "#121210",
  textMuted: "#6B6C60",
  teal: "#C59E6F",
  lime: "#5E7C55",
  orange: "#A37542",
  red: "#963A3A",
  blue: "#4E6686",
  gold: "#A87D2D",
  clay: "#EFECE3",
  surfaceGlow: "rgba(163, 117, 66, 0.08)",
  heroBadge: "rgba(255, 255, 255, 0.94)",
  inputSurface: "#FFFFFF",
  trackSurface: "#FFFFFF",
  shareSurface: "#FFFFFF",
  successSoft: "rgba(94, 124, 85, 0.10)",
  warningSoft: "rgba(168, 125, 45, 0.10)",
  dangerSoft: "rgba(150, 58, 58, 0.10)",
  heatEmpty: "#EAE7DD",
  heatLow: "rgba(163, 117, 66, 0.22)",
  heatMid: "rgba(163, 117, 66, 0.42)",
  heatHigh: "#A37542",
  reportCanvas: "#FFFFFF",
  reportText: "#121210",
  reportMute: "#6B6C60",
  reportBlue: "rgba(78, 102, 134, 0.10)",
  reportMint: "rgba(94, 124, 85, 0.10)",
  reportAmber: "rgba(168, 125, 45, 0.10)",
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
