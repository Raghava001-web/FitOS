import React, { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { GhostButton, PrimaryButton, SectionCard } from "../components/ui";
import { getBodyCompositionLabel } from "../engine/fitness";
import { useApp } from "../store/AppContext";
import { radius, shadows, spacing } from "../theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExerciseStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<ExerciseStackParamList, "Readiness">;

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const ScoreDial = ({
  value,
  color,
  palette,
}: {
  value: number;
  color: string;
  palette: ReturnType<typeof useApp>["palette"];
}) => {
  const size = 220;
  const strokeWidth = 16;
  const ringRadius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * ringRadius;
  const safeValue = clamp(value, 0, 100);
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: safeValue,
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, safeValue]);

  const strokeDashoffset = progress.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, circumference * (1 - safeValue / 100)],
  });

  return (
    <View style={dialStyles.wrap}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={ringRadius}
          stroke={palette.line}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={ringRadius}
          stroke={`${color}26`}
          strokeWidth={strokeWidth + 8}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={ringRadius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          fill="none"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={dialStyles.center}>
        <Text style={[dialStyles.scoreValue, { color }]}>{Math.round(safeValue)}</Text>
        <Text style={[dialStyles.scoreLabel, { color: palette.textMuted }]}>out of 100</Text>
      </View>
    </View>
  );
};

const dialStyles = StyleSheet.create({
  wrap: {
    width: 220,
    height: 220,
    alignItems: "center",
    justifyContent: "center",
  },
  center: {
    position: "absolute",
    alignItems: "center",
    gap: 4,
  },
  scoreValue: {
    fontSize: 56,
    lineHeight: 60,
    fontWeight: "800",
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
});

const FactorBar = ({
  label,
  value,
  note,
  color,
  palette,
}: {
  label: string;
  value: number;
  note: string;
  color: string;
  palette: ReturnType<typeof useApp>["palette"];
}) => {
  const width = `${clamp(value, 0, 100)}%` as const;

  return (
    <View style={[factorStyles.row, { borderBottomColor: palette.line }]}>
      <View style={factorStyles.topRow}>
        <Text style={[factorStyles.label, { color: palette.text }]}>{label}</Text>
        <Text style={[factorStyles.value, { color }]}>{Math.round(clamp(value, 0, 100))}</Text>
      </View>
      <View style={[factorStyles.track, { backgroundColor: palette.panelAlt }]}>
        <View style={[factorStyles.fill, { width, backgroundColor: color }]} />
      </View>
      <Text style={[factorStyles.note, { color: palette.textMuted }]}>{note}</Text>
    </View>
  );
};

const factorStyles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
  },
  value: {
    fontSize: 14,
    fontWeight: "800",
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: "hidden",
  },
  fill: {
    height: 8,
    borderRadius: 999,
  },
  note: {
    fontSize: 13,
    lineHeight: 20,
  },
});

