import React, { useEffect, useMemo, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useExerciseMemory } from "../hooks/useExerciseMemory";
import { useApp } from "../store/AppContext";
import { radius, shadows, spacing } from "../theme";

export function SetLogger({ exerciseName }: { exerciseName: string }) {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { hydrated, history, logSet, lastSet, bestSet } = useExerciseMemory(exerciseName);
  const [weight, setWeight] = useState("");
  const [reps, setReps] = useState("8");
  const [logged, setLogged] = useState(false);
  const [error, setError] = useState("");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    if (lastSet) {
      setWeight(`${lastSet.weight}`);
      setReps(`${lastSet.reps}`);
      return;
    }
    setWeight("");
    setReps("8");
  }, [exerciseName, hydrated, lastSet?.date, lastSet?.weight, lastSet?.reps]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleLog = async () => {
    const nextWeight = Number(weight.trim());
    const nextReps = Number(reps.trim());

    if (!Number.isFinite(nextWeight) || nextWeight <= 0 || !Number.isFinite(nextReps) || nextReps <= 0) {
      setError("Enter valid numbers for weight and reps before logging.");
      return;
    }

    setError("");
    await logSet(nextWeight, nextReps);
    setLogged(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setLogged(false);
    }, 2000);
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Set logger</Text>
        <Text style={styles.subtitle}>FitOS remembers the last working set for {exerciseName}.</Text>
      </View>

      {!hydrated ? <Text style={styles.helper}>Loading set memory...</Text> : null}

      {hydrated && history.length > 0 && lastSet ? (
        <Text style={styles.helper}>Last session: {lastSet.weight} kg × {lastSet.reps} reps</Text>
      ) : null}

      {hydrated && bestSet ? (
        <Text style={styles.prText}>PR: {bestSet.weight} kg × {bestSet.reps} reps</Text>
      ) : null}

      <View style={styles.inputRow}>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>WEIGHT (kg)</Text>
          <TextInput
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
            placeholder="0"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
          />
        </View>
        <View style={styles.inputBlock}>
          <Text style={styles.label}>REPS</Text>
          <TextInput
            value={reps}
            onChangeText={setReps}
            keyboardType="numeric"
            placeholder="8"
            placeholderTextColor={palette.textMuted}
            style={styles.input}
          />
        </View>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <Pressable
        onPress={() => void handleLog()}
        style={({ pressed }) => [
          styles.button,
          logged ? styles.buttonLogged : null,
          pressed ? styles.buttonPressed : null
        ]}
      >
        <Text style={styles.buttonText}>{logged ? "Set logged!" : "Log this set"}</Text>
      </Pressable>
    </View>
  );
}

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    card: {
      backgroundColor: palette.panel,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      ...shadows.card
    },
    header: {
      gap: 6
    },
    title: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    subtitle: {
      color: palette.text,
      fontSize: 15,
      lineHeight: 24
    },
    helper: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24
    },
    prText: {
      color: palette.orange,
      fontWeight: "700",
      fontSize: 15,
      lineHeight: 24
    },
    inputRow: {
      flexDirection: "row",
      gap: spacing.sm
    },
    inputBlock: {
      flex: 1,
      gap: 6
    },
    label: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase"
    },
    input: {
      backgroundColor: palette.inputSurface,
      color: palette.text,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: palette.line,
      fontSize: 22,
      fontWeight: "700"
    },
    errorText: {
      color: palette.orange,
      lineHeight: 24,
      fontSize: 15
    },
    button: {
      minHeight: 52,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.orange
    },
    buttonLogged: {
      backgroundColor: "#16a34a"
    },
    buttonPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.985 }]
    },
    buttonText: {
      color: palette.buttonTextOnAccent,
      fontWeight: "800",
      fontSize: 16
    }
  });




