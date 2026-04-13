import { DerivedMetrics, DietPlan, FoodPreference, UserProfile } from "../types";

const mealsByPreference: Record<FoodPreference, string[][]> = {
  vegetarian: [
    ["Greek yogurt bowl", "banana", "oats"],
    ["Paneer wrap", "salad"],
    ["Dal rice", "curd"],
    ["Whey shake", "almonds"]
  ],
  "non-vegetarian": [
    ["Egg + oats breakfast"],
    ["Chicken rice bowl"],
    ["Salmon salad", "fruit"],
    ["Whey shake", "peanut butter toast"]
  ],
  eggetarian: [
    ["Egg + oats breakfast"],
    ["Paneer wrap"],
    ["Dal rice", "curd"],
    ["Whey shake", "fruit"]
  ],
  Indian: [
    ["Poha + curd"],
    ["Dal rice", "salad"],
    ["Paneer wrap", "fruit"],
    ["Curd bowl", "nuts"]
  ],
  "salad-based": [
    ["Greek yogurt bowl"],
    ["Salmon salad"],
    ["Chicken rice bowl", "greens"],
    ["Fruit + whey shake"]
  ],
  "high-protein": [
    ["Egg + oats breakfast"],
    ["Chicken rice bowl"],
    ["Greek yogurt bowl"],
    ["Whey shake", "paneer cubes"]
  ],
  "fat-loss": [
    ["Greek yogurt bowl"],
    ["Egg + oats breakfast"],
    ["Salmon salad"],
    ["Dal + veggie bowl"]
  ],
  "muscle-gain": [
    ["Egg + oats breakfast"],
    ["Chicken rice bowl"],
    ["Paneer wrap"],
    ["Whey shake", "banana"]
  ]
};

export const generateDietPlan = (profile: UserProfile, metrics: DerivedMetrics): DietPlan => {
  const leanMass = profile.weightKg * (1 - profile.bodyFatPct / 100);
  const bmr = 370 + 21.6 * leanMass;
  const activityMultiplier =
    ({ low: 1.35, moderate: 1.5, high: 1.65 }[profile.activityLevel] ?? 1.5) +
    profile.trainingDaysPerWeek * 0.02;
  const goalAdjustment =
    ({
      "fat loss": -350,
      "lean body": -100,
      bulking: 320,
      "strength gain": 180,
      bodybuilding: 220,
      "Olympic-style fitness": 150,
      "sports-based fitness": 120
    }[profile.primaryGoal] ?? 0);
  const stressAdjustment = metrics.stressScore > 65 ? -100 : 0;
  const calories = Math.round(bmr * activityMultiplier + goalAdjustment + stressAdjustment);

  const proteinMultiplier =
    ({
      "fat loss": 2.2,
      "lean body": 2,
      bulking: 1.9,
      "strength gain": 1.8,
      bodybuilding: 2.1,
      "Olympic-style fitness": 1.8,
      "sports-based fitness": 1.9
    }[profile.primaryGoal] ?? 1.9);
  const protein = Math.round(profile.weightKg * proteinMultiplier);
  const fats = Math.round(profile.weightKg * 0.8);
  const carbs = Math.round((calories - protein * 4 - fats * 9) / 4);
  const mealFoods = mealsByPreference[profile.foodPreference] ?? mealsByPreference["high-protein"];
  const meals = ["Breakfast", "Lunch", "Snack", "Dinner"].map((title, index) => ({
    title,
    foods: mealFoods[index] ?? mealFoods[mealFoods.length - 1]
  }));
  const groceryList = Array.from(new Set(meals.flatMap((meal) => meal.foods))).sort();

  return {
    calories,
    protein,
    carbs,
    fats,
    style: profile.foodPreference,
    meals,
    groceryList
  };
};

export const recommendSupplements = (profile: UserProfile, metrics: DerivedMetrics) => {
  if (profile.supplementNames.length > 0) return profile.supplementNames;
  const base = ["whey protein"];
  if (profile.primaryGoal !== "fat loss") base.push("creatine");
  if (metrics.stressScore > 60) base.push("recovery support");
  if (profile.foodPreference === "vegetarian" || profile.foodPreference === "eggetarian") {
    base.push("omega-3");
  }
  if (profile.workHoursPerDay > 9) base.push("multivitamin");
  if (
    profile.primaryGoal === "strength gain" ||
    profile.primaryGoal === "sports-based fitness" ||
    profile.primaryGoal === "Olympic-style fitness"
  ) {
    base.push("pre-workout");
  }
  return Array.from(new Set(base));
};

