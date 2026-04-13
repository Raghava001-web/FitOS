# FitOS Build Notes

This file is the "why and how" companion to the README.
It is meant to help you continue building FitOS in a fast, vibe-coding style without losing the architectural thread.

## What This Project Is Right Now

FitOS is currently a local-first Expo + React Native MVP.

That means:

- It runs as a mobile app through Expo Go.
- It stores app state locally on-device using AsyncStorage.
- It already has the major screens and core coaching logic.
- It does not yet have a real backend, push notifications, or cloud sync.

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
- Displays the top readiness/status hero

Current approach:

- Manual tab switching using local app state

Why I used this approach first:

- Faster than setting up React Navigation on day one
- Lower setup friction while proving the app concept
- Good enough to validate screen structure and business logic

What to likely do next:

- Migrate to React Navigation after first-run bugs are known

Why migrate later:

- Navigation libraries are worth it once the screens are stable
- Right now proving the product logic was more important than navigation polish

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

### 3. Real notifications

Reminder mode is captured in the onboarding model, but actual notification scheduling is not wired yet.

Why:

- Running and validating the core app mattered more first
- Notification APIs are useful once the habit model is stable

### 4. Real shorts/video infrastructure

Intentionally left basic.

Why:

- This is not the core product loop
- Video upload is infrastructure-heavy
- It should be the last major feature

## Why Navigation Was Kept Simple First

The current app uses a state-driven tab system instead of React Navigation.

Why I made that choice:

- Fastest way to prove the app screens and logic
- Fewer dependencies during first scaffold
- Lower chance of getting blocked before the app even runs

Tradeoff:

- It is not as scalable or standard as React Navigation
- Deep linking and navigation stacks are not there yet

Recommendation:

Once you have your first 3 runtime bugs written down from real phone testing, move to React Navigation.
Do that after the app’s first-run flow is known, not before.

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

- No React Navigation yet
- No form validation library yet
- No real backend auth
- No cloud sync
- No real push notification scheduling
- No real media upload stack
- No live food database
- No tests yet

Also, Expo currently warns about version mismatch on:

- `@react-native-async-storage/async-storage`
- `react-native`

Those should be aligned with Expo’s expected versions soon.

## Recommended Next Build Order

This is the most sensible next sequence from here:

1. Run the app on the phone
2. Write down the first 3 real runtime/UI breaks
3. Fix those before adding new features
4. Migrate tabs/onboarding flow to React Navigation
5. Tighten onboarding validation
6. Strengthen weight memory UX
7. Add habit reminders with `expo-notifications`
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
