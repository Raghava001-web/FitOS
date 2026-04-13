import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { Habit, ReminderMode } from "../types";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

const CHANNEL_ID = "fitos-habit-reminders";

const parseSlot = (slot: string) => {
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

export const clearHabitReminders = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const syncHabitReminders = async (habits: Habit[], reminderMode?: ReminderMode | null) => {
  if (!shouldScheduleNotifications(reminderMode)) {
    await clearHabitReminders();
    return;
  }

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    if (requested.status !== "granted") {
      return;
    }
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: "FitOS Habit Reminders",
      importance: Notifications.AndroidImportance.HIGH,
      sound: "default"
    });
  }

  await clearHabitReminders();

  for (const habit of habits) {
    for (const slot of habit.timeSlots) {
      const parsed = parseSlot(slot);
      if (!parsed) continue;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "FitOS Habit Reminder",
          body: `${habit.name} at ${slot}`,
          data: {
            habitId: habit.id,
            habitName: habit.name,
            slot
          }
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: parsed.hour,
          minute: parsed.minute,
          channelId: CHANNEL_ID
        }
      });
    }
  }
};

