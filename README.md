# FitOS 🏋️‍♂️📱 — premium On-Device Android Fitness Coach & OS

> [!WARNING]  
> **🚨 ACTIVE DEVELOPMENT PHASE — NOT YET COMPLETED**  
> FitOS is an ongoing engineering prototype. Core UI structures, numerical calculation engines, local storage schemas, and navigation stacks are fully functional and compile cleanly. However, advanced hardware-level integrations (such as native smartwatch biometric syncing, Bluetooth scales, and full production user authentication) are still actively in development. This is a pre-release work-in-progress and not a finalized production build.

FitOS is a luxurious, high-fidelity native **Android Fitness Coaching & OS** built with **React Native (Expo SDK 54)** and **TypeScript**. Designed for athletes who demand premium visual aesthetics and secure on-device intelligence, FitOS functions as an advanced gym coach, recovery advisor, workout memory system, multi-slot habit builder, and diet helper. 

All computations, progression analysis, and data logging are handled **100% locally and securely on-device** using persistent AsyncStorage, ensuring zero server latency and absolute privacy.

---

## 🎨 Visual Identity: The "Luxe" Theme
FitOS utilizes a bespoke custom design system, sporting rich charcoal tones, bronze overlays, mossy sages, and borderless micro-cards that evoke a high-end, premium feel:
* **Background Canvas:** Warm Charcoal (`#121210` / `#181816`)
* **Floating Panels:** Soft Charcoal (`#1E1E1C` / `#262622`)
* **Primary Accent:** Rich Bronze (`#D19C60` / `#C59E6F`)
* **Secondary Accents:** Muted Sage (`#81A675`), Muted Slate (`#7992B4`), and Soft Sand Gold (`#DFB15B`)
* **Typography:** Warm high-contrast cream (`#F4F4EC`)
* **Borderless Design System:** Ripped out heavy default styling borders (`borderWidth: 0`), using elevation layers, custom card shadows, and scale transitions on pressable components.

---

## 📂 File-by-File Codebase Roadmap

```
r:/gym/
├── src/
│   ├── components/            # Reusable luxurious UI components
│   │   ├── ui.tsx             # Custom design kit (ScreenHero, SectionCard, OptionChip, LabeledInput, Button)
│   │   ├── HabitHeatmap.tsx   # GitHub-style contribution grid for habit history visualization
│   │   ├── SetLogger.tsx      # High-fidelity inline logging grid for weight, sets, reps, and checkmarks
│   │   ├── ExerciseDemo.tsx   # Simulated video demo wrapper for exercise instruction visuals
│   │   ├── AnimatedDemo.tsx   # Interactive micro-animation wrappers
│   │   └── BodyAnalysisSheet.tsx # Bottom drawer sheet representing lean mass & fat ratios
│   │
│   ├── engine/                # Core business logic & mathematical models
│   │   ├── fitness.ts         # Stress score, readiness metrics, and safe weight progression logic
│   │   ├── habits.ts          # Rank calculations, recovery challenges, and baseline habit lists
│   │   ├── nutrition.ts       # Caloric requirements (Katch-McArdle) and supplement advice
│   │   ├── plans.ts           # Workout splits (PPL, Full Body) based on onboarding goals
│   │   └── reminders.ts       # Local push notification scheduling via expo-notifications (Android-optimized)
│   │
│   ├── data/                  # Built-in static local databases
│   │   ├── exercises.ts       # Detailed definitions (muscle, caution areas, instructions, starter weights)
│   │   └── mockContent.ts     # Video links and clips for the Shorts feed
│   │
│   ├── hooks/                 # Custom state & memory hook bindings
│   │   └── useExerciseMemory.ts # Auto-prefill engine remembering weight/rep stats from the last workout
│   │
│   ├── navigation/            # Native Stack and Bottom Tab routing architectures
│   │   ├── TabNavigator.tsx   # Custom floating tab bar routing Exercise, Habits, Progress, and Profile
│   │   ├── ExerciseStack.tsx  # Drill-down routes: Exercise list ➔ Exercise Logging ➔ Workout Summary
│   │   ├── HabitStack.tsx     # Habit index ➔ Camera-driven Streak Recovery Challenge
│   │   ├── ProgressStack.tsx  # Progress dashboard ➔ Readiness details
│   │   └── types.ts           # Strictly-typed navigation route param mappings
│   │
│   ├── store/                 # Central React Context state provider
│   │   └── AppContext.tsx     # Handles async hydration from AsyncStorage, log mutations, and state updates
│   │
│   ├── theme.ts               # UX styling configurations, radii, spacing, and Luxe color schemes
│   └── types.ts               # Domain TypeScript interfaces (UserProfile, WorkoutLog, Habit, etc.)
│
├── assets/                    # Android application icon, adaptive launch icons, and splash screens
├── App.tsx                    # Main App entrypoint running hydrations, navigation, and loading states
├── app.json                   # Expo platform configuration, plugins, and native permission list
├── eas.json                   # Cloud EAS compilation build profiles
└── tsconfig.json              # App compilation TypeScript configs
```