export const ReadinessScreen = ({ navigation }: Props) => {
  const { state, metrics, palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const profile = state.profile;

  if (!metrics || !profile) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <GhostButton label="Back" onPress={() => navigation.goBack()} />
        <View style={styles.heroIntro}>
          <Text style={styles.eyebrow}>Coach intelligence</Text>
          <Text style={styles.headline}>Readiness</Text>
          <Text style={styles.copy}>Complete onboarding to unlock the daily readiness breakdown.</Text>
        </View>
      </ScrollView>
    );
  }

  const readiness = metrics.readinessScore;
  const stress = metrics.stressScore;
  const recovery = metrics.recoveryPotential;
  const progression = metrics.safeProgressionRangePct;
  const bodyComp = getBodyCompositionLabel(profile.bodyFatPct ?? 18);
  const sleepSignal = clamp(
    Math.round((Math.min(profile.sleepHours, 8) / 8) * 55 + profile.sleepQuality * 9),
    0,
    100
  );
  const workLoad = clamp(profile.workHoursPerDay * 7 + profile.workDaysPerWeek * 4, 0, 100);
  const weeklyLoad = clamp(metrics.totalSetsWeek * 6, 0, 100);

  const zone =
    readiness >= 70
      ? {
          color: palette.lime,
          icon: "flash" as const,
          shortLabel: "Push",
          title: "Green zone",
          summary: "Your body is ready for normal loading and clean progression today.",
        }
      : readiness >= 40
        ? {
            color: palette.gold,
            icon: "pulse" as const,
            shortLabel: "Hold",
            title: "Yellow zone",
            summary: "You can train today, but the goal is quality work rather than force.",
          }
        : {
            color: palette.red,
            icon: "shield-checkmark" as const,
            shortLabel: "Recover",
            title: "Red zone",
            summary: "Recovery work will move you forward more than heavy loading right now.",
          };

  const loadModeCopy: Record<string, string> = {
    rest: "Rest day. Keep loading off the table.",
    recovery: "Recovery mode. Trim working loads and stay submaximal.",
    moderate: "Moderate load. Train with intent, but do not chase new PRs.",
    high: "Full load. Your current recovery supports a normal progression day.",
  };

  const actionSteps =
    readiness >= 70
      ? [
          "Run your main working sets as planned.",
          `Progress only inside the ${progression}% safe jump band.`,
          "Use this session to build momentum, not to get reckless."
        ]
      : readiness >= 40
        ? [
            "Keep the session, but cut intensity by around 10-15%.",
            "Choose cleaner reps over aggressive top sets.",
            "Respect rest periods and stop one rep earlier than usual."
          ]
        : [
            "Swap heavy work for mobility, walking, or technique volume.",
            "Do not attempt large jumps or low-rep grinders today.",
            "Protect tonight's sleep and let recovery become the win."
          ];

  const injuryNote =
    profile.injuries.length > 0
      ? `Medical flags active: ${profile.injuries.map((injury) => injury.area).join(", ")}. Keep exercise selection and range of motion conservative.`
      : "No injury flags are currently shaping today's load decisions.";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <GhostButton label="Back" onPress={() => navigation.goBack()} />

      <View style={styles.heroIntro}>
        <Text style={styles.eyebrow}>Coach intelligence</Text>
        <Text style={styles.headline}>Readiness</Text>
        <Text style={styles.heroCopy}>
          One score, one call, and the reasons underneath it. This should tell you what kind of training day you are walking into.
        </Text>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.heroHeaderRow}>
          <View style={styles.heroTitleWrap}>
            <Text style={styles.heroLabel}>Today's readiness</Text>
            <Text style={styles.heroTitle}>{zone.title}</Text>
            <Text style={styles.heroSummary}>{zone.summary}</Text>
          </View>
          <View style={[styles.zoneBadge, { backgroundColor: `${zone.color}18`, borderColor: `${zone.color}44` }]}>
            <Ionicons name={zone.icon} size={18} color={zone.color} />
            <Text style={[styles.zoneBadgeText, { color: zone.color }]}>{zone.shortLabel}</Text>
          </View>
        </View>

        <View style={styles.heroMainRow}>
          <ScoreDial value={readiness} color={zone.color} palette={palette} />

          <View style={styles.heroCoachCard}>
            <Text style={styles.heroCoachLabel}>Coach call</Text>
            <Text style={styles.heroCoachTitle}>{metrics.trainingLoadSuitability}</Text>
            <Text style={styles.heroCoachCopy}>
              {loadModeCopy[metrics.trainingLoadSuitability] ?? "Use the score to guide the session, not to fight it."}
            </Text>
            <View style={styles.heroCoachMeta}>
              <View style={styles.heroMiniCard}>
                <Text style={styles.heroMiniLabel}>Safe jump</Text>
                <Text style={styles.heroMiniValue}>{progression}%</Text>
              </View>
              <View style={styles.heroMiniCard}>
                <Text style={styles.heroMiniLabel}>Recovery</Text>
                <Text style={styles.heroMiniValue}>{recovery}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.signalRow}>
          <View style={styles.signalCard}>
            <Text style={styles.signalLabel}>Sleep</Text>
            <Text style={styles.signalValue}>{profile.sleepHours}h</Text>
            <Text style={styles.signalNote}>quality {profile.sleepQuality}/5</Text>
          </View>
          <View style={styles.signalCard}>
            <Text style={styles.signalLabel}>Stress</Text>
            <Text style={[styles.signalValue, { color: stress >= 60 ? palette.red : palette.text }]}>{stress}</Text>
            <Text style={styles.signalNote}>{profile.lifestyleStress}</Text>
          </View>
          <View style={styles.signalCard}>
            <Text style={styles.signalLabel}>Weekly sets</Text>
            <Text style={styles.signalValue}>{metrics.totalSetsWeek}</Text>
            <Text style={styles.signalNote}>recent load</Text>
          </View>
        </View>
      </View>

      <SectionCard
        title="Why the score landed here"
        subtitle="The score only feels trustworthy when the underlying signals are visible."
        accent={zone.color}
      >
        <FactorBar
          label="Sleep signal"
          value={sleepSignal}
          color={profile.sleepHours >= 7 ? palette.lime : palette.gold}
          note={`${profile.sleepHours}h sleep with quality ${profile.sleepQuality}/5 from last night.`}
          palette={palette}
        />
        <FactorBar
          label="Stress load"
          value={stress}
          color={stress <= 30 ? palette.lime : stress <= 60 ? palette.gold : palette.red}
          note={`Lifestyle stress is ${profile.lifestyleStress} with ${profile.workHoursPerDay} work hours per day.`}
          palette={palette}
        />
        <FactorBar
          label="Recovery potential"
          value={recovery}
          color={palette.teal}
          note={`Recovery consistency is ${profile.recoveryConsistency} and activity level is ${profile.activityLevel}.`}
          palette={palette}
        />
        <FactorBar
          label="Weekly workload"
          value={weeklyLoad}
          color={palette.orange}
          note={`${metrics.totalSetsWeek} sets and ${metrics.totalWeightLiftedWeek} kg moved in the last 7 days.`}
          palette={palette}
        />
        <FactorBar
          label="Workload drag"
          value={workLoad}
          color={workLoad >= 70 ? palette.red : palette.gold}
          note={`${profile.workDaysPerWeek} work days per week means recovery has to compete with real life load.`}
          palette={palette}
        />
      </SectionCard>

      <SectionCard
        title="Coach plan for today"
        subtitle="This should feel like advice you can act on immediately."
        accent={palette.orange}
      >
        <View style={styles.planList}>
          {actionSteps.map((step) => (
            <View key={step} style={styles.planRow}>
              <View style={[styles.planDot, { backgroundColor: zone.color }]} />
              <Text style={styles.planText}>{step}</Text>
            </View>
          ))}
        </View>

        <View style={styles.cautionCard}>
          <Text style={styles.cautionLabel}>Safety context</Text>
          <Text style={styles.cautionText}>{injuryNote}</Text>
        </View>
      </SectionCard>

      <SectionCard
        title="Body and block context"
        subtitle="Readiness should fit your body data and the training block around it."
        accent={palette.blue}
      >
        <View style={styles.contextGrid}>
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>BMI</Text>
            <Text style={styles.contextValue}>{metrics.bmi.toFixed(1)}</Text>
            <Text style={styles.contextNote}>{metrics.bmiLabel}</Text>
          </View>
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Body fat</Text>
            <Text style={styles.contextValue}>{profile.bodyFatPct}%</Text>
            <Text style={styles.contextNote}>{bodyComp}</Text>
          </View>
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Consistency</Text>
            <Text style={styles.contextValue}>{metrics.consistencyRank}</Text>
            <Text style={styles.contextNote}>habit rank</Text>
          </View>
          <View style={styles.contextCard}>
            <Text style={styles.contextLabel}>Volume</Text>
            <Text style={styles.contextValue}>{metrics.totalWeightLiftedWeek}</Text>
            <Text style={styles.contextNote}>kg this week</Text>
          </View>
        </View>
      </SectionCard>

      <PrimaryButton label="Back to training" onPress={() => navigation.goBack()} />
    </ScrollView>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.background,
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 120,
      gap: spacing.lg,
    },
    heroIntro: {
      gap: 8,
    },
    eyebrow: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    headline: {
      color: palette.text,
      fontSize: 38,
      fontWeight: "800",
    },
    heroCopy: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24,
    },
    copy: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24,
    },
    heroCard: {
      backgroundColor: palette.panel,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.lg,
      ...shadows.card,
    },
    heroHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      gap: spacing.md,
    },
    heroTitleWrap: {
      flex: 1,
      gap: 6,
    },
    heroLabel: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    heroTitle: {
      color: palette.text,
      fontSize: 28,
      fontWeight: "800",
    },
    heroSummary: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24,
    },
    zoneBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: radius.pill,
      borderWidth: 1,
    },
    zoneBadgeText: {
      fontSize: 13,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    heroMainRow: {
      gap: spacing.lg,
      alignItems: "center",
    },
    heroCoachCard: {
      width: "100%",
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      ...shadows.card,
    },
    heroCoachLabel: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    heroCoachTitle: {
      color: palette.text,
      fontSize: 24,
      fontWeight: "800",
      textTransform: "capitalize",
    },
    heroCoachCopy: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24,
    },
    heroCoachMeta: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    heroMiniCard: {
      flex: 1,
      backgroundColor: palette.panel,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: 4,
    },
    heroMiniLabel: {
      color: palette.textMuted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 1.4,
      textTransform: "uppercase",
    },
    heroMiniValue: {
      color: palette.orange,
      fontSize: 24,
      fontWeight: "800",
    },
    signalRow: {
      flexDirection: "row",
      gap: spacing.sm,
      flexWrap: "wrap",
    },
    signalCard: {
      flex: 1,
      minWidth: 96,
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 4,
      ...shadows.card,
    },
    signalLabel: {
      color: palette.textMuted,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },
    signalValue: {
      color: palette.text,
      fontSize: 28,
      lineHeight: 32,
      fontWeight: "800",
    },
    signalNote: {
      color: palette.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
    planList: {
      gap: spacing.sm,
    },
    planRow: {
      flexDirection: "row",
      gap: spacing.sm,
      alignItems: "flex-start",
    },
    planDot: {
      width: 10,
      height: 10,
      borderRadius: 999,
      marginTop: 7,
    },
    planText: {
      flex: 1,
      color: palette.text,
      fontSize: 15,
      lineHeight: 24,
      fontWeight: "600",
    },
    cautionCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 6,
      ...shadows.card,
    },
    cautionLabel: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    cautionText: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24,
    },
    contextGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    contextCard: {
      flexBasis: "48%",
      flexGrow: 1,
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 4,
      ...shadows.card,
    },
    contextLabel: {
      color: palette.textMuted,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.4,
    },
    contextValue: {
      color: palette.text,
      fontSize: 26,
      lineHeight: 30,
      fontWeight: "800",
    },
    contextNote: {
      color: palette.textMuted,
      fontSize: 13,
      lineHeight: 18,
    },
  });
