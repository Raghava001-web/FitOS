# FitOS Mobile Feature Audit

Last reviewed: 2026-05-21

Source of truth: the Expo React Native app in `R:\gym`. The `web/` folder is a previous experiment and is not counted as product progress for Android or iPhone.

## Release Target

FitOS is now configured as an installable mobile app project:

- Android package: `com.fitos.app`
- iOS bundle identifier: `com.fitos.app`
- Android internal/test build path: `npm run build:android:preview`
- Android store build path: `npm run build:android:production`
- iPhone/TestFlight build path: `npm run build:ios:production`
- Both platforms: `npm run build:all:production`

Important: real iPhone device builds and TestFlight/App Store release require an Apple Developer account. Android Play Store release requires a Google Play Console account.

## Current Health Checks

Latest local checks:

- TypeScript: `npm run typecheck` passes
- Expo Doctor: `npx expo-doctor` passes 17/17 checks
- npm audit: 0 vulnerabilities after SDK 54 patch alignment and safe transitive overrides
- Android bundle export: `npx expo export --platform android --clear` passes
- iOS bundle export: `npx expo export --platform ios --clear` passes

Dependency notes:

- Expo SDK is aligned to `expo@~54.0.34`
- `expo-dev-client` is aligned to `~6.0.21`
- `expo-notifications` is aligned to `~0.32.17`
- `@xmldom/xmldom` and `postcss` are pinned through npm overrides to patched transitive versions without moving the app to SDK 55

## Feature Status

| Area | Status | Notes |
|---|---|---|
| Onboarding | Partial | Seven-step onboarding works and saves profile data. Sports-based goal now asks for sport type. Missing real signup/login auth. |
| Body stats | Working | BMI, body fat label, readiness inputs, stress inputs, recovery consistency, work hours, and sleep inputs are captured. |
| Sports support | Working for MVP | Sport choice is saved and flows into sports conditioning plan naming. More sport-specific exercise programming is still future work. |
| Diet setup | Working for MVP | Food preference and diet/no-diet choice are captured. Diet plan and grocery list are generated locally. |
| Supplements | Partial | User supplement stack is captured and Profile shows logged stack plus recommendations. Intake tracking should be tied into habits next. |
| Theme | Working | Phone light/dark mode is auto-detected. Manual theme toggle is intentionally removed. |
| Readiness score | Working | Readiness screen has score, signals, action plan, stress/recovery/workload factors, injury context, and body/block context. |
| Stress score | Working | Calculated from sleep, work, activity, habits/recovery, and training load in local engine. |
| Weight memory | Working | AsyncStorage stores per-exercise set history, last set, PR, recent memory, and chart data. |
| Progression advice | Working for MVP | Suggested loads, jump-risk path, injury warnings, and recent-session advice exist. Needs more real-world calibration after testing. |
| Exercise logging | Working | Quick log and full session logger both save data. Rest timer and session clock are included. |
| Exercise demos | Working for MVP | Per-exercise SVG demos are present. Not form analysis. |
| YouTube refs | Working | Exercise detail can open reference links. |
| Workout split generator | Working | Uses goal, training days, stress/recovery metrics, and selected plan state. |
| Muscle exercise generator | Working | Muscle selection surfaces relevant exercises. |
| Workout history | Working | Profile history reads AsyncStorage memory, refreshes on focus, and groups full-session logs by timestamp. |
| Daily progress dashboard | Partial | Calories/protein/sets, coach note, weekly/monthly summaries, PR, habit heatmap, food log, and habits exist. Missing full steps/cardio/body-fat trend pipeline. |
| Food search | Working with network | Open Food Facts search is wired and biased toward India. Requires internet. |
| Barcode food logging | Working in code, needs device QA | Uses `expo-camera` barcode scanning and Open Food Facts product lookup. Must be tested in a dev build. |
| Habit tracker | Working | Multi-slot habits, defaults, custom habits, completion state, streaks, and heatmap are implemented. |
| Notifications | Working in code, needs dev-build QA | `expo-notifications` scheduling exists. Expo Go is not enough for reliable native reminder QA. |
| Calendar integration | Not built | App stores reminder mode, but device calendar write integration is not implemented. |
| Streak recovery challenges | Working | Draw random challenge, camera proof flow, completion, badge history, and habit streak restoration are implemented. |
| Rank system | Working | Rank derives from workout logs and habits. Displayed on Profile and Progress. |
| Profile edit | Working | Edits weight, height, sleep, work hours, and goal; recalculates metrics. |
| Share progress card | Partial | Native share sheet shares text summary. Visual PNG card generation is not built yet. |
| Shorts tab | Placeholder | Local mock clips work, but real upload/feed/storage is not built. This should stay last. |
| Backend/auth/cloud sync | Not built | Supabase or similar is still future work. Local AsyncStorage is the current data source. |
| App store readiness | Partial | EAS config exists. Need real Android/iOS builds, icons/splash review, privacy text, store screenshots, and account setup. |

## Highest Risk Items Before Public Testing

1. Build and install an Android development build, then test notifications and camera barcode scanning on a real phone.
2. Build an iOS production/TestFlight build after Apple Developer account setup.
3. Decide whether to hide Shorts until real upload/storage exists.
4. Add Supabase auth and cloud backup only after local mobile flows are stable.
5. Create visual progress-card PNG generation if sharing screenshots is a core demo moment.

## Current Product Shape

The app is no longer a skeleton. The core local product loop works:

1. Onboard profile.
2. Pick/inspect exercise.
3. Log set or full session.
4. Reopen exercise and see memory, PR, trend, and progression advice.
5. Track nutrition/habits.
6. Review Profile history and share progress.

The biggest remaining gap is not core logic. It is native-device QA and release packaging.
