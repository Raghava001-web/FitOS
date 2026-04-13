import React, { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { BodyAnalysisSheet } from "../components/BodyAnalysisSheet";
import { GhostButton, KeyStat, LabeledInput, MiniStat, OptionChip, PrimaryButton, SectionCard } from "../components/ui";
import { formatShortDate } from "../engine/fitness";
import { EXERCISES } from "../data/exercises";
import { getMonthlySummary, getWeeklySummary } from "../engine/habits";
import { readExerciseMemory } from "../hooks/useExerciseMemory";
import { useApp } from "../store/AppContext";
import { radius, shadows, spacing } from "../theme";
import { FitnessGoal } from "../types";

type ProfileMode = "overview" | "body" | "fuel" | "reports" | "history";

const profileModes: Array<{ id: ProfileMode; label: string }> = [
  { id: "overview", label: "Overview" },
  { id: "body", label: "Body" },
  { id: "fuel", label: "Fuel" },
  { id: "reports", label: "Reports" },
  { id: "history", label: "History" }
];

const goalOptions: Array<{ label: string; value: FitnessGoal }> = [
  { label: "fat loss", value: "fat loss" },
  { label: "lean body", value: "lean body" },
  { label: "bulking", value: "bulking" },
  { label: "strength", value: "strength gain" }
];

export const ProfileScreen = () => {
  const { state, metrics, dietPlan, supplementPlan, savedPlans, rank, palette, updateProfile } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [mode, setMode] = useState<ProfileMode>("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editWeight, setEditWeight] = useState("");
  const [editHeight, setEditHeight] = useState("");
  const [editSleepHours, setEditSleepHours] = useState("");
  const [editGoal, setEditGoal] = useState<FitnessGoal>("lean body");
  const [editWorkHours, setEditWorkHours] = useState("");
  const [editError, setEditError] = useState("");
  const [profileNote, setProfileNote] = useState("Update body stats, sleep, and work hours here when your routine changes.");
  const [historyRows, setHistoryRows] = useState<
    Array<{
      exerciseId: string;
      exerciseName: string;
      weight: number;
      reps: number;
      date: string;
      key: string;
    }>
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [selectedHistoryExerciseName, setSelectedHistoryExerciseName] = useState("");

  const profile = state.profile;
  const weekly = getWeeklySummary(state.workoutLogs);
  const monthly = getMonthlySummary(state.workoutLogs);
  const activePlan = savedPlans.find((plan) => plan.id === state.activePlanId) ?? savedPlans[0];
  const badges = [
    rank,
    weekly.sessions >= 3 ? "Consistent Week" : "Building Week",
    state.completedChallengeIds.length > 0 ? "Streak Saver" : "Challenge Ready",
    metrics && metrics.readinessScore >= 70 ? "Green Zone" : "Recovery Aware"
  ];

  const historyGroups = useMemo(() => {
    const grouped = new Map<string, typeof historyRows>();
    [...historyRows]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .forEach((log) => {
        const key = log.date.slice(0, 10);
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(log);
      });
    return [...grouped.entries()].map(([date, logs]) => ({ date, logs }));
  }, [historyRows]);

  const selectedHistoryLogs = useMemo(
    () => (selectedHistoryExerciseName ? historyRows.filter((row) => row.exerciseName === selectedHistoryExerciseName) : []),
    [historyRows, selectedHistoryExerciseName]
  );

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      setHistoryError("");
      try {
        const loaded = await Promise.all(
          EXERCISES.map(async (exercise) => {
            const entries = await readExerciseMemory(exercise.name);
            return entries.map((entry) => ({
              exerciseId: exercise.id,
              exerciseName: exercise.name,
              weight: entry.weight,
              reps: entry.reps,
              date: entry.date,
              key: `${exercise.id}-${entry.date}-${entry.weight}-${entry.reps}`
            }));
          })
        );

        if (cancelled) return;
        const nextRows = loaded
          .flat()
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setHistoryRows(nextRows);
        setSelectedHistoryExerciseName((current) => current || nextRows[0]?.exerciseName || "");
      } catch {
        if (!cancelled) {
          setHistoryError("Workout history could not be loaded right now.");
        }
      } finally {
        if (!cancelled) {
          setHistoryLoading(false);
        }
      }
    };

    void loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  const openEditProfile = () => {
    if (!profile) return;

    const validGoal = goalOptions.some((option) => option.value === profile.primaryGoal)
      ? profile.primaryGoal
      : "lean body";

    setEditWeight(`${profile.weightKg}`);
    setEditHeight(`${profile.heightCm}`);
    setEditSleepHours(`${profile.sleepHours}`);
    setEditGoal(validGoal);
    setEditWorkHours(`${profile.workHoursPerDay}`);
    setEditError("");
    setIsEditOpen(true);
  };

  const handleSaveProfile = () => {
    const weightKg = Number(editWeight.trim());
    const heightCm = Number(editHeight.trim());
    const sleepHours = Number(editSleepHours.trim());
    const workHoursPerDay = Number(editWorkHours.trim());

    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      setEditError("Enter a valid body weight in kilograms.");
      return;
    }

    if (!Number.isFinite(heightCm) || heightCm <= 0) {
      setEditError("Enter a valid height in centimeters.");
      return;
    }

    if (!Number.isFinite(sleepHours) || sleepHours <= 0) {
      setEditError("Enter a valid sleep duration in hours.");
      return;
    }

    if (!Number.isFinite(workHoursPerDay) || workHoursPerDay <= 0) {
      setEditError("Enter valid daily work hours.");
      return;
    }

    updateProfile({
      weightKg,
      heightCm,
      sleepHours,
      primaryGoal: editGoal,
      workHoursPerDay
    });
    setEditError("");
    setProfileNote("Profile updated. Readiness and stress were recalculated from the new body and recovery inputs.");
    setIsEditOpen(false);
  };

  if (!profile || !metrics) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageEyebrow}>Identity and reports</Text>
          <Text style={styles.pageTitle}>Profile</Text>
          <Text style={styles.pageSubtitle}>Body stats, plan state, fuel, and history stay organized in one lane.</Text>
        </View>
        <SectionCard title="Profile" subtitle="Complete onboarding to unlock the profile view.">
          <Text style={styles.copy}>No profile data yet.</Text>
        </SectionCard>
      </ScrollView>
    );
  }

  const selectedHistoryName = selectedHistoryLogs[0]?.exerciseName ?? "Workout history";

  return (
    <>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.pageHeader}>
          <Text style={styles.pageEyebrow}>Identity and reports</Text>
          <Text style={styles.pageTitle}>Profile</Text>
          <Text style={styles.pageSubtitle}>Body stats, plan state, fuel, and history stay organized in one lane.</Text>
        </View>

        <SectionCard
          title="Profile board"
          subtitle="Identity and current status first. Body, fuel, reports, and history stay one tap away."
        >
          <Text style={styles.name}>{profile.name}</Text>
          <Text style={styles.copy}>{profile.email || "No email set"} - goal: {profile.primaryGoal}</Text>
          <View style={styles.metricRow}>
            <KeyStat label="Rank" value={rank} note={`${weekly.sessions} sessions this week`} highlight />
            <KeyStat label="BMI" value={`${metrics.bmi}`} note={metrics.bmiLabel} />
            <KeyStat label="Readiness" value={`${metrics.readinessScore}`} note={metrics.readinessScore < 40 ? "Recovery first" : "Ready to train"} highlight={metrics.readinessScore >= 70} />
          </View>
          <View style={styles.overviewGrid}>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Active plan</Text>
              <Text style={styles.overviewValue}>{activePlan?.name ?? "Choose a split"}</Text>
              <Text style={styles.copy}>{activePlan?.focus ?? "Pick a split from the Exercise tab."}</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Fuel style</Text>
              <Text style={styles.overviewValue}>{dietPlan?.style ?? profile.foodPreference}</Text>
              <Text style={styles.copy}>{supplementPlan.length > 0 ? `${supplementPlan.length} support items recommended` : "No supplement plan yet"}</Text>
            </View>
            <View style={styles.overviewCard}>
              <Text style={styles.overviewLabel}>Current block</Text>
              <Text style={styles.overviewValue}>{weekly.sessions} sessions</Text>
              <Text style={styles.copy}>{monthly.volume} kg moved this month</Text>
            </View>
          </View>
          <View style={styles.noteCard}>
            <Text style={styles.noteLabel}>Latest update</Text>
            <Text style={styles.noteText}>{profileNote}</Text>
          </View>
          <View style={styles.actionRow}>
            <View style={styles.actionItem}>
              <PrimaryButton label="Edit profile" onPress={openEditProfile} />
            </View>
            <View style={styles.actionItem}>
              <GhostButton label="Workout history" onPress={() => setMode("history")} />
            </View>
          </View>
          <View style={styles.modeRow}>
            {profileModes.map((entry) => (
              <OptionChip key={entry.id} label={entry.label} selected={mode === entry.id} onPress={() => setMode(entry.id)} />
            ))}
          </View>
        </SectionCard>

        {mode === "overview" ? (
          <>
            <SectionCard title="Plan + goal history" subtitle="Only the essentials for direction and adherence.">
              {activePlan ? (
                <View style={styles.panel}>
                  <Text style={styles.cardTitle}>{activePlan.name}</Text>
                  <Text style={styles.copy}>{activePlan.focus}</Text>
                  <Text style={styles.copy}>{activePlan.days.join(" - ")}</Text>
                </View>
              ) : (
                <Text style={styles.copy}>Choose a split from the Exercise tab to pin it here.</Text>
              )}
              <View style={styles.metricRow}>
                <MiniStat label="Goal now" value={profile.primaryGoal} />
                <MiniStat label="Food style" value={dietPlan?.style ?? "--"} />
                <MiniStat label="Reminder mode" value={profile.reminderMode} />
              </View>
            </SectionCard>

            <SectionCard title="Achievements" subtitle="A lighter overview of your current badge state.">
              <View style={styles.badgeWrap}>
                {badges.map((badge) => (
                  <View key={badge} style={styles.badge}>
                    <Text style={styles.badgeText}>{badge}</Text>
                  </View>
                ))}
              </View>
            </SectionCard>
          </>
        ) : null}

        {mode === "body" ? (
          <>
            <SectionCard title="BMI + body analysis sheet" subtitle="Sample visual report inspired by printed body-composition sheets.">
              <BodyAnalysisSheet profile={profile} metrics={metrics} />
            </SectionCard>

            <SectionCard title="Medical notes" subtitle="Protect joints, keep the important context easy to scan.">
              <View style={styles.panel}>
                <Text style={styles.cardTitle}>Medical notes</Text>
                <Text style={styles.copy}>{profile.medicalNotes || "No medical notes saved."}</Text>
              </View>
              <View style={styles.metricRow}>
                <MiniStat label="Weekly sessions" value={`${weekly.sessions}`} />
                <MiniStat label="Weekly volume" value={`${weekly.volume} kg`} />
                <MiniStat label="Monthly volume" value={`${monthly.volume} kg`} />
              </View>
            </SectionCard>
          </>
        ) : null}

        {mode === "fuel" ? (
          <SectionCard title="Diet, grocery list, supplements" subtitle="Your generated calories, macros, shopping list, and support stack.">
            {dietPlan ? (
              <>
                <View style={styles.metricRow}>
                  <MiniStat label="Calories" value={`${dietPlan.calories}`} />
                  <MiniStat label="Protein" value={`${dietPlan.protein} g`} />
                  <MiniStat label="Carbs" value={`${dietPlan.carbs} g`} />
                </View>
                <View style={styles.groceryWrap}>
                  {dietPlan.groceryList.map((item) => (
                    <View key={item} style={styles.groceryChip}>
                      <Text style={styles.groceryText}>{item}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : null}
            <View style={styles.panel}>
              <Text style={styles.cardTitle}>Supplement tracker</Text>
              <Text style={styles.copy}>{supplementPlan.join(" - ") || "No supplement recommendation yet."}</Text>
            </View>
          </SectionCard>
        ) : null}

        {mode === "reports" ? (
          <SectionCard title="Reports + share card" subtitle="A compact summary card that is easier to screenshot and review.">
            <View style={styles.metricRow}>
              <MiniStat label="Weekly sessions" value={`${weekly.sessions}`} />
              <MiniStat label="Monthly volume" value={`${monthly.volume} kg`} />
              <MiniStat label="Consistency" value={`${metrics.consistencyRank}`} />
            </View>
            <View style={styles.shareCard}>
              <Text style={styles.shareBrand}>FitOS Progress Card</Text>
              <Text style={styles.shareName}>{profile.name}</Text>
              <Text style={styles.shareStats}>Rank {rank} - {weekly.sessions} sessions this week - {metrics.consistencyRank} consistency</Text>
              <Text style={styles.shareStats}>Current goal: {profile.primaryGoal}</Text>
            </View>
          </SectionCard>
        ) : null}

        {mode === "history" ? (
          <SectionCard title="Workout history" subtitle="Every saved set grouped by date. Tap an exercise to inspect the full trail.">
            {historyLoading ? (
              <View style={styles.searchState}>
                <ActivityIndicator color={palette.orange} />
                <Text style={styles.copy}>Loading workout history...</Text>
              </View>
            ) : null}
            {historyError ? <Text style={styles.errorText}>{historyError}</Text> : null}
            {!historyLoading && historyGroups.length === 0 ? (
              <Text style={styles.copy}>No workouts logged yet.</Text>
            ) : null}
            {!historyLoading && historyGroups.length > 0 ? (
              <View style={styles.historyList}>
                {historyGroups.map((group) => (
                  <View key={group.date} style={styles.historyDay}>
                    <Text style={styles.historyDate}>{formatShortDate(group.date)}</Text>
                    <View style={styles.historyRows}>
                      {group.logs.map((log) => {
                        const selected = selectedHistoryExerciseName === log.exerciseName;
                        return (
                          <Pressable
                            key={log.key}
                            onPress={() => setSelectedHistoryExerciseName(log.exerciseName)}
                            style={({ pressed }) => [
                              styles.historyRow,
                              selected ? styles.historyRowSelected : null,
                              pressed ? styles.historyRowPressed : null
                            ]}
                          >
                            <View style={styles.historyRowMain}>
                              <Text style={styles.historyExercise}>{log.exerciseName}</Text>
                              <Text style={styles.historyMeta}>{log.weight} kg x {log.reps}</Text>
                            </View>
                            <Text style={styles.historyChevron}>View</Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            {selectedHistoryLogs.length > 0 ? (
              <View style={styles.historyDetail}>
                <Text style={styles.cardTitle}>{selectedHistoryName}</Text>
                <Text style={styles.copy}>Full history for this exercise.</Text>
                {selectedHistoryLogs.map((entry) => (
                  <View key={entry.key} style={styles.historySession}>
                    <Text style={styles.historySessionTitle}>{formatShortDate(entry.date)}</Text>
                    <Text style={styles.historySessionLine}>{entry.weight} kg x {entry.reps}</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </SectionCard>
        ) : null}
      </ScrollView>

      <Modal animationType="slide" transparent visible={isEditOpen} onRequestClose={() => setIsEditOpen(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit profile</Text>
            <Text style={styles.copy}>Update the core inputs that drive readiness, stress, and the plan suggestions.</Text>
            <View style={styles.modalGrid}>
              <LabeledInput label="Weight (kg)" value={editWeight} onChangeText={setEditWeight} keyboardType="numeric" />
              <LabeledInput label="Height (cm)" value={editHeight} onChangeText={setEditHeight} keyboardType="numeric" />
            </View>
            <View style={styles.modalGrid}>
              <LabeledInput label="Sleep hours" value={editSleepHours} onChangeText={setEditSleepHours} keyboardType="numeric" />
              <LabeledInput label="Work hours / day" value={editWorkHours} onChangeText={setEditWorkHours} keyboardType="numeric" />
            </View>
            <View style={styles.goalGroup}>
              <Text style={styles.goalLabel}>Goal</Text>
              <View style={styles.chips}>
                {goalOptions.map((option) => (
                  <OptionChip
                    key={option.value}
                    label={option.label}
                    selected={editGoal === option.value}
                    onPress={() => setEditGoal(option.value)}
                  />
                ))}
              </View>
            </View>
            {editError ? <Text style={styles.errorText}>{editError}</Text> : null}
            <View style={styles.actionRow}>
              <View style={styles.actionItem}>
                <PrimaryButton label="Save profile" onPress={handleSaveProfile} />
              </View>
              <View style={styles.actionItem}>
                <GhostButton label="Cancel" onPress={() => setIsEditOpen(false)} />
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    pageHeader: {
      paddingTop: 52,
      paddingBottom: 14,
      gap: 6
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
      fontSize: 32,
      fontWeight: "800"
    },
    pageSubtitle: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24
    },
    modeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    name: {
      color: palette.text,
      fontWeight: "800",
      fontSize: 32
    },
    overviewGrid: {
      gap: spacing.sm
    },
    overviewCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 6,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    overviewLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    overviewValue: {
      color: palette.text,
      fontSize: 15,
      lineHeight: 24,
      fontWeight: "600"
    },
    copy: {
      color: palette.textMuted,
      lineHeight: 24,
      fontSize: 15
    },
    metricRow: {
      flexDirection: "row",
      gap: spacing.sm,
      flexWrap: "wrap"
    },
    noteCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 6,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    noteLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    noteText: {
      color: palette.text,
      fontWeight: "600",
      lineHeight: 24,
      fontSize: 15
    },
    panel: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 6,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    cardTitle: {
      color: palette.text,
      fontWeight: "700",
      fontSize: 15
    },
    groceryWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    groceryChip: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: palette.line,
      paddingHorizontal: 14,
      paddingVertical: 10,
      ...shadows.card
    },
    groceryText: {
      color: palette.text
    },
    badgeWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    badge: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: palette.line,
      paddingHorizontal: 14,
      paddingVertical: 10,
      ...shadows.card
    },
    badgeText: {
      color: palette.text,
      fontWeight: "700"
    },
    shareCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    shareBrand: {
      color: palette.textMuted,
      fontSize: 13,
      textTransform: "uppercase",
      letterSpacing: 2
    },
    shareName: {
      color: palette.text,
      fontSize: 24,
      fontWeight: "800"
    },
    shareStats: {
      color: palette.textMuted,
      lineHeight: 24,
      fontSize: 15
    },
    searchState: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: 6
    },
    historyList: {
      gap: spacing.md
    },
    historyDay: {
      gap: spacing.sm
    },
    historyDate: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    historyRows: {
      gap: spacing.sm
    },
    historyRow: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    historyRowPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.985 }]
    },
    historyRowSelected: {
      backgroundColor: palette.panel,
      opacity: 0.95
    },
    historyRowMain: {
      flex: 1,
      gap: 4
    },
    historyExercise: {
      color: palette.text,
      fontSize: 15,
      fontWeight: "700"
    },
    historyMeta: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24
    },
    historyChevron: {
      color: palette.orange,
      fontWeight: "700"
    },
    historyDetail: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    historySession: {
      gap: 4,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: palette.line
    },
    historySessionTitle: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    historySessionLine: {
      color: palette.text,
      fontSize: 15,
      lineHeight: 24
    },
    actionRow: {
      flexDirection: "row",
      gap: spacing.sm
    },
    actionItem: {
      flex: 1
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(4, 10, 18, 0.82)",
      justifyContent: "center",
      padding: spacing.lg
    },
    modalCard: {
      backgroundColor: palette.panel,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    modalTitle: {
      color: palette.text,
      fontSize: 24,
      fontWeight: "800"
    },
    modalGrid: {
      flexDirection: "row",
      gap: spacing.sm
    },
    goalGroup: {
      gap: spacing.sm
    },
    goalLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    errorText: {
      color: palette.orange,
      lineHeight: 20
    }
  });











