# FitOS Build Notes

This file is the "why and how" companion to the README.
It is meant to help you continue building FitOS in a fast, vibe-coding style without losing the architectural thread.

## What This Project Is Right Now

FitOS is currently a local-first Expo + React Native MVP.

That means:

- It runs as a mobile app through Expo Go for quick checks and through EAS/dev builds for real device QA.
- It stores app state locally on-device using AsyncStorage.
- It already has the major screens and core coaching logic.
- It does not yet have real backend auth or cloud sync.
- Native reminder and camera flows are wired, but still need development-build QA on an actual phone.

## Source Of Truth

The root project is the real mobile app.

That means these files and folders are the main product path:

- `App.tsx`
- `app.json`
- `package.json`
- `src/`
- `assets/`
- `MOBILE_FEATURE_AUDIT.md`
- `MOBILE_RELEASE_RUNBOOK.md`

There is also a separate `web/` folder in this repo.

Important:

- `web/` is a side experiment / detour, not the main FitOS product
- if your goal is Android and Expo, do not keep building new core features in `web/`
- when in doubt, treat the root Expo app as the only source of truth

## Current Mobile Direction

The intended product direction is:

- Android-first
- Expo / React Native
- local-first persistence with AsyncStorage
- Expo Go for quick UI checks
- development builds for more reliable notification and native-feature testing

Expo Go is still useful, but not every native feature behaves perfectly there anymore.

In particular:

- `expo-notifications` can show limitations or warnings inside Expo Go
- network tunnel stability can break loads on some phone setups
- Private DNS on Android can interfere with Expo tunnel downloads

So the practical rule is:

- use Expo Go to move fast on screens and state
- use a development build when testing reminders, camera, or anything that feels unreliable in Expo Go

## Current Implementation Snapshot (May 2026)

This section is the current source of truth for the app state today.
Some of the older sections below describe earlier scaffolding decisions and are useful as history, but this snapshot should win if there is any conflict.

### What is real right now

- The root Expo app is the real product path
- The main tabs are:
  - Exercise
  - Shorts
  - Progress
  - Profile
- React Navigation is already in place
- The core exercise memory system is real and persisted with AsyncStorage
- Readiness, stress, progression logic, habits, food logging, profile editing, workout history, and recovery challenge flows are already implemented in the mobile app

### Key mobile screens that exist now

- `OnboardingScreen.tsx`
- `ExerciseScreen.tsx`
- `ExerciseDetailScreen.tsx`
- `ReadinessScreen.tsx`
- `WorkoutSummaryScreen.tsx`
- `ProgressScreen.tsx`
- `HabitScreen.tsx`
- `RecoveryChallengeScreen.tsx`
- `ProfileScreen.tsx`
- `ShortsScreen.tsx`

### Key implementation notes

- `useExerciseMemory.ts` is the core differentiator and should be protected first
- `ProgressScreen.tsx` is currently the strongest MVP home for habits, nutrition, and daily control surfaces
- `ShortsScreen.tsx` is intentionally lightweight and should stay low priority until the core loop and Android reliability are solid
- `expo-notifications` is wired, but real reminder confidence requires a development build and phone testing outside Expo Go
- `expo-dev-client` is now installed so the Android development-build path is ready to use
- Expo Doctor currently passes 17/17 checks
- npm audit currently reports 0 vulnerabilities; patch-level transitive fixes are pinned with npm `overrides`
- Android Metro export currently passes, so the app bundles successfully before cloud build
- iOS Metro export currently passes, so the JavaScript bundle path is also clean for iPhone builds
- EAS CLI is not currently available on PATH; install/login with `npm install -g eas-cli` and `eas login` before running build scripts

### Recommended next order

1. Validate the Android development build path
2. Test reminders and native flows on a real phone outside Expo Go
3. Consolidate habits so the feature has one clear MVP home
4. Tighten copy and polish across the current screens
5. Add supplements more fully into onboarding and nutrition
6. Improve food logging UX
7. Add backend only after the local Android loop feels dependable

The current goal was not "production readiness."
The goal was:

1. Get the app structure in place quickly
2. Build the highest-value product logic first
3. Make the app runnable on a phone
4. Leave the code organized enough that future changes are easy

## Stack Used

### 1. Expo

Used because it is the fastest way to get a React Native app running on a real phone.

Why it was chosen:

- Fastest setup for mobile MVP work
- Easy testing with Expo Go
- Good for solo building and rapid iteration
- Lets you avoid native Android/iOS setup at the start

Why this matters for FitOS:

