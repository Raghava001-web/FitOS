import React, { useMemo } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { useApp } from "../store/AppContext";
import { radius, shadows, spacing } from "../theme";

export const SectionCard = ({
  title,
  subtitle,
  accent,
  children
}: {
  title: string;
  subtitle?: string;
  accent?: string;
  children: React.ReactNode;
}) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.card}>
      <View pointerEvents="none" style={[styles.cardGlow, accent ? { backgroundColor: `${accent}14` } : null]} />
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <View style={[styles.cardAccent, accent ? { backgroundColor: accent } : { backgroundColor: palette.orange }]} />
          <Text style={styles.cardTitle}>{title}</Text>
        </View>
        {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      </View>
      {children}
    </View>
  );
};

export const KeyStat = ({
  label,
  value,
  note,
  highlight = false
}: {
  label: string;
  value: string;
  note?: string;
  highlight?: boolean;
}) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const hasLetters = /[A-Za-z]/.test(value);
  const isLongWord = hasLetters && value.length >= 6;
  const isVeryLongWord = hasLetters && value.length >= 8;

  return (
    <View style={styles.keyStat}>
      <Text style={styles.keyStatLabel}>{label}</Text>
      <Text
        style={[
          styles.keyStatValue,
          hasLetters ? styles.keyStatValueWord : null,
          isLongWord ? styles.keyStatValueWordLong : null,
          isVeryLongWord ? styles.keyStatValueWordVeryLong : null,
          highlight ? styles.keyStatValueAccent : null
        ]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.68}
      >
        {value}
      </Text>
      {note ? <Text style={styles.keyStatNote}>{note}</Text> : null}
    </View>
  );
};

export const MetricPill = ({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn" | "danger";
}) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const toneMap = {
    neutral: { valueColor: palette.text, dotColor: palette.teal, bgColor: palette.panelAlt },
    good: { valueColor: palette.lime, dotColor: palette.lime, bgColor: palette.successSoft },
    warn: { valueColor: palette.gold, dotColor: palette.gold, bgColor: palette.warningSoft },
    danger: { valueColor: palette.red, dotColor: palette.red, bgColor: palette.dangerSoft }
  } as const;
  const resolvedTone = toneMap[tone];

  return (
    <View style={[styles.metricPill, { backgroundColor: resolvedTone.bgColor }]}>
      <View style={styles.metricHeader}>
        <View style={[styles.metricDot, { backgroundColor: resolvedTone.dotColor }]} />
        <Text style={styles.metricLabel}>{label}</Text>
      </View>
      <Text style={[styles.metricValue, { color: resolvedTone.valueColor }]}>{value}</Text>
    </View>
  );
};

export const MiniStat = ({
  label,
  value
}: {
  label: string;
  value: string;
}) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
};

export const OptionChip = ({
  label,
  selected,
  onPress
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: `${palette.orange}18` }}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : null,
        pressed ? styles.chipPressed : null
      ]}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : null]}>{label}</Text>
    </Pressable>
  );
};

export const LabeledInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
  multiline = false
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "numeric" | "email-address";
  multiline?: boolean;
}) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.inputWrap}>
      {label ? <Text style={styles.inputLabel}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={palette.textMuted}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline ? styles.multilineInput : null]}
      />
    </View>
  );
};

export const PrimaryButton = ({
  label,
  onPress,
  tone
}: {
  label: string;
  onPress: () => void;
  tone?: string;
}) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: `${palette.buttonTextOnAccent}18` }}
      style={({ pressed }) => [styles.button, pressed ? styles.buttonPressed : null, { backgroundColor: tone ?? palette.orange }]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
};

