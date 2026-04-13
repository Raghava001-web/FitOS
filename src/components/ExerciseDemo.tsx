import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Ellipse, Line, Rect } from "react-native-svg";
import { useApp } from "../store/AppContext";
import { radius, shadows, spacing } from "../theme";

type DemoRenderer = (motion: number) => React.ReactNode;

const ORANGE = "#f97316";
const SLATE = "#475569";
const BG = "#0f172a";
const TEXT = "#e2e8f0";
const MUTED = "#94a3b8";

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);
const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
const polarX = (x: number, length: number, degrees: number) => x + Math.cos(toRadians(degrees)) * length;
const polarY = (y: number, length: number, degrees: number) => y + Math.sin(toRadians(degrees)) * length;

const renderLatPulldown: DemoRenderer = (motion) => {
  const handleY = 34 + motion * 34;
  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Line x1="34" y1="20" x2="186" y2="20" stroke={SLATE} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="34" cy="20" r="10" fill={ORANGE} />
      <Circle cx="186" cy="20" r="10" fill={ORANGE} />
      <Line x1="110" y1="20" x2="110" y2={handleY} stroke={SLATE} strokeWidth="3" strokeLinecap="round" />
      <Rect x="88" y={handleY} width="44" height="10" rx="5" fill={ORANGE} />
      <Circle cx="110" cy="92" r="10" fill={SLATE} />
      <Line x1="110" y1="102" x2="110" y2="132" stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1="110" y1="112" x2="92" y2={handleY + 10} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="110" y1="112" x2="128" y2={handleY + 10} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Rect x="86" y="128" width="48" height="10" rx="5" fill={SLATE} />
    </Svg>
  );
};

const renderBackSquat: DemoRenderer = (motion) => {
  const bodyDrop = motion * 20;
  const barY = 36 + bodyDrop;
  const headY = 24 + bodyDrop;
  const shoulderY = 46 + bodyDrop;
  const hipY = 80 + bodyDrop * 0.75;
  const kneeY = 112;
  const leftKneeX = 90 - motion * 12;
  const rightKneeX = 130 + motion * 12;

  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Line x1="28" y1={barY} x2="192" y2={barY} stroke={SLATE} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="28" cy={barY} r="10" fill={ORANGE} />
      <Circle cx="192" cy={barY} r="10" fill={ORANGE} />
      <Circle cx="110" cy={headY} r="10" fill={SLATE} />
      <Line x1="110" y1={headY + 12} x2="110" y2={hipY} stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1="110" y1={shoulderY} x2="78" y2={barY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="110" y1={shoulderY} x2="142" y2={barY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="110" y1={hipY} x2={leftKneeX} y2={kneeY} stroke={SLATE} strokeWidth="9" strokeLinecap="round" />
      <Line x1="110" y1={hipY} x2={rightKneeX} y2={kneeY} stroke={SLATE} strokeWidth="9" strokeLinecap="round" />
      <Line x1={leftKneeX} y1={kneeY} x2={76} y2={138} stroke={SLATE} strokeWidth="9" strokeLinecap="round" />
      <Line x1={rightKneeX} y1={kneeY} x2={144} y2={138} stroke={SLATE} strokeWidth="9" strokeLinecap="round" />
      <Line x1="54" y1="138" x2="166" y2="138" stroke={SLATE} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
};

const renderBenchPress: DemoRenderer = (motion) => {
  const barY = 34 + motion * 24;
  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Rect x="36" y="100" width="148" height="10" rx="5" fill={SLATE} />
      <Line x1="28" y1={barY} x2="192" y2={barY} stroke={SLATE} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="28" cy={barY} r="10" fill={ORANGE} />
      <Circle cx="192" cy={barY} r="10" fill={ORANGE} />
      <Circle cx="70" cy="88" r="9" fill={SLATE} />
      <Line x1="82" y1="88" x2="140" y2="88" stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1="92" y1="86" x2="88" y2={barY + 4} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="126" y1="86" x2="132" y2={barY + 4} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="144" y1="92" x2="164" y2="112" stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
      <Line x1="154" y1="112" x2="178" y2="128" stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
    </Svg>
  );
};

const renderBicepCurl: DemoRenderer = (motion) => {
  const shoulderX = 110;
  const shoulderY = 36;
  const elbowX = 110;
  const elbowY = 74;
  const forearmAngle = 88 - motion * 78;
  const wristX = polarX(elbowX, 34, forearmAngle);
  const wristY = polarY(elbowY, 34, forearmAngle);

  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Circle cx={shoulderX} cy="24" r="10" fill={SLATE} />
      <Line x1={shoulderX} y1={shoulderY} x2={shoulderX} y2="114" stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1={shoulderX} y1="48" x2={elbowX} y2={elbowY} stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
      <Line x1={elbowX} y1={elbowY} x2={wristX} y2={wristY} stroke={ORANGE} strokeWidth="8" strokeLinecap="round" />
      <Circle cx={wristX} cy={wristY} r="11" fill={ORANGE} />
      <Line x1="98" y1="114" x2="88" y2="142" stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
      <Line x1="122" y1="114" x2="132" y2="142" stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
    </Svg>
  );
};

