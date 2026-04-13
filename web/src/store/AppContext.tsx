import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { syncHabitReminders } from "../engine/reminders";
import { deriveMetrics } from "../engine/fitness";
import { generateDietPlan, recommendSupplements } from "../engine/nutrition";
import { getWorkoutSplitOptions } from "../engine/plans";
import {
  calculateRank,
  getRandomChallenge,
  makeDefaultHabits,
  normalizeHabitForToday,
  restoreHabitStreak
} from "../engine/habits";
import {
  AppState,
  DailyMacroTotals,
  DailyStreakState,
  FoodItem,
  FoodLogEntry,
  Habit,
  UserProfile,
  WorkoutLog
} from "../types";

const STORAGE_KEY = "fitos-state-v1";
const USER_PROFILE_KEY = "user_profile";

const initialDailyStreak: DailyStreakState = {
  current: 0,
  lastCheckInDate: null
};

const initialState: AppState = {
  hydrated: false,
  profile: null,
  tab: "exercise",
  workoutLogs: [],
  habits: [],
  foodLogs: [],
  dailyTotals: {},
  activeChallenge: null,
  completedChallengeIds: [],
  activePlanId: null,
  dailyStreak: initialDailyStreak
};

const ROOKIE_PROFILE: UserProfile = {
  name: "Rookie Athlete",
  email: "athlete@fitos.app",
  weightKg: 75,
  heightCm: 175,
  bodyFatPct: 18,
  sleepHours: 7,
  sleepQuality: 3,
  workHoursPerDay: 8,
  workDaysPerWeek: 5,
  lifestyleStress: "moderate",
  medicalNotes: "No known issues.",
  injuries: [],
  primaryGoal: "lean body",
  followsDiet: false,
  dietNotes: "",
  supplementNames: [],
  reminderMode: "notifications",
  trainingDaysPerWeek: 4,
  foodPreference: "high-protein",
  activityLevel: "moderate",
  recoveryConsistency: "average"
};

type AppContextValue = {
  state: AppState;
  metrics: ReturnType<typeof deriveMetrics> | null;
  dietPlan: ReturnType<typeof generateDietPlan> | null;
  supplementPlan: string[];
  savedPlans: ReturnType<typeof getWorkoutSplitOptions>;
  rank: ReturnType<typeof calculateRank>;
  setTab: (tab: AppState["tab"]) => void;
  completeOnboarding: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  logWorkout: (entry: Omit<WorkoutLog, "id" | "date"> & { date?: string }) => void;
  completeHabitSlot: (habitId: string, slot: string) => void;
  addHabit: (habit: Pick<Habit, "name" | "category" | "timeSlots">) => void;
  logFood: (item: FoodItem) => void;
  choosePlan: (planId: string) => void;
  drawChallenge: () => void;
  completeChallenge: () => void;
  checkInDailyStreak: () => void;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

const createId = (prefix: string) =>
  prefix + "-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);

const localDateKey = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
};

