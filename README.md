# FitOS 🏋️‍♂️📱

FitOS is a premium, client-side intelligent **Android Fitness Coaching & OS** built with **React Native (Expo SDK 54)** and **TypeScript**. Designed with a luxurious, high-end "Luxe" aesthetic, FitOS functions as an advanced gym coach, recovery advisor, workout memory system, multi-slot habit builder, and diet helper. 

All computation, progression intelligence, and user data analysis are handled securely, 100% on-device, using persistent AsyncStorage.

---

## ✨ Features & Architecture

### 1. 🧠 Core Intelligence Engines
* **Fitness & Safe Progression Engine (`src/engine/fitness.ts`):** Calculates BMI, daily readiness score (0-100), training load suitability, and caution indicators based on injury logs. Includes a **Jump-Risk Advisor** that prevents users from increasing weights too aggressively.
* **On-Device Weight Memory (`src/hooks/useExerciseMemory.ts`):** Automatically remembers the user's previous successful sets, reps, and weights for every exercise, pre-filling log sheets and adapting progression bands in real time.
* **Habit & Recovery Engine (`src/engine/habits.ts`):** Generates custom baseline habits based on user profiles, tracks consistency with GitHub-style contribution heatmaps, and triggers interactive **Streak Recovery Mini-Games** if a streak is at risk.
* **Push Notification Scheduler (`src/engine/reminders.ts`):** Schedules local reminders directly on the Android OS using `expo-notifications`, with platform-specific channel routing and granular reminder settings.
* **Nutrition & Dietary Advisor (`src/engine/nutrition.ts`):** Dynamically generates calorie, macro, and supplement recommendations based on physical profile, training split, and primary fitness goal.

### 2. 📱 Luxurious Mobile Screens (10 Total)
* **🌟 Premium Onboarding (`OnboardingScreen`):** A beautiful 7-step wizard that configures the entire user profile, dietary styles, injuries, goals, and daily reminder preferences.
* **🏋️‍♂️ Exercise Database & Detail (`ExerciseScreen`, `ExerciseDetailScreen`):** Searchable exercise list categorized by target muscles, with real-time progression hints (e.g., *"+2.5 kg suggested"*), historical logging, and interactive sets.
* **📊 Analytics & Macro Logs (`ProgressScreen`):** Tracks body weight, calculated body fat, daily food items, and macro budgets with sleek circular progress trackers.
* **🔋 Readiness & Vital Stats (`ReadinessScreen`):** High-fidelity dashboard visualizing training load recommendations, sleep logs, and stress metrics.
* **🛡️ Streak Recovery Challenge (`RecoveryChallengeScreen`):** Restores broken streaks through interactive recovery games when consistency lapses.
* **📱 FitShorts Feed (`ShortsScreen`):** High-engagement swipeable shorts feed mock for curated, motivational athletic clips.
* **👤 User Profile & Customization (`ProfileScreen`):** Displays dynamic user status badges, supplement schedules, interactive grocery lists, and a beautiful shareable progress card.

---

## 🎨 Visual Identity & Theme ("Luxe")

FitOS is built on a luxurious custom design system utilizing premium aesthetics, smooth animations, and high-contrast layouts:
* **Backgrounds:** Warm Charcoal (`#121210` / `#0A0A0A`)
* **Accents:** Luxurious Bronze (`#D19C60`), Muted Sage Sage (`#81A675`), Soft Teal (`#38BDF8`), and Lime Accent (`#84CC16`)
* **Aesthetics:** Borderless micro-cards, glassmorphism overlays, custom shadows, and dynamic option chips that react to user touches with subtle animations and scale transforms.

---

## 🚀 Getting Started & Local Development

### Prerequisites
Make sure you have Node.js (v20+ recommended) and the Expo CLI installed.

```bash
# Install dependencies
npm install
```

### Start Development Server
Run the local dev server using the Expo CLI:
```bash
# Start expo in local interactive mode
npx expo start
```
You can then scan the QR code using the **Expo Go** app on your Android device.

---

## 📦 Building the Android APK

FitOS is fully configured for cloud and local builds using **Expo Application Services (EAS)**.

### 1. Cloud Build via EAS
First, log in to your Expo account:
```bash
npx eas-cli login
```

Build the preview APK (for manual installation on your phone):
```bash
npx eas-cli build --platform android --profile preview
```

### 2. Custom EAS Profile Configurations (`eas.json`)
* **`development`**: For debugging and running a local development server on the device.
* **`preview`**: Compiles a standalone `.apk` directly downloadable to your Android device via QR code.
* **`production`**: Compiles a bundle ready for release on the Google Play Store.

---

## 🛠️ Tech Stack & Directory Structure

```
FitOS/
├── .expo/                   # Expo configuration cache
├── assets/                  # App icon, splash screen, and static media
├── src/
│   ├── components/          # Reusable UI widgets (HabitHeatmap, SetLogger, etc.)
│   ├── data/                # Local databases (Exercise definitions, shorts feed)
│   ├── engine/              # Core business logic (Fitness, Nutrition, Reminders)
│   ├── hooks/               # Custom hooks for state memory and analytics
│   ├── navigation/          # React Navigation stacks and type definitions
│   ├── screens/             # Standalone high-fidelity screens
│   ├── store/               # Application-wide React Context (AppContext.tsx)
│   ├── theme.ts             # Luxurious HSL custom palette and design tokens
│   └── types.ts             # Comprehensive TypeScript domain interfaces
├── App.tsx                  # App hydration and routing entrypoint
├── app.json                 # Expo project metadata and Android permissions
├── eas.json                 # Standalone APK build profiles
└── tsconfig.json            # TypeScript build settings
```