- The app needs to be tested on a real phone quickly
- You want fast iteration more than native optimization right now
- Features like notifications can be added later through Expo packages

### 2. React Native

Used because FitOS is a mobile-first product, not a web dashboard.

Why it was chosen:

- Native mobile UI primitives
- Good fit for habit reminders, workout logging, daily-use behavior
- Works naturally with Expo

### 3. TypeScript

Used to keep the project from becoming messy as features grow.

Why it was chosen:

- FitOS has a lot of structured data: workouts, sets, habits, diet plans, user profile, readiness metrics
- TypeScript reduces silent mistakes when passing data between screens and engines
- Helps keep "vibe coding" from turning into impossible debugging later

### 4. AsyncStorage

Used for local persistence.

Why it was chosen:

- Needed a fast local-first data layer
- Perfect for early MVP state persistence
- Lets onboarding, workout logs, habits, and diet data survive app restarts

Important note:

The current app already uses AsyncStorage through the app-wide state store.
Weight memory is working through persisted workout logs rather than through a separate per-exercise key-value helper.

So right now:

- All app state is persisted together
- Exercise history is derived from saved workout logs
- "Last session" memory is pulled from those logs

This is a valid MVP approach.
Later, if you want, you can also add a dedicated per-exercise memory helper for simpler access patterns.

## High-Level Architecture

The app is split into 5 main layers.

### 1. App Shell

File:

- [App.tsx](/R:/gym/App.tsx)

What it does:

- Boots the app
- Wraps everything in the shared app provider
- Shows the onboarding flow if no profile exists
- Shows the main tabbed experience if onboarding is complete
- Applies the phone light/dark theme to React Navigation

Current approach:

- React Navigation is the active navigation layer.
- Bottom tabs are in `src/navigation/TabNavigator.tsx`.
- Exercise and Progress use stack navigators for detail screens.

Why this approach is used now:

- It matches the shape of a real mobile app.
- It supports detail routes like Exercise Detail, Readiness, Habits, and Recovery Challenge.
- It keeps the app ready for future deep links and native navigation polish.

What to likely do next:

- Keep navigation stable while you test on Android.
- Only add more routes when a feature truly needs a separate screen.

Why not overbuild it further yet:

- Navigation already works.
- The next bottleneck is device QA, not route architecture.

### 2. Global App State

File:

- [AppContext.tsx](/R:/gym/src/store/AppContext.tsx)

What it does:

- Stores the full app state
- Hydrates from AsyncStorage on app launch
- Persists changes back to AsyncStorage
- Exposes actions for:
  - completing onboarding
  - logging workouts
  - completing habit reminders
  - adding habits
  - logging food
  - choosing plans
  - drawing and completing challenges

Why I used a context store:

- Very fast to set up
- Enough for MVP scale
- Avoids premature state-management complexity
- Keeps data shared across all screens without prop drilling

Why I did not use Redux, Zustand, MobX, or backend state yet:

- Too early
- The real bottleneck was product logic, not state tooling
- Context + AsyncStorage is enough for an MVP with one local user

### 3. Domain Engines

Files:

- [fitness.ts](/R:/gym/src/engine/fitness.ts)
- [plans.ts](/R:/gym/src/engine/plans.ts)
- [nutrition.ts](/R:/gym/src/engine/nutrition.ts)
- [habits.ts](/R:/gym/src/engine/habits.ts)

This layer is the brain of the app.

Why this layer exists:

- UI should display decisions, not contain decision-making logic
- It keeps formulas and business rules reusable
- It makes future backend migration easier

What each engine handles:

`fitness.ts`

- BMI calculation
- stress score
- readiness score
- recovery potential
- safe progression range
- training load suitability
- exercise log lookup
- medical warning logic
- plateau detection
- deload suggestion
- progression recommendation
- risky weight jump analysis

`plans.ts`

- workout split generation based on goal, training days, and recovery/stress profile

`nutrition.ts`

- diet plan generation
- calorie and macro target generation
- grocery list generation
- supplement recommendations

`habits.ts`

- exercise lookup by muscle group
- rank calculation
- weekly and monthly summaries
- progress bot message generation
- default habit setup
- challenge generation
- streak restoration helpers

Why I separated these:

- Easier to reason about than giant screen files
- Lets you tune formulas without touching UI
- Makes it easier to swap implementations later

### 4. Screens

Files:

- [OnboardingScreen.tsx](/R:/gym/src/screens/OnboardingScreen.tsx)
- [ExerciseScreen.tsx](/R:/gym/src/screens/ExerciseScreen.tsx)
- [ProgressScreen.tsx](/R:/gym/src/screens/ProgressScreen.tsx)
- [ProfileScreen.tsx](/R:/gym/src/screens/ProfileScreen.tsx)
- [ShortsScreen.tsx](/R:/gym/src/screens/ShortsScreen.tsx)

