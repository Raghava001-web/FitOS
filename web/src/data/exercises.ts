import { ExerciseDefinition } from "../types";

export const EXERCISES: ExerciseDefinition[] = [
  {
    id: "lat-pulldown",
    name: "Lat Pulldown",
    targetMuscle: "back",
    category: "compound",
    instructions: [
      "Set the thigh pad tight so your hips stay down.",
      "Pull elbows toward your pockets instead of yanking with the wrists.",
      "Pause at the chest, then control the eccentric for 2-3 seconds."
    ],
    restSeconds: 90,
    defaultRepRange: "8-12",
    youtubeUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    cautionAreas: ["shoulder", "elbow"],
    movementPattern: "vertical pull"
  },
  {
    id: "back-squat",
    name: "Back Squat",
    targetMuscle: "quads",
    category: "compound",
    instructions: [
      "Brace before each rep and keep the ribs stacked over the pelvis.",
      "Sit between the hips while keeping the whole foot planted.",
      "Drive up with even pressure through mid-foot and heel."
    ],
    restSeconds: 150,
    defaultRepRange: "3-8",
    youtubeUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8",
    cautionAreas: ["knee", "back"],
    movementPattern: "squat"
  },
  {
    id: "bench-press",
    name: "Bench Press",
    targetMuscle: "chest",
    category: "compound",
    instructions: [
      "Create upper-back tension and keep the shoulder blades tucked.",
      "Lower to the lower chest with forearms vertical.",
      "Press back up without losing the arch or leg drive."
    ],
    restSeconds: 150,
    defaultRepRange: "4-10",
    youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
    cautionAreas: ["shoulder", "elbow"],
    movementPattern: "horizontal press"
  },
  {
    id: "overhead-press",
    name: "Overhead Press",
    targetMuscle: "shoulders",
    category: "compound",
    instructions: [
      "Squeeze glutes and abs before the bar leaves the shoulders.",
      "Move the head back just enough for a straight bar path.",
      "Finish with the biceps beside the ears and ribs down."
    ],
    restSeconds: 120,
    defaultRepRange: "5-8",
    youtubeUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI",
    cautionAreas: ["shoulder", "back"],
    movementPattern: "vertical press"
  },
  {
    id: "romanian-deadlift",
    name: "Romanian Deadlift",
    targetMuscle: "hamstrings",
    category: "compound",
    instructions: [
      "Unlock the knees slightly and push the hips back first.",
      "Keep the bar close to the legs during the hinge.",
      "Stop when hamstrings are loaded, then drive hips through."
    ],
    restSeconds: 120,
    defaultRepRange: "6-10",
    youtubeUrl: "https://www.youtube.com/watch?v=2SHsk9AzdjA",
    cautionAreas: ["back", "other"],
    movementPattern: "hinge"
  },
  {
    id: "lateral-raise",
    name: "Lateral Raise",
    targetMuscle: "shoulders",
    category: "isolation",
    instructions: [
      "Lead with the elbows and keep the hands slightly below shoulder height.",
      "Use a soft elbow bend and avoid swinging from the lower back.",
      "Lower under control until the dumbbells are beside the hips."
    ],
    restSeconds: 60,
    defaultRepRange: "12-20",
    youtubeUrl: "https://www.youtube.com/watch?v=kDqklk1ZESo",
    cautionAreas: ["shoulder"],
    movementPattern: "abduction"
  },
  {
    id: "barbell-row",
    name: "Barbell Row",
    targetMuscle: "back",
    category: "compound",
    instructions: [
      "Set the torso angle and lock it in before the first rep.",
      "Row the bar toward the lower ribs with the elbows tucked.",
      "Return to the hang without losing the brace."
    ],
    restSeconds: 120,
    defaultRepRange: "6-10",
    youtubeUrl: "https://www.youtube.com/watch?v=kBWAon7ItDw",
    cautionAreas: ["back", "shoulder"],
    movementPattern: "horizontal pull"
  },
  {
    id: "bicep-curl",
    name: "Bicep Curl",
    targetMuscle: "biceps",
    category: "isolation",
    instructions: [
      "Pin the elbows close to the torso for every rep.",
      "Curl without letting the shoulders roll forward.",
      "Control the lowering phase fully to keep tension on the biceps."
    ],
    restSeconds: 45,
    defaultRepRange: "10-15",
    youtubeUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo",
    cautionAreas: ["elbow"],
    movementPattern: "elbow flexion"
  },
  {
    id: "tricep-pushdown",
    name: "Tricep Pushdown",
    targetMuscle: "triceps",
    category: "isolation",
    instructions: [
      "Set the shoulders down and keep the chest tall.",
      "Extend the elbows fully without shrugging or leaning over.",
      "Return slowly until forearms are just above parallel."
    ],
    restSeconds: 45,
    defaultRepRange: "10-15",
    youtubeUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU",
    cautionAreas: ["elbow", "shoulder"],
    movementPattern: "elbow extension"
  },
  {
    id: "pull-up",
    name: "Pull-Up",
    targetMuscle: "back",
    category: "bodyweight",
    instructions: [
      "Start from a dead hang with the shoulders active.",
      "Pull the chest toward the bar while keeping the ribs stacked.",
      "Lower all the way down to a controlled hang before the next rep."
    ],
    restSeconds: 120,
    defaultRepRange: "4-10",
    youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    cautionAreas: ["shoulder", "elbow"],
    movementPattern: "vertical pull"
  },
  {
    id: "plank",
    name: "Plank",
    targetMuscle: "abs",
    category: "bodyweight",
    instructions: [
      "Line the elbows under the shoulders and squeeze the glutes.",
      "Think long spine instead of aggressively arching or rounding.",
      "Breathe behind the brace while holding position."
    ],
    restSeconds: 45,
    defaultRepRange: "30-90 sec",
    youtubeUrl: "https://www.youtube.com/watch?v=pSHjTRCQxIw",
    cautionAreas: ["back"],
    movementPattern: "anti-extension core"
  },
  {
    id: "sprint-interval",
    name: "Sprint Intervals",
    targetMuscle: "calves",
    category: "sport",
    instructions: [
      "Build speed for the first few steps instead of exploding upright.",
      "Keep ground contact quick and posture tall through the sprint.",
      "Walk back and recover fully before the next effort."
    ],
    restSeconds: 120,
    defaultRepRange: "20-40 m repeats",
    youtubeUrl: "https://www.youtube.com/watch?v=w7y8u4g7k5g",
    cautionAreas: ["knee", "other"],
    movementPattern: "speed conditioning"
  }
];
