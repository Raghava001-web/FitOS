import "expo-dev-client";
import React, { useMemo } from "react";
import { SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { OnboardingScreen } from "./src/screens/OnboardingScreen";
import { TabNavigator } from "./src/navigation/TabNavigator";
import { AppProvider, useApp } from "./src/store/AppContext";
import { spacing } from "./src/theme";

// Navigation themes
const FitOSDarkNavTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: "#0A0A0A",
    card: "#111111",
    border: "#1F1F1F",
    text: "#ffffff",
    primary: "#F97316",
  },
};

const FitOSLightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: "#F5F5F5",
    card: "#FFFFFF",
    border: "#E5E5E5",
    text: "#0a0a0a",
    primary: "#F97316",
  },
};

// Dashboard (post-onboarding)
const Dashboard = () => {
  const { themeMode, palette } = useApp();
  const navTheme = themeMode === "dark" ? FitOSDarkNavTheme : FitOSLightNavTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar barStyle={themeMode === "dark" ? "light-content" : "dark-content"} />
      <TabNavigator />
    </NavigationContainer>
  );
};

// Root
const Root = () => {
  const { state, palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  // Loading state
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

  // No profile → onboarding
  if (!state.profile) return <OnboardingScreen />;

  // Main app
  return <Dashboard />;
};

// App entry
export default function App() {
  return (
    <AppProvider>
      <Root />
    </AppProvider>
  );
}

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    safe: {
      flex: 1,
      backgroundColor: palette.background,
    },
    loadingWrap: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },
    brand: {
      color: palette.orange,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2,
    },
    loadingCopy: {
      color: palette.textMuted,
    },
  });
