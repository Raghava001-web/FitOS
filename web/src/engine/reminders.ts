import { Habit, ReminderMode } from "../types";

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
  console.log("[Reminders] All reminders cleared.");
};

export const syncHabitReminders = async (habits: Habit[], reminderMode?: ReminderMode | null) => {
  if (!shouldScheduleNotifications(reminderMode)) {
    await clearHabitReminders();
    return;
  }

  await clearHabitReminders();

  for (const habit of habits) {
    for (const slot of habit.timeSlots) {
      const parsed = parseSlot(slot);
      if (!parsed) continue;
      console.log("[Reminders] Scheduled: " + habit.name + " at " + slot);
    }
  }
};