These are the product surfaces.

What each screen is responsible for:

`OnboardingScreen.tsx`

- signup/login placeholder
- body stats
- sleep and work stress inputs
- goal selection
- injury notes
- diet/supplement choices
- reminder preference

`ExerciseScreen.tsx`

- exercise library
- last-session memory display
- progression advice
- movement instructions
- animated demo placeholder
- log workout sets
- jump-risk checker
- workout split options
- muscle-based generator
- recent workout timeline

`ProgressScreen.tsx`

- daily progress view
- macro tracker
- food logging
- habits and streaks
- challenge recovery
- AI progress bot summary

`ProfileScreen.tsx`

- profile summary
- rank
- active plan
- grocery list
- supplement recommendations
- medical notes
- weekly/monthly summaries
- shareable progress card

`ShortsScreen.tsx`

- simple placeholder feed

Important product decision:

The Shorts screen exists only because it was in the spec.
It is intentionally the least developed surface and should stay that way until the core loop is strong.

### 5. Shared Components and Theme

Files:

- [ui.tsx](/R:/gym/src/components/ui.tsx)
- [AnimatedDemo.tsx](/R:/gym/src/components/AnimatedDemo.tsx)
- [theme.ts](/R:/gym/src/theme.ts)

Why this layer exists:

- Avoid duplicated styling
- Keep screens readable
- Make the app easier to redesign later

Current design direction:

- Dark, high-contrast training UI
- Card-based sections
- Strong accent colors for important signals
- Built for fast readability over design-system perfection

`AnimatedDemo.tsx` is currently a lightweight placeholder motion component.

Why:

- The spec wanted demo motion cues
- A simple MVP animation is enough to prove the screen flow
- Real exercise GIFs/SVGs can be added later

## Data Model

The app uses typed models in:

- [types.ts](/R:/gym/src/types.ts)

This file defines:

- user profile
- goals
- sports types
- medical flags
- exercise definitions
- workout logs and sets
- habits
- food items
- challenges
- diet plans
- plan options
- derived metrics
- progression advice
- overall app state

Why this matters:

FitOS is not a small CRUD app.
It has lots of interconnected systems.
The type layer prevents the data from drifting into chaos.

## What I Built First and Why

I followed the product value, not the easiest code path.

### First priority: workout memory + progression intelligence

Why:

- This is the core differentiator
- A lot of fitness apps log data
- Fewer apps give useful next-session memory and progression guidance

How it works now:

- Workout logs are saved into app state
- App state is persisted in AsyncStorage
- On exercise selection, the app looks up previous logs for that exercise
- It displays the most recent session
- It uses readiness, stress, rep trend, plateau checks, and injury flags to suggest the next load

This is the most important product loop currently implemented.

### Second priority: onboarding + metrics engine

Why:

- Progression logic is weak without context
- Readiness and stress depend on body stats and recovery inputs

What this enabled:

- BMI
- stress score
- readiness score
- recovery potential
- load suitability
- safer progression logic

### Third priority: habit tracking and daily retention surfaces

Why:

- FitOS should not feel like a one-time workout logger
- Habits and reminders are what create daily stickiness

What is implemented:

- habits with multiple time slots
- completion tracking
- streak tracking
- recovery challenge system

### Fourth priority: nutrition and profile surfaces

Why:

- The app spec included full-body-goal support
- Diet and supplements are part of the promise
- They can be modeled locally before backend work

## What I Deliberately Did Not Overbuild

### 1. Real backend

Not added yet.

Why:

- Local product loop had to work first
- Backend too early would slow down iteration
- The real unknowns were UX and product flow, not database shape

### 2. Real auth

Current onboarding has a local signup/login-style entry, not a real auth flow.

Why:

- Good enough for local proof-of-concept
- Real auth should come after first-run UX is stable

### 3. Fully verified native notifications

Reminder mode is captured in onboarding, habits have multi-slot schedules, and `expo-notifications` scheduling is wired.

Why:

- Expo Go is not the final confidence layer for reminders.
- Android notification permission, exact alarm behavior, and background timing need a development build.
- This should be tested over a real day before you trust retention metrics.

### 4. Real shorts/video infrastructure

Intentionally left basic.

Why:

- This is not the core product loop
- Video upload is infrastructure-heavy
- It should be the last major feature

## Why Navigation Is Now React Navigation

The current app uses React Navigation.