---

## 🧠 Core Intelligence & Mathematical Models

### 1. Daily Stress Index (0-100)
Calculated in `src/engine/fitness.ts` via `calculateStressScore()`. This score acts as a fatigue baseline by aggregating lifestyle metrics and sleep debt:
$$\text{Stress Score} = 16 + \text{Sleep Deficit} + \text{Sleep Quality Penalty} + \text{Work Deficit} + \text{Work Days Factor} + \text{Stress Level} + \text{Activity Level} - \text{Recovery Bonus}$$

* **Sleep Deficit:** $(8 - \text{sleepHours}) \times 8$ (clamped between $0$ and $30$)
* **Sleep Quality Penalty:** $(5 - \text{sleepQuality}) \times 5$
* **Work Deficit:** $(\text{workHoursPerDay} - 8) \times 5$ (clamped between $0$ and $20$)
* **Work Days Factor:** $(\text{workDaysPerWeek} - 5) \times 4$ (clamped between $0$ and $12$)
* **Stress Penalty:** `low: 0`, `moderate: 8`, `high: 16`
* **Activity Penalty:** `low: 2`, `moderate: 7`, `high: 12`
* **Recovery Bonus:** `poor: 0`, `average: 6`, `good: 12`
* **Overtraining Alert:** Add $+6$ points if workout days in the last week $\ge 5$.
* **Extreme Load Alert:** Add $+18$ points if daily sleep is $<6$ hours and work is $>10$ hours.

### 2. Daily Readiness Index (0-100)
Calculated via `calculateReadinessScore()`. This dictates how much training load your body can safely handle today:
$$\text{Readiness} = 78 + \text{Sleep Mod} + \text{Sleep Qual Mod} - (\text{Stress Score} \times 0.38) - (\text{Consecutive Days} \times 7) + \text{Rest Days Mod} - (\text{Injuries} \times 10)$$

* **Sleep Mod:** $(\text{sleepHours} - 7) \times 8$ (clamped between $-18$ and $+12$)
* **Sleep Qual Mod:** $(\text{sleepQuality} - 3) \times 5$
* **Rest Days Mod:** Days since last workout $\times 4$ (clamped between $0$ and $12$)
* **Extreme Load Penalty:** Subtract $-12$ points if sleep is $<6$ hours and work is $>10$ hours.
* **Resulting Load Suitabilities (`getTrainingLoadSuitability`):**
  * **Readiness $<40$:** `rest` (High fatigue. Mandatory recovery day suggested).
  * **Readiness $<55$ OR Stress $>70$:** `recovery` (Light active recovery, active stretching).
  * **Readiness $<75$:** `moderate` (Controlled progressive training).
  * **Readiness $\ge 75$:** `high` (Peak state. Ready for intense progression).

