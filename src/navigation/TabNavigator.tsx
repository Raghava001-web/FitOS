import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseStack } from "./ExerciseStack";
import { ShortsScreen } from "../screens/ShortsScreen";
import { ProgressStack } from "./ProgressStack";
import { ProfileScreen } from "../screens/ProfileScreen";
import { useApp } from "../store/AppContext";
import { spacing } from "../theme";
import type { RootTabParamList } from "./types";

const Tab = createBottomTabNavigator<RootTabParamList>();

const tabConfig = [
  { name: "ExerciseTab" as const, label: "Exercise", icon: "barbell-outline" as const },
  { name: "ShortsTab" as const, label: "Shorts", icon: "play-circle-outline" as const },
  { name: "ProgressTab" as const, label: "Progress", icon: "stats-chart-outline" as const },
  { name: "ProfileTab" as const, label: "Profile", icon: "person-outline" as const },
] as const;

export const TabNavigator = () => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={{ flex: 1, backgroundColor: palette.background }}>
      <Tab.Navigator
        screenOptions={({ route }) => {
          const tab = tabConfig.find((t) => t.name === route.name);
          return {
            headerShown: false,
            tabBarIcon: ({ focused }) => (
              <View style={[styles.iconShell, focused ? styles.iconShellActive : null]}>
                {focused ? <View style={styles.iconPulse} /> : null}
                <Ionicons
                  name={tab?.icon ?? "ellipse-outline"}
                  size={22}
                  color={focused ? palette.orange : palette.textMuted}
                />
              </View>
            ),
            tabBarActiveTintColor: palette.orange,
            tabBarInactiveTintColor: palette.textMuted,
            tabBarLabel: tab?.label ?? "",
            tabBarLabelStyle: styles.tabLabel,
            tabBarStyle: styles.tabBar,
            tabBarItemStyle: styles.tabItem,
          };
        }}
      >
        <Tab.Screen name="ExerciseTab" component={ExerciseStack} />
        <Tab.Screen name="ShortsTab" component={ShortsScreen} />
        <Tab.Screen name="ProgressTab" component={ProgressStack} />
        <Tab.Screen name="ProfileTab" component={ProfileScreen} />
      </Tab.Navigator>
    </View>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    tabBar: {
      backgroundColor: palette.panel,
      borderTopWidth: 0,
      paddingBottom: 6,
      paddingTop: 8,
      height: 68,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
      borderRadius: 24,
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 14 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 6,
    },
    tabItem: {
      paddingVertical: 4,
    },
    iconShell: {
      width: 44,
      height: 32,
      borderRadius: 16,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden"
    },
    iconShellActive: {
      backgroundColor: palette.surfaceGlow
    },
    iconPulse: {
      position: "absolute",
      top: -18,
      width: 36,
      height: 36,
      borderRadius: 999,
      backgroundColor: `${palette.orange}2B`
    },
    tabLabel: {
      fontWeight: "700",
      fontSize: 11,
      letterSpacing: 0.5,
    },
  });
