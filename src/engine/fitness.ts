import { CHALLENGE_POOL } from "../data/mockContent";
import { EXERCISES } from "../data/exercises";
import {
  Challenge,
  DerivedMetrics,
  DietPlan,
  ExerciseDefinition,
  FoodPreference,
  Habit,
  JumpCheckResult,
  MedicalFlag,
  MuscleGroup,
  ProgressionAdvice,
  RankTitle,
  UserProfile,
  WorkoutLog,
  WorkoutPlanOption
} from "../types";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const roundToStep = (value: number, step = 2.5) =>
  Math.round(value / step) * step;

const todayKey = () => new Date().toISOString().slice(0, 10);

const daysBetween = (dateA: string, dateB: string) => {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const diff = Math.abs(a.getTime() - b.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

export const formatShortDate = (value: string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric"
  });

export const calculateBMI = (profile: UserProfile) => {
  const meters = profile.heightCm / 100;
  return profile.weightKg / (meters * meters);
};

export const getBMILabel = (bmi: number) => {
  if (bmi < 18.5) return "Underweight";
  if (bmi < 25) return "Balanced";
  if (bmi < 30) return "Overweight";
  return "High BMI";
};

export const getBodyCompositionLabel = (bodyFatPct: number) => {
  if (bodyFatPct < 12) return "Athletic";
  if (bodyFatPct < 18) return "Lean";
  if (bodyFatPct < 25) return "Average";
  return "Higher body-fat phase";
};

const getLifestyleStressPenalty = (stress: UserProfile["lifestyleStress"]) =>
  ({ low: 0, moderate: 8, high: 16 }[stress]);

const getActivityPenalty = (activity: UserProfile["activityLevel"]) =>
  ({ low: 2, moderate: 7, high: 12 }[activity]);

const getRecoveryBonus = (consistency: UserProfile["recoveryConsistency"]) =>
  ({ poor: 0, average: 6, good: 12 }[consistency]);

const getConsecutiveTrainingDays = (logs: WorkoutLog[]) => {
  if (!logs.length) return 0;
  const uniqueDays = [...new Set(logs.map((log) => log.date.slice(0, 10)))].sort().reverse();
  let streak = 0;
  let cursor = new Date();
  cursor.setHours(0, 0, 0, 0);
  for (const day of uniqueDays) {
    const expected = cursor.toISOString().slice(0, 10);
    if (day === expected) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    if (streak === 0 && daysBetween(day, expected) === 1) {
      streak += 1;
      cursor = new Date(day);
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }
    break;
  }
  return streak;
};

const sumWeight = (logs: WorkoutLog[]) =>
  logs.reduce(
    (total, log) =>
      total + log.sets.reduce((setTotal, set) => setTotal + set.weightKg * set.reps, 0),
    0
  );

const getHabitConsistency = (habits: Habit[]) => {
  if (!habits.length) return 0;
  const maxStreak = Math.max(...habits.map((habit) => habit.streak), 0);
  const completionRate =
    habits.reduce((acc, habit) => acc + habit.completedSlotsToday.length / habit.timeSlots.length, 0) /
    habits.length;
  return clamp(Math.round(maxStreak * 2 + completionRate * 50), 0, 100);
};

export const calculateStressScore = (profile: UserProfile, logs: WorkoutLog[]) => {
  let score = 16;
  score += clamp((8 - profile.sleepHours) * 8, 0, 30);
  score += (5 - profile.sleepQuality) * 5;
  score += clamp((profile.workHoursPerDay - 8) * 5, 0, 20);
  score += clamp((profile.workDaysPerWeek - 5) * 4, 0, 12);
  score += getLifestyleStressPenalty(profile.lifestyleStress);
  score += getActivityPenalty(profile.activityLevel);
  score -= getRecoveryBonus(profile.recoveryConsistency);
  const lastWeekLogs = logs.filter((log) => daysBetween(log.date, todayKey()) <= 7);
  if (lastWeekLogs.length >= 5) score += 6;
  if (profile.sleepHours < 6 && profile.workHoursPerDay > 10) score += 18;
  return clamp(Math.round(score), 0, 100);
};

export const calculateReadinessScore = (
  profile: UserProfile,
  stressScore: number,
  logs: WorkoutLog[]
) => {
  const consecutiveTrainingDays = getConsecutiveTrainingDays(logs);
  const lastWorkoutDate = logs[0]?.date;
  const daysSinceLastWorkout = lastWorkoutDate ? daysBetween(lastWorkoutDate, todayKey()) : 3;
  let score = 78;
  score += clamp((profile.sleepHours - 7) * 8, -18, 12);
  score += (profile.sleepQuality - 3) * 5;
  score -= Math.round(stressScore * 0.38);
  score -= consecutiveTrainingDays * 7;
  score += clamp(daysSinceLastWorkout * 4, 0, 12);
  score -= profile.injuries.length * 10;
  if (profile.sleepHours < 6 && profile.workHoursPerDay > 10) score -= 12;
  return clamp(Math.round(score), 0, 100);
};

export const calculateRecoveryPotential = (profile: UserProfile, stressScore: number) => {
  let potential = 55;
  potential += profile.sleepHours * 3;
  potential += profile.sleepQuality * 4;
  potential -= Math.round(stressScore * 0.35);
  potential += getRecoveryBonus(profile.recoveryConsistency);
  potential -= profile.injuries.length * 6;
  return clamp(Math.round(potential), 0, 100);
};

export const getTrainingLoadSuitability = (readiness: number, stress: number) => {
  if (readiness < 40) return "rest";
  if (readiness < 55 || stress > 70) return "recovery";
  if (readiness < 75) return "moderate";
  return "high";
};

export const deriveMetrics = (
  profile: UserProfile,
  logs: WorkoutLog[],
  habits: Habit[]
): DerivedMetrics => {
  const bmi = calculateBMI(profile);
  const stressScore = calculateStressScore(profile, logs);
  const readinessScore = calculateReadinessScore(profile, stressScore, logs);
  const recoveryPotential = calculateRecoveryPotential(profile, stressScore);
  const loadSuitability = getTrainingLoadSuitability(readinessScore, stressScore);
  const lastWeekLogs = logs.filter((log) => daysBetween(log.date, todayKey()) <= 7);
  return {
    bmi: Number(bmi.toFixed(1)),
    bmiLabel: getBMILabel(bmi),
    stressScore,
    readinessScore,
    recoveryPotential,
    safeProgressionRangePct:
      loadSuitability === "high" ? 7 : loadSuitability === "moderate" ? 5 : 2.5,
    trainingLoadSuitability: loadSuitability,
    bodyCompositionLabel: getBodyCompositionLabel(profile.bodyFatPct),
    totalWeightLiftedWeek: Math.round(sumWeight(lastWeekLogs)),
    totalSetsWeek: lastWeekLogs.reduce((total, log) => total + log.sets.length, 0),
    consistencyRank: getHabitConsistency(habits)
  };
};

export const getExerciseById = (exerciseId: string) =>
  EXERCISES.find((exercise) => exercise.id === exerciseId);

export const getExerciseLogs = (logs: WorkoutLog[], exerciseId: string) =>
  logs
    .filter((log) => log.exerciseId === exerciseId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

const getTopSet = (log: WorkoutLog | undefined) => {
  if (!log) return null;
  return [...log.sets].sort((a, b) => b.weightKg * b.reps - a.weightKg * a.reps)[0] ?? null;
};

export const getMedicalWarnings = (exercise: ExerciseDefinition, injuries: MedicalFlag[]) =>
  injuries
    .filter((injury) => exercise.cautionAreas.includes(injury.area))
    .map((injury) => {
      if (injury.area === "knee") {
        return `Knee note logged: ease heavy leg loading and keep ROM pain-free for ${exercise.name}.`;
      }
      if (injury.area === "shoulder") {
        return `Shoulder note logged: watch overhead or end-range loading and stay strict on ${exercise.name}.`;
      }
      return `${injury.area[0].toUpperCase()}${injury.area.slice(1)} note logged: adjust load and range of motion for ${exercise.name}.`;
    });

export const detectPlateau = (logs: WorkoutLog[], exerciseId: string) => {
  const recent = getExerciseLogs(logs, exerciseId).slice(0, 4);
  if (recent.length < 3) return false;
  const topSets = recent.map((log) => getTopSet(log)).filter(Boolean);
  if (topSets.length < 3) return false;
  const [latest, previous, older] = topSets as NonNullable<ReturnType<typeof getTopSet>>[];
  return (
    latest.weightKg === previous.weightKg &&
    previous.weightKg === older.weightKg &&
    latest.reps <= previous.reps &&
    previous.reps <= older.reps
  );
};

export const needsDeload = (logs: WorkoutLog[]) => {
  if (logs.length < 8) return false;
  const byWeek = new Map<string, number>();
  logs.forEach((log) => {
    const date = new Date(log.date);
    const weekKey = `${date.getUTCFullYear()}-${Math.ceil((date.getUTCDate() + 6) / 7)}`;
    byWeek.set(weekKey, (byWeek.get(weekKey) ?? 0) + sumWeight([log]));
  });
  const recentWeeks = [...byWeek.values()].slice(-6);
  if (recentWeeks.length < 4) return false;
  let progressiveWeeks = 0;
  for (let index = 1; index < recentWeeks.length; index += 1) {
    if (recentWeeks[index] >= recentWeeks[index - 1]) progressiveWeeks += 1;
  }
  return progressiveWeeks >= 4;
};

const getBaseRecommendation = (profile: UserProfile, exercise: ExerciseDefinition) => {
  if (exercise.category === "bodyweight") return profile.weightKg;
  if (exercise.category === "compound") return roundToStep(profile.weightKg * 0.55);
  if (exercise.category === "sport") return 0;
  return roundToStep(profile.weightKg * 0.25);
};

export const recommendProgression = (
  profile: UserProfile,
  metrics: DerivedMetrics,
  exercise: ExerciseDefinition,
  logs: WorkoutLog[]
): ProgressionAdvice => {
  const exerciseLogs = getExerciseLogs(logs, exercise.id);
  const latest = exerciseLogs[0];
  const previous = exerciseLogs[1];
  const latestTopSet = getTopSet(latest);
  const previousTopSet = getTopSet(previous);
  const warnings = getMedicalWarnings(exercise, profile.injuries);
  const plateau = detectPlateau(logs, exercise.id);

  if (!latestTopSet) {
    const starter = getBaseRecommendation(profile, exercise);
    return {
      recommendedWeightKg: starter,
      incrementKg: 0,
      action: "hold",
      summary: `Start ${exercise.name} around ${starter} kg and use the first session to set your baseline.`,
      reasoning: [
        "No previous log found, so the app is setting a conservative opener from body stats and lift type.",
        "Log all sets today so the next session can show exact memory-based progression."
      ],
      warnings
    };
  }

  const repTrend =
    previousTopSet && latestTopSet.weightKg === previousTopSet.weightKg
      ? latestTopSet.reps - previousTopSet.reps
      : 0;

  const readinessLow = metrics.readinessScore < 40;
  const riskCap = metrics.safeProgressionRangePct <= 2.5;
  const isCompound = exercise.category === "compound";
  let increment = 0;
  let action: ProgressionAdvice["action"] = "hold";

  if (readinessLow) {
    increment = -roundToStep(latestTopSet.weightKg * 0.05);
    action = "reduce";
    warnings.push("Readiness is below 40, so FitOS is steering today toward recovery work or a reduced load.");
  } else if (warnings.length > 0 || riskCap) {
    increment = 0;
    action = "hold";
  } else if (plateau) {
    increment = 0;
    action = "hold";
    warnings.push(
      "Plateau flagged: same load has held for 3+ weeks without rep improvement. Try tempo work, a variation, or a deload."
    );
  } else if (repTrend >= 2 && metrics.readinessScore >= 70) {
    increment = isCompound ? 5 : 2.5;
    action = isCompound ? "increase-large" : "increase-small";
  } else if (repTrend >= 1 || metrics.readinessScore >= 60) {
    increment = 2.5;
    action = "increase-small";
  }

  const recommendedWeightKg = clamp(roundToStep(latestTopSet.weightKg + increment), 0, 999);
  const summary =
    increment > 0
      ? `Suggested next load: ${recommendedWeightKg} kg for ${exercise.name}.`
      : increment < 0
        ? `Suggested recovery load: ${recommendedWeightKg} kg for ${exercise.name}.`
        : `Hold ${latestTopSet.weightKg} kg on ${exercise.name} and focus on cleaner volume today.`;

  const reasoning = [
    `Last session top set: ${latestTopSet.weightKg} kg x ${latestTopSet.reps}.`,
    `Readiness ${metrics.readinessScore}/100, stress ${metrics.stressScore}/100, safe jump band ${metrics.safeProgressionRangePct}%.`
  ];

  if (repTrend > 0) reasoning.push(`Performance trend improved by ${repTrend} rep(s) at the same load.`);
  if (plateau) reasoning.push("Volume has stalled across recent sessions, so load is capped until momentum returns.");
  if (warnings.length === 0 && increment === 0) {
    reasoning.push("Current readiness supports quality volume, but not enough momentum yet for a clean jump.");
  }

  return {
    recommendedWeightKg,
    incrementKg: increment,
    action,
    summary,
    reasoning,
    warnings
  };
};

export const buildJumpCheck = (currentWeight: number, targetWeight: number): JumpCheckResult => {
  const percentageJump = ((targetWeight - currentWeight) / currentWeight) * 100;
  const risk =
    percentageJump > 15 ? "high" : percentageJump > 8 ? "moderate" : "low";
  const steps: number[] = [currentWeight];
  let cursor = currentWeight;
  const increment = targetWeight - currentWeight >= 15 ? 5 : 2.5;
  while (cursor < targetWeight) {
    cursor = Math.min(targetWeight, roundToStep(cursor + increment));
    if (steps[steps.length - 1] !== cursor) steps.push(cursor);
  }
  const summary =
    risk === "high"
      ? `That is a ${Math.round(percentageJump)}% jump. Injury risk is high. Suggested path: ${steps.join(" -> ")} over 4-6 weeks.`
      : risk === "moderate"
        ? `That is a ${Math.round(percentageJump)}% jump. Progress it in smaller steps: ${steps.join(" -> ")}.`
        : `That is a ${Math.round(percentageJump)}% jump. Keep technique sharp and only move if the last block was solid.`;
  return {
    percentageJump: Number(percentageJump.toFixed(1)),
    risk,
    steps,
    summary
  };
};
