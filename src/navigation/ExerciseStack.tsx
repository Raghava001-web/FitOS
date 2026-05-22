import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ExerciseScreen } from "../screens/ExerciseScreen";
import { ExerciseDetailScreen } from "../screens/ExerciseDetailScreen";
import { WorkoutSummaryScreen } from "../screens/WorkoutSummaryScreen";
import { ReadinessScreen } from "../screens/ReadinessScreen";
import type { ExerciseStackParamList } from "./types";

const Stack = createNativeStackNavigator<ExerciseStackParamList>();

export const ExerciseStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ExerciseToday" component={ExerciseScreen} />
    <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
    <Stack.Screen name="WorkoutSummary" component={WorkoutSummaryScreen} />
    <Stack.Screen name="Readiness" component={ReadinessScreen} />
  </Stack.Navigator>
);
