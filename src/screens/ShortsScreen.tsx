import React, { useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { PrimaryButton, SectionCard } from "../components/ui";
import { SHORTS_FEED } from "../data/mockContent";
import { radius, shadows, spacing } from "../theme";
import { useApp } from "../store/AppContext";
import { SocialShort } from "../types";

export const ShortsScreen = () => {
  const { palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [feed, setFeed] = useState<SocialShort[]>(SHORTS_FEED);
  const [uploadCount, setUploadCount] = useState(0);
  const [actionNote, setActionNote] = useState("Mock local uploads are enabled here for now. Real video storage comes later.");

  const handleUploadMockClip = () => {
    const nextCount = uploadCount + 1;
    const newClip: SocialShort = {
      id: `local-short-${Date.now()}`,
      athlete: "You",
      title: `Session Clip ${nextCount}`,
      caption: "Mock local upload saved to the feed so the button has a real MVP action.",
      duration: "0:18",
      tags: ["local mock", "progress", "FitOS"]
    };

    setUploadCount(nextCount);
    setFeed((current) => [newClip, ...current]);
    setActionNote("Mock clip added to the local feed. We'll wire real upload + storage later.");
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageEyebrow}>Community lane</Text>
        <Text style={styles.pageTitle}>Shorts</Text>
        <Text style={styles.pageSubtitle}>Progress sharing stays lightweight, so training still owns the app.</Text>
      </View>

      <SectionCard
        title="Shorts feed"
        subtitle="Community clips stay secondary to training, but the lane is here for progress sharing and quick ideas."
        accent={palette.orange}
      >
        <View style={styles.heroStrip}>
          <View style={styles.heroCopyWrap}>
            <Text style={styles.heroEyebrow}>Secondary lane</Text>
            <Text style={styles.heroHeadline}>Short-form clips, without taking over the app.</Text>
          </View>
          <View style={styles.heroCountPill}>
            <Text style={styles.heroCountValue}>{feed.length}</Text>
            <Text style={styles.heroCountLabel}>clips</Text>
          </View>
        </View>

        <PrimaryButton label="Upload workout clip" onPress={handleUploadMockClip} tone={palette.orange} />

        <View style={styles.noteCard}>
          <Text style={styles.noteLabel}>Latest action</Text>
          <Text style={styles.noteText}>{actionNote}</Text>
        </View>

        {feed.map((short) => (
          <View key={short.id} style={styles.card}>
            <View style={styles.poster}>
              <Text style={styles.posterLabel}>Replay</Text>
              <Text style={styles.posterMetric}>{short.duration}</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.athlete}>{short.athlete}</Text>
              <Text style={styles.duration}>{short.duration}</Text>
            </View>
            <Text style={styles.title}>{short.title}</Text>
            <Text style={styles.caption}>{short.caption}</Text>
            <Text style={styles.tags}>{short.tags.join(" • ")}</Text>
          </View>
        ))}
      </SectionCard>
    </ScrollView>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: palette.background
    },
    content: {
      paddingHorizontal: spacing.lg,
      paddingBottom: 120
    },
    pageHeader: {
      paddingTop: 52,
      paddingBottom: 14,
      gap: 6
    },
    pageEyebrow: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 2.2
    },
    pageTitle: {
      color: palette.text,
      fontSize: 32,
      fontWeight: "800"
    },
    pageSubtitle: {
      color: palette.textMuted,
      fontSize: 15,
      lineHeight: 24
    },
    heroStrip: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: spacing.md,
      alignItems: "stretch",
      marginBottom: spacing.sm
    },
    heroCopyWrap: {
      flex: 1,
      gap: 6
    },
    heroEyebrow: {
      color: palette.textMuted,
      fontSize: 13,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 2
    },
    heroHeadline: {
      color: palette.text,
      fontSize: 24,
      lineHeight: 30,
      fontWeight: "800"
    },
    heroCountPill: {
      minWidth: 84,
      borderRadius: radius.lg,
      backgroundColor: palette.panelAlt,
      padding: spacing.md,
      alignItems: "center",
      justifyContent: "center",
      gap: 4,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    heroCountValue: {
      color: palette.orange,
      fontSize: 32,
      fontWeight: "800"
    },
    heroCountLabel: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.2
    },
    noteCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: 6,
      marginTop: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    noteLabel: {
      color: palette.textMuted,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 2
    },
    noteText: {
      color: palette.text,
      lineHeight: 20,
      fontWeight: "600"
    },
    card: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.lg,
      padding: spacing.md,
      gap: spacing.sm,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    poster: {
      height: 180,
      borderRadius: radius.lg,
      backgroundColor: palette.panel,
      alignItems: "flex-start",
      justifyContent: "space-between",
      padding: spacing.md,
      borderWidth: 1,
      borderColor: palette.line
    },
    posterLabel: {
      color: palette.textMuted,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      letterSpacing: 1.2
    },
    posterMetric: {
      color: palette.orange,
      fontSize: 28,
      fontWeight: "800"
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center"
    },
    athlete: {
      color: palette.orange,
      fontWeight: "700"
    },
    duration: {
      color: palette.textMuted
    },
    title: {
      color: palette.text,
      fontWeight: "800",
      fontSize: 20
    },
    caption: {
      color: palette.text,
      lineHeight: 20
    },
    tags: {
      color: palette.textMuted
    }
  });