const daysBetween = (fromDateKey: string, toDateKey: string) => {
  const start = new Date(fromDateKey + "T00:00:00");
  const end = new Date(toDateKey + "T00:00:00");
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

const normalizeHabit = (habit: Habit): Habit => ({
  ...habit,
  completedSlotsToday: habit.completedSlotsToday ?? [],
  historyDates: habit.historyDates ?? []
});

const normalizeDailyStreak = (streak?: Partial<DailyStreakState> | null): DailyStreakState => ({
  current: typeof streak?.current === "number" && streak.current > 0 ? streak.current : 0,
  lastCheckInDate: typeof streak?.lastCheckInDate === "string" ? streak.lastCheckInDate : null
});

const buildDailyTotals = (foodLogs: FoodLogEntry[]) =>
  foodLogs.reduce<Record<string, DailyMacroTotals>>((acc, entry) => {
    const dateKey = entry.loggedAt.slice(0, 10);
    const current = acc[dateKey] ?? { calories: 0, protein: 0, carbs: 0, fats: 0 };
    acc[dateKey] = {
      calories: current.calories + entry.calories,
      protein: current.protein + entry.protein,
      carbs: current.carbs + entry.carbs,
      fats: current.fats + entry.fats
    };
    return acc;
  }, {});

const normalizeHydratedState = (parsed: Partial<AppState>): AppState => {
  const foodLogs = (parsed.foodLogs ?? []).map((entry) => ({
    ...entry,
    loggedAt: typeof entry.loggedAt === "string" ? entry.loggedAt : new Date().toISOString()
  })) as FoodLogEntry[];

  return {
    ...initialState,
    ...parsed,
    hydrated: true,
    foodLogs,
    dailyTotals:
      parsed.dailyTotals && Object.keys(parsed.dailyTotals).length > 0
        ? parsed.dailyTotals
        : buildDailyTotals(foodLogs),
    habits: (parsed.habits ?? []).map(normalizeHabit),
    dailyStreak: normalizeDailyStreak(parsed.dailyStreak)
  };
};

const persistUserProfile = (profile: UserProfile | null) => {
  if (!profile) return;
  try {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  } catch (error) {
    console.warn("FitOS profile persist failed", error);
  }
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState>(initialState);
  const reminderSignatureRef = useRef<string>("");

  useEffect(() => {
    const hydrate = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        let parsed: Partial<AppState> = {};

        if (stored) {
          parsed = JSON.parse(stored) as Partial<AppState>;
        }

        const savedProfileStr = localStorage.getItem(USER_PROFILE_KEY);
        let profile = parsed.profile;

        if (!profile && savedProfileStr) {
          profile = JSON.parse(savedProfileStr) as UserProfile;
        }

        // Auto-inject default profile on first run
        if (!profile) {
          profile = ROOKIE_PROFILE;
          persistUserProfile(profile);
          parsed.profile = profile;
        } else {
          parsed.profile = profile;
        }

        // Seed default habits if none exist (covers both first-run and legacy state)
        if (!parsed.habits || parsed.habits.length === 0) {
          parsed.habits = makeDefaultHabits(profile).map(normalizeHabit);
        }

        setState(normalizeHydratedState(parsed));
      } catch (error) {
        console.warn("FitOS state hydration failed", error);
        setState((current) => ({ ...current, hydrated: true }));
      }
    };

    hydrate();
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn("FitOS state persist failed", error);
    }
  }, [state]);

  const metrics = useMemo(() => {
    if (!state.profile) return null;
    return deriveMetrics(state.profile, state.workoutLogs, state.habits.map(normalizeHabitForToday));
  }, [state.profile, state.workoutLogs, state.habits]);

  const dietPlan = useMemo(() => {
    if (!state.profile || !metrics) return null;
    return generateDietPlan(state.profile, metrics);
  }, [state.profile, metrics]);

  const supplementPlan = useMemo(() => {
    if (!state.profile || !metrics) return [];
    return recommendSupplements(state.profile, metrics);
  }, [state.profile, metrics]);

  const savedPlans = useMemo(() => {
    if (!state.profile || !metrics) return [];
    return getWorkoutSplitOptions(state.profile, metrics);
  }, [state.profile, metrics]);

  const rank = useMemo(
    () => calculateRank(state.workoutLogs, state.habits.map(normalizeHabitForToday)),
    [state.workoutLogs, state.habits]
  );

  useEffect(() => {
    if (!state.hydrated || !state.profile) return;
    const signature = JSON.stringify({
      mode: state.profile.reminderMode,
      habits: state.habits.map((habit) => ({
        id: habit.id,
        name: habit.name,
        slots: habit.timeSlots
      }))
    });

    if (signature === reminderSignatureRef.current) return;
    reminderSignatureRef.current = signature;

    void syncHabitReminders(state.habits, state.profile.reminderMode).catch((error) => {
      console.warn("FitOS reminder sync failed", error);
    });
  }, [state.hydrated, state.profile?.reminderMode, state.habits]);

  const setTab: AppContextValue["setTab"] = (tab) => {
    setState((current) => ({ ...current, tab }));
  };

  const completeOnboarding: AppContextValue["completeOnboarding"] = (profile) => {
    const habits = makeDefaultHabits(profile).map(normalizeHabit);
    const seedMetrics = deriveMetrics(profile, [], habits);
    const plans = getWorkoutSplitOptions(profile, seedMetrics);
    setState((current) => ({
      ...current,
      profile,
      habits,
      dailyStreak: initialDailyStreak,
      activePlanId: plans[0]?.id ?? null
    }));
    persistUserProfile(profile);
  };

  const updateProfile: AppContextValue["updateProfile"] = (updates) => {
    setState((current) => {
      if (!current.profile) return current;
      const nextProfile = { ...current.profile, ...updates };
      persistUserProfile(nextProfile);
      return { ...current, profile: nextProfile };
    });
  };

  const checkInDailyStreak: AppContextValue["checkInDailyStreak"] = () => {
    setState((current) => {
      const today = localDateKey();
      const lastCheckInDate = current.dailyStreak.lastCheckInDate;
      if (lastCheckInDate === today) return current;

      if (!lastCheckInDate) {
        return { ...current, dailyStreak: { current: 1, lastCheckInDate: today } };
      }

      const gap = daysBetween(lastCheckInDate, today);
      if (gap === 1) {
        return { ...current, dailyStreak: { current: current.dailyStreak.current + 1, lastCheckInDate: today } };
      }

      return { ...current, dailyStreak: { current: 1, lastCheckInDate: today } };
    });
  };

  const logWorkout: AppContextValue["logWorkout"] = (entry) => {
    setState((current) => ({
      ...current,
      workoutLogs: [
        {
          id: createId("workout"),
          date: entry.date ?? new Date().toISOString(),
          exerciseId: entry.exerciseId,
          exerciseName: entry.exerciseName,
          sets: entry.sets,
          notes: entry.notes
        },
        ...current.workoutLogs
      ]
    }));
  };

  const completeHabitSlot: AppContextValue["completeHabitSlot"] = (habitId, slot) => {
    const today = localDateKey();
    setState((current) => ({
      ...current,
      habits: current.habits.map((habit) => {
        if (habit.id !== habitId) return normalizeHabitForToday(normalizeHabit(habit));
        const normalized = normalizeHabitForToday(normalizeHabit(habit));
        if (normalized.completedSlotsToday.includes(slot)) return normalized;
        const completedSlotsToday = [...normalized.completedSlotsToday, slot];
        const completedAll = completedSlotsToday.length === normalized.timeSlots.length;
        const historyDates =
          completedAll && !normalized.historyDates?.includes(today)
            ? [...(normalized.historyDates ?? []), today]
            : normalized.historyDates ?? [];
        return {
          ...normalized,
          completedSlotsToday,
          historyDates,
          lastSlotDate: today,
          streak:
            completedAll && normalized.lastCompletedDate !== today
              ? normalized.streak + 1
              : normalized.streak,
          lastCompletedDate: completedAll ? today : normalized.lastCompletedDate
        };
      })
    }));
  };

  const addHabit: AppContextValue["addHabit"] = (habit) => {
    setState((current) => ({
      ...current,
      habits: [
        ...current.habits,
        {
          id: createId("habit"),
          ...habit,
          streak: 0,
          lastCompletedDate: null,
          completedSlotsToday: [],
          historyDates: []
        }
      ]
    }));
  };

  const logFood: AppContextValue["logFood"] = (item) => {
    const loggedAt = new Date().toISOString();
    const dateKey = loggedAt.slice(0, 10);
    setState((current) => {
      const existing = current.dailyTotals[dateKey] ?? { calories: 0, protein: 0, carbs: 0, fats: 0 };
      return {
        ...current,
        foodLogs: [{ ...item, loggedAt }, ...current.foodLogs],
        dailyTotals: {
          ...current.dailyTotals,
          [dateKey]: {
            calories: existing.calories + item.calories,
            protein: existing.protein + item.protein,
            carbs: existing.carbs + item.carbs,
            fats: existing.fats + item.fats
          }
        }
      };
    });
  };

  const choosePlan: AppContextValue["choosePlan"] = (planId) => {
    setState((current) => ({ ...current, activePlanId: planId }));
  };

  const drawChallenge = () => {
    setState((current) => ({ ...current, activeChallenge: getRandomChallenge() }));
  };

  const completeChallenge = () => {
    const today = localDateKey();
    setState((current) => {
      const activeChallenge = current.activeChallenge;
      if (!activeChallenge) return current;
      return {
        ...current,
        activeChallenge: null,
        completedChallengeIds: [...current.completedChallengeIds, activeChallenge.id],
        habits: current.habits.map((habit) => {
          const normalized = normalizeHabitForToday(normalizeHabit(habit));
          const restored = restoreHabitStreak(normalized);
          return restored.historyDates?.includes(today)
            ? restored
            : { ...restored, historyDates: [...(restored.historyDates ?? []), today] };
        })
      };
    });
  };

  const value: AppContextValue = {
    state,
    metrics,
    dietPlan,
    supplementPlan,
    savedPlans,
    rank,
    setTab,
    completeOnboarding,
    updateProfile,
    logWorkout,
    completeHabitSlot,
    addHabit,
    logFood,
    choosePlan,
    drawChallenge,
    completeChallenge,
    checkInDailyStreak
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used inside AppProvider");
  }
  return context;
};
