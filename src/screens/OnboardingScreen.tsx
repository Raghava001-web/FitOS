import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { GhostButton, LabeledInput, OptionChip, PrimaryButton, SectionCard } from "../components/ui";
import { radius, shadows, spacing } from "../theme";
import {
  ActivityLevel,
  FitnessGoal,
  FoodPreference,
  LifestyleStress,
  MedicalFlag,
  MedicalFlagArea,
  RecoveryConsistency,
  ReminderMode,
  SportType,
} from "../types";
import { useApp } from "../store/AppContext";

const goals: FitnessGoal[] = [
  "fat loss",
  "lean body",
  "bulking",
  "strength gain",
  "bodybuilding",
  "Olympic-style fitness",
  "sports-based fitness",
];

const sports: SportType[] = [
  "running",
  "javelin",
  "throws",
  "badminton",
  "bowling",
  "batting",
  "other sports",
];

const foodPrefs: FoodPreference[] = [
  "vegetarian",
  "non-vegetarian",
  "eggetarian",
  "Indian",
  "salad-based",
  "high-protein",
  "fat-loss",
  "muscle-gain",
];

const stressLevels: LifestyleStress[] = ["low", "moderate", "high"];
const activityLevels: ActivityLevel[] = ["low", "moderate", "high"];
const recoveryLevels: RecoveryConsistency[] = ["poor", "average", "good"];
const injuryAreas: MedicalFlagArea[] = ["knee", "shoulder", "back", "elbow", "other"];
const reminderModes: ReminderMode[] = ["calendar", "notifications", "both"];
const trainingDaysOptions = [2, 3, 4, 5, 6];
const supplementOptions = [
  "whey protein",
  "creatine",
  "multivitamin",
  "omega-3",
  "pre-workout",
  "recovery support",
];

const TOTAL_STEPS = 7;

