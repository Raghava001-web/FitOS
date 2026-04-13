# FitOS

FitOS is a mobile-first Expo + React Native MVP for a smart gym assistant that acts like a coach, readiness engine, workout memory, habit tracker, and diet helper.

## What is included

- Guided onboarding with body stats, stress/recovery, goal, diet, supplements, injury notes, and reminder mode
- BMI, stress, readiness, recovery, safe progression band, and training load suitability
- Exercise logging with set/rep/weight/rest tracking
- Weight memory that shows the previous session for each exercise
- Progression intelligence with 2.5 kg / 5 kg / hold / reduce suggestions
- Jump-risk advisor for unsafe load jumps
- Workout split generator and muscle-based exercise generator
- Habit tracker with multi-slot reminders and streak recovery challenges
- Macro tracker with a searchable food list and generated diet plan
- Profile screen with badges, grocery list, supplements, summaries, and shareable progress card
- Secondary shorts feed tab for fitness clips

## Stack

- Expo
- React Native
- TypeScript
- AsyncStorage for local persistence

## Run

1. Install dependencies with `npm install`
2. Start the app with `npm start`

## Notes

- This workspace did not have Node.js or npm installed in the sandbox, so the project could not be compiled here.
- Reminder scheduling, calendar integration, and a real auth backend are modeled in the UI but not yet connected to device APIs.
