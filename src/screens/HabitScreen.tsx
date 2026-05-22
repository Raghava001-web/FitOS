import React, { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useApp } from "../store/AppContext";
import { normalizeHabitForToday } from "../engine/habits";
import { SectionCard, GhostButton, OptionChip, PrimaryButton } from "../components/ui";
import { HabitHeatmap } from "../components/HabitHeatmap";
import { radius, shadows, spacing } from "../theme";
import type { Habit, HabitCategory } from "../types";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { HabitStackParamList } from "../navigation/types";

const categoryIcons: Record<HabitCategory, string> = {
  Gym: "barbell-outline",
  Water: "water-outline",
  Tablets: "medkit-outline",
  Sleep: "moon-outline",
  Meals: "restaurant-outline",
  "Assignments/Studies": "school-outline",
  Recovery: "heart-outline",
  Custom: "ellipse-outline",
};

const todayKey = () => {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const d = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${d}`;
};

type Props = NativeStackScreenProps<HabitStackParamList, "HabitList">;

export const HabitScreen = ({ navigation }: Props) => {
  const { state, palette, completeHabitSlot, addHabit, drawChallenge, completeChallenge } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const today = todayKey();

  const habits = state.habits.map(normalizeHabitForToday);

  const totalSlots = habits.reduce((sum, h) => sum + h.timeSlots.length, 0);
  const doneSlots = habits.reduce((sum, h) => sum + h.completedSlotsToday.length, 0);
  const completionPct = totalSlots > 0 ? Math.round((doneSlots / totalSlots) * 100) : 0;

  const longestStreak = habits.reduce((best, h) => Math.max(best, h.streak), 0);

  const brokenHabits = habits.filter((h) => {
    if (!h.lastCompletedDate) return h.streak === 0 && h.timeSlots.length > 0;
    const last = new Date(h.lastCompletedDate);
    const now = new Date(today);
    const gap = Math.floor((now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24));
    return gap > 1;
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Daily Habits</Text>
        <Text style={styles.headline}>Build the rhythm.</Text>
        <Text style={styles.subhead}>
          {completionPct === 100
            ? "Every slot is done today. Protect the streak."
            : `${doneSlots} / ${totalSlots} slots completed today (${completionPct}%).`}
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{longestStreak}</Text>
            <Text style={styles.statLabel}>Top streak</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={styles.statValue}>{habits.length}</Text>
            <Text style={styles.statLabel}>Habits</Text>
          </View>
          <View style={styles.statPill}>
            <Text style={[styles.statValue, completionPct === 100 ? styles.statComplete : null]}>
              {completionPct}%
            </Text>
            <Text style={styles.statLabel}>Today</Text>
          </View>
        </View>
      </View>

      {/* Streak warning */}
      {brokenHabits.length > 0 && !state.activeChallenge ? (
        <SectionCard
          title="Broken streak"
          subtitle={`${brokenHabits.length} habit${brokenHabits.length > 1 ? "s" : ""} missed a day. Draw a recovery challenge to restore them.`}
          accent={palette.red}
        >
          <PrimaryButton
            label="Draw recovery challenge"
            onPress={() => {
              drawChallenge();
              navigation.push("RecoveryChallenge", {});
            }}
            tone={palette.red}
          />
        </SectionCard>
      ) : null}

      {/* Active challenge */}
      {state.activeChallenge ? (
        <SectionCard
          title="Recovery challenge"
          subtitle={state.activeChallenge.description}
          accent={palette.gold}
        >
          <Text style={styles.challengeTitle}>{state.activeChallenge.title}</Text>
          <Text style={styles.copy}>
            Complete this challenge to restore all broken streaks and earn the{" "}
            {state.activeChallenge.rewardBadge} badge.
          </Text>
          <PrimaryButton
            label="Start challenge"
            onPress={() => navigation.push("RecoveryChallenge", {})}
            tone={palette.gold}
          />
        </SectionCard>
      ) : null}

      {/* Habit cards */}
      {habits.map((habit) => {
        const allDone = habit.completedSlotsToday.length === habit.timeSlots.length;
        const iconName = categoryIcons[habit.category] ?? "ellipse-outline";

        return (
          <SectionCard
            key={habit.id}
            title={habit.name}
            subtitle={
              allDone
                ? `All ${habit.timeSlots.length} slots done today. Streak: ${habit.streak}.`
                : `${habit.completedSlotsToday.length} / ${habit.timeSlots.length} slots done.`
            }
            accent={allDone ? palette.lime : palette.orange}
          >
            <View style={styles.habitHeader}>
              <View style={[styles.habitIcon, allDone ? styles.habitIconDone : null]}>
                <Ionicons
                  name={iconName as any}
                  size={20}
                  color={allDone ? palette.lime : palette.orange}
                />
              </View>
              <View style={styles.habitMeta}>
                <Text style={styles.habitStreak}>
                  {habit.streak > 0 ? `🔥 ${habit.streak} day streak` : "No streak yet"}
                </Text>
              </View>
            </View>

            <View style={styles.slotGrid}>
              {habit.timeSlots.map((slot) => {
                const done = habit.completedSlotsToday.includes(slot);
                return (
                  <Pressable
                    key={`${habit.id}-${slot}`}
                    onPress={() => {
                      if (!done) completeHabitSlot(habit.id, slot);
                    }}
                    style={({ pressed }) => [
                      styles.slotChip,
                      done ? styles.slotDone : null,
                      pressed && !done ? styles.slotPressed : null,
                    ]}
                  >
                    <Ionicons
                      name={done ? "checkmark-circle" : "ellipse-outline"}
                      size={16}
                      color={done ? palette.lime : palette.textMuted}
                    />
                    <Text style={[styles.slotText, done ? styles.slotTextDone : null]}>
                      {slot}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {habit.historyDates && habit.historyDates.length > 0 ? (
              <HabitHeatmap habitName={habit.name} streak={habit.streak} historyDates={habit.historyDates} />
            ) : null}
          </SectionCard>
        );
      })}

      {/* ── Add habit ─────────────────────────────────────────────────────── */}
      <SectionCard
        title="New habit"
        subtitle="Add a simple repeating habit to your daily list."
        accent={palette.teal}
      >
        <QuickAddHabit onAdd={addHabit} palette={palette} />
      </SectionCard>
    </ScrollView>
  );
};

// ── Quick add habit inline component ──────────────────────────────────────
const QuickAddHabit = ({
  onAdd,
  palette,
}: {
  onAdd: (h: Pick<Habit, "name" | "category" | "timeSlots">) => void;
  palette: ReturnType<typeof useApp>["palette"];
}) => {
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState<HabitCategory>("Custom");
  const categories: HabitCategory[] = [
    "Gym", "Water", "Tablets", "Sleep", "Meals", "Recovery", "Custom",
  ];

  const styles = useMemo(() => createStyles(palette), [palette]);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd({
      name: trimmed,
      category,
      timeSlots: category === "Water" ? ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"] : ["09:00"],
    });
    setName("");
  };

  return (
    <View style={styles.addWrap}>
      <View style={styles.addInput}>
        <Text style={styles.addLabel}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="e.g. Stretching"
          placeholderTextColor={palette.textMuted}
          style={styles.inputBox}
        />
      </View>
      <View style={{ gap: 8 }}>
        <Text style={styles.addLabel}>Category</Text>
        <View style={styles.chipRow}>
          {categories.map((cat) => (
            <OptionChip
              key={cat}
              label={cat}
              selected={category === cat}
              onPress={() => setCategory(cat)}
            />
          ))}
        </View>
      </View>
      <PrimaryButton label="Add habit" onPress={handleAdd} />
    </View>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.background },
    content: { padding: spacing.md, gap: spacing.lg, paddingBottom: 48 },

    hero: {
      backgroundColor: palette.panel,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card,
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
      fontSize: 28,
      fontWeight: "800",
      lineHeight: 34,
    },
    subhead: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24,
    },
    statsRow: {
      flexDirection: "row",
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    statPill: {
      flex: 1,
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      alignItems: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: palette.line,
    },
    statValue: {
      color: palette.text,
      fontSize: 22,
      fontWeight: "800",
    },
    statComplete: {
      color: palette.lime,
    },
    statLabel: {
      color: palette.textMuted,
      fontSize: 11,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.5,
    },

    challengeTitle: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "800",
    },
    copy: {
      color: palette.textMuted,
      fontSize: 14,
      lineHeight: 22,
    },

    habitHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
    },
    habitIcon: {
      width: 40,
      height: 40,
      borderRadius: radius.lg,
      backgroundColor: palette.surfaceGlow,
      alignItems: "center",
      justifyContent: "center",
    },
    habitIconDone: {
      backgroundColor: palette.successSoft,
    },
    habitMeta: { flex: 1 },
    habitStreak: {
      color: palette.text,
      fontSize: 14,
      fontWeight: "700",
    },

    slotGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },
    slotChip: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.panelAlt,
    },
    slotDone: {
      borderColor: `${palette.lime}44`,
      backgroundColor: palette.successSoft,
    },
    slotPressed: {
      opacity: 0.85,
      transform: [{ scale: 0.97 }],
    },
    slotText: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "600",
    },
    slotTextDone: {
      color: palette.lime,
    },

    addWrap: { gap: spacing.md },
    addInput: { gap: 8 },
    addLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase",
    },
    inputBox: {
      backgroundColor: palette.inputSurface,
      color: palette.text,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: palette.line,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 15,
    },
    chipRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs,
    },
  });
