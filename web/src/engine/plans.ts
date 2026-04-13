import { DerivedMetrics, UserProfile, WorkoutPlanOption } from "../types";

const pickDays = (count: number, days: string[]) => days.slice(0, Math.max(count, 2));

const option = (
  id: string,
  name: string,
  days: string[],
  focus: string,
  rationale: string
): WorkoutPlanOption => ({
  id,
  name,
  days,
  focus,
  rationale
});

export const getWorkoutSplitOptions = (
  profile: UserProfile,
  metrics: DerivedMetrics
): WorkoutPlanOption[] => {
  const baseDays = profile.trainingDaysPerWeek;
  const softer = metrics.stressScore > 60 || metrics.readinessScore < 55;
  const recoveryNote = softer
    ? "Reduced fatigue bias because recovery is tight right now."
    : "Supports steady overload from your current readiness profile.";

  switch (profile.primaryGoal) {
    case "fat loss":
      return [
        option("fat-upper-lower", "Upper / Lower + Conditioning", pickDays(baseDays, ["Upper", "Lower", "Conditioning", "Upper", "Lower"]), "Preserve muscle while driving calorie burn.", recoveryNote),
        option("fat-full-body", "Full-Body Density", pickDays(baseDays, ["Full Body A", "Full Body B", "Cardio + Core", "Full Body C"]), "Efficient sessions for busy schedules.", "Good when work hours are long and you still want momentum."),
        option("fat-ppl", "Push / Pull / Legs", pickDays(baseDays, ["Push", "Pull", "Legs", "Cardio / Steps"]), "Simple split with clean muscle rotation.", "Best if you want structure without long sessions.")
      ];
    case "bulking":
      return [
        option("bulk-ppl", "Push / Pull / Legs", pickDays(baseDays, ["Push", "Pull", "Legs", "Push", "Pull", "Legs"]), "High weekly hypertrophy volume.", recoveryNote),
        option("bulk-bro", "Bro Split", pickDays(baseDays, ["Chest", "Back", "Shoulders", "Arms", "Legs"]), "High local fatigue and pump work.", "Strong fit if you enjoy one-muscle-focus sessions."),
        option("bulk-upper-lower", "Upper / Lower", pickDays(baseDays, ["Upper Strength", "Lower Strength", "Upper Volume", "Lower Volume"]), "Volume plus heavier loading without six-day fatigue.", "Middle ground between bodybuilding and recovery.")
      ];
    case "strength gain":
      return [
        option("strength-split", "Strength Split", pickDays(baseDays, ["Squat", "Bench", "Deadlift", "Press", "Accessories"]), "Specific top sets and back-off work for big lifts.", recoveryNote),
        option("strength-upper-lower", "Upper / Lower Strength", pickDays(baseDays, ["Upper Heavy", "Lower Heavy", "Upper Volume", "Lower Volume"]), "Heavy exposures twice weekly with manageable fatigue.", "Good powerlifting structure without maxing often."),
        option("strength-full-body", "Full-Body Strength", pickDays(baseDays, ["Heavy A", "Volume A", "Heavy B", "Volume B"]), "Great for 3-4 day schedules with strong carryover.", "Useful when weekly availability shifts.")
      ];
    case "bodybuilding":
      return [
        option("bb-bro", "Bodybuilding Bro Split", pickDays(baseDays, ["Chest", "Back", "Shoulders", "Arms", "Legs", "Weak Point"]), "Varied angles and local muscle fatigue.", recoveryNote),
        option("bb-ppl", "Push / Pull / Legs", pickDays(baseDays, ["Push", "Pull", "Legs", "Push Pump", "Pull Pump", "Legs Pump"]), "Higher frequency hypertrophy with enough variety to avoid stalls.", "Works well when calories and sleep are solid."),
        option("bb-upper-lower", "Upper / Lower Bodybuilding", pickDays(baseDays, ["Upper", "Lower", "Arms + Delts", "Upper", "Lower"]), "Efficient physique split with weak-point work.", "Good if you want bodybuilding structure without marathon sessions.")
      ];
    case "Olympic-style fitness":
      return [
        option("oly-strength", "Olympic + Strength", pickDays(baseDays, ["Snatch", "Clean & Jerk", "Squat Strength", "Pulls + Mobility"]), "Explosive lifts first, then positions and strength.", recoveryNote),
        option("oly-flow", "Full-Body Olympic Flow", pickDays(baseDays, ["Technique", "Strength", "Power", "Mobility"]), "Technique-focused split for learning speed under the bar.", "Better if you are still building movement literacy."),
        option("oly-athletic", "Athletic Power Split", pickDays(baseDays, ["Power", "Squat", "Press + Pull", "Conditioning"]), "Olympic-style explosiveness without full specialization.", "Useful for field sports and general athleticism.")
      ];
    case "sports-based fitness":
      return [
        option("sport-conditioning", `Sports Conditioning${profile.primarySport ? ` + ${profile.primarySport}` : ""}`, pickDays(baseDays, ["Speed", "Strength", "Skill", "Recovery", "Power"]), "Gym supports sport performance instead of stealing recovery.", recoveryNote),
        option("sport-strength", "Strength + Sport Practice", pickDays(baseDays, ["Lower Power", "Upper Power", "Skill Session", "Conditioning"]), "Balanced gym work around sport sessions.", "Best when your sport already creates fatigue."),
        option("sport-calisthenics", "Calisthenics + Conditioning", pickDays(baseDays, ["Push Skill", "Pull Skill", "Leg Power", "Sprint / Agility"]), "Body control, athleticism, and mixed energy systems.", "Great for minimal-equipment athletes.")
      ];
    default:
      return [
        option("lean-upper-lower", "Upper / Lower", pickDays(baseDays, ["Upper", "Lower", "Rest", "Upper", "Lower"]), "Balanced physique work with progression on key compounds.", recoveryNote),
        option("lean-ppl", "Push / Pull / Legs", pickDays(baseDays, ["Push", "Pull", "Legs", "Upper Pump", "Conditioning"]), "Aesthetic volume plus conditioning to stay lean.", "Works well when readiness stays above the mid-range."),
        option("lean-full-body", "Full-Body + Skill", pickDays(baseDays, ["Full Body", "Skill Work", "Full Body", "Conditioning"]), "Lean physique with athletic skill slots.", "Good for generalists who want performance and appearance together.")
      ];
  }
};

