import React, { useEffect, useMemo, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";
import { useApp } from "../store/AppContext";
import { radius, spacing } from "../theme";

export const AnimatedDemo = ({ label }: { label: string }) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const lift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(lift, {
          toValue: -18,
          duration: 900,
          useNativeDriver: true
        }),
        Animated.timing(lift, {
          toValue: 0,
          duration: 900,
          useNativeDriver: true
        })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [lift]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label} demo loop</Text>
      <View style={styles.track}>
        <Animated.View style={[styles.barbell, { transform: [{ translateY: lift }] }]}>
          <View style={styles.plate} />
          <View style={styles.bar} />
          <View style={styles.plate} />
        </Animated.View>
      </View>
      <Text style={styles.caption}>Simple motion cue for setup and range of motion.</Text>
    </View>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    wrap: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm
    },
    label: {
      color: palette.text,
      fontWeight: "700"
    },
    track: {
      height: 120,
      borderRadius: radius.md,
      backgroundColor: palette.trackSurface,
      justifyContent: "center",
      alignItems: "center",
      overflow: "hidden"
    },
    barbell: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8
    },
    plate: {
      width: 20,
      height: 54,
      borderRadius: radius.sm,
      backgroundColor: palette.orange
    },
    bar: {
      width: 110,
      height: 10,
      borderRadius: radius.pill,
      backgroundColor: palette.text
    },
    caption: {
      color: palette.textMuted,
      fontSize: 12,
      lineHeight: 18
    }
  });
