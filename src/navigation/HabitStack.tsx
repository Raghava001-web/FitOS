import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HabitScreen } from "../screens/HabitScreen";
import { RecoveryChallengeScreen } from "../screens/RecoveryChallengeScreen";
import type { HabitStackParamList } from "./types";

const Stack = createNativeStackNavigator<HabitStackParamList>();

export const HabitStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HabitList" component={HabitScreen} />
    <Stack.Screen name="RecoveryChallenge" component={RecoveryChallengeScreen} />
  </Stack.Navigator>
);
