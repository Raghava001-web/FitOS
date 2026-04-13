import React, { useMemo } from "react";
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ExerciseScreen } from "./src/screens/ExerciseScreen";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { ProgressScreen } from "./src/screens/ProgressScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { ShortsScreen } from "./src/screens/ShortsScreen";
import { AppProvider, useApp } from "./src/store/AppContext";
import { radius, spacing } from "./src/theme";

const tabLabels = [
  { id: "exercise", label: "Exercise", icon: "barbell-outline" },
  { id: "shorts", label: "Shorts", icon: "play-circle-outline" },
  { id: "progress", label: "Progress", icon: "stats-chart-outline" },
  { id: "profile", label: "Profile", icon: "person-outline" }
] as const;

const Dashboard = () => {
  const { state, setTab, themeMode, palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const renderScreen = () => {
    switch (state.tab) {
      case "shorts":
        return <ShortsScreen />;
      case "progress":
        return <ProgressScreen />;
      case "profile":
        return <ProfileScreen />;
      default:
        return <ExerciseScreen />;
    }
  };

  if (!state.hydrated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingWrap}>
          <Text style={styles.brand}>FitOS</Text>
          <Text style={styles.loadingCopy}>Loading your coach brain...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!state.profile) return <OnboardingScreen />;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} />
      <View style={styles.shell}>
        <View style={styles.screenWrap}>{renderScreen()}</View>

        <View style={styles.tabBar}>
          {tabLabels.map((tab) => {
            const selected = state.tab === tab.id;
            const iconColor = selected ? palette.orange : palette.textMuted;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setTab(tab.id)}
                style={({ pressed }) => [
                  styles.tabButton,
                  selected ? styles.tabButtonSelected : null,
                  pressed ? styles.tabButtonPressed : null
                ]}
              >
                <Ionicons name={tab.icon} size={20} color={iconColor} />
                <Text style={[styles.tabText, selected ? styles.tabTextSelected : null]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AppProvider>
      <Dashboard />
    </AppProvider>
  );
}

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: palette.background
    },
    loadingWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm
    },
    loadingCopy: {
      color: palette.textMuted
    },
    shell: {
      flex: 1,
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm
    },
    brand: {
      color: palette.orange,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    screenWrap: {
      flex: 1
    },
    tabBar: {
      flexDirection: "row",
      gap: spacing.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      backgroundColor: palette.panel,
      borderWidth: 1,
      borderColor: palette.line,
      borderRadius: 24,
      marginHorizontal: spacing.sm,
      marginBottom: spacing.sm,
      ...{
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.18,
        shadowRadius: 24,
        elevation: 6
      }
    },
    tabButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: radius.lg,
      paddingVertical: 11,
      gap: 6,
      backgroundColor: "transparent",
      borderWidth: 1,
      borderColor: "transparent"
    },
    tabButtonSelected: {
      borderColor: `${palette.orange}33`,
      backgroundColor: palette.surfaceGlow
    },
    tabButtonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.985 }]
    },
    tabText: {
      color: palette.textMuted,
      fontWeight: "700",
      fontSize: 12
    },
    tabTextSelected: {
      color: palette.orange
    }
  });



