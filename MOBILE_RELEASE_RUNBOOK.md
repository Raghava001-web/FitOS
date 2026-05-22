# FitOS Mobile Release Runbook

This is the practical path from the current Expo app to a downloadable Android and iPhone app.

Source of truth: the root Expo app in `R:\gym`. The `web/` folder is not the mobile product path.

## Current Build Health

Latest checks:

- `npm run typecheck`: passing
- `npx expo-doctor`: passing 17/17 checks
- `npm audit --audit-level=moderate`: 0 vulnerabilities
- `npx expo export --platform android --clear`: passing
- `npx expo export --platform ios --clear`: passing

The project is now clean enough to attempt real device development builds.

## Required Build Tooling

EAS CLI is required before the `build:*` and `submit:*` scripts can run.

Current machine note: `eas` was not found on PATH during this audit.

Install once when network access is available:

```bash
npm install -g eas-cli
eas login
```

Alternative later improvement: add `eas-cli` as a project dev dependency so the scripts do not depend on a global install.

## Current Mobile Config

Android:

- Package name: `com.fitos.app`
- Internal APK profile: `development` / `preview`
- Store AAB profile: `production`

iOS:

- Bundle identifier: `com.fitos.app`
- Build number: `1`
- Device/TestFlight builds require a paid Apple Developer account

## Phase 1 - Android Development Build

Use this first because Android is the fastest real-device path from Windows.

```bash
npm run build:android:dev
```

After installing the generated APK on the phone:

```bash
npm run start:dev-client
```

Then open the installed FitOS development app, not Expo Go.

Use this build to test:

- App launch without Expo Go
- Onboarding persistence
- Weight memory persistence
- Habit reminder permission and scheduling
- Barcode scanner camera permission
- Recovery challenge camera flow

## Phase 2 - Android Preview Build

Use this when you want to send a more stable APK to testers.

```bash
npm run build:android:preview
```

This is still not the Play Store build. It is for internal sharing and real-device QA.

## Phase 3 - Android Production Build

Use this for Play Console upload.

```bash
npm run build:android:production
```

This creates an Android App Bundle (`.aab`) through EAS.

Submit after store listing, screenshots, privacy text, and Play Console setup:

```bash
npm run submit:android
```

## Phase 4 - iPhone/TestFlight Build

Use this after Apple Developer account setup.

```bash
npm run build:ios:production
```

Then submit to App Store Connect/TestFlight:

```bash
npm run submit:ios
```

Important: from Windows, EAS cloud build is the realistic iOS build path. Local iOS builds require macOS/Xcode.

## First Real-Device QA Pass

Do this before showing the app publicly:

1. Complete onboarding from fresh install.
2. Close and reopen app, confirm profile persists.
3. Log Lat Pulldown quick set.
4. Reopen exercise and confirm last set, PR, recent memory, and chart.
5. Save a full workout and confirm Profile history updates.
6. Search food, tap to log, confirm calories/protein update.
7. Scan a barcode and confirm product lookup or graceful error.
8. Create a custom habit with two time slots.
9. Complete one habit slot and confirm streak state.
10. Schedule a reminder and wait for a real notification.
11. Open recovery challenge and test camera permission.
12. Switch phone light/dark mode and confirm UI follows automatically.

## Store-Readiness Gaps

Still needed before public release:

- Real app icon and splash final polish
- Privacy policy
- Store screenshots
- App description and keywords
- Android notification/camera permission wording review
- iOS App Privacy answers
- Backend/cloud backup plan
- More complete QA on low-end Android devices

## Official References

- EAS Build: https://docs.expo.dev/build/introduction/
- Development builds: https://docs.expo.dev/develop/development-builds/create-a-build/
- EAS build profiles: https://docs.expo.dev/build/eas-json/
- EAS Submit: https://docs.expo.dev/submit/introduction/
