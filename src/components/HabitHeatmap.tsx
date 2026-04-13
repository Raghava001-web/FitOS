import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useApp } from "../store/AppContext";
import { radius, spacing } from "../theme";

const toDateKey = (value: Date) => value.toISOString().slice(0, 10);

const buildFallbackHistory = (streak: number) => {
  const safeLength = Math.min(Math.max(streak, 0), 45);
  return Array.from({ length: safeLength }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - index);
    return toDateKey(date);
  });
};

const getMonths = () =>
  Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return date;
  });

export const HabitHeatmap = ({
  habitName,
  streak,
  historyDates
}: {
  habitName: string;
  streak: number;
  historyDates: string[];
}) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const normalizedHistory = historyDates.length > 0 ? historyDates : buildFallbackHistory(streak);
  const historySet = useMemo(() => new Set(normalizedHistory), [normalizedHistory]);
  const months = getMonths();
  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const completedThisMonth = normalizedHistory.filter((entry) => entry.startsWith(thisMonthKey)).length;

  const getDotColor = (dateKey: string) => {
    if (!historySet.has(dateKey)) return palette.heatEmpty;
    const daysAgo = Math.floor((Date.now() - new Date(dateKey).getTime()) / (1000 * 60 * 60 * 24));
    if (daysAgo <= 7) return palette.heatHigh;
    if (daysAgo <= 21) return palette.heatMid;
    return palette.heatLow;
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{habitName} consistency</Text>
          <Text style={styles.copy}>Dot calendar view inspired by yearly streak trackers.</Text>
        </View>
        <View style={styles.scorePill}>
          <Text style={styles.scoreLabel}>Current streak</Text>
          <Text style={styles.scoreValue}>{streak}d</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Completed this month</Text>
          <Text style={styles.summaryValue}>{completedThisMonth}</Text>
        </View>
        <View style={styles.summaryBox}>
          <Text style={styles.summaryLabel}>Tracked history</Text>
          <Text style={styles.summaryValue}>{normalizedHistory.length} days</Text>
        </View>
      </View>

      <View style={styles.monthWrap}>
        {months.map((month) => {
          const monthLabel = month.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
          const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
          const offset = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
          const cells = Array.from({ length: 35 }, (_, cellIndex) => {
            const dateNumber = cellIndex - offset + 1;
            if (dateNumber < 1 || dateNumber > daysInMonth) return null;
            const date = new Date(month.getFullYear(), month.getMonth(), dateNumber);
            return toDateKey(date);
          });

          return (
            <View key={`${month.getFullYear()}-${month.getMonth()}`} style={styles.monthCard}>
              <Text style={styles.monthLabel}>{monthLabel}</Text>
              <View style={styles.grid}>
                {cells.map((dateKey, index) => (
                  <View
                    key={`${monthLabel}-${index}`}
                    style={[
                      styles.dot,
                      { backgroundColor: dateKey ? getDotColor(dateKey) : "transparent" }
                    ]}
                  />
                ))}
              </View>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: palette.heatEmpty }]} />
          <Text style={styles.legendText}>missed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: palette.heatLow }]} />
          <Text style={styles.legendText}>older wins</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: palette.heatHigh }]} />
          <Text style={styles.legendText}>recent streak</Text>
        </View>
      </View>
    </View>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.md
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.md
    },
    title: {
      color: palette.text,
      fontSize: 18,
      fontWeight: "800"
    },
    copy: {
      color: palette.textMuted,
      lineHeight: 18,
      marginTop: 4
    },
    scorePill: {
      minWidth: 90,
      backgroundColor: palette.surfaceGlow,
      borderRadius: radius.md,
      padding: spacing.sm,
      gap: 4,
      alignItems: "center",
      justifyContent: "center"
    },
    scoreLabel: {
      color: palette.textMuted,
      fontSize: 11,
      textTransform: "uppercase"
    },
    scoreValue: {
      color: palette.text,
      fontWeight: "800",
      fontSize: 20
    },
    summaryRow: {
      flexDirection: "row",
      gap: spacing.sm
    },
    summaryBox: {
      flex: 1,
      backgroundColor: palette.panel,
      borderRadius: radius.md,
      padding: spacing.sm,
      gap: 4
    },
    summaryLabel: {
      color: palette.textMuted,
      fontSize: 12
    },
    summaryValue: {
      color: palette.text,
      fontWeight: "800",
      fontSize: 18
    },
    monthWrap: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    monthCard: {
      width: "31%",
      minWidth: 100,
      gap: spacing.sm
    },
    monthLabel: {
      color: palette.textMuted,
      fontWeight: "700",
      textAlign: "center"
    },
    grid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 6,
      justifyContent: "center"
    },
    dot: {
      width: 12,
      height: 12,
      borderRadius: radius.pill
    },
    legend: {
      flexDirection: "row",
      gap: spacing.md,
      flexWrap: "wrap"
    },
    legendItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6
    },
    legendDot: {
      width: 10,
      height: 10,
      borderRadius: radius.pill
    },
    legendText: {
      color: palette.textMuted,
      fontSize: 12
    }
  });