### 3. Katch-McArdle Nutrition Calculator
Calculated in `src/engine/nutrition.ts` via `generateDietPlan()`. Instead of standard rough estimations, FitOS uses lean mass ratios:
$$\text{Lean Mass} = \text{weightKg} \times \left(1 - \frac{\text{bodyFatPct}}{100}\right)$$
$$\text{BMR} = 370 + (21.6 \times \text{Lean Mass})$$
$$\text{Daily Calories} = (\text{BMR} \times \text{Activity Multiplier}) + \text{Goal Adjustment} + \text{Stress Adjustment}$$

* **Activity Multiplier:** `low: 1.35`, `moderate: 1.5`, `high: 1.65` (plus $+0.02$ per active training day/week).
* **Goal Caloric Offsets:**
  * `fat loss`: $-350$ kcal
  * `lean body`: $-100$ kcal
  * `bulking`: $+320$ kcal
  * `strength gain`: $+180$ kcal
  * `bodybuilding`: $+220$ kcal
  * `Olympic-style fitness`: $+150$ kcal
  * `sports-based fitness`: $+120$ kcal
* **Stress Safety Cap:** If daily Stress Score is $>65$, subtract $-100$ kcal to account for slower metabolic rates and elevated cortisol levels.
* **Macronutrient Budgets:**
  * **Protein:** Weight (kg) $\times$ Goal Multiplier (`fat loss: 2.2g`, `lean body: 2.0g`, `bodybuilding: 2.1g`, `strength: 1.8g`).
  * **Fats:** Clamped at a healthy hormone-regulating $0.8$g per kg of body weight.
  * **Carbohydrates:** Calculated dynamically from remaining calories:
    $$\text{Carbohydrates (g)} = \frac{\text{Calories} - (\text{Protein} \times 4) - (\text{Fats} \times 9)}{4}$$

### 4. Progression & Deload Advisor
Determined in `src/engine/fitness.ts` via `recommendProgression()` and `needsDeload()`:
* **First session starter weights:**
  * **Compound Lifts:** $55\%$ of user's body weight (rounded to nearest 2.5 kg).
  * **Isolation Lifts:** $25\%$ of user's body weight (rounded to nearest 2.5 kg).
  * **Bodyweight:** Body weight.
* **Auto-Progression Increments:**
  * If Readiness is low ($<40$), recommend **reducing** load by $5\%$ (`-5%` recovery load).
  * If injuries are flagged in the exercise's target muscle group, **hold** current load.
  * If a **plateau** is detected (no weight or rep increases in the last 3 sessions), **hold** and alert user to switch to tempo work.
  * If rep performance has increased by $\ge 2$ reps over the previous session **AND** readiness is high ($\ge 70$):
    * **Compound Lift:** suggest `+5.0 kg` jump.
    * **Isolation Lift:** suggest `+2.5 kg` jump.
  * If rep performance is $+1$ rep **OR** readiness is moderate ($\ge 60$): suggest a standard `+2.5 kg` jump.
* **Deload Watch:** Triggers a recommendation for a **60% volume deload week** if you have accumulated 4-6 progressive weeks of intensive loading without recovery phases.

### 5. Progression Jump-Risk Advisor
Calculated via `buildJumpCheck()`. Evaluates manual weight entries against your historical baselines to prevent muscular tears and joint overload:
$$\text{Weight Jump \%} = \frac{\text{Target Weight} - \text{Current Weight}}{\text{Current Weight}} \times 100$$
* **Low Risk ($\le 8\%$):** Safe jump. Keep form tight.
* **Moderate Risk ($8\% - 15\%$):** Warning shown. Advises split increments (e.g., $10$ kg $\rightarrow$ two $5$ kg blocks).
* **High Risk ($>15\%$):** Critical alarm. Displays a progressive loading plan spread out over 4-6 weeks to reach the target safely.

