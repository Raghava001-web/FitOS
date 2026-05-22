import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ProgressScreen } from "../screens/ProgressScreen";
import { RecoveryChallengeScreen } from "../screens/RecoveryChallengeScreen";
import type { ProgressStackParamList } from "./types";

const Stack = createNativeStackNavigator<ProgressStackParamList>();

export const ProgressStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ProgressHome" component={ProgressScreen} />
    <Stack.Screen name="RecoveryChallenge" component={RecoveryChallengeScreen} />
  </Stack.Navigator>
);