const renderRomanianDeadlift: DemoRenderer = (motion) => {
  const hipX = 122;
  const hipY = 84;
  const torsoAngle = -102 - motion * 34;
  const shoulderX = polarX(hipX, 42, torsoAngle);
  const shoulderY = polarY(hipY, 42, torsoAngle);
  const headX = polarX(shoulderX, 14, torsoAngle - 90);
  const headY = polarY(shoulderY, 14, torsoAngle - 90);
  const handX = shoulderX - 8;
  const handY = shoulderY + 36 + motion * 20;
  const barY = handY + 6;

  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Circle cx={headX} cy={headY} r="9" fill={SLATE} />
      <Line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1={hipX} y1={hipY} x2="108" y2="136" stroke={SLATE} strokeWidth="9" strokeLinecap="round" />
      <Line x1={hipX} y1={hipY} x2="138" y2="136" stroke={SLATE} strokeWidth="9" strokeLinecap="round" />
      <Line x1={shoulderX - 4} y1={shoulderY + 6} x2={handX} y2={handY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1={shoulderX + 8} y1={shoulderY + 8} x2={handX + 24} y2={handY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1={handX - 24} y1={barY} x2={handX + 48} y2={barY} stroke={SLATE} strokeWidth="4" strokeLinecap="round" />
      <Circle cx={handX - 24} cy={barY} r="10" fill={ORANGE} />
      <Circle cx={handX + 48} cy={barY} r="10" fill={ORANGE} />
      <Line x1="86" y1="138" x2="154" y2="138" stroke={SLATE} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
};

const renderOverheadPress: DemoRenderer = (motion) => {
  const barY = 72 - motion * 40;
  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Circle cx="110" cy="32" r="10" fill={SLATE} />
      <Line x1="110" y1="44" x2="110" y2="108" stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1="110" y1="60" x2="92" y2="88" stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="110" y1="60" x2="128" y2="88" stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="94" y1="110" x2="84" y2="140" stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
      <Line x1="126" y1="110" x2="136" y2="140" stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
      <Line x1="40" y1={barY} x2="180" y2={barY} stroke={SLATE} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="40" cy={barY} r="10" fill={ORANGE} />
      <Circle cx="180" cy={barY} r="10" fill={ORANGE} />
      <Line x1="92" y1="88" x2="92" y2={barY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="128" y1="88" x2="128" y2={barY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
    </Svg>
  );
};

const renderBarbellRow: DemoRenderer = (motion) => {
  const hipX = 126;
  const hipY = 86;
  const shoulderX = 92;
  const shoulderY = 58;
  const rowY = 108 - motion * 26;

  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Circle cx="88" cy="42" r="9" fill={SLATE} />
      <Line x1={shoulderX} y1={shoulderY} x2={hipX} y2={hipY} stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1={hipX} y1={hipY} x2="112" y2="138" stroke={SLATE} strokeWidth="9" strokeLinecap="round" />
      <Line x1={hipX} y1={hipY} x2="142" y2="138" stroke={SLATE} strokeWidth="9" strokeLinecap="round" />
      <Line x1={shoulderX - 2} y1={shoulderY + 4} x2="92" y2={rowY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1={shoulderX + 16} y1={shoulderY + 8} x2="122" y2={rowY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="64" y1={rowY} x2="150" y2={rowY} stroke={SLATE} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="64" cy={rowY} r="10" fill={ORANGE} />
      <Circle cx="150" cy={rowY} r="10" fill={ORANGE} />
      <Line x1="74" y1="138" x2="154" y2="138" stroke={SLATE} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
};

const renderTricepPushdown: DemoRenderer = (motion) => {
  const elbowLeftX = 98;
  const elbowRightX = 122;
  const elbowY = 64;
  const angle = 52 + motion * 34;
  const handLeftX = polarX(elbowLeftX, 30, angle);
  const handLeftY = polarY(elbowY, 30, angle);
  const handRightX = polarX(elbowRightX, 30, 180 - angle);
  const handRightY = polarY(elbowY, 30, angle);
  const handleY = 36 + motion * 24;

  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Line x1="110" y1="18" x2="110" y2={handleY} stroke={SLATE} strokeWidth="3" strokeLinecap="round" />
      <Rect x="96" y={handleY} width="28" height="10" rx="5" fill={ORANGE} />
      <Circle cx="110" cy="30" r="10" fill={SLATE} />
      <Line x1="110" y1="42" x2="110" y2="108" stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1="110" y1="54" x2={elbowLeftX} y2={elbowY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="110" y1="54" x2={elbowRightX} y2={elbowY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1={elbowLeftX} y1={elbowY} x2={handLeftX} y2={handLeftY} stroke={ORANGE} strokeWidth="8" strokeLinecap="round" />
      <Line x1={elbowRightX} y1={elbowY} x2={handRightX} y2={handRightY} stroke={ORANGE} strokeWidth="8" strokeLinecap="round" />
      <Line x1="98" y1="110" x2="88" y2="140" stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
      <Line x1="122" y1="110" x2="132" y2="140" stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
    </Svg>
  );
};

const renderPullUp: DemoRenderer = (motion) => {
  const bodyLift = motion * 28;
  const shoulderY = 68 - bodyLift;
  const hipY = 100 - bodyLift;
  const kneeY = 128 - bodyLift * 0.45;

  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Line x1="34" y1="22" x2="186" y2="22" stroke={SLATE} strokeWidth="4" strokeLinecap="round" />
      <Circle cx="34" cy="22" r="10" fill={ORANGE} />
      <Circle cx="186" cy="22" r="10" fill={ORANGE} />
      <Circle cx="110" cy={shoulderY - 16} r="10" fill={SLATE} />
      <Line x1="82" y1="22" x2="100" y2={shoulderY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="138" y1="22" x2="120" y2={shoulderY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="110" y1={shoulderY} x2="110" y2={hipY} stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1="110" y1={hipY} x2="96" y2={kneeY} stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
      <Line x1="110" y1={hipY} x2="124" y2={kneeY} stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
    </Svg>
  );
};

const renderPlank: DemoRenderer = (motion) => {
  const ringRadius = 10 + motion * 10;
  const glowOpacity = clamp(0.12 + motion * 0.25, 0.12, 0.4);
  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Circle cx="58" cy="82" r="10" fill={SLATE} />
      <Line x1="68" y1="82" x2="156" y2="74" stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1="52" y1="92" x2="40" y2="118" stroke={ORANGE} strokeWidth="8" strokeLinecap="round" />
      <Line x1="150" y1="80" x2="178" y2="112" stroke={ORANGE} strokeWidth="8" strokeLinecap="round" />
      <Ellipse cx="114" cy="78" rx={ringRadius + 8} ry={ringRadius} fill={ORANGE} opacity={glowOpacity} />
    </Svg>
  );
};

const renderLateralRaise: DemoRenderer = (motion) => {
  const raiseY = 96 - motion * 34;
  const leftX = 82 - motion * 28;
  const rightX = 138 + motion * 28;

  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Circle cx="110" cy="26" r="10" fill={SLATE} />
      <Line x1="110" y1="38" x2="110" y2="104" stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1="110" y1="56" x2={leftX} y2={raiseY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="110" y1="56" x2={rightX} y2={raiseY} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Circle cx={leftX} cy={raiseY} r="10" fill={ORANGE} />
      <Circle cx={rightX} cy={raiseY} r="10" fill={ORANGE} />
      <Line x1="98" y1="106" x2="88" y2="140" stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
      <Line x1="122" y1="106" x2="132" y2="140" stroke={SLATE} strokeWidth="8" strokeLinecap="round" />
    </Svg>
  );
};

const renderSprintIntervals: DemoRenderer = (motion) => {
  const stride = motion * 18;
  return (
    <Svg width={220} height={150} viewBox="0 0 220 150">
      <Circle cx="116" cy="28" r="9" fill={SLATE} />
      <Line x1="116" y1="40" x2="106" y2="78" stroke={SLATE} strokeWidth="10" strokeLinecap="round" />
      <Line x1="106" y1="54" x2={82 - stride * 0.3} y2={72 - stride * 0.2} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="110" y1="58" x2={134 + stride * 0.6} y2={46 + stride * 0.2} stroke={SLATE} strokeWidth="7" strokeLinecap="round" />
      <Line x1="106" y1="78" x2={84 - stride} y2="116" stroke={ORANGE} strokeWidth="8" strokeLinecap="round" />
      <Line x1="106" y1="78" x2={138 + stride} y2="112" stroke={ORANGE} strokeWidth="8" strokeLinecap="round" />
      <Line x1="54" y1="138" x2="176" y2="138" stroke={SLATE} strokeWidth="4" strokeLinecap="round" />
    </Svg>
  );
};

const demos: Record<string, DemoRenderer> = {
  "Lat Pulldown": renderLatPulldown,
  "Back Squat": renderBackSquat,
  "Bench Press": renderBenchPress,
  "Bicep Curl": renderBicepCurl,
  "Romanian Deadlift": renderRomanianDeadlift,
  "Overhead Press": renderOverheadPress,
  "Barbell Row": renderBarbellRow,
  "Tricep Pushdown": renderTricepPushdown,
  "Pull-Up": renderPullUp,
  Plank: renderPlank,
  "Lateral Raise": renderLateralRaise,
  "Sprint Intervals": renderSprintIntervals
};

const captions: Record<string, string> = {
  "Lat Pulldown": "Pull the bar toward the upper chest while keeping the torso stacked.",
  "Back Squat": "Lower under control, keep the brace, and drive back up through the floor.",
  "Bench Press": "Bring the bar to the chest, pause with control, then press back to lockout.",
  "Bicep Curl": "Keep the upper arm quiet and rotate the forearm through the curl.",
  "Romanian Deadlift": "Push the hips back, keep the bar close, then return with hip drive.",
  "Overhead Press": "Start from the shoulders and press the bar to full overhead lockout.",
  "Barbell Row": "Hold the hinge and pull the bar into the lower chest.",
  "Tricep Pushdown": "Keep elbows pinned and extend the forearms straight down.",
  "Pull-Up": "Pull the body to the bar, then return to a full hang with control.",
  Plank: "Hold one long line and brace hard enough that the core keeps pulsing with tension.",
  "Lateral Raise": "Lift out to the side without swinging through the torso.",
  "Sprint Intervals": "Fast turnover, forward intent, and clean stride timing."
};

export function ExerciseDemo({ name }: { name: string }) {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTick((current) => (current + 1) % 120);
    }, 40);

    return () => {
      clearInterval(interval);
    };
  }, [name]);

  const motion = useMemo(() => {
    const radians = (tick / 120) * Math.PI * 2;
    return (Math.sin(radians - Math.PI / 2) + 1) / 2;
  }, [tick]);

  const renderDemo = demos[name] ?? demos["Lat Pulldown"];
  const caption = captions[name] ?? captions["Lat Pulldown"];

  return (
    <View style={styles.wrap}>
      <View style={styles.canvas}>{renderDemo(motion)}</View>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    wrap: {
      backgroundColor: palette.panel,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadows.card
    },
    canvas: {
      height: 150,
      alignItems: "center",
      justifyContent: "center"
    },
    caption: {
      color: palette.textMuted,
      lineHeight: 24,
      textAlign: "center",
      fontSize: 15
    }
  });


