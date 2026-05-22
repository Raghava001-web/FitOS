import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Habit, HabitCategory, ReminderMode } from "../types";

// Notification handler (configure once).
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const CHANNEL = {
  HABIT: "fitos-habit-reminders",
  STREAK: "fitos-streak-alerts",
  RECOVERY: "fitos-recovery-challenges",
  WORKOUT: "fitos-workout-reminders",
} as const;

const categoryMeta: Record<HabitCategory, { title: string }> = {
  Gym: { title: "Train time" },
  Water: { title: "Hydration check" },
  Tablets: { title: "Supplement time" },
  Sleep: { title: "Wind down" },
  Meals: { title: "Meal time" },
  "Assignments/Studies": { title: "Study block" },
  Recovery: { title: "Recovery session" },
  Custom: { title: "Habit reminder" },
};

const parseSlot = (slot: string): { hour: number; minute: number } | null => {
  const [hourText, minuteText] = slot.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText ?? "0");
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return { hour, minute };
};

const shouldScheduleNotifications = (mode?: ReminderMode | null) => {
  if (!mode) return true;
  return mode === "notifications" || mode === "both";
};

const ensurePermissions = async (): Promise<boolean> => {
  if (Platform.OS === "web") return false;
  try {
    const permissions = await Notifications.getPermissionsAsync();
    if (permissions.status === "granted") return true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === "granted";
  } catch {
    return false;
  }
};

const ensureAndroidChannels = async () => {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync(CHANNEL.HABIT, {
    name: "FitOS Habit Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
    vibrationPattern: [0, 250, 250, 250],
  });
  await Notifications.setNotificationChannelAsync(CHANNEL.STREAK, {
    name: "FitOS Streak Alerts",
    importance: Notifications.AndroidImportance.MAX,
    sound: "default",
  });
  await Notifications.setNotificationChannelAsync(CHANNEL.RECOVERY, {
    name: "FitOS Recovery Challenges",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
  });
  await Notifications.setNotificationChannelAsync(CHANNEL.WORKOUT, {
    name: "FitOS Workout Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    sound: "default",
  });
};

export const clearHabitReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const syncHabitReminders = async (
  habits: Habit[],
  reminderMode?: ReminderMode | null
) => {
  if (!shouldScheduleNotifications(reminderMode)) {
    await clearHabitReminders();
    return;
  }

  const granted = await ensurePermissions();
  if (!granted) return;

  await ensureAndroidChannels();
  await clearHabitReminders();

  for (const habit of habits) {
    const meta = categoryMeta[habit.category] ?? categoryMeta.Custom;

    for (const slot of habit.timeSlots) {
      const parsed = parseSlot(slot);
      if (!parsed) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: `FitOS ${meta.title}`,
          body: `${habit.name} - tap to log ${slot}`,
          data: { habitId: habit.id, habitName: habit.name, slot, category: habit.category },
          sound: "default",
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: parsed.hour,
          minute: parsed.minute,
          channelId: CHANNEL.HABIT,
        },
      });
    }
  }
};

export const notifyStreakBroken = async (habitName: string, streakDays: number) => {
  const granted = await ensurePermissions();
  if (!granted) return;
  await ensureAndroidChannels();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "FitOS Streak at risk",
      body: `${habitName} - ${streakDays}-day streak needs saving. Open FitOS to draw a recovery challenge.`,
      data: { type: "streak_broken", habitName, streakDays },
      sound: "default",
    },
    trigger: null,
  });
};

export const scheduleRecoveryReminder = async (challengeTitle: string, hour = 20, minute = 0) => {
  const granted = await ensurePermissions();
  if (!granted) return;
  await ensureAndroidChannels();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "FitOS Recovery challenge pending",
      body: `"${challengeTitle}" - complete it today to restore your streak.`,
      data: { type: "recovery_challenge", challengeTitle },
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL.RECOVERY,
    },
  });
};

export const scheduleWorkoutReminder = async (hour = 7, minute = 0) => {
  const granted = await ensurePermissions();
  if (!granted) return;
  await ensureAndroidChannels();

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "FitOS Train day",
      body: "Your plan is loaded. Open FitOS to see today's readiness and suggested load.",
      data: { type: "workout_reminder" },
      sound: "default",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: CHANNEL.WORKOUT,
    },
  });
};

export const notifyStreakMilestone = async (streakDays: number) => {
  const milestones: Record<number, string> = {
    3: "3 days straight. The habit is forming.",
    7: "One week streak. You are building something real.",
    14: "Two weeks. This is now a routine.",
    30: "30 days. Elite consistency. Protect it.",
  };
  const message = milestones[streakDays];
  if (!message) return;

  const granted = await ensurePermissions();
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: `FitOS ${streakDays}-day streak`,
      body: message,
      data: { type: "streak_milestone", streakDays },
      sound: "default",
    },
    trigger: null,
  });
};