export const GhostButton = ({
  label,
  onPress
}: {
  label: string;
  onPress: () => void;
}) => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <Pressable
      onPress={onPress}
      android_ripple={{ color: `${palette.text}12` }}
      style={({ pressed }) => [styles.ghostButton, pressed ? styles.ghostButtonPressed : null]}
    >
      <Text style={styles.ghostButtonText}>{label}</Text>
    </Pressable>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    card: {
      position: "relative",
      overflow: "hidden",
      backgroundColor: palette.panel,
      borderRadius: radius.lg,
      padding: spacing.lg,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    cardGlow: {
      position: "absolute",
      top: -36,
      right: -24,
      width: 132,
      height: 132,
      borderRadius: 999,
      opacity: 0.75
    },
    cardHeader: {
      gap: 6
    },
    cardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10
    },
    cardAccent: {
      width: 30,
      height: 4,
      borderRadius: 999
    },
    cardTitle: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    cardSubtitle: {
      color: palette.text,
      fontSize: 15,
      lineHeight: 24
    },
    keyStat: {
      flex: 1,
      minWidth: 112,
      borderRadius: radius.lg,
      backgroundColor: palette.panelAlt,
      padding: spacing.lg,
      gap: 8,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    keyStatLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    keyStatValue: {
      color: palette.text,
      fontSize: 48,
      lineHeight: 52,
      fontWeight: "800"
    },
    keyStatValueWord: {
      fontSize: 40,
      lineHeight: 44
    },
    keyStatValueWordLong: {
      fontSize: 34,
      lineHeight: 38
    },
    keyStatValueWordVeryLong: {
      fontSize: 28,
      lineHeight: 32
    },
    keyStatValueAccent: {
      color: palette.orange
    },
    keyStatNote: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24
    },
    metricPill: {
      flex: 1,
      minWidth: 88,
      borderRadius: radius.lg,
      backgroundColor: palette.panelAlt,
      padding: spacing.md,
      gap: 6,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    metricHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6
    },
    metricDot: {
      width: 6,
      height: 6,
      borderRadius: 999
    },
    metricLabel: {
      color: palette.textMuted,
      fontSize: 11,
      fontWeight: "700",
      letterSpacing: 2
    },
    metricValue: {
      fontSize: 20,
      fontWeight: "800"
    },
    miniStat: {
      flex: 1,
      minWidth: 88,
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: 6,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    miniLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase"
    },
    miniValue: {
      color: palette.text,
      fontSize: 16,
      fontWeight: "700"
    },
    chip: {
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: radius.pill,
      borderWidth: 1,
      borderColor: palette.line,
      backgroundColor: palette.panelAlt
    },
    chipSelected: {
      borderColor: `${palette.orange}55`,
      backgroundColor: palette.surfaceGlow
    },
    chipPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }]
    },
    chipText: {
      color: palette.textMuted,
      fontWeight: "600"
    },
    chipTextSelected: {
      color: palette.orange
    },
    inputWrap: {
      gap: 8,
      flex: 1
    },
    inputLabel: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      letterSpacing: 2,
      textTransform: "uppercase"
    },
    input: {
      backgroundColor: palette.inputSurface,
      color: palette.text,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: palette.line,
      paddingHorizontal: 14,
      paddingVertical: 14,
      fontSize: 15,
      lineHeight: 22
    },
    multilineInput: {
      minHeight: 100,
      textAlignVertical: "top"
    },
    button: {
      minHeight: 52,
      width: "100%",
      paddingHorizontal: 18,
      borderRadius: 14,
      alignItems: "center",
      justifyContent: "center",
      ...shadows.card
    },
    buttonPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.985 }]
    },
    buttonText: {
      color: palette.buttonTextOnAccent,
      fontWeight: "800",
      fontSize: 15
    },
    ghostButton: {
      minHeight: 52,
      width: "100%",
      paddingHorizontal: 18,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: palette.line,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: palette.panelAlt
    },
    ghostButtonPressed: {
      opacity: 0.88,
      backgroundColor: palette.panelMuted,
      transform: [{ scale: 0.985 }]
    },
    ghostButtonText: {
      color: palette.text,
      fontWeight: "700",
      fontSize: 15
    }
  });