### 6. Athlete Consistency Rank
Calculated in `src/engine/habits.ts` via `calculateRank()` to gamify consistency:
$$\text{Rank Score} = \frac{\text{Total Volume Lifted}}{1500} + (\text{Average Habit Streak} \times 3) + (\text{Workout Count} \times 2)$$
* **Rookie:** $\le 20$ pts
* **Novice:** $20 - 50$ pts
* **Strong:** $50 - 95$ pts
* **Elite:** $95 - 150$ pts
* **Legendary:** $150 - 220$ pts
* **Monster:** $>220$ pts

---

## 📋 Interactive 7-Step Onboarding Flow
FitOS includes a gorgeous 7-stage configuration wizard (`src/screens/OnboardingScreen.tsx`) to build a high-fidelity athlete model:
1. **Athlete Identity & Goal:** Captures name and selects primary fitness goal.
2. **Body Dimensions:** Captures weight and height to calculate initial BMI.
3. **Body Fat Estimation:** Gathers body fat % to calculate lean mass BMR (Katch-McArdle).
4. **Sleep & Work Stats:** Ingests sleep hours, quality rating, and work hours to configure baseline fatigue metrics.
5. **Lifestyle Context:** Analyzes day-to-day stress levels, activity levels, and historical recovery consistency.
6. **Injury Guardrails:** Formally logs existing pain/injuries (e.g., knee, shoulder) to trigger dynamic caution messages during workouts.
7. **Diet & Rhythm:** Maps food styles (vegetarian, high-protein, eggetarian), weekly training frequency, and local notification preferences.

---

## 🔒 Android Platform Permissions
FitOS is fully optimized for the Android platform and requests the following essential system permissions under `app.json`:
* **`android.permission.CAMERA`:** Powers scanning barcodes for calorie tracking and validation photos for Streak Recovery challenges.
* **`android.permission.POST_NOTIFICATIONS`:** Allows native Android channels to push time-sensitive habit reminders and streak danger alerts.
* **`android.permission.SCHEDULE_EXACT_ALARM` & `android.permission.USE_EXACT_ALARM`:** Schedules exact daily habit timers that trigger on time even if the device is in power-saving/Doze mode.
* **`android.permission.RECEIVE_BOOT_COMPLETED`:** Reschedules all notifications and alarms automatically if your device rebooted.
* **`android.permission.VIBRATE`:** Provides subtle haptic feedback during heavy set completions and notifications.
* **`android.permission.RECORD_AUDIO`:** Prerequisite for secure camera usage.
* **`android.permission.READ_EXTERNAL_STORAGE` & `android.permission.WRITE_EXTERNAL_STORAGE`:** Saves custom progress cards and athlete profile avatars to the local device memory.

---

## 🚀 Getting Started & Local Development

### Installation
Make sure you have Node.js (v20+ recommended) and the Expo CLI installed.

```bash
# Clone the repository
git clone https://github.com/Raghava001-web/FitOS.git
cd FitOS

# Install dependencies
npm install
```

### Run Expo Go (Interactive Sandbox)
Start the local bundler:
```bash
npx expo start
```
Scan the displayed QR code using the **Expo Go** application on your Android phone to run the app instantly!

---

## 📦 Building the Standalone Android APK

FitOS is pre-configured with **Expo Application Services (EAS)** to compile a physical `.apk` package.

### 1. Connect EAS CLI
Make sure you have the EAS CLI installed globally:
```bash
npm install -g eas-cli
```

### 2. Login & Link project
Authenticate with your Expo credentials or set up your `EXPO_TOKEN`:
```bash
npx eas-cli login
```

### 3. Compile Standalone preview APK
Build a standalone preview package for manual installation on your Android phone:
```bash
npx eas-cli build --platform android --profile preview
```
EAS will output a URL containing your compiled `.apk` installer ready for mobile testing!
