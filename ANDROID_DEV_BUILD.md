# FitOS Android Dev Build Runbook

This file is the exact path for testing FitOS as a real Android app instead of relying only on Expo Go.

## Why this exists

Expo Go is still useful for quick UI checks, but it is not the final truth for FitOS anymore.

The app now depends on native behavior that should be tested in a development build:

- habit reminders via `expo-notifications`
- camera flow in recovery challenges
- more reliable app startup than tunnel-only Expo Go sessions

## Current project support

The project already has:

- `expo-dev-client` installed
- `eas.json` configured with a `development` Android profile
- npm scripts for starting the dev client and building Android profiles

Before running EAS build scripts, install and log in to EAS CLI if `eas` is not already available:

```bash
npm install -g eas-cli
eas login
```

Relevant files:

- [package.json](/R:/gym/package.json)
- [eas.json](/R:/gym/eas.json)
- [app.json](/R:/gym/app.json)

## Most useful commands

From `R:\gym`:

```bash
npm run start:dev-client
```

Starts Metro in dev-client mode.

```bash
npm run build:android:dev
```

Creates an Android development build through EAS.

```bash
npm run build:android:preview
```

Creates a more shareable preview-style Android build.

## Recommended workflow

### 1. Keep Expo Go only for fast UI checks

Use Expo Go when you want to quickly inspect:

- layout changes
- text changes
- screen wiring
- local state/UI behavior

Do not treat Expo Go as final proof for:

- reminders
- native permissions
- camera flows
- device-specific Android behavior

### 2. Build the Android development client

Run:

```bash
npm run build:android:dev
```

This will use the `development` profile from `eas.json`.

Use this build when you want to validate:

- notifications
- camera capture flow
- navigation stability on device
- behavior closer to the real app

### 3. Start Metro for the development client

After the build is installed on the phone:

```bash
npm run start:dev-client
```

Then open the installed FitOS development build on the Android device and connect it to Metro.

## First real-device test checklist

When the dev build is installed, run this exact test pass:

1. Complete onboarding from start to finish
2. Open Exercise tab and verify readiness header
3. Open readiness breakdown and confirm it loads cleanly
4. Log a quick set for one exercise
5. Open exercise detail and confirm:
   - last set
   - PR
   - recent memory
   - trend chart
6. Save a workout and confirm workout summary screen opens
7. Open Progress and:
   - search a food item
   - tap to log it
   - confirm calorie/protein totals update
8. Open habits flow and:
   - create a custom habit
   - complete a time slot
   - confirm streak state changes
9. Trigger a recovery challenge and test the camera flow
10. Verify at least one reminder actually schedules and appears on device

## What to log during testing

For every failure, write down:

- screen name
- exact action you took
- what happened
- what you expected
- whether it happened in Expo Go, dev build, or both

That will make future fixes much faster than "something broke".

## Current recommendation

Use this order:

1. Finish polishing the Expo app
2. Use the development build to validate native features
3. Only after that, move to backend and sync work

This keeps FitOS focused on becoming a dependable Android app first.

For the full Android and iPhone release path, see [MOBILE_RELEASE_RUNBOOK.md](/R:/gym/MOBILE_RELEASE_RUNBOOK.md).
