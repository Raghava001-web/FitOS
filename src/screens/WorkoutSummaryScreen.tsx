import React, { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GhostButton, KeyStat, MiniStat, PrimaryButton, SectionCard } from "../components/ui";
import { useApp } from "../store/AppContext";
import { radius, shadows, spacing } from "../theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ExerciseStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<ExerciseStackParamList, "WorkoutSummary">;

export const WorkoutSummaryScreen = ({ route, navigation }: Props) => {
  const { exerciseName, setsCount, totalVolume } = route.params;
  const { state, metrics, palette, checkInDailyStreak } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const readiness = metrics?.readinessScore ?? 0;
  const stress = metrics?.stressScore ?? 0;
  const streak = state.dailyStreak.current;

  const coachNote = readiness < 40
    ? "Recovery is the priority now. Protect sleep and keep tomorrow light."
    : readiness >= 70
      ? "Strong session. You earned that volume. Keep momentum tomorrow."
      : "Solid work. Stay consistent and trust the process.";

  const volumeLabel = totalVolume >= 5000
    ? "Heavy session"
    : totalVolume >= 2000
      ? "Productive session"
      : "Light session";

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <View style={styles.hero}>
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={48} color={palette.lime} />
        </View>
        <Text style={styles.headline}>Workout saved</Text>
        <Text style={styles.sub}>{exerciseName} - {setsCount} sets logged</Text>
      </View>

      {/* ── Summary stats ─────────────────────────────────────────────── */}
      <SectionCard title="Session summary" subtitle={volumeLabel} accent={palette.lime}>
        <View style={styles.statRow}>
          <KeyStat label="Volume" value={`${totalVolume}`} note="kg total" highlight />
          <KeyStat label="Sets" value={`${setsCount}`} note="logged" />
        </View>
        <View style={styles.statRow}>
          <MiniStat label="Readiness" value={`${readiness}/100`} />
          <MiniStat label="Stress" value={`${stress}/100`} />
          <MiniStat label="Streak" value={`${streak}`} />
        </View>
      </SectionCard>

      {/* ── Coach note ────────────────────────────────────────────────── */}
      <SectionCard title="What's next" subtitle={coachNote} accent={palette.teal}>
        <View style={styles.nextGrid}>
          <View style={styles.nextCard}>
            <Ionicons name="water-outline" size={20} color={palette.teal} />
            <Text style={styles.nextText}>Hydrate within 30 minutes</Text>
          </View>
          <View style={styles.nextCard}>
            <Ionicons name="restaurant-outline" size={20} color={palette.orange} />
            <Text style={styles.nextText}>Eat protein within 2 hours</Text>
          </View>
          <View style={styles.nextCard}>
            <Ionicons name="moon-outline" size={20} color={palette.blue} />
            <Text style={styles.nextText}>Aim for 7+ hours of sleep tonight</Text>
          </View>
        </View>
      </SectionCard>

      {/* ── Actions ───────────────────────────────────────────────────── */}
      <View style={styles.actions}>
        <PrimaryButton
          label="Check in daily streak"
          onPress={() => {
            checkInDailyStreak();
          }}
        />
        <GhostButton
          label="Back to dashboard"
          onPress={() => navigation.popToTop()}
        />
      </View>
    </ScrollView>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.background },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 120,
      gap: spacing.lg,
    },
    hero: {
      alignItems: "center",
      paddingTop: 60,
      paddingBottom: spacing.lg,
      gap: spacing.sm,
    },
    iconWrap: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: palette.successSoft,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: spacing.sm,
    },
    headline: {
      color: palette.text,
      fontSize: 32,
      fontWeight: "800",
    },
    sub: {
      color: palette.textMuted,
      fontSize: 16,
      lineHeight: 24,
    },
    statRow: {
      flexDirection: "row",
      gap: spacing.sm,
      flexWrap: "wrap",
    },
    nextGrid: { gap: spacing.sm },
    nextCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card,
    },
    nextText: {
      color: palette.text,
      fontSize: 15,
      fontWeight: "600",
      flex: 1,
    },
    actions: {
      gap: spacing.sm,
    },
  });
