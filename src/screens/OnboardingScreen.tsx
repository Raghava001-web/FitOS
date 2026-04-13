import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GhostButton, LabeledInput, OptionChip, PrimaryButton, SectionCard } from "../components/ui";
import { radius, shadows, spacing } from "../theme";
import { FoodPreference, FitnessGoal } from "../types";
import { useApp } from "../store/AppContext";

const goals: FitnessGoal[] = [
  "fat loss",
  "lean body",
  "bulking",
  "strength gain",
  "bodybuilding",
  "Olympic-style fitness",
  "sports-based fitness"
];

const foodPrefs: FoodPreference[] = [
  "vegetarian",
  "non-vegetarian",
  "eggetarian",
  "Indian",
  "salad-based",
  "high-protein",
  "fat-loss",
  "muscle-gain"
];

export const OnboardingScreen = () => {
  const { completeOnboarding, palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Athlete");
  const [goal, setGoal] = useState<FitnessGoal>("lean body");
  const [weightKg, setWeightKg] = useState("72");
  const [heightCm, setHeightCm] = useState("173");
  const [sleepHours, setSleepHours] = useState("7");
  const [workHoursPerDay, setWorkHoursPerDay] = useState("9");
  const [foodPreference, setFoodPreference] = useState<FoodPreference>("high-protein");
  const [followsDiet, setFollowsDiet] = useState(true);

  const progressLabel = `${step + 1} / 4`;
  const stepDots = [0, 1, 2, 3];

  const finish = () => {
    completeOnboarding({
      name: name.trim() || "Athlete",
      email: "",
      weightKg: Number(weightKg) || 70,
      heightCm: Number(heightCm) || 170,
      bodyFatPct: 18,
      sleepHours: Number(sleepHours) || 7,
      sleepQuality: 3,
      workHoursPerDay: Number(workHoursPerDay) || 8,
      workDaysPerWeek: 5,
      lifestyleStress: "moderate",
      medicalNotes: "",
      injuries: [],
      primaryGoal: goal,
      primarySport: undefined,
      followsDiet,
      dietNotes: followsDiet ? `Prefers ${foodPreference}` : "Generate one",
      supplementNames: [],
      reminderMode: "notifications",
      trainingDaysPerWeek: 4,
      foodPreference,
      activityLevel: "moderate",
      recoveryConsistency: "average"
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <Text style={styles.brand}>FitOS</Text>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Step {progressLabel}</Text>
          </View>
        </View>
        <Text style={styles.headline}>Set up your coach brain in four quick screens.</Text>
        <Text style={styles.subhead}>We keep the onboarding short and fill the rest with safe defaults so the app opens fast.</Text>
        <View style={styles.dotRow}>
          {stepDots.map((item) => (
            <View key={item} style={[styles.dot, item <= step ? styles.dotActive : null]} />
          ))}
        </View>
      </View>

      {step === 0 ? (
        <SectionCard title="Name + goal" subtitle={`Step ${progressLabel}: tell FitOS who you are and what you want first.`}>
          <LabeledInput label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <Text style={styles.label}>Primary goal</Text>
          <View style={styles.chips}>
            {goals.map((item) => (
              <OptionChip key={item} label={item} selected={goal === item} onPress={() => setGoal(item)} />
            ))}
          </View>
          <View style={styles.row}>
            <PrimaryButton label="Next" onPress={() => setStep(1)} />
          </View>
        </SectionCard>
      ) : null}

      {step === 1 ? (
        <SectionCard title="Weight + height" subtitle={`Step ${progressLabel}: these feed BMI, readiness, and progression suggestions.`}>
          <View style={styles.grid}>
            <LabeledInput label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" />
            <LabeledInput label="Height (cm)" value={heightCm} onChangeText={setHeightCm} keyboardType="numeric" />
          </View>
          <View style={styles.row}>
            <GhostButton label="Back" onPress={() => setStep(0)} />
            <PrimaryButton label="Next" onPress={() => setStep(2)} />
          </View>
        </SectionCard>
      ) : null}

      {step === 2 ? (
        <SectionCard title="Sleep + work" subtitle={`Step ${progressLabel}: this powers stress and recovery scoring.`}>
          <View style={styles.grid}>
            <LabeledInput label="Sleep hours" value={sleepHours} onChangeText={setSleepHours} keyboardType="numeric" />
            <LabeledInput label="Work hours / day" value={workHoursPerDay} onChangeText={setWorkHoursPerDay} keyboardType="numeric" />
          </View>
          <View style={styles.row}>
            <GhostButton label="Back" onPress={() => setStep(1)} />
            <PrimaryButton label="Next" onPress={() => setStep(3)} />
          </View>
        </SectionCard>
      ) : null}

      {step === 3 ? (
        <SectionCard title="Diet preference" subtitle={`Step ${progressLabel}: choose how FitOS should shape your food plan.`}>
          <Text style={styles.label}>Already following a diet?</Text>
          <View style={styles.inlineChips}>
            <OptionChip label="Yes" selected={followsDiet} onPress={() => setFollowsDiet(true)} />
            <OptionChip label="No, generate one" selected={!followsDiet} onPress={() => setFollowsDiet(false)} />
          </View>
          <Text style={styles.label}>Food preference</Text>
          <View style={styles.chips}>
            {foodPrefs.map((item) => (
              <OptionChip key={item} label={item} selected={foodPreference === item} onPress={() => setFoodPreference(item)} />
            ))}
          </View>
          <View style={styles.row}>
            <GhostButton label="Back" onPress={() => setStep(2)} />
            <PrimaryButton label="Launch FitOS" onPress={finish} />
          </View>
        </SectionCard>
      ) : null}
    </ScrollView>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.background
    },
    content: {
      padding: spacing.lg,
      gap: spacing.lg,
      paddingBottom: 48
    },
    hero: {
      backgroundColor: palette.panel,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.sm,
      ...shadows.card
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm
    },
    brand: {
      color: palette.orange,
      fontWeight: "800",
      fontSize: 18,
      letterSpacing: 1.2,
      textTransform: "uppercase"
    },
    stepBadge: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: palette.panelAlt
    },
    stepBadgeText: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.2
    },
    headline: {
      color: palette.text,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "800"
    },
    subhead: {
      color: palette.textMuted,
      lineHeight: 24,
      fontSize: 15
    },
    dotRow: {
      flexDirection: "row",
      gap: 8,
      marginTop: spacing.xs
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: palette.line
    },
    dotActive: {
      width: 28,
      backgroundColor: palette.orange
    },
    grid: {
      flexDirection: "row",
      gap: spacing.sm
    },
    row: {
      flexDirection: "row",
      gap: spacing.sm
    },
    label: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: 6
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    inlineChips: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.sm
    }
  });
