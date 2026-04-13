export type AppTab = "exercise" | "shorts" | "progress" | "profile";
export type ThemeMode = "dark" | "light";

export type FitnessGoal =
  | "fat loss"
  | "lean body"
  | "bulking"
  | "strength gain"
  | "bodybuilding"
  | "Olympic-style fitness"
  | "sports-based fitness";

export type SportType =
  | "running"
  | "javelin"
  | "throws"
  | "badminton"
  | "bowling"
  | "batting"
  | "other sports";

export type LifestyleStress = "low" | "moderate" | "high";
export type ActivityLevel = "low" | "moderate" | "high";
export type RecoveryConsistency = "poor" | "average" | "good";
export type ReminderMode = "calendar" | "notifications" | "both";
export type FoodPreference =
  | "vegetarian"
  | "non-vegetarian"
  | "eggetarian"
  | "Indian"
  | "salad-based"
  | "high-protein"
  | "fat-loss"
  | "muscle-gain";

export type HabitCategory =
  | "Gym"
  | "Water"
  | "Tablets"
  | "Sleep"
  | "Meals"
  | "Assignments/Studies"
  | "Recovery"
  | "Custom";

export type RankTitle =
  | "Rookie"
  | "Novice"
  | "Strong"
  | "Elite"
  | "Legendary"
  | "Monster";

export type MuscleGroup =
  | "chest"
  | "back"
  | "shoulders"
  | "biceps"
  | "triceps"
  | "quads"
  | "hamstrings"
  | "glutes"
  | "calves"
  | "abs";

export type TrainingLoadSuitability = "rest" | "recovery" | "moderate" | "high";
export type MedicalFlagArea = "knee" | "shoulder" | "back" | "elbow" | "other";

export interface MedicalFlag {
  area: MedicalFlagArea;
  note: string;
}

export interface UserProfile {
  name: string;
  email: string;
  weightKg: number;
  heightCm: number;
  bodyFatPct: number;
  sleepHours: number;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
  workHoursPerDay: number;
  workDaysPerWeek: number;
  lifestyleStress: LifestyleStress;
  medicalNotes: string;
  injuries: MedicalFlag[];
  primaryGoal: FitnessGoal;
  primarySport?: SportType;
  followsDiet: boolean;
  dietNotes: string;
  supplementNames: string[];
  reminderMode: ReminderMode;
  trainingDaysPerWeek: number;
  foodPreference: FoodPreference;
  activityLevel: ActivityLevel;
  recoveryConsistency: RecoveryConsistency;
}

export interface ExerciseDefinition {
  id: string;
  name: string;
  targetMuscle: MuscleGroup;
  category:
    | "compound"
    | "isolation"
    | "bodyweight"
    | "conditioning"
    | "sport";
  instructions: string[];
  restSeconds: number;
  defaultRepRange: string;
  youtubeUrl: string;
  cautionAreas: MedicalFlagArea[];
  movementPattern: string;
}

export interface LoggedSet {
  setNumber: number;
  reps: number;
  weightKg: number;
  restSeconds: number;
  durationSeconds: number;
}

export interface WorkoutLog {
  id: string;
  exerciseId: string;
  exerciseName: string;
  date: string;
  sets: LoggedSet[];
  notes?: string;
}

export interface Habit {
  id: string;
  name: string;
  category: HabitCategory;
  timeSlots: string[];
  streak: number;
  lastCompletedDate: string | null;
  completedSlotsToday: string[];
  historyDates?: string[];
  targetEveryHours?: number;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  tags: string[];
}

export interface FoodLogEntry extends FoodItem {
  loggedAt: string;
}

export interface DailyMacroTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardBadge: string;
}

export interface DietMeal {
  title: string;
  foods: string[];
}

export interface DietPlan {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  style: string;
  meals: DietMeal[];
  groceryList: string[];
}

export interface WorkoutPlanOption {
  id: string;
  name: string;
  days: string[];
  focus: string;
  rationale: string;
}

export interface DerivedMetrics {
  bmi: number;
  bmiLabel: string;
  stressScore: number;
  readinessScore: number;
  recoveryPotential: number;
  safeProgressionRangePct: number;
  trainingLoadSuitability: TrainingLoadSuitability;
  bodyCompositionLabel: string;
  totalWeightLiftedWeek: number;
  totalSetsWeek: number;
  consistencyRank: number;
}

export interface ProgressionAdvice {
  recommendedWeightKg: number;
  incrementKg: number;
  action: "hold" | "increase-small" | "increase-large" | "reduce";
  summary: string;
  reasoning: string[];
  warnings: string[];
}

export interface JumpCheckResult {
  percentageJump: number;
  risk: "low" | "moderate" | "high";
  steps: number[];
  summary: string;
}

export interface SocialShort {
  id: string;
  athlete: string;
  title: string;
  caption: string;
  duration: string;
  tags: string[];
}

export interface DailyStreakState {
  current: number;
  lastCheckInDate: string | null;
}

export interface AppState {
  hydrated: boolean;
  profile: UserProfile | null;
  tab: AppTab;
  workoutLogs: WorkoutLog[];
  habits: Habit[];
  foodLogs: FoodLogEntry[];
  dailyTotals: Record<string, DailyMacroTotals>;
  activeChallenge: Challenge | null;
  completedChallengeIds: string[];
  activePlanId: string | null;
  dailyStreak: DailyStreakState;
}


