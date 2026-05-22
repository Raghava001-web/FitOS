import type { NavigatorScreenParams } from "@react-navigation/native";

// Exercise stack
export type ExerciseStackParamList = {
  ExerciseToday: undefined;
  ExerciseDetail: { exerciseId: string };
  WorkoutSummary: { exerciseName: string; setsCount: number; totalVolume: number };
  Readiness: undefined;
};

// Legacy habit stack. Habits now live under Progress, but this keeps older
// local navigation code type-safe while we phase it out.
export type HabitStackParamList = {
  HabitList: undefined;
  HabitDetail: { habitId: string };
  RecoveryChallenge: { habitId?: string };
};

// Progress stack
export type ProgressStackParamList = {
  ProgressHome: undefined;
  RecoveryChallenge: { habitId?: string };
};

// Profile stack
export type ProfileStackParamList = {
  ProfileHome: undefined;
};

// Root tab navigator
export type RootTabParamList = {
  ExerciseTab: NavigatorScreenParams<ExerciseStackParamList>;
  ShortsTab: undefined;
  ProgressTab: NavigatorScreenParams<ProgressStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};
