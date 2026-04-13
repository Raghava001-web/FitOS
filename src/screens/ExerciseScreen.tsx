import React, { useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { Linking, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { ExerciseDemo } from "../components/ExerciseDemo";
import { LineChart } from "react-native-chart-kit";
import { SetLogger } from "../components/SetLogger";
import { GhostButton, KeyStat, LabeledInput, MiniStat, OptionChip, PrimaryButton, SectionCard } from "../components/ui";
import { EXERCISES } from "../data/exercises";
import { buildJumpCheck, formatShortDate, getExerciseById, getExerciseLogs, recommendProgression } from "../engine/fitness";
import { getExercisesByMuscle } from "../engine/habits";
import { useExerciseMemory } from "../hooks/useExerciseMemory";
import { useApp } from "../store/AppContext";
import { radius, shadows, spacing } from "../theme";
import { LoggedSet, MuscleGroup } from "../types";

type DraftSet = {
  reps: string;
  weightKg: string;
  restSeconds: string;
};

type DashboardMode = "today" | "train" | "plan";

const makeDrafts = (weightKg: number, restSeconds: number, reps = 8): DraftSet[] => [
  { reps: `${reps}`, weightKg: `${weightKg}`, restSeconds: `${restSeconds}` },
  { reps: `${reps}`, weightKg: `${weightKg}`, restSeconds: `${restSeconds}` },
  { reps: `${reps}`, weightKg: `${weightKg}`, restSeconds: `${restSeconds}` }
];

const formatDuration = (totalSeconds: number) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(safeSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
};

const muscles: MuscleGroup[] = [
  "chest",
  "back",
  "shoulders",
  "biceps",
  "triceps",
  "quads",
  "hamstrings",
  "glutes",
  "calves",
  "abs"
];

const dashboardModes: Array<{ id: DashboardMode; label: string }> = [
  { id: "today", label: "Today" },
  { id: "train", label: "Train" },
  { id: "plan", label: "Plan" }
];

export const ExerciseScreen = () => {
  const { state, metrics, savedPlans, choosePlan, logWorkout, palette, checkInDailyStreak } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const profile = state.profile;
  const [dashboardMode, setDashboardMode] = useState<DashboardMode>("today");
  const [selectedExerciseId, setSelectedExerciseId] = useState(EXERCISES[0].id);
  const [selectedMuscle, setSelectedMuscle] = useState<MuscleGroup>("back");
  const [draftSets, setDraftSets] = useState<DraftSet[]>(makeDrafts(20, 90));
  const [notes, setNotes] = useState("");
  const [currentJump, setCurrentJump] = useState("80");
  const [targetJump, setTargetJump] = useState("100");
  const [quickWeight, setQuickWeight] = useState("");
  const [quickReps, setQuickReps] = useState("8");
  const [quickLogged, setQuickLogged] = useState(false);
  const [actionNote, setActionNote] = useState("Pick an exercise and log a set to build your weight memory.");
  const [sessionElapsedSeconds, setSessionElapsedSeconds] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [restRunning, setRestRunning] = useState(false);
  const [restTargetSeconds, setRestTargetSeconds] = useState(EXERCISES[0].restSeconds);
  const [restRemainingSeconds, setRestRemainingSeconds] = useState(EXERCISES[0].restSeconds);

  const localDateKey = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = `${now.getMonth() + 1}`.padStart(2, "0");
    const day = `${now.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const daysBetweenKeys = (fromKey: string, toKey: string) => {
    const from = new Date(`${fromKey}T00:00:00`);
    const to = new Date(`${toKey}T00:00:00`);
    return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
  };

  const exercise = useMemo(() => getExerciseById(selectedExerciseId) ?? EXERCISES[0], [selectedExerciseId]);
  const exerciseLogs = useMemo(() => getExerciseLogs(state.workoutLogs, selectedExerciseId), [state.workoutLogs, selectedExerciseId]);
  const lastLog = exerciseLogs[0];
  const { hydrated: memoryHydrated, history: memoryHistory, lastSet: memoryLastSet, bestSet, logSet, logSets } = useExerciseMemory(exercise.name);
  const advice = useMemo(() => {
    if (!profile || !metrics) return null;
    return recommendProgression(profile, metrics, exercise, state.workoutLogs);
  }, [exercise, metrics, profile, state.workoutLogs]);
  const activePlan = useMemo(
    () => savedPlans.find((plan) => plan.id === state.activePlanId) ?? savedPlans[0],
    [savedPlans, state.activePlanId]
  );
  const recommendedRestSeconds = Math.max(15, Number(draftSets[0]?.restSeconds) || exercise.restSeconds);
  const restStatusLabel = restRunning ? "Running" : restRemainingSeconds === 0 ? "Ready" : "Paused";
  const sessionLabel = formatDuration(sessionElapsedSeconds);
  const todayKey = localDateKey();
  const lastCheckInDate = state.dailyStreak.lastCheckInDate;
  const streakGap = lastCheckInDate ? daysBetweenKeys(lastCheckInDate, todayKey) : null;
  const streakMissed = streakGap !== null && streakGap > 1;
  const streakCheckedToday = lastCheckInDate === todayKey;
  const streakHeadline = streakMissed
    ? "Reset clean and build again."
    : streakCheckedToday && state.dailyStreak.current >= 7
      ? "Seven-day rhythm. Stay with it."
      : streakCheckedToday
        ? "Today's check-in is locked."
        : state.dailyStreak.current >= 7
          ? "You're carrying real momentum now."
          : state.dailyStreak.current >= 3
            ? "Momentum is building. Protect it."
            : "Start the habit before motivation fades.";
  const streakCopy = streakCheckedToday
    ? "Checked in today. Keep the streak alive tomorrow."
    : streakMissed
      ? "A day was missed. The next check-in will restart the streak."
      : state.dailyStreak.current > 0
        ? "The streak is live. Check in once today to keep it moving."
        : "Start your daily streak with a quick check-in.";
  const streakButtonLabel = streakCheckedToday ? "Checked in today" : "Check in today";

  useEffect(() => {
    if (memoryLastSet) {
      setQuickWeight(`${memoryLastSet.weight}`);
      setQuickReps(`${memoryLastSet.reps}`);
      return;
    }

    const previousSet = lastLog?.sets[lastLog.sets.length - 1];
    if (previousSet) {
      setQuickWeight(`${previousSet.weightKg}`);
      setQuickReps(`${previousSet.reps}`);
      return;
    }

    setQuickWeight(`${advice?.recommendedWeightKg ?? 20}`);
    setQuickReps("8");
  }, [memoryLastSet?.date, lastLog?.id, advice?.recommendedWeightKg, selectedExerciseId]);

  useEffect(() => {
    if (memoryLastSet) {
      setDraftSets(makeDrafts(memoryLastSet.weight, exercise.restSeconds, memoryLastSet.reps));
      return;
    }

    if (lastLog) {
      setDraftSets(
        lastLog.sets.map((set) => ({
          reps: `${set.reps}`,
          weightKg: `${set.weightKg}`,
          restSeconds: `${set.restSeconds}`
        }))
      );
      return;
    }

    const nextWeight = advice?.recommendedWeightKg ?? 20;
    setDraftSets(makeDrafts(nextWeight, exercise.restSeconds));
  }, [selectedExerciseId, memoryLastSet?.date, lastLog?.id, advice?.recommendedWeightKg, exercise.restSeconds]);

  useEffect(() => {
    setRestRunning(false);
    setRestTargetSeconds(exercise.restSeconds);
    setRestRemainingSeconds(exercise.restSeconds);
  }, [selectedExerciseId, exercise.restSeconds]);

  useEffect(() => {
    if (restRunning) return;
    setRestTargetSeconds(recommendedRestSeconds);
    setRestRemainingSeconds(recommendedRestSeconds);
  }, [recommendedRestSeconds, restRunning]);

  useEffect(() => {
    if (!sessionActive) return;
    const interval = setInterval(() => {
      setSessionElapsedSeconds((current) => current + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [sessionActive]);

  useEffect(() => {
    if (!restRunning) return;
    if (restRemainingSeconds <= 0) {
      setRestRunning(false);
      setActionNote(`Rest complete. ${exercise.name} is ready for the next set.`);
      return;
    }
    const timeout = setTimeout(() => {
      setRestRemainingSeconds((current) => Math.max(current - 1, 0));
    }, 1000);
    return () => clearTimeout(timeout);
  }, [restRunning, restRemainingSeconds, exercise.name]);

  const jumpCheck = useMemo(() => {
    const current = Number(currentJump);
    const target = Number(targetJump);
    if (!current || !target || target <= current) return null;
    return buildJumpCheck(current, target);
  }, [currentJump, targetJump]);

  const { width: screenWidth } = useWindowDimensions();
  const trendPoints = useMemo(() => {
    const byDay = new Map<string, { date: string; weight: number }>();
    memoryHistory.forEach((entry) => {
      byDay.set(entry.date.slice(0, 10), { date: entry.date.slice(0, 10), weight: entry.weight });
    });
    return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-5);
  }, [memoryHistory]);

  const chartWidth = Math.max(280, screenWidth - spacing.lg * 2 - 8);

  const dedupedMemoryHistory = useMemo(() => {
    const seen = new Set<string>();
    const ordered = [...memoryHistory].reverse();
    const unique = ordered.filter((entry) => {
      const signature = `${entry.date.slice(0, 10)}-${entry.weight}-${entry.reps}`;
      if (seen.has(signature)) return false;
      seen.add(signature);
      return true;
    });
    return unique.reverse();
  }, [memoryHistory]);

  const recentMemorySets = useMemo(
    () =>
      dedupedMemoryHistory
        .slice(-4)
        .reverse()
        .map((entry, index) => ({ ...entry, key: `${entry.date}-${entry.weight}-${entry.reps}-${index}` })),
    [dedupedMemoryHistory]
  );

  const progressionAdvice = useMemo(() => {
    const lastThree = dedupedMemoryHistory.slice(-3);
    if (lastThree.length < 3) return "Keep logging to unlock advice.";

    const weights = lastThree.map((entry) => entry.weight);
    const reps = lastThree.map((entry) => entry.reps);
    const sameWeight = weights.every((value) => value === weights[0]);

    if (sameWeight) {
      return "Same weight for 3 sessions. Increase by 2.5 kg next time.";
    }

    if (reps[2] > reps[1]) {
      return "Reps are climbing. Keep the weight and add another rep before increasing.";
    }

    return "The load is moving. Hold steady and keep the next session clean.";
  }, [dedupedMemoryHistory]);

  const recentTimeline = state.workoutLogs.slice(0, 5);
  const muscleExercises = getExercisesByMuscle(selectedMuscle);
  const fallbackLastSet = lastLog?.sets[lastLog.sets.length - 1];
  const displayLastSet = memoryLastSet ?? (fallbackLastSet
    ? {
        weight: fallbackLastSet.weightKg,
        reps: fallbackLastSet.reps,
        date: lastLog.date
      }
    : null);

  const focusTitle = !metrics
    ? "Finish setup"
    : metrics.readinessScore < 40
      ? "Recovery first"
      : advice?.action === "reduce"
        ? "Hold this lift"
        : "Train day ready";

  const focusCopy = !metrics
    ? "Complete onboarding so FitOS can personalize your load, readiness, and split."
    : metrics.readinessScore < 40
      ? "Mobility, walking, or technique work will move you forward more than heavy loading today."
      : advice?.summary ?? "Log your first working set so FitOS can start learning this exercise.";
  const pageTitle = dashboardMode === "train" ? exercise.name : "Exercise";
  const pageEyebrow = dashboardMode === "train" ? "Exercise detail" : dashboardMode === "plan" ? "Split builder" : "Readiness-first training";
  const pageNote = dashboardMode === "train" ? actionNote : focusCopy;

  const selectExercise = (exerciseId: string, exerciseName: string) => {
    setSelectedExerciseId(exerciseId);
    setDashboardMode("train");
    setActionNote(`Loaded ${exerciseName}. Review the last set, PR, and recommendation before training.`);
  };

  const startSessionClock = () => {
    setSessionActive(true);
  };

  const toggleSessionClock = () => {
    if (sessionActive) {
      setSessionActive(false);
      setActionNote("Session clock paused.");
      return;
    }

    setSessionActive(true);
    setActionNote("Session clock started.");
  };

  const resetSessionClock = () => {
    setSessionActive(false);
    setSessionElapsedSeconds(0);
    setActionNote("Session clock reset.");
  };

  const startRestTimer = (seconds = recommendedRestSeconds, announce = true) => {
    const nextSeconds = Math.max(15, Math.round(seconds));
    setSessionActive(true);
    setRestTargetSeconds(nextSeconds);
    setRestRemainingSeconds(nextSeconds);
    setRestRunning(true);
    if (announce) {
      setActionNote(`Rest timer started for ${nextSeconds}s.`);
    }
  };

  const addRestTime = (seconds = 30) => {
    setSessionActive(true);
    setRestRunning(true);
    setRestRemainingSeconds((current) => current + seconds);
    setRestTargetSeconds((current) => current + seconds);
    setActionNote(`Added ${seconds}s to the rest timer.`);
  };

  const skipRestTimer = () => {
    setRestRunning(false);
    setRestRemainingSeconds(0);
    setActionNote("Rest skipped. Go again when your form feels sharp.");
  };

  const handleQuickLog = async () => {
    const trimmedWeight = quickWeight.trim();
    const trimmedReps = quickReps.trim();
    if (!trimmedWeight || !trimmedReps) {
      setActionNote("Enter both weight and reps before logging a set.");
      return;
    }

    const weight = Number(trimmedWeight);
    const reps = Number(trimmedReps);
    if (!Number.isFinite(weight) || !Number.isFinite(reps) || reps <= 0) {
      setActionNote("Use numeric values for weight and reps so FitOS can store the set correctly.");
      return;
    }

    await logSet(weight, reps);
    startSessionClock();
    startRestTimer(recommendedRestSeconds, false);
    setQuickLogged(true);
    setActionNote(`Logged ${exercise.name}: ${weight} kg x ${reps}. Memory updated for your next session.`);
    setTimeout(() => setQuickLogged(false), 1600);
  };

  const saveWorkout = async () => {
    const sets: LoggedSet[] = draftSets.map((set, index) => ({
      setNumber: index + 1,
      reps: Number(set.reps) || 0,
      weightKg: Number(set.weightKg) || 0,
      restSeconds: Number(set.restSeconds) || exercise.restSeconds,
      durationSeconds: 40
    }));

    const hasValidSet = sets.some((set) => set.reps > 0 && Number.isFinite(set.weightKg));
    if (!hasValidSet) {
      setActionNote("Add at least one valid set before saving the full session.");
      return;
    }

    const completedSessionLabel = sessionElapsedSeconds > 0 ? formatDuration(sessionElapsedSeconds) : "";

    logWorkout({
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets,
      notes
    });
    await logSets(sets.map((set) => ({ weightKg: set.weightKg, reps: set.reps })));
    setNotes("");
    setDashboardMode("today");
    setSessionActive(false);
    setSessionElapsedSeconds(0);
    setRestRunning(false);
    setRestTargetSeconds(recommendedRestSeconds);
    setRestRemainingSeconds(recommendedRestSeconds);
    setActionNote(
      `Saved ${sets.length} sets for ${exercise.name}.${completedSessionLabel ? ` Session ${completedSessionLabel}.` : ""} Full session and memory history are updated.`
    );
  };

  const addAnotherSet = () => {
    startSessionClock();
    setDraftSets((current) => [
      ...current,
      {
        reps: quickReps || "8",
        weightKg: quickWeight || `${advice?.recommendedWeightKg ?? 20}`,
        restSeconds: `${exercise.restSeconds}`
      }
    ]);
    setActionNote(`Added set ${draftSets.length + 1} for ${exercise.name}.`);
  };

  const openReference = async () => {
    try {
      const supported = await Linking.canOpenURL(exercise.youtubeUrl);
      if (!supported) {
        setActionNote("This device could not open the YouTube reference link.");
        return;
      }
      await Linking.openURL(exercise.youtubeUrl);
      setActionNote(`Opened the YouTube reference for ${exercise.name}.`);
    } catch {
      setActionNote("The reference link could not be opened right now.");
    }
  };

  const selectPlan = (planId: string, planName: string) => {
    choosePlan(planId);
    setActionNote(`${planName} is now your active split.`);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageEyebrow}>{pageEyebrow}</Text>
        <Text style={styles.pageTitle}>{pageTitle}</Text>
        <View style={styles.pageMetaRow}>
          <View style={styles.pageMetaPill}>
            <Text style={styles.pageMetaLabel}>Today</Text>
            <Text style={styles.pageMetaValue}>{formatShortDate(new Date().toISOString())}</Text>
          </View>
          <View style={styles.pageMetaPill}>
            <Text style={styles.pageMetaLabel}>Readiness</Text>
            <Text style={[styles.pageMetaValue, styles.pageMetaValueAccent]}>{metrics?.readinessScore ?? "--"}</Text>
          </View>
        </View>
        <Text style={styles.pageNote}>{pageNote}</Text>
      </View>

      <View style={styles.modeRow}>
        {dashboardModes.map((mode) => (
          <OptionChip
            key={mode.id}
            label={mode.label}
            selected={dashboardMode === mode.id}
            onPress={() => setDashboardMode(mode.id)}
          />
        ))}
      </View>

      {dashboardMode === "today" ? (
        <>
          <SectionCard
            title="Core loop"
            subtitle="Log the set you used today so the next session opens with the right memory."
            accent={palette.teal}
          >
            <View style={styles.metricRow}>
              <MiniStat label="Memory ready" value={memoryHydrated ? "Yes" : "Loading"} />
              <MiniStat label="PR" value={bestSet ? `${bestSet.weight} kg x ${bestSet.reps}` : "Not yet"} />
              <MiniStat label="Last set" value={displayLastSet ? `${displayLastSet.weight} kg x ${displayLastSet.reps}` : "None"} />
            </View>
            <View style={styles.quickGrid}>
              <LabeledInput label="Weight (kg)" value={quickWeight} onChangeText={setQuickWeight} keyboardType="numeric" />
              <LabeledInput label="Reps" value={quickReps} onChangeText={setQuickReps} keyboardType="numeric" />
            </View>
            <PrimaryButton
              label={quickLogged ? "Set logged!" : "Log this set"}
              onPress={() => void handleQuickLog()}
              tone={quickLogged ? palette.lime : palette.orange}
            />
            {recentMemorySets.length > 0 ? (
              <View style={styles.recentWrap}>
                <Text style={styles.memoryLabel}>Recent memory</Text>
                {recentMemorySets.map((entry) => (
                  <View key={entry.key} style={styles.recentRow}>
                    <Text style={styles.recentValue}>{entry.weight} kg x {entry.reps}</Text>
                    <Text style={styles.recentMeta}>{formatShortDate(entry.date)}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.copy}>Once you log a set here, FitOS will start showing the real last set and PR for this exercise.</Text>
            )}
          </SectionCard>

          <SectionCard
            title="Daily streak"
            subtitle={streakCopy}
            accent={palette.orange}
          >
            <View style={styles.streakRow}>
              <View style={styles.streakGlyphWrap}>
                <View style={[styles.streakIconWrap, streakMissed ? styles.streakIconWrapBroken : null]}>
                  <Ionicons
                    name={streakMissed ? "flame-outline" : "flame"}
                    size={26}
                    color={streakMissed ? palette.textMuted : palette.orange}
                  />
                </View>
                <View>
                  <Text style={styles.streakLabel}>Daily streak</Text>
                  <Text style={styles.streakValue}>{state.dailyStreak.current}</Text>
                  <Text style={styles.streakHeadline}>{streakHeadline}</Text>
                </View>
              </View>
              <View style={[styles.streakPill, streakMissed ? styles.streakPillBroken : null]}>
                <Text style={styles.streakPillLabel}>{streakCheckedToday ? "Checked today" : streakMissed ? "Broken streak" : "Keep going"}</Text>
              </View>
            </View>
            <PrimaryButton
              label={streakButtonLabel}
              onPress={() => {
                checkInDailyStreak();
                setActionNote(
                  streakCheckedToday
                    ? "You already checked in today."
                    : streakMissed
                      ? "Missed a day. Daily streak restarted."
                      : state.dailyStreak.current > 0
                        ? "Daily streak extended."
                        : "Daily streak started."
                );
              }}
            />
          </SectionCard>

          <SectionCard
            title="Coach guardrails"
            subtitle="Simple safety guidance so the dashboard stays practical instead of noisy."
            accent={palette.red}
          >
            {advice ? (
              <View style={styles.coachPanel}>
                <Text style={styles.dashboardValue}>Suggested load: {advice.recommendedWeightKg} kg</Text>
                <Text style={styles.copy}>{advice.summary}</Text>
                {advice.reasoning.slice(0, 2).map((item) => (
                  <Text key={item} style={styles.copy}>- {item}</Text>
                ))}
                {advice.warnings.slice(0, 2).map((item) => (
                  <Text key={item} style={[styles.copy, styles.warningCopy]}>- {item}</Text>
                ))}
              </View>
            ) : null}
            <View style={styles.grid}>
              <LabeledInput label="Current weight" value={currentJump} onChangeText={setCurrentJump} keyboardType="numeric" />
              <LabeledInput label="Target weight" value={targetJump} onChangeText={setTargetJump} keyboardType="numeric" />
            </View>
            {jumpCheck ? (
              <View style={styles.jumpCard}>
                <Text style={styles.jumpHeadline}>{jumpCheck.summary}</Text>
                <Text style={styles.copy}>Risk band: {jumpCheck.risk} - path: {jumpCheck.steps.join(" -> ")}</Text>
              </View>
            ) : (
              <Text style={styles.copy}>Enter a heavier target than your current load to get a staged progression path.</Text>
            )}
          </SectionCard>
        </>
      ) : null}

      {dashboardMode === "train" ? (
        <>
          <SectionCard
            title="Exercise detail"
            subtitle="Choose one exercise, review the cue, then log the full working sets."
            accent={palette.orange}
          >
            <View style={styles.chips}>
              {EXERCISES.map((item) => (
                <OptionChip
                  key={item.id}
                  label={item.name}
                  selected={selectedExerciseId === item.id}
                  onPress={() => selectExercise(item.id, item.name)}
                />
              ))}
            </View>
            <View style={styles.exerciseHeader}>
              <View style={styles.exerciseMeta}>
                <Text style={styles.exerciseTitle}>{exercise.name}</Text>
                <Text style={styles.exerciseText}>
                  {exercise.targetMuscle} - {exercise.defaultRepRange} reps - rest {exercise.restSeconds}s
                </Text>
                <Text style={styles.exerciseText}>Pattern: {exercise.movementPattern}</Text>
              </View>
              {advice ? (
                <View style={styles.recommendCard}>
                  <Text style={styles.recommendLabel}>Suggested load</Text>
                  <Text style={styles.recommendValue}>{advice.recommendedWeightKg} kg</Text>
                  <Text style={styles.exerciseText}>{advice.summary}</Text>
                </View>
              ) : null}
            </View>
            <ExerciseDemo name={exercise.name} />
            <View style={styles.instructions}>
              {exercise.instructions.map((step, index) => (
                <Text key={`${exercise.id}-${index}`} style={styles.instructionText}>
                  {index + 1}. {step}
                </Text>
              ))}
            </View>
            <SetLogger exerciseName={exercise.name} />
            <View style={styles.chartCard}>
              <Text style={styles.chartTitle}>Weight trend</Text>
              <Text style={styles.chartSubtitle}>Last 5 sessions for this lift.</Text>
              {trendPoints.length > 0 ? (
                <LineChart
                  data={{
                    labels: trendPoints.map((point) => formatShortDate(point.date)),
                    datasets: [{ data: trendPoints.map((point) => point.weight) }]
                  }}
                  width={chartWidth}
                  height={220}
                  withDots
                  withInnerLines={false}
                  withOuterLines={false}
                  bezier
                  fromZero
                  yAxisSuffix=" kg"
                  style={styles.chartCanvas}
                  chartConfig={{
                    backgroundGradientFrom: palette.panel,
                    backgroundGradientTo: palette.panel,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(249, 115, 22, ${opacity})`,
                    labelColor: () => palette.textMuted,
                    propsForBackgroundLines: { stroke: palette.line, strokeWidth: 1 },
                    propsForDots: { r: "3" }
                  }}
                />
              ) : (
                <Text style={styles.copy}>Log a few sessions to reveal the trend line.</Text>
              )}
            </View>

            <PrimaryButton label="Open YouTube reference" onPress={() => void openReference()} />
          </SectionCard>

          <SectionCard
            title="Full session logger"
            subtitle="Track sets, reps, weight, rest, and sync the result back into memory."
            accent={palette.lime}
          >
            <View style={styles.setTable}>
              {draftSets.map((set, index) => (
                <View key={`set-${index}`} style={styles.setRow}>
                  <Text style={styles.setLabel}>Set {index + 1}</Text>
                  <View style={styles.setInputs}>
                    <View style={styles.setField}>
                      <Text style={styles.setFieldLabel}>kg</Text>
                      <LabeledInput
                        label=""
                        value={set.weightKg}
                        onChangeText={(value) =>
                          setDraftSets((current) =>
                            current.map((item, rowIndex) =>
                              rowIndex === index ? { ...item, weightKg: value } : item
                            )
                          )
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.setField}>
                      <Text style={styles.setFieldLabel}>reps</Text>
                      <LabeledInput
                        label=""
                        value={set.reps}
                        onChangeText={(value) =>
                          setDraftSets((current) =>
                            current.map((item, rowIndex) =>
                              rowIndex === index ? { ...item, reps: value } : item
                            )
                          )
                        }
                        keyboardType="numeric"
                      />
                    </View>
                    <View style={styles.setField}>
                      <Text style={styles.setFieldLabel}>rest</Text>
                      <LabeledInput
                        label=""
                        value={set.restSeconds}
                        onChangeText={(value) =>
                          setDraftSets((current) =>
                            current.map((item, rowIndex) =>
                              rowIndex === index ? { ...item, restSeconds: value } : item
                            )
                          )
                        }
                        keyboardType="numeric"
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>
            <View style={styles.timerPanel}>
              <View style={styles.timerHeader}>
                <View style={styles.timerMeta}>
                  <Text style={styles.timerLabel}>Rest timer</Text>
                  <Text style={styles.copy}>Recommended rest is {recommendedRestSeconds}s for {exercise.name}.</Text>
                </View>
                <Text style={[styles.timerValue, restRemainingSeconds === 0 ? styles.timerValueReady : null]}>{formatDuration(restRemainingSeconds)}</Text>
              </View>
              <View style={styles.metricRow}>
                <MiniStat label="Status" value={restStatusLabel} />
                <MiniStat label="Target rest" value={`${restTargetSeconds}s`} />
                <MiniStat label="Session" value={sessionLabel} />
              </View>
              <View style={styles.actionRow}>
                <View style={styles.actionItem}>
                  <PrimaryButton
                    label={restRunning ? "Restart rest" : restRemainingSeconds === 0 ? "Start next rest" : "Start rest"}
                    onPress={() => startRestTimer()}
                  />
                </View>
                <View style={styles.actionItem}>
                  <GhostButton label="+30 sec" onPress={() => addRestTime(30)} />
                </View>
              </View>
              <View style={styles.actionRow}>
                <View style={styles.actionItem}>
                  <GhostButton label={sessionActive ? "Pause session" : "Start session"} onPress={toggleSessionClock} />
                </View>
                <View style={styles.actionItem}>
                  <GhostButton label={restRemainingSeconds === 0 ? "Reset clock" : "Skip rest"} onPress={restRemainingSeconds === 0 ? resetSessionClock : skipRestTimer} />
                </View>
              </View>
            </View>
            <GhostButton label="Add another set" onPress={addAnotherSet} />
            <LabeledInput
              label="Session notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="RPE, pain, mood, or form notes"
              multiline
            />
            <PrimaryButton label="Save workout memory" onPress={() => void saveWorkout()} />
          </SectionCard>
        </>
      ) : null}

      {dashboardMode === "plan" ? (
        <>
          <SectionCard
            title="Split planner"
            subtitle="Your active split first, with alternatives only when you want to change direction."
            accent={palette.gold}
          >
            {activePlan ? (
              <View style={styles.activePlanCard}>
                <Text style={styles.dashboardLabel}>Active now</Text>
                <Text style={styles.planTitle}>{activePlan.name}</Text>
                <Text style={styles.copy}>{activePlan.focus}</Text>
                <Text style={styles.copy}>{activePlan.days.join(" - ")}</Text>
              </View>
            ) : null}
            {savedPlans.map((plan) => {
              const active = state.activePlanId === plan.id;
              return (
                <View key={plan.id} style={[styles.planCard, active ? styles.planActive : null]}>
                  <Text style={styles.planTitle}>{plan.name}</Text>
                  <Text style={styles.copy}>{plan.focus}</Text>
                  <Text style={styles.copy}>{plan.days.join(" - ")}</Text>
                  <Text style={styles.exerciseText}>{plan.rationale}</Text>
                  {active ? (
                    <GhostButton label="Active plan" onPress={() => setActionNote(`${plan.name} is already your active split.`)} />
                  ) : (
                    <PrimaryButton
                      label="Choose plan"
                      onPress={() => selectPlan(plan.id, plan.name)}
                    />
                  )}
                </View>
              );
            })}
          </SectionCard>

          <SectionCard
            title="Muscle generator"
            subtitle="Pick a body part and keep the list short and actionable."
            accent={palette.blue}
          >
            <View style={styles.chips}>
              {muscles.map((muscle) => (
                <OptionChip
                  key={muscle}
                  label={muscle}
                  selected={selectedMuscle === muscle}
                  onPress={() => {
                    setSelectedMuscle(muscle);
                    setActionNote(`Showing ${muscle} exercise ideas for quick programming.`);
                  }}
                />
              ))}
            </View>
            {muscleExercises.map((item) => (
              <View key={item.id} style={styles.generatorCard}>
                <Text style={styles.planTitle}>{item.name}</Text>
                <Text style={styles.exerciseText}>{item.movementPattern} - {item.defaultRepRange}</Text>
                <Text style={styles.copy}>{item.instructions[0]}</Text>
              </View>
            ))}
          </SectionCard>

          <SectionCard
            title="Recent timeline"
            subtitle="Only the last few sessions, so the dashboard stays readable."
            accent={palette.teal}
          >
            {recentTimeline.length === 0 ? (
              <Text style={styles.copy}>Your timeline will populate after the first saved workout.</Text>
            ) : (
              recentTimeline.map((log) => (
                <View key={log.id} style={styles.timelineRow}>
                  <View style={styles.timelineDate}>
                    <Text style={styles.timelineDateText}>{formatShortDate(log.date)}</Text>
                  </View>
                  <View style={styles.timelineBody}>
                    <Text style={styles.planTitle}>{log.exerciseName}</Text>
                    <View style={styles.metricRow}>
                      <MiniStat label="Sets" value={`${log.sets.length}`} />
                      <MiniStat label="Top Set" value={`${Math.max(...log.sets.map((set) => set.weightKg))} kg`} />
                      <MiniStat label="Rest" value={`${log.sets[0]?.restSeconds ?? 0}s`} />
                    </View>
                  </View>
                </View>
              ))
            )}
          </SectionCard>
        </>
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
      paddingHorizontal: spacing.lg,
      paddingBottom: 120,
      gap: spacing.lg
    },
    metricRow: {
      flexDirection: "row",
      gap: spacing.sm,
      flexWrap: "wrap"
    },
    dashboardGrid: {
      flexDirection: "row",
      gap: spacing.sm
    },
    dashboardCard: {
      flex: 1,
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 8,
      ...shadows.card
    },
    dashboardLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    dashboardValue: {
      color: palette.text,
      fontSize: 15,
      lineHeight: 24,
      fontWeight: "600"
    },
    modeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    pageHeader: {
      paddingTop: spacing.sm,
      paddingBottom: spacing.sm,
      gap: 8
    },
    pageEyebrow: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2.2
    },
    pageTitle: {
      color: palette.text,
      fontSize: 34,
      fontWeight: "800"
    },
    pageMetaRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    pageMetaPill: {
      minWidth: 118,
      borderRadius: radius.pill,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: palette.panelAlt,
      borderWidth: 1,
      borderColor: palette.line,
      gap: 2,
      ...shadows.card
    },
    pageMetaLabel: {
      color: palette.textMuted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase"
    },
    pageMetaValue: {
      color: palette.text,
      fontSize: 15,
      lineHeight: 20,
      fontWeight: "700"
    },
    pageMetaValueAccent: {
      color: palette.orange
    },
    pageNote: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24
    },
    streakCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      ...shadows.card
    },
    streakRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: spacing.sm
    },
    streakGlyphWrap: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm
    },
    streakIconWrap: {
      width: 48,
      height: 48,
      borderRadius: radius.pill,
      backgroundColor: palette.panel,
      alignItems: "center",
      justifyContent: "center"
    },
    streakIconWrapBroken: {
      backgroundColor: palette.panelMuted
    },
    streakLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    streakValue: {
      color: palette.orange,
      fontSize: 48,
      lineHeight: 52,
      fontWeight: "800"
    },
    streakHeadline: {
      color: palette.text,
      fontSize: 15,
      lineHeight: 24,
      fontWeight: "600"
    },
    streakPill: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.pill,
      backgroundColor: palette.panel,
      borderWidth: 1,
      borderColor: palette.line
    },
    streakPillLabel: {
      color: palette.text,
      fontWeight: "700",
      fontSize: 12
    },
    streakPillBroken: {
      backgroundColor: palette.panelMuted
    },
    statusCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 6,
      ...shadows.card
    },
    statusLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    statusText: {
      color: palette.text,
      lineHeight: 24,
      fontWeight: "600",
      fontSize: 15
    },
    chartCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 8,
      ...shadows.card
    },
    chartTitle: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    chartSubtitle: {
      color: palette.text,
      fontSize: 15,
      lineHeight: 24
    },
    chartCanvas: {
      borderRadius: radius.md,
      marginLeft: -12
    },
    memoryLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    copy: {
      color: palette.textMuted,
      lineHeight: 24,
      fontSize: 15
    },
    warningCopy: {
      color: palette.orange
    },
    coachPanel: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 8,
      ...shadows.card
    },
    quickGrid: {
      flexDirection: "row",
      gap: spacing.sm
    },
    recentWrap: {
      gap: spacing.sm
    },
    adviceCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 6,
      ...shadows.card
    },
    recentRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.sm,
      paddingVertical: 10,
      paddingHorizontal: spacing.md,
      borderRadius: radius.md,
      backgroundColor: palette.panelAlt
    },
    recentValue: {
      color: palette.text,
      fontWeight: "700"
    },
    recentMeta: {
      color: palette.textMuted
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    exerciseHeader: {
      gap: spacing.md
    },
    exerciseMeta: {
      gap: 6
    },
    exerciseTitle: {
      color: palette.text,
      fontWeight: "800",
      fontSize: 26
    },
    exerciseText: {
      color: palette.textMuted,
      lineHeight: 20
    },
    recommendCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 6,
      ...shadows.card
    },
    recommendLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    recommendValue: {
      color: palette.orange,
      fontSize: 48,
      lineHeight: 52,
      fontWeight: "800"
    },
    instructions: {
      gap: 8
    },
    instructionText: {
      color: palette.text,
      lineHeight: 20
    },
    setTable: {
      gap: spacing.sm
    },
    timerPanel: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      ...shadows.card
    },
    timerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      gap: spacing.md
    },
    timerMeta: {
      flex: 1,
      gap: 6
    },
    timerLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    timerValue: {
      color: palette.orange,
      fontSize: 48,
      lineHeight: 52,
      fontWeight: "800"
    },
    timerValueReady: {
      color: palette.text
    },
    actionRow: {
      flexDirection: "row",
      gap: spacing.sm
    },
    actionItem: {
      flex: 1
    },
    setRow: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadows.card
    },
    setLabel: {
      color: palette.textMuted,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2,
      fontSize: 13
    },
    setInputs: {
      flexDirection: "row",
      gap: spacing.sm
    },
    setField: {
      flex: 1
    },
    setFieldLabel: {
      color: palette.textMuted,
      marginBottom: 6,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    grid: {
      flexDirection: "row",
      gap: spacing.sm
    },
    jumpCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 8,
      ...shadows.card
    },
    jumpHeadline: {
      color: palette.text,
      fontWeight: "700",
      lineHeight: 22
    },
    activePlanCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 6,
      ...shadows.card
    },
    planCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadows.card
    },
    planActive: {
      backgroundColor: palette.panel,
      opacity: 0.95
    },
    planTitle: {
      color: palette.text,
      fontWeight: "700",
      fontSize: 18
    },
    generatorCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 6,
      ...shadows.card
    },
    timelineRow: {
      flexDirection: "row",
      gap: spacing.sm,
      alignItems: "stretch"
    },
    timelineDate: {
      width: 72,
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.sm,
      ...shadows.card
    },
    timelineDateText: {
      color: palette.text,
      fontWeight: "700"
    },
    timelineBody: {
      flex: 1,
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
      ...shadows.card
    }
  });
























