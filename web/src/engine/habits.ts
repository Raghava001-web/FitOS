import { CHALLENGE_POOL } from "../data/mockContent";
import { EXERCISES } from "../data/exercises";
import { detectPlateau, needsDeload } from "./fitness";
import {
  Challenge,
  DerivedMetrics,
  Habit,
  MuscleGroup,
  RankTitle,
  UserProfile,
  WorkoutLog
} from "../types";

const todayKey = () => new Date().toISOString().slice(0, 10);

const daysBetween = (dateA: string, dateB: string) => {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const diff = Math.abs(a.getTime() - b.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const sumWeight = (logs: WorkoutLog[]) =>
  logs.reduce(
    (total, log) =>
      total + log.sets.reduce((setTotal, set) => setTotal + set.weightKg * set.reps, 0),
    0
  );

export const getExercisesByMuscle = (muscle: MuscleGroup) =>
  EXERCISES.filter((exercise) => exercise.targetMuscle === muscle);

export const calculateRank = (logs: WorkoutLog[], habits: Habit[]): RankTitle => {
  const totalVolume = sumWeight(logs);
  const avgStreak =
    habits.length > 0
      ? habits.reduce((total, habit) => total + habit.streak, 0) / habits.length
      : 0;
  const score = totalVolume / 1500 + avgStreak * 3 + logs.length * 2;
  if (score > 220) return "Monster";
  if (score > 150) return "Legendary";
  if (score > 95) return "Elite";
  if (score > 50) return "Strong";
  if (score > 20) return "Novice";
  return "Rookie";
};

export const getWorkoutPR = (logs: WorkoutLog[]) => {
  const best = [...logs].sort(
    (a, b) =>
      Math.max(...b.sets.map((set) => set.weightKg)) - Math.max(...a.sets.map((set) => set.weightKg))
  )[0];
  if (!best) return null;
  const topSet = [...best.sets].sort((a, b) => b.weightKg * b.reps - a.weightKg * a.reps)[0];
  return `${best.exerciseName}: ${topSet.weightKg} kg x ${topSet.reps}`;
};

export const generateProgressBotMessage = (
  profile: UserProfile,
  metrics: DerivedMetrics,
  logs: WorkoutLog[],
  habits: Habit[]
) => {
  const totalTodayHabits = habits.reduce((total, habit) => total + habit.timeSlots.length, 0);
  const completedTodayHabits = habits.reduce(
    (total, habit) => total + habit.completedSlotsToday.length,
    0
  );
  const deload = needsDeload(logs);
  const lastPR = getWorkoutPR(logs);

  const lines = [
    metrics.readinessScore < 40
      ? "Recovery is leading today. Swap heavy compounds for mobility, walking, or lighter technique work."
      : `Readiness is ${metrics.readinessScore}/100, so today can support ${
          metrics.trainingLoadSuitability === "high" ? "a strong progression session" : "controlled productive work"
        }.`,
    `Stress is ${metrics.stressScore}/100 and recovery potential is ${metrics.recoveryPotential}/100.`,
    `Habit execution today: ${completedTodayHabits}/${totalTodayHabits} reminders completed.`
  ];

  if (lastPR) lines.push(`Most recent notable PR marker: ${lastPR}.`);
  if (deload) lines.push("You have stacked 4-6 progressive weeks. A 60% volume deload is a smart next move.");
  if (profile.injuries.length > 0) lines.push("Keep injury notes active in exercise selection and trim loading on sensitive patterns.");
  if (metrics.stressScore > 65) lines.push("Fix today: protect sleep, trim junk volume, and keep rest times disciplined.");
  if (!deload && detectPlateau(logs, logs[0]?.exerciseId ?? "")) {
    lines.push("Plateau watch is active. Rotate a variation or add tempo/drop-set work on the stalled lift.");
  }
  return lines.join(" ");
};

export const getWeeklySummary = (logs: WorkoutLog[]) => {
  const weekly = logs.filter((log) => daysBetween(log.date, todayKey()) <= 7);
  return {
    sessions: weekly.length,
    sets: weekly.reduce((total, log) => total + log.sets.length, 0),
    volume: Math.round(sumWeight(weekly))
  };
};

export const getMonthlySummary = (logs: WorkoutLog[]) => {
  const monthly = logs.filter((log) => daysBetween(log.date, todayKey()) <= 30);
  return {
    sessions: monthly.length,
    sets: monthly.reduce((total, log) => total + log.sets.length, 0),
    volume: Math.round(sumWeight(monthly))
  };
};

export const getRandomChallenge = (): Challenge =>
  CHALLENGE_POOL[Math.floor(Math.random() * CHALLENGE_POOL.length)];

export const makeDefaultHabits = (_profile: UserProfile): Habit[] => {
  const habits: Habit[] = [
    {
      id: "habit-gym",
      name: "Gym",
      category: "Gym",
      timeSlots: ["18:00"],
      streak: 0,
      lastCompletedDate: null,
      completedSlotsToday: []
    },
    {
      id: "habit-water",
      name: "Water",
      category: "Water",
      timeSlots: ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"],
      streak: 0,
      lastCompletedDate: null,
      completedSlotsToday: [],
      targetEveryHours: 2
    },
    {
      id: "habit-tablets",
      name: "Tablets",
      category: "Tablets",
      timeSlots: ["07:10", "22:00"],
      streak: 0,
      lastCompletedDate: null,
      completedSlotsToday: []
    }
  ];

  return habits;
};

export const normalizeHabitForToday = (habit: Habit): Habit => {
  const today = todayKey();
  // Keep completed slots if they were recorded today (partial or full)
  if (habit.lastCompletedDate === today) return habit;
  if (habit.lastSlotDate === today) return habit;
  // Otherwise it's a new day — reset partial progress
  return {
    ...habit,
    completedSlotsToday: []
  };
};

export const restoreHabitStreak = (habit: Habit): Habit => {
  const today = todayKey();
  return {
    ...habit,
    streak: Math.max(habit.streak, 1),
    lastCompletedDate: today,
    lastSlotDate: today,
    completedSlotsToday: [...habit.timeSlots]
  };
};