export const OnboardingScreen = () => {
  const { completeOnboarding, palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [step, setStep] = useState(0);

  // Step 1: Name + Goal
  const [name, setName] = useState("Athlete");
  const [goal, setGoal] = useState<FitnessGoal>("lean body");
  const [primarySport, setPrimarySport] = useState<SportType>("running");

  // Step 2: Weight + Height
  const [weightKg, setWeightKg] = useState("72");
  const [heightCm, setHeightCm] = useState("173");

  // Step 3: Body fat
  const [bodyFatPct, setBodyFatPct] = useState("18");

  // Step 4: Sleep + Work stress
  const [sleepHours, setSleepHours] = useState("7");
  const [sleepQuality, setSleepQuality] = useState<1 | 2 | 3 | 4 | 5>(3);
  const [workHoursPerDay, setWorkHoursPerDay] = useState("9");
  const [workDaysPerWeek, setWorkDaysPerWeek] = useState("5");

  // Step 5: Stress / lifestyle
  const [lifestyleStress, setLifestyleStress] = useState<LifestyleStress>("moderate");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("moderate");
  const [recoveryConsistency, setRecoveryConsistency] = useState<RecoveryConsistency>("average");

  // Step 6: Medical issues
  const [injuries, setInjuries] = useState<MedicalFlag[]>([]);
  const [medicalNotes, setMedicalNotes] = useState("");
  const [pendingInjuryArea, setPendingInjuryArea] = useState<MedicalFlagArea>("knee");
  const [pendingInjuryNote, setPendingInjuryNote] = useState("");

  // Step 7: Diet + training schedule
  const [foodPreference, setFoodPreference] = useState<FoodPreference>("high-protein");
  const [followsDiet, setFollowsDiet] = useState(true);
  const [takesSupplements, setTakesSupplements] = useState(false);
  const [selectedSupplements, setSelectedSupplements] = useState<string[]>([]);
  const [customSupplement, setCustomSupplement] = useState("");
  const [trainingDaysPerWeek, setTrainingDaysPerWeek] = useState(4);
  const [reminderMode, setReminderMode] = useState<ReminderMode>("notifications");

  const progressLabel = `${step + 1} / ${TOTAL_STEPS}`;
  const stepDots = Array.from({ length: TOTAL_STEPS }, (_, i) => i);

  const addInjury = () => {
    if (!pendingInjuryNote.trim()) return;
    setInjuries((prev) => [
      ...prev,
      { area: pendingInjuryArea, note: pendingInjuryNote.trim() },
    ]);
    setPendingInjuryNote("");
  };

  const removeInjury = (index: number) => {
    setInjuries((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleSupplement = (item: string) => {
    setSelectedSupplements((prev) =>
      prev.includes(item) ? prev.filter((entry) => entry !== item) : [...prev, item]
    );
  };

  const finish = () => {
    const supplementNames = takesSupplements
      ? [...selectedSupplements, customSupplement.trim()].filter(Boolean)
      : [];

    completeOnboarding({
      name: name.trim() || "Athlete",
      email: "",
      weightKg: Number(weightKg) || 70,
      heightCm: Number(heightCm) || 170,
      bodyFatPct: Number(bodyFatPct) || 18,
      sleepHours: Number(sleepHours) || 7,
      sleepQuality,
      workHoursPerDay: Number(workHoursPerDay) || 8,
      workDaysPerWeek: Number(workDaysPerWeek) || 5,
      lifestyleStress,
      medicalNotes,
      injuries,
      primaryGoal: goal,
      primarySport: goal === "sports-based fitness" ? primarySport : undefined,
      followsDiet,
      dietNotes: followsDiet ? `Prefers ${foodPreference}` : "Generate one",
      supplementNames,
      reminderMode,
      trainingDaysPerWeek,
      foodPreference,
      activityLevel,
      recoveryConsistency,
    });
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.heroTopRow}>
          <Text style={styles.brand}>FitOS</Text>
          <View style={styles.stepBadge}>
            <Text style={styles.stepBadgeText}>Step {progressLabel}</Text>
          </View>
        </View>
        <Text style={styles.headline}>
          Build your coach brain in {TOTAL_STEPS} quick screens.
        </Text>
        <Text style={styles.subhead}>
          Every answer shapes your readiness score, stress profile, and daily coaching.
        </Text>
        <View style={styles.dotRow}>
          {stepDots.map((item) => (
            <View
              key={item}
              style={[styles.dot, item <= step ? styles.dotActive : null]}
            />
          ))}
        </View>
      </View>

      {/* ── Step 1: Name + Goal ──────────────────────────────────────────── */}
      {step === 0 ? (
        <SectionCard
          title="Name + goal"
          subtitle={`Step ${progressLabel}: tell FitOS who you are and what you want first.`}
        >
          <LabeledInput
            label="Name"
            value={name}
            onChangeText={setName}
            placeholder="Your name"
          />
          <Text style={styles.label}>Primary goal</Text>
          <View style={styles.chips}>
            {goals.map((item) => (
              <OptionChip
                key={item}
                label={item}
                selected={goal === item}
                onPress={() => setGoal(item)}
              />
            ))}
          </View>

          {goal === "sports-based fitness" ? (
            <>
              <Text style={styles.label}>Primary sport</Text>
              <View style={styles.chips}>
                {sports.map((item) => (
                  <OptionChip
                    key={item}
                    label={item}
                    selected={primarySport === item}
                    onPress={() => setPrimarySport(item)}
                  />
                ))}
              </View>
            </>
          ) : null}

          <View style={styles.row}>
            <View style={styles.actionItem}>
              <PrimaryButton label="Next" onPress={() => setStep(1)} />
            </View>
          </View>
        </SectionCard>
      ) : null}

      {/* ── Step 2: Weight + Height ──────────────────────────────────────── */}
      {step === 1 ? (
        <SectionCard
          title="Weight + height"
          subtitle={`Step ${progressLabel}: these feed BMI, readiness, and progression suggestions.`}
        >
          <View style={styles.grid}>
            <LabeledInput
              label="Weight (kg)"
              value={weightKg}
              onChangeText={setWeightKg}
              keyboardType="numeric"
            />
            <LabeledInput
              label="Height (cm)"
              value={heightCm}
              onChangeText={setHeightCm}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.row}>
            <View style={styles.actionItem}>
              <GhostButton label="Back" onPress={() => setStep(0)} />
            </View>
            <View style={styles.actionItem}>
              <PrimaryButton label="Next" onPress={() => setStep(2)} />
            </View>
          </View>
        </SectionCard>
      ) : null}

      {/* ── Step 3: Body fat ─────────────────────────────────────────────── */}
      {step === 2 ? (
        <SectionCard
          title="Body fat"
          subtitle={`Step ${progressLabel}: body fat drives composition labels and lean mass calculations for your diet plan.`}
        >
          <LabeledInput
            label="Body fat %"
            value={bodyFatPct}
            onChangeText={setBodyFatPct}
            keyboardType="numeric"
            placeholder="e.g. 18"
          />
          <Text style={styles.hint}>
            Under 12% is athletic. 12-18% is lean. 18-25% is average. 25%+ is a higher body-fat phase.
            If you are not sure, use 20% as a safe estimate.
          </Text>
          <View style={styles.row}>
            <View style={styles.actionItem}>
              <GhostButton label="Back" onPress={() => setStep(1)} />
            </View>
            <View style={styles.actionItem}>
              <PrimaryButton label="Next" onPress={() => setStep(3)} />
            </View>
          </View>
        </SectionCard>
      ) : null}

      {/* ── Step 4: Sleep + Work ──────────────────────────────────────────── */}
      {step === 3 ? (
        <SectionCard
          title="Sleep + work"
          subtitle={`Step ${progressLabel}: this powers stress and recovery scoring.`}
        >
          <View style={styles.grid}>
            <LabeledInput
              label="Sleep hours"
              value={sleepHours}
              onChangeText={setSleepHours}
              keyboardType="numeric"
            />
            <LabeledInput
              label="Work hours / day"
              value={workHoursPerDay}
              onChangeText={setWorkHoursPerDay}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.grid}>
            <LabeledInput
              label="Work days / week"
              value={workDaysPerWeek}
              onChangeText={setWorkDaysPerWeek}
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.label}>Sleep quality</Text>
          <View style={styles.chips}>
            {([1, 2, 3, 4, 5] as const).map((q) => (
              <OptionChip
                key={q}
                label={q === 1 ? "1 Poor" : q === 5 ? "5 Great" : `${q}`}
                selected={sleepQuality === q}
                onPress={() => setSleepQuality(q)}
              />
            ))}
          </View>
          <View style={styles.row}>
            <View style={styles.actionItem}>
              <GhostButton label="Back" onPress={() => setStep(2)} />
            </View>
            <View style={styles.actionItem}>
              <PrimaryButton label="Next" onPress={() => setStep(4)} />
            </View>
          </View>
        </SectionCard>
      ) : null}

      {/* ── Step 5: Stress / Lifestyle ───────────────────────────────────── */}
      {step === 4 ? (
        <SectionCard
          title="Stress + lifestyle"
          subtitle={`Step ${progressLabel}: lifestyle stress, daily activity, and recovery habits shape your readiness ceiling.`}
        >
          <Text style={styles.label}>Lifestyle stress</Text>
          <View style={styles.chips}>
            {stressLevels.map((level) => (
              <OptionChip
                key={level}
                label={level}
                selected={lifestyleStress === level}
                onPress={() => setLifestyleStress(level)}
              />
            ))}
          </View>

          <Text style={styles.label}>Daily activity level</Text>
          <View style={styles.chips}>
            {activityLevels.map((level) => (
              <OptionChip
                key={level}
                label={level}
                selected={activityLevel === level}
                onPress={() => setActivityLevel(level)}
              />
            ))}
          </View>

          <Text style={styles.label}>Recovery consistency</Text>
          <View style={styles.chips}>
            {recoveryLevels.map((level) => (
              <OptionChip
                key={level}
                label={level}
                selected={recoveryConsistency === level}
                onPress={() => setRecoveryConsistency(level)}
              />
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.actionItem}>
              <GhostButton label="Back" onPress={() => setStep(3)} />
            </View>
            <View style={styles.actionItem}>
              <PrimaryButton label="Next" onPress={() => setStep(5)} />
            </View>
          </View>
        </SectionCard>
      ) : null}

      {/* ── Step 6: Medical Issues ───────────────────────────────────────── */}
      {step === 5 ? (
        <SectionCard
          title="Medical issues"
          subtitle={`Step ${progressLabel}: flag any injury areas so FitOS can guard your loading and exercise selection.`}
        >
          <Text style={styles.label}>Injury area</Text>
          <View style={styles.chips}>
            {injuryAreas.map((area) => (
              <OptionChip
                key={area}
                label={area}
                selected={pendingInjuryArea === area}
                onPress={() => setPendingInjuryArea(area)}
              />
            ))}
          </View>
          <LabeledInput
            label="Injury note"
            value={pendingInjuryNote}
            onChangeText={setPendingInjuryNote}
            placeholder="e.g. ACL rehab, avoid heavy squats"
          />
          <GhostButton label="Add injury" onPress={addInjury} />

          {injuries.length > 0 ? (
            <View style={styles.injuryList}>
              {injuries.map((injury, index) => (
                <View key={`${injury.area}-${index}`} style={styles.injuryRow}>
                  <View style={styles.injuryMeta}>
                    <Text style={styles.injuryArea}>{injury.area}</Text>
                    <Text style={styles.injuryNote}>{injury.note}</Text>
                  </View>
                  <GhostButton
                    label="Remove"
                    onPress={() => removeInjury(index)}
                  />
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.hint}>
              No injuries flagged. Skip this step if everything is clear.
            </Text>
          )}

          <LabeledInput
            label="General medical notes"
            value={medicalNotes}
            onChangeText={setMedicalNotes}
            placeholder="e.g. asthma, blood pressure meds"
            multiline
          />

          <View style={styles.row}>
            <View style={styles.actionItem}>
              <GhostButton label="Back" onPress={() => setStep(4)} />
            </View>
            <View style={styles.actionItem}>
              <PrimaryButton label="Next" onPress={() => setStep(6)} />
            </View>
          </View>
        </SectionCard>
      ) : null}

      {/* ── Step 7: Diet + Training Schedule ──────────────────────────────── */}
      {step === 6 ? (
        <SectionCard
          title="Diet + schedule"
          subtitle={`Step ${progressLabel}: choose your food style and training rhythm.`}
        >
          <Text style={styles.label}>Already following a diet?</Text>
          <View style={styles.inlineChips}>
            <OptionChip
              label="Yes"
              selected={followsDiet}
              onPress={() => setFollowsDiet(true)}
            />
            <OptionChip
              label="No, generate one"
              selected={!followsDiet}
              onPress={() => setFollowsDiet(false)}
            />
          </View>

          <Text style={styles.label}>Food preference</Text>
          <View style={styles.chips}>
            {foodPrefs.map((item) => (
              <OptionChip
                key={item}
                label={item}
                selected={foodPreference === item}
                onPress={() => setFoodPreference(item)}
              />
            ))}
          </View>

          <Text style={styles.label}>Already taking supplements?</Text>
          <View style={styles.inlineChips}>
            <OptionChip
              label="Yes"
              selected={takesSupplements}
              onPress={() => setTakesSupplements(true)}
            />
            <OptionChip
              label="No, recommend later"
              selected={!takesSupplements}
              onPress={() => {
                setTakesSupplements(false);
                setSelectedSupplements([]);
                setCustomSupplement("");
              }}
            />
          </View>

          {takesSupplements ? (
            <>
              <View style={styles.chips}>
                {supplementOptions.map((item) => (
                  <OptionChip
                    key={item}
                    label={item}
                    selected={selectedSupplements.includes(item)}
                    onPress={() => toggleSupplement(item)}
                  />
                ))}
              </View>
              <LabeledInput
                label="Other supplement"
                value={customSupplement}
                onChangeText={setCustomSupplement}
                placeholder="Optional"
              />
            </>
          ) : (
            <Text style={styles.hint}>
              FitOS will recommend a simple stack from your goal, BMI, and recovery profile.
            </Text>
          )}

          <Text style={styles.label}>Training days per week</Text>
          <View style={styles.chips}>
            {trainingDaysOptions.map((d) => (
              <OptionChip
                key={d}
                label={`${d} days`}
                selected={trainingDaysPerWeek === d}
                onPress={() => setTrainingDaysPerWeek(d)}
              />
            ))}
          </View>

          <Text style={styles.label}>Reminder mode</Text>
          <View style={styles.chips}>
            {reminderModes.map((mode) => (
              <OptionChip
                key={mode}
                label={mode}
                selected={reminderMode === mode}
                onPress={() => setReminderMode(mode)}
              />
            ))}
          </View>

          <View style={styles.row}>
            <View style={styles.actionItem}>
              <GhostButton label="Back" onPress={() => setStep(5)} />
            </View>
            <View style={styles.actionItem}>
              <PrimaryButton label="Launch FitOS" onPress={finish} />
            </View>
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
      backgroundColor: palette.background,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.lg,
      paddingBottom: 48,
    },
    hero: {
      backgroundColor: palette.panel,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.sm,
      ...shadows.card,
    },
    heroTopRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
    },
    brand: {
      color: palette.orange,
      fontWeight: "800",
      fontSize: 18,
      letterSpacing: 1.2,
      textTransform: "uppercase",
    },
    stepBadge: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: palette.panelAlt,
    },
    stepBadgeText: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.2,
    },
    headline: {
      color: palette.text,
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "800",
    },
    subhead: {
      color: palette.textMuted,
      lineHeight: 24,
      fontSize: 15,
    },
    dotRow: {
      flexDirection: "row",
      gap: 6,
      marginTop: spacing.xs,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: palette.line,
    },
    dotActive: {
      width: 22,
      backgroundColor: palette.orange,
    },
    grid: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    row: {
      flexDirection: "row",
      gap: spacing.sm,
    },
    actionItem: {
      flex: 1,
    },
    label: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2,
      marginBottom: 6,
    },
    hint: {
      color: palette.textMuted,
      fontSize: 14,
      lineHeight: 22,
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    inlineChips: {
      flexDirection: "row",
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    injuryList: {
      gap: spacing.sm,
    },
    injuryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: palette.panelAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: palette.line,
    },
    injuryMeta: {
      flex: 1,
      gap: 4,
    },
    injuryArea: {
      color: palette.orange,
      fontWeight: "700",
      fontSize: 14,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    injuryNote: {
      color: palette.text,
      fontSize: 14,
      lineHeight: 20,
    },
  });
