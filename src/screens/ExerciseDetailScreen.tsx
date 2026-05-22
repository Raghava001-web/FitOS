import React, { useEffect, useMemo, useState } from "react";
import { Linking, ScrollView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { ExerciseDemo } from "../components/ExerciseDemo";
import { SetLogger } from "../components/SetLogger";
import {
  GhostButton,
  LabeledInput,
  MiniStat,
  PrimaryButton,
  SectionCard,
} from "../components/ui";
import {
  formatShortDate,
  getExerciseById,
  getExerciseLogs,
  recommendProgression,
} from "../engine/fitness";
import { useExerciseMemory } from "../hooks/useExerciseMemory";
import { useApp } from "../store/AppContext";
import { radius, shadows, spacing } from "../theme";
import { EXERCISES } from "../data/exercises";
import type { LoggedSet } from "../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExerciseStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<ExerciseStackParamList, "ExerciseDetail">;

type DraftSet = {
  reps: string;
  weightKg: string;
  restSeconds: string;
};

const makeDrafts = (weightKg: number, restSeconds: number, reps = 8): DraftSet[] => [
  { reps: `${reps}`, weightKg: `${weightKg}`, restSeconds: `${restSeconds}` },
  { reps: `${reps}`, weightKg: `${weightKg}`, restSeconds: `${restSeconds}` },
  { reps: `${reps}`, weightKg: `${weightKg}`, restSeconds: `${restSeconds}` },
];

const formatDuration = (totalSeconds: number) => {
  const safe = Math.max(0, totalSeconds);
  const m = Math.floor(safe / 60).toString().padStart(2, "0");
  const s = Math.floor(safe % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

export const ExerciseDetailScreen = ({ route, navigation }: Props) => {
  const { exerciseId } = route.params;
  const { state, metrics, logWorkout, palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const profile = state.profile;

  const exercise = useMemo(
    () => getExerciseById(exerciseId) ?? EXERCISES[0],
    [exerciseId]
  );
  const exerciseLogs = useMemo(
    () => getExerciseLogs(state.workoutLogs, exerciseId),
    [state.workoutLogs, exerciseId]
  );
  const lastLog = exerciseLogs[0];

  const {
    hydrated: memoryHydrated,
    history: memoryHistory,
    lastSet: memoryLastSet,
    bestSet,
    logSet,
    logSets,
  } = useExerciseMemory(exercise.name);

  const advice = useMemo(() => {
    if (!profile || !metrics) return null;
    return recommendProgression(profile, metrics, exercise, state.workoutLogs);
  }, [exercise, metrics, profile, state.workoutLogs]);

  // ── Quick log state ────────────────────────────────────────────────────
  const [quickWeight, setQuickWeight] = useState("");
  const [quickReps, setQuickReps] = useState("8");
  const [quickLogged, setQuickLogged] = useState(false);
  const [actionNote, setActionNote] = useState(
    "Review the last set and PR, then log your working sets."
  );

  // ── Full session state ─────────────────────────────────────────────────
  const [draftSets, setDraftSets] = useState<DraftSet[]>(makeDrafts(20, 90));
  const [notes, setNotes] = useState("");

  // ── Timers ─────────────────────────────────────────────────────────────
  const [sessionElapsed, setSessionElapsed] = useState(0);
  const [sessionActive, setSessionActive] = useState(false);
  const [restRunning, setRestRunning] = useState(false);
  const recommendedRest = Math.max(
    15,
    Number(draftSets[0]?.restSeconds) || exercise.restSeconds
  );
  const [restTarget, setRestTarget] = useState(exercise.restSeconds);
  const [restRemaining, setRestRemaining] = useState(exercise.restSeconds);

  // ── Chart ──────────────────────────────────────────────────────────────
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = Math.max(280, screenWidth - spacing.lg * 2 - 8);
  const trendPoints = useMemo(() => {
    const byDay = new Map<string, { date: string; weight: number }>();
    memoryHistory.forEach((e) => {
      byDay.set(e.date.slice(0, 10), { date: e.date.slice(0, 10), weight: e.weight });
    });
    return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date)).slice(-5);
  }, [memoryHistory]);

  // ── Derived ────────────────────────────────────────────────────────────
  const fallbackLast = lastLog?.sets[lastLog.sets.length - 1];
  const displayLast = memoryLastSet ?? (fallbackLast
    ? { weight: fallbackLast.weightKg, reps: fallbackLast.reps, date: lastLog.date }
    : null);

  const dedupedHistory = useMemo(() => {
    const seen = new Set<string>();
    const ordered = [...memoryHistory].reverse();
    return ordered
      .filter((e) => {
        const sig = e.date;
        if (seen.has(sig)) return false;
        seen.add(sig);
        return true;
      })
      .reverse();
  }, [memoryHistory]);

  const recentSets = useMemo(
    () =>
      dedupedHistory
        .slice(-4)
        .reverse()
        .map((e, i) => ({ ...e, key: `${e.date}-${e.weight}-${e.reps}-${i}` })),
    [dedupedHistory]
  );

  // ── Seeds ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (memoryLastSet) {
      setQuickWeight(`${memoryLastSet.weight}`);
      setQuickReps(`${memoryLastSet.reps}`);
      return;
    }
    const prev = lastLog?.sets[lastLog.sets.length - 1];
    if (prev) { setQuickWeight(`${prev.weightKg}`); setQuickReps(`${prev.reps}`); return; }
    setQuickWeight(`${advice?.recommendedWeightKg ?? 20}`);
    setQuickReps("8");
  }, [memoryLastSet?.date, lastLog?.id, advice?.recommendedWeightKg, exerciseId]);

  useEffect(() => {
    if (memoryLastSet) {
      setDraftSets(makeDrafts(memoryLastSet.weight, exercise.restSeconds, memoryLastSet.reps));
      return;
    }
    if (lastLog) {
      setDraftSets(lastLog.sets.map((s) => ({
        reps: `${s.reps}`, weightKg: `${s.weightKg}`, restSeconds: `${s.restSeconds}`,
      })));
      return;
    }
    setDraftSets(makeDrafts(advice?.recommendedWeightKg ?? 20, exercise.restSeconds));
  }, [exerciseId, memoryLastSet?.date, lastLog?.id, advice?.recommendedWeightKg, exercise.restSeconds]);

  // ── Session clock ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!sessionActive) return;
    const id = setInterval(() => setSessionElapsed((c) => c + 1), 1000);
    return () => clearInterval(id);
  }, [sessionActive]);

  // ── Rest timer ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!restRunning || restRemaining <= 0) {
      if (restRunning && restRemaining <= 0) {
        setRestRunning(false);
        setActionNote(`Rest complete. ${exercise.name} is ready for the next set.`);
      }
      return;
    }
    const t = setTimeout(() => setRestRemaining((c) => Math.max(c - 1, 0)), 1000);
    return () => clearTimeout(t);
  }, [restRunning, restRemaining, exercise.name]);

  // ── Handlers ───────────────────────────────────────────────────────────
  const startRest = (seconds = recommendedRest) => {
    const s = Math.max(15, Math.round(seconds));
    setSessionActive(true);
    setRestTarget(s);
    setRestRemaining(s);
    setRestRunning(true);
  };

  const handleQuickLog = async () => {
    const w = Number(quickWeight.trim());
    const r = Number(quickReps.trim());
    if (!Number.isFinite(w) || !Number.isFinite(r) || r <= 0) {
      setActionNote("Enter valid weight and reps.");
      return;
    }
    await logSet(w, r);
    setSessionActive(true);
    startRest(recommendedRest);
    setQuickLogged(true);
    setActionNote(`Logged ${exercise.name}: ${w} kg x ${r}. Memory updated.`);
    setTimeout(() => setQuickLogged(false), 1600);
  };

  const saveWorkout = async () => {
    const sets: LoggedSet[] = draftSets.map((s, i) => ({
      setNumber: i + 1,
      reps: Number(s.reps) || 0,
      weightKg: Number(s.weightKg) || 0,
      restSeconds: Number(s.restSeconds) || exercise.restSeconds,
      durationSeconds: 40,
    }));
    const valid = sets.some((s) => s.reps > 0 && Number.isFinite(s.weightKg));
    if (!valid) { setActionNote("Add at least one valid set."); return; }

    logWorkout({ exerciseId: exercise.id, exerciseName: exercise.name, sets, notes });
    await logSets(sets.map((s) => ({ weightKg: s.weightKg, reps: s.reps })));

    const totalVolume = sets.reduce((sum, s) => sum + s.weightKg * s.reps, 0);
    navigation.replace("WorkoutSummary", {
      exerciseName: exercise.name,
      setsCount: sets.length,
      totalVolume: Math.round(totalVolume),
    });
  };

  const addSet = () => {
    setSessionActive(true);
    setDraftSets((c) => [
      ...c,
      { reps: quickReps || "8", weightKg: quickWeight || "20", restSeconds: `${exercise.restSeconds}` },
    ]);
  };

  const openRef = async () => {
    try {
      if (await Linking.canOpenURL(exercise.youtubeUrl)) await Linking.openURL(exercise.youtubeUrl);
    } catch { /* ignore */ }
  };

  const restLabel = restRunning ? "Running" : restRemaining === 0 ? "Ready" : "Paused";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ── Header ────────────────────────────────────────────────────── */}
      <View style={styles.header}>
        <GhostButton label="Back" onPress={() => navigation.goBack()} />
        <Text style={styles.eyebrow}>Exercise detail</Text>
        <Text style={styles.title}>{exercise.name}</Text>
        <Text style={styles.sub}>
          {exercise.targetMuscle} - {exercise.defaultRepRange} reps - rest {exercise.restSeconds}s - {exercise.movementPattern}
        </Text>
        <Text style={styles.note}>{actionNote}</Text>
      </View>

      {/* ── Memory + Quick log ────────────────────────────────────────── */}
      <SectionCard title="Core loop" subtitle="Log the set you used today so the next session opens with the right memory." accent={palette.teal}>
        <View style={styles.statRow}>
          <MiniStat label="Memory" value={memoryHydrated ? "Ready" : "Loading"} />
          <MiniStat label="PR" value={bestSet ? `${bestSet.weight} kg x ${bestSet.reps}` : "Not yet"} />
          <MiniStat label="Last set" value={displayLast ? `${displayLast.weight} kg x ${displayLast.reps}` : "None"} />
        </View>
        <View style={styles.grid}>
          <LabeledInput label="Weight (kg)" value={quickWeight} onChangeText={setQuickWeight} keyboardType="numeric" />
          <LabeledInput label="Reps" value={quickReps} onChangeText={setQuickReps} keyboardType="numeric" />
        </View>
        <PrimaryButton label={quickLogged ? "Set logged!" : "Log this set"} onPress={() => void handleQuickLog()} tone={quickLogged ? palette.lime : palette.orange} />
        {recentSets.length > 0 ? (
          <View style={styles.recentWrap}>
            <Text style={styles.sectionLabel}>Recent memory</Text>
            {recentSets.map((e) => (
              <View key={e.key} style={styles.recentRow}>
                <Text style={styles.recentVal}>{e.weight} kg x {e.reps}</Text>
                <Text style={styles.recentMeta}>{formatShortDate(e.date)}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </SectionCard>

      {/* ── Coach advice ──────────────────────────────────────────────── */}
      {advice ? (
        <SectionCard title="Coach guardrails" subtitle={advice.summary} accent={palette.red}>
          <Text style={styles.adviceValue}>Suggested load: {advice.recommendedWeightKg} kg</Text>
          {advice.reasoning.slice(0, 2).map((r) => <Text key={r} style={styles.copy}>- {r}</Text>)}
          {advice.warnings.slice(0, 2).map((w) => <Text key={w} style={[styles.copy, styles.warningCopy]}>Warning: {w}</Text>)}
        </SectionCard>
      ) : null}

      {/* ── Demo + instructions ───────────────────────────────────────── */}
      <SectionCard title="Form reference" accent={palette.blue}>
        <ExerciseDemo name={exercise.name} />
        {exercise.instructions.map((step, i) => (
          <Text key={`inst-${i}`} style={styles.copy}>{i + 1}. {step}</Text>
        ))}
        <SetLogger exerciseName={exercise.name} />
        <GhostButton label="Open YouTube reference" onPress={() => void openRef()} />
      </SectionCard>

      {/* ── Weight trend chart ────────────────────────────────────────── */}
      {trendPoints.length > 0 ? (
        <SectionCard title="Weight trend" subtitle="Last 5 sessions for this lift." accent={palette.gold}>
          <LineChart
            data={{
              labels: trendPoints.map((p) => formatShortDate(p.date)),
              datasets: [{ data: trendPoints.map((p) => p.weight) }],
            }}
            width={chartWidth}
            height={220}
            withDots
            withInnerLines={false}
            withOuterLines={false}
            bezier
            fromZero
            yAxisSuffix=" kg"
            style={styles.chart}
            chartConfig={{
              backgroundGradientFrom: palette.panel,
              backgroundGradientTo: palette.panel,
              decimalPlaces: 0,
              color: (o = 1) => `rgba(34, 211, 238, ${o})`,
              labelColor: () => palette.textMuted,
              propsForBackgroundLines: { stroke: palette.line, strokeWidth: 1 },
              propsForDots: { r: "3" },
            }}
          />
        </SectionCard>
      ) : null}

      {/* ── Full session logger ────────────────────────────────────────── */}
      <SectionCard title="Full session logger" subtitle="Track sets, reps, weight, rest, and sync the result back into memory." accent={palette.lime}>
        <View style={styles.setTable}>
          {draftSets.map((set, i) => (
            <View key={`set-${i}`} style={styles.setRow}>
              <Text style={styles.setLabel}>Set {i + 1}</Text>
              <View style={styles.setInputs}>
                <View style={styles.setField}>
                  <Text style={styles.setFieldLabel}>kg</Text>
                  <LabeledInput label="" value={set.weightKg} onChangeText={(v) => setDraftSets((c) => c.map((s, j) => j === i ? { ...s, weightKg: v } : s))} keyboardType="numeric" />
                </View>
                <View style={styles.setField}>
                  <Text style={styles.setFieldLabel}>reps</Text>
                  <LabeledInput label="" value={set.reps} onChangeText={(v) => setDraftSets((c) => c.map((s, j) => j === i ? { ...s, reps: v } : s))} keyboardType="numeric" />
                </View>
                <View style={styles.setField}>
                  <Text style={styles.setFieldLabel}>rest</Text>
                  <LabeledInput label="" value={set.restSeconds} onChangeText={(v) => setDraftSets((c) => c.map((s, j) => j === i ? { ...s, restSeconds: v } : s))} keyboardType="numeric" />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Timer panel */}
        <View style={styles.timerPanel}>
          <View style={styles.timerHeader}>
            <View>
              <Text style={styles.sectionLabel}>Rest timer</Text>
              <Text style={styles.copy}>Recommended: {recommendedRest}s</Text>
            </View>
            <Text style={[styles.timerValue, restRemaining === 0 ? styles.timerReady : null]}>{formatDuration(restRemaining)}</Text>
          </View>
          <View style={styles.statRow}>
            <MiniStat label="Status" value={restLabel} />
            <MiniStat label="Target" value={`${restTarget}s`} />
            <MiniStat label="Session" value={formatDuration(sessionElapsed)} />
          </View>
          <View style={styles.actionRow}>
            <View style={{ flex: 1 }}>
              <PrimaryButton label={restRunning ? "Restart rest" : "Start rest"} onPress={() => startRest()} />
            </View>
            <View style={{ flex: 1 }}>
              <GhostButton label="+30 sec" onPress={() => { setRestRunning(true); setRestRemaining((c) => c + 30); setRestTarget((c) => c + 30); }} />
            </View>
          </View>
          <View style={styles.actionRow}>
            <View style={{ flex: 1 }}>
              <GhostButton label={sessionActive ? "Pause session" : "Start session"} onPress={() => setSessionActive(!sessionActive)} />
            </View>
            <View style={{ flex: 1 }}>
              <GhostButton label={restRemaining === 0 ? "Reset clock" : "Skip rest"} onPress={() => {
                if (restRemaining === 0) { setSessionActive(false); setSessionElapsed(0); }
                else { setRestRunning(false); setRestRemaining(0); }
              }} />
            </View>
          </View>
        </View>

        <GhostButton label="Add another set" onPress={addSet} />
        <LabeledInput label="Session notes" value={notes} onChangeText={setNotes} placeholder="RPE, pain, mood, or form notes" multiline />
        <PrimaryButton label="Save workout memory" onPress={() => void saveWorkout()} />
      </SectionCard>
    </ScrollView>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: 120, gap: spacing.lg },
    header: { paddingTop: spacing.sm, gap: 6 },
    eyebrow: { color: palette.textMuted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 2 },
    title: { color: palette.text, fontSize: 28, fontWeight: "800" },
    sub: { color: palette.textMuted, fontSize: 14, lineHeight: 22 },
    note: { color: palette.textMuted, fontSize: 15, lineHeight: 24 },
    statRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
    grid: { flexDirection: "row", gap: spacing.sm },
    copy: { color: palette.textMuted, lineHeight: 20 },
    warningCopy: { color: palette.red },
    adviceValue: { color: palette.text, fontSize: 16, fontWeight: "700" },
    sectionLabel: { color: palette.textMuted, fontSize: 13, fontWeight: "700", textTransform: "uppercase", letterSpacing: 2 },
    recentWrap: { gap: spacing.xs },
    recentRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6 },
    recentVal: { color: palette.text, fontWeight: "600" },
    recentMeta: { color: palette.textMuted },
    chart: { borderRadius: radius.lg, overflow: "hidden" },
    setTable: { gap: spacing.sm },
    setRow: { gap: 6 },
    setLabel: { color: palette.textMuted, fontWeight: "700", fontSize: 13, textTransform: "uppercase", letterSpacing: 2 },
    setInputs: { flexDirection: "row", gap: spacing.sm },
    setField: { flex: 1, gap: 4 },
    setFieldLabel: { color: palette.textMuted, fontSize: 11, textTransform: "uppercase", letterSpacing: 1 },
    timerPanel: { backgroundColor: palette.panelAlt, borderRadius: radius.lg, padding: spacing.md, gap: spacing.md, borderWidth: 1, borderColor: palette.line, ...shadows.card },
    timerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    timerValue: { color: palette.text, fontSize: 32, fontWeight: "800" },
    timerReady: { color: palette.lime },
    actionRow: { flexDirection: "row", gap: spacing.sm },
  });
