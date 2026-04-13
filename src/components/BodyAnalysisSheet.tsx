import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useApp } from "../store/AppContext";
import { radius, shadows, spacing } from "../theme";
import { DerivedMetrics, UserProfile } from "../types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const getWeightForBMI = (heightCm: number, bmi: number) => {
  const meters = heightCm / 100;
  return bmi * meters * meters;
};

const formatSigned = (value: number) => `${value > 0 ? "+" : ""}${value.toFixed(1)} kg`;

const ReportBar = ({
  label,
  value,
  range,
  fillPct,
  fillColor
}: {
  label: string;
  value: string;
  range: string;
  fillPct: number;
  fillColor: string;
}) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.reportRow}>
      <View style={styles.reportRowTop}>
        <Text style={styles.reportLabel}>{label}</Text>
        <Text style={styles.reportValue}>{value}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.trackFill, { width: `${clamp(fillPct, 8, 100)}%`, backgroundColor: fillColor }]} />
      </View>
      <Text style={styles.reportRange}>Recommended range: {range}</Text>
    </View>
  );
};

export const BodyAnalysisSheet = ({
  profile,
  metrics
}: {
  profile: UserProfile;
  metrics: DerivedMetrics;
}) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const leanMass = profile.weightKg * (1 - profile.bodyFatPct / 100);
  const fatMass = profile.weightKg * (profile.bodyFatPct / 100);
  const targetBMI = profile.primaryGoal === "fat loss" ? 22 : profile.primaryGoal === "bulking" ? 24.2 : 23;
  const targetWeight = getWeightForBMI(profile.heightCm, targetBMI);
  const targetDelta = targetWeight - profile.weightKg;
  const bmiZone = metrics.bmi < 18.5 ? "Under" : metrics.bmi < 25 ? "Balanced" : metrics.bmi < 30 ? "Over" : "High";
  const diagnosisColors = [palette.reportMint, "#d7f5cf", "#fff2c9", "#ffd8c2", "#ffc7c7"];
  const activeZoneIndex = metrics.bmi < 18.5 ? 0 : metrics.bmi < 25 ? 1 : metrics.bmi < 30 ? 2 : metrics.bmi < 35 ? 3 : 4;

  return (
    <View style={styles.sheet}>
      <View style={styles.sheetHeader}>
        <View>
          <Text style={styles.sheetTitle}>Human Body Composition Analysis</Text>
          <Text style={styles.sheetSub}>Reference view for BMI, recovery, body fat, and weight control</Text>
        </View>
        <View style={styles.dateTag}>
          <Text style={styles.dateTagText}>{new Date().toLocaleDateString("en-GB")}</Text>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={[styles.summaryBox, { backgroundColor: palette.reportBlue }]}>
          <Text style={styles.summaryLabel}>Weight</Text>
          <Text style={styles.summaryValue}>{profile.weightKg} kg</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: palette.reportMint }]}>
          <Text style={styles.summaryLabel}>BMI</Text>
          <Text style={styles.summaryValue}>{metrics.bmi}</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: palette.reportAmber }]}>
          <Text style={styles.summaryLabel}>Body Fat</Text>
          <Text style={styles.summaryValue}>{profile.bodyFatPct}%</Text>
        </View>
        <View style={[styles.summaryBox, { backgroundColor: palette.reportLilac }]}>
          <Text style={styles.summaryLabel}>Readiness</Text>
          <Text style={styles.summaryValue}>{metrics.readinessScore}/100</Text>
        </View>
      </View>

      <View style={styles.columns}>
        <View style={styles.column}>
          <View style={[styles.sectionBlock, { backgroundColor: palette.reportBlue }]}>
            <Text style={styles.sectionTitle}>1. Body Balance</Text>
            <ReportBar
              label="Body Mass Index"
              value={`${metrics.bmi} (${metrics.bmiLabel})`}
              range="18.5 - 24.9"
              fillPct={(metrics.bmi / 35) * 100}
              fillColor={palette.blue}
            />
            <ReportBar
              label="Body Fat"
              value={`${profile.bodyFatPct}%`}
              range="10 - 20%"
              fillPct={(profile.bodyFatPct / 35) * 100}
              fillColor={palette.orange}
            />
            <ReportBar
              label="Lean Mass"
              value={`${leanMass.toFixed(1)} kg`}
              range={`${(profile.weightKg * 0.72).toFixed(1)} - ${(profile.weightKg * 0.9).toFixed(1)} kg`}
              fillPct={(leanMass / profile.weightKg) * 100}
              fillColor={palette.teal}
            />
          </View>

          <View style={[styles.sectionBlock, { backgroundColor: palette.reportMint }]}>
            <Text style={styles.sectionTitle}>2. Recovery Status</Text>
            <ReportBar
              label="Readiness"
              value={`${metrics.readinessScore}/100`}
              range="40 - 100"
              fillPct={metrics.readinessScore}
              fillColor={palette.lime}
            />
            <ReportBar
              label="Recovery Potential"
              value={`${metrics.recoveryPotential}/100`}
              range="55 - 100"
              fillPct={metrics.recoveryPotential}
              fillColor={palette.teal}
            />
            <ReportBar
              label="Stress Score"
              value={`${metrics.stressScore}/100`}
              range="0 - 45"
              fillPct={metrics.stressScore}
              fillColor={palette.red}
            />
          </View>
        </View>

        <View style={styles.column}>
          <View style={[styles.sectionBlock, { backgroundColor: palette.reportAmber }]}>
            <Text style={styles.sectionTitle}>3. Weight Control</Text>
            <View style={styles.miniRows}>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Target Weight</Text>
                <Text style={styles.controlValue}>{targetWeight.toFixed(1)} kg</Text>
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Expected Change</Text>
                <Text style={styles.controlValue}>{formatSigned(targetDelta)}</Text>
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Fat Mass</Text>
                <Text style={styles.controlValue}>{fatMass.toFixed(1)} kg</Text>
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Progression Band</Text>
                <Text style={styles.controlValue}>{metrics.safeProgressionRangePct}% / block</Text>
              </View>
            </View>
          </View>

          <View style={[styles.sectionBlock, { backgroundColor: palette.reportLilac }]}>
            <Text style={styles.sectionTitle}>4. Coach Notes</Text>
            <View style={styles.miniRows}>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Goal</Text>
                <Text style={styles.controlValue}>{profile.primaryGoal}</Text>
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Sleep</Text>
                <Text style={styles.controlValue}>{profile.sleepHours}h / quality {profile.sleepQuality}</Text>
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Workload</Text>
                <Text style={styles.controlValue}>{profile.workHoursPerDay}h x {profile.workDaysPerWeek}d</Text>
              </View>
              <View style={styles.controlRow}>
                <Text style={styles.controlLabel}>Load Suitability</Text>
                <Text style={styles.controlValue}>{metrics.trainingLoadSuitability}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.diagnosisWrap}>
        <Text style={styles.sectionTitle}>5. Obesity Diagnosis Band</Text>
        <View style={styles.diagnosisBar}>
          {diagnosisColors.map((color, index) => (
            <View
              key={`${color}-${index}`}
              style={[
                styles.diagnosisSlice,
                { backgroundColor: color },
                index === activeZoneIndex ? styles.diagnosisSliceActive : null
              ]}
            />
          ))}
        </View>
        <View style={styles.diagnosisLabels}>
          {["Under", "Balanced", "Over", "High", "Risk"].map((item) => (
            <Text key={item} style={[styles.reportRange, item === bmiZone ? styles.activeDiagnosis : null]}>
              {item}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    sheet: {
      backgroundColor: palette.reportCanvas,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: palette.line
    },
    sheetHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.md
    },
    sheetTitle: {
      color: palette.reportText,
      fontSize: 18,
      fontWeight: "800"
    },
    sheetSub: {
      color: palette.reportMute,
      marginTop: 4,
      lineHeight: 18
    },
    dateTag: {
      alignSelf: "flex-start",
      backgroundColor: palette.reportBlue,
      borderRadius: radius.pill,
      paddingHorizontal: 12,
      paddingVertical: 8
    },
    dateTagText: {
      color: palette.reportText,
      fontWeight: "700"
    },
    summaryGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    summaryBox: {
      flex: 1,
      minWidth: 120,
      borderRadius: radius.md,
      padding: spacing.sm,
      gap: 3
    },
    summaryLabel: {
      color: palette.reportMute,
      fontSize: 12
    },
    summaryValue: {
      color: palette.reportText,
      fontSize: 18,
      fontWeight: "800"
    },
    columns: {
      gap: spacing.sm
    },
    column: {
      gap: spacing.sm
    },
    sectionBlock: {
      borderRadius: radius.md,
      padding: spacing.sm,
      gap: spacing.sm
    },
    sectionTitle: {
      color: palette.reportText,
      fontSize: 15,
      fontWeight: "800"
    },
    reportRow: {
      gap: 6
    },
    reportRowTop: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm
    },
    reportLabel: {
      color: palette.reportText,
      fontWeight: "700"
    },
    reportValue: {
      color: palette.reportText,
      fontWeight: "800"
    },
    track: {
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: "#ffffff90",
      overflow: "hidden"
    },
    trackFill: {
      height: "100%",
      borderRadius: radius.pill
    },
    reportRange: {
      color: palette.reportMute,
      fontSize: 12
    },
    miniRows: {
      gap: spacing.sm
    },
    controlRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm,
      paddingBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: "#ffffff80"
    },
    controlLabel: {
      flex: 1,
      color: palette.reportMute
    },
    controlValue: {
      flex: 1,
      color: palette.reportText,
      textAlign: "right",
      fontWeight: "700"
    },
    diagnosisWrap: {
      gap: 8
    },
    diagnosisBar: {
      flexDirection: "row",
      gap: 6
    },
    diagnosisSlice: {
      flex: 1,
      height: 18,
      borderRadius: radius.pill
    },
    diagnosisSliceActive: {
      borderWidth: 2,
      borderColor: palette.reportText
    },
    diagnosisLabels: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm
    },
    activeDiagnosis: {
      color: palette.reportText,
      fontWeight: "800"
    }
  });

