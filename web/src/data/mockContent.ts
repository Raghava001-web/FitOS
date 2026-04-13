import { Challenge, FoodItem, SocialShort } from "../types";

export const FOOD_LIBRARY: FoodItem[] = [
  {
    id: "chicken-rice",
    name: "Chicken Rice Bowl",
    calories: 520,
    protein: 42,
    carbs: 48,
    fats: 14,
    tags: ["high-protein", "muscle-gain", "non-vegetarian"]
  },
  {
    id: "paneer-wrap",
    name: "Paneer Wrap",
    calories: 430,
    protein: 28,
    carbs: 36,
    fats: 18,
    tags: ["Indian", "vegetarian", "high-protein"]
  },
  {
    id: "egg-oats",
    name: "Egg + Oats Breakfast",
    calories: 380,
    protein: 24,
    carbs: 30,
    fats: 16,
    tags: ["eggetarian", "fat-loss", "breakfast"]
  },
  {
    id: "dal-rice",
    name: "Dal Rice",
    calories: 410,
    protein: 18,
    carbs: 62,
    fats: 8,
    tags: ["Indian", "vegetarian"]
  },
  {
    id: "greek-yogurt-bowl",
    name: "Greek Yogurt Bowl",
    calories: 280,
    protein: 21,
    carbs: 24,
    fats: 8,
    tags: ["fat-loss", "high-protein"]
  },
  {
    id: "whey-shake",
    name: "Whey Protein Shake",
    calories: 160,
    protein: 28,
    carbs: 6,
    fats: 3,
    tags: ["supplement", "high-protein"]
  },
  {
    id: "salmon-salad",
    name: "Salmon Salad",
    calories: 450,
    protein: 34,
    carbs: 18,
    fats: 24,
    tags: ["salad-based", "non-vegetarian"]
  }
];

export const CHALLENGE_POOL: Challenge[] = [
  {
    id: "pushup-30",
    title: "30 Push-ups",
    description: "Complete 30 quality push-ups now to restore your streak momentum.",
    rewardBadge: "Bounce Back"
  },
  {
    id: "walk-5",
    title: "5-minute Walk",
    description: "Take a brisk 5-minute walk and log it for streak recovery.",
    rewardBadge: "Momentum Saver"
  },
  {
    id: "plank-1",
    title: "1-minute Plank",
    description: "Hold a strong plank for one minute without letting the hips sag.",
    rewardBadge: "Core Rescue"
  },
  {
    id: "squats-50",
    title: "50 Bodyweight Squats",
    description: "Knock out 50 bodyweight squats with full depth to save the streak.",
    rewardBadge: "Leg Day Revival"
  }
];

export const SHORTS_FEED: SocialShort[] = [
  {
    id: "short-1",
    athlete: "Maya R.",
    title: "Deadlift form update",
    caption: "Finally locked in my wedge and the bar is moving cleaner.",
    duration: "0:32",
    tags: ["powerlifting", "technique"]
  },
  {
    id: "short-2",
    athlete: "Arjun K.",
    title: "Push day pump",
    caption: "Shoulders + triceps finisher after a long workday.",
    duration: "0:24",
    tags: ["bodybuilding", "consistency"]
  },
  {
    id: "short-3",
    athlete: "Coach Nia",
    title: "Sprint reset drill",
    caption: "Two cues for cleaner acceleration if your first step feels heavy.",
    duration: "0:41",
    tags: ["sports", "running"]
  }
];