Current structure:

- Bottom tabs: Exercise, Shorts, Progress, Profile
- Exercise stack: Exercise home, exercise detail, readiness, workout summary
- Progress stack: Progress home, habits, recovery challenge

Why this is good for FitOS:

- The app now behaves like a real downloadable mobile app.
- It can grow into deep links, notifications opening specific screens, and profile/history detail pages.
- It keeps tab-level surfaces simple while still allowing drill-down flows.

Recommendation:

Do not rewrite navigation again right now.
Stabilize Android builds, notifications, camera, and the core memory loop first.

## Why the Current Weight Memory Approach Is Valid

There are 2 valid ways to build workout memory:

### Option A: global workout log history

Current implementation.

How it works:

- Save full workout logs
- Query those logs by exercise ID
- Use the latest matching entry as memory

Why it is good:

- Richer history
- Supports timelines, PR logic, plateau detection, weekly summaries, etc.

### Option B: direct per-exercise key storage

The simplified helper approach you mentioned:

- save by exercise name key
- read latest entry directly

Why it is also good:

- Simpler mental model
- Easier for targeted feature wiring

My recommendation:

Keep the current global log model as the source of truth.
If needed, add thin helper functions that read/write per-exercise summaries for convenience.
Do not replace the full log model with only per-exercise latest values, because you would lose trend intelligence.

## What Was Needed To Get It Running On This Machine

This environment did not have Node or npm available.

So the run path used was:

1. Download portable Node into `R:\gym\.tools`
2. Install npm dependencies locally
3. Redirect Expo state away from `C:\Users\...\.expo` into `R:\gym\.expo`
4. Add missing app entry file:
   - [index.js](/R:/gym/index.js)
5. Start Expo in LAN mode so it can be opened from Expo Go

This matters because if you re-run the setup elsewhere and it "mysteriously fails," the environment is probably the reason, not your app code.

## Important Current Files

If you are vibe-coding and need to know where to jump in, use this map:

### Core app boot

- [App.tsx](/R:/gym/App.tsx)
- [index.js](/R:/gym/index.js)

### State and persistence

- [AppContext.tsx](/R:/gym/src/store/AppContext.tsx)

### Main business logic

- [fitness.ts](/R:/gym/src/engine/fitness.ts)
- [plans.ts](/R:/gym/src/engine/plans.ts)
- [nutrition.ts](/R:/gym/src/engine/nutrition.ts)
- [habits.ts](/R:/gym/src/engine/habits.ts)

### Screens

- [OnboardingScreen.tsx](/R:/gym/src/screens/OnboardingScreen.tsx)
- [ExerciseScreen.tsx](/R:/gym/src/screens/ExerciseScreen.tsx)
- [ProgressScreen.tsx](/R:/gym/src/screens/ProgressScreen.tsx)
- [ProfileScreen.tsx](/R:/gym/src/screens/ProfileScreen.tsx)
- [ShortsScreen.tsx](/R:/gym/src/screens/ShortsScreen.tsx)

### Seed content and modeling

- [types.ts](/R:/gym/src/types.ts)
- [exercises.ts](/R:/gym/src/data/exercises.ts)
- [mockContent.ts](/R:/gym/src/data/mockContent.ts)

## Current Known Gaps

These are not bugs by default, but they are unfinished areas:

- No form validation library yet
- No real backend auth
- No cloud sync
- Native notifications need development-build QA
- No real media upload stack
- Food search is live, but the meal-builder UX is still basic
- No tests yet

Also, run `npm run typecheck` after UI changes and use a development build before trusting camera or reminder behavior.



## Recommended Next Build Order

This is the most sensible next sequence from here:

1. Run the app on the phone
2. Write down the first 3 real runtime/UI breaks
3. Fix those before adding new features
4. Validate an Android development build
5. Test reminders and camera/barcode flows on a real phone
6. Tighten onboarding validation
7. Strengthen weight memory UX with more coach-style explanations
8. Add backend only after the local loop is stable

## If You Want To Keep Vibe-Coding Safely

Use this rule:

- Add new UI in screens
- Add reusable display bits in components
- Add formulas and decisions in engine files
- Add shared data shapes in `types.ts`
- Keep persistence logic in `AppContext.tsx`

That one rule will save you a lot of pain.

## Summary

The app was built with a local-first MVP philosophy:

- prove the core differentiator first
- keep the architecture simple but not sloppy
- defer heavy infrastructure until the product loop is real

The central product bet is:

FitOS should feel like a coach that remembers what you did, knows how recovered you are, and tells you what to do next.

That is the lens the current codebase was built through.
