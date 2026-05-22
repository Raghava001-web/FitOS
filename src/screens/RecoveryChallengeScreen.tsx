import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { Ionicons } from "@expo/vector-icons";
import { GhostButton, PrimaryButton, SectionCard } from "../components/ui";
import { useApp } from "../store/AppContext";
import { radius, shadows, spacing } from "../theme";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import type { ProgressStackParamList } from "../navigation/types";

type Props = NativeStackScreenProps<ProgressStackParamList, "RecoveryChallenge">;

type ChallengeStep = "brief" | "camera" | "confirm" | "done";

export const RecoveryChallengeScreen = ({ navigation }: Props) => {
  const { state, completeChallenge, palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);

  const [permission, requestPermission] = useCameraPermissions();
  const [step, setStep] = useState<ChallengeStep>("brief");
  const [facing, setFacing] = useState<CameraType>("back");
  const [photoCaptured, setPhotoCaptured] = useState(false);
  const [captureCount, setCaptureCount] = useState(0);
  const cameraRef = useRef<CameraView>(null);

  // Pulse animation for the capture button
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (step !== "camera") return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [step]);

  const challenge = state.activeChallenge;

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      // Take the photo as local proof; nothing is uploaded.
      await cameraRef.current.takePictureAsync({ quality: 0.4, skipProcessing: true });
      setCaptureCount((c) => c + 1);
      setPhotoCaptured(true);
      // Brief delay so user sees feedback, then move to confirm step
      setTimeout(() => setStep("confirm"), 800);
    } catch {
      // Camera can fail in simulators, so still allow progression.
      setPhotoCaptured(true);
      setTimeout(() => setStep("confirm"), 400);
    }
  };

  const handleComplete = () => {
    completeChallenge();
    setStep("done");
  };

  const handleSkipCamera = () => {
    setPhotoCaptured(false);
    setStep("confirm");
  };

  // No active challenge.
  if (!challenge) {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <GhostButton label="Back" onPress={() => navigation.goBack()} />
        <View style={styles.hero}>
          <Text style={styles.headline}>No challenge active</Text>
          <Text style={styles.sub}>
            Go back to Progress, open Habits, and draw a recovery challenge first.
          </Text>
        </View>
        <PrimaryButton label="Back to Progress" onPress={() => navigation.goBack()} />
      </ScrollView>
    );
  }

  // Done state.
  if (step === "done") {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <View style={styles.doneHero}>
          <View style={[styles.doneIcon, { backgroundColor: `${palette.lime}22` }]}>
            <Ionicons name="trophy" size={48} color={palette.lime} />
          </View>
          <Text style={styles.headline}>Streak restored!</Text>
          <Text style={styles.sub}>
            You completed the recovery challenge and earned the{" "}
            <Text style={{ color: palette.orange, fontWeight: "800" }}>
              {challenge.rewardBadge}
            </Text>{" "}
            badge.
          </Text>
          <Text style={styles.sub}>
            All broken streaks have been restored. Keep the momentum from here.
          </Text>
        </View>
        <PrimaryButton
          label="Back to Progress"
          onPress={() => navigation.popToTop()}
        />
      </ScrollView>
    );
  }

  // Brief step.
  if (step === "brief") {
    return (
      <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
        <GhostButton label="Back" onPress={() => navigation.goBack()} />

        <View style={styles.hero}>
          <Text style={styles.eyebrow}>Recovery challenge</Text>
          <Text style={styles.headline}>{challenge.title}</Text>
        </View>

        <SectionCard title="The challenge" accent={palette.gold}>
          <Text style={styles.challengeDesc}>{challenge.description}</Text>
        </SectionCard>

        <SectionCard title="How it works" accent={palette.teal}>
          <View style={styles.stepList}>
            <View style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: `${palette.teal}22` }]}>
                <Text style={[styles.stepNum, { color: palette.teal }]}>1</Text>
              </View>
              <Text style={styles.stepText}>Read your challenge above</Text>
            </View>
            <View style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: `${palette.orange}22` }]}>
                <Text style={[styles.stepNum, { color: palette.orange }]}>2</Text>
              </View>
              <Text style={styles.stepText}>Complete the challenge in real life</Text>
            </View>
            <View style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: `${palette.lime}22` }]}>
                <Text style={[styles.stepNum, { color: palette.lime }]}>3</Text>
              </View>
              <Text style={styles.stepText}>Take a proof photo to mark it done</Text>
            </View>
            <View style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: `${palette.gold}22` }]}>
                <Text style={[styles.stepNum, { color: palette.gold }]}>4</Text>
              </View>
              <Text style={styles.stepText}>Earn the <Text style={{ color: palette.orange }}>{challenge.rewardBadge}</Text> badge and restore your streak</Text>
            </View>
          </View>
        </SectionCard>

        <PrimaryButton
          label="I'm ready - open camera"
          onPress={async () => {
            if (!permission?.granted) {
              const result = await requestPermission();
              if (!result.granted) {
                // Allow skipping camera if permission denied
                setStep("confirm");
                return;
              }
            }
            setStep("camera");
          }}
        />
        <GhostButton label="Skip photo proof" onPress={handleSkipCamera} />
      </ScrollView>
    );
  }

  // Camera step.
  if (step === "camera") {
    if (!permission?.granted) {
      return (
        <View style={[styles.screen, styles.center]}>
          <Ionicons name="camera-outline" size={48} color={palette.textMuted} />
          <Text style={[styles.sub, { textAlign: "center", marginTop: spacing.md }]}>
            Camera permission denied. You can still complete the challenge without a photo.
          </Text>
          <GhostButton label="Complete without photo" onPress={handleSkipCamera} />
        </View>
      );
    }

    return (
      <View style={styles.screen}>
        <CameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing={facing}
        />

        {/* Overlay UI */}
        <View style={styles.cameraOverlay}>
          {/* Top bar */}
          <View style={styles.cameraTopBar}>
            <Pressable
              onPress={() => setStep("brief")}
              style={styles.cameraBackBtn}
            >
              <Ionicons name="arrow-back" size={24} color="#fff" />
            </Pressable>
            <Text style={styles.cameraTitle}>{challenge.title}</Text>
            <Pressable
              onPress={() => setFacing((f) => (f === "back" ? "front" : "back"))}
              style={styles.cameraFlipBtn}
            >
              <Ionicons name="camera-reverse-outline" size={24} color="#fff" />
            </Pressable>
          </View>

          {/* Viewfinder guide */}
          <View style={styles.viewfinder}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>

          {/* Hint */}
          <Text style={styles.cameraHint}>
            Take a photo of yourself completing the challenge
          </Text>

          {/* Capture button */}
          <View style={styles.captureRow}>
            <Animated.View style={{ transform: [{ scale: pulse }] }}>
              <Pressable
                onPress={() => void handleCapture()}
                style={({ pressed }) => [
                  styles.captureBtn,
                  pressed && { opacity: 0.8, transform: [{ scale: 0.94 }] },
                  photoCaptured && { backgroundColor: palette.lime },
                ]}
              >
                <Ionicons
                  name={photoCaptured ? "checkmark" : "camera"}
                  size={32}
                  color={photoCaptured ? palette.background : "#fff"}
                />
              </Pressable>
            </Animated.View>
          </View>
        </View>
      </View>
    );
  }

  // Confirm step.
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.hero}>
        <View style={[styles.doneIcon, { backgroundColor: `${palette.gold}22` }]}>
          <Ionicons
            name={photoCaptured ? "camera" : "checkbox-outline"}
            size={40}
            color={palette.gold}
          />
        </View>
        <Text style={styles.eyebrow}>Ready to confirm</Text>
        <Text style={styles.headline}>
          {photoCaptured ? "Photo captured!" : "Challenge completed?"}
        </Text>
        <Text style={styles.sub}>
          {photoCaptured
            ? "Your proof photo is saved on your device. Confirm below to restore your streak."
            : "No photo taken. Confirm on your honour that you completed the challenge."}
        </Text>
      </View>

      <SectionCard title="Challenge summary" accent={palette.gold}>
        <Text style={styles.challengeDesc}>{challenge.title}</Text>
        <Text style={styles.copy}>{challenge.description}</Text>
        <View style={styles.rewardRow}>
          <Ionicons name="ribbon-outline" size={20} color={palette.orange} />
          <Text style={[styles.copy, { color: palette.orange, fontWeight: "700" }]}>
            Badge: {challenge.rewardBadge}
          </Text>
        </View>
      </SectionCard>

      <PrimaryButton
        label="Confirm - restore my streak"
        onPress={handleComplete}
        tone={palette.lime}
      />
      <GhostButton
        label="Retake photo"
        onPress={() => setStep("camera")}
      />
      <GhostButton
        label="Cancel"
        onPress={() => navigation.goBack()}
      />
    </ScrollView>
  );
};

const createStyles = (palette: ReturnType<typeof useApp>["palette"]) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: palette.background },
    content: { paddingHorizontal: spacing.lg, paddingBottom: 100, gap: spacing.lg },
    center: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.lg, padding: spacing.lg },

    hero: { paddingTop: spacing.sm, gap: 10, alignItems: "flex-start" },
    eyebrow: { color: palette.textMuted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 2 },
    headline: { color: palette.text, fontSize: 28, fontWeight: "800", lineHeight: 34 },
    sub: { color: palette.textMuted, fontSize: 15, lineHeight: 24 },
    copy: { color: palette.textMuted, fontSize: 14, lineHeight: 22 },
    challengeDesc: { color: palette.text, fontSize: 17, lineHeight: 26, fontWeight: "600" },

    stepList: { gap: spacing.sm },
    stepRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
    stepBadge: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center" },
    stepNum: { fontWeight: "800", fontSize: 15 },
    stepText: { color: palette.text, fontSize: 15, flex: 1, lineHeight: 22 },

    rewardRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs, marginTop: 4 },

    doneHero: { alignItems: "center", paddingTop: 60, paddingBottom: spacing.lg, gap: spacing.md },
    doneIcon: { width: 96, height: 96, borderRadius: 48, alignItems: "center", justifyContent: "center" },

    // Camera overlay
    cameraOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: "space-between",
      alignItems: "center",
      paddingBottom: 48,
    },
    cameraTopBar: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      width: "100%",
      paddingHorizontal: spacing.lg,
      paddingTop: Platform.OS === "android" ? 40 : 56,
      paddingBottom: spacing.md,
      backgroundColor: "rgba(0,0,0,0.45)",
    },
    cameraBackBtn: { padding: 8 },
    cameraFlipBtn: { padding: 8 },
    cameraTitle: {
      color: "#fff",
      fontWeight: "800",
      fontSize: 15,
      flex: 1,
      textAlign: "center",
      marginHorizontal: spacing.sm,
    },

    // Viewfinder guide corners
    viewfinder: { width: 240, height: 240, position: "relative" },
    corner: { position: "absolute", width: 28, height: 28, borderColor: "#fff", borderWidth: 3 },
    cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
    cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
    cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
    cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },

    cameraHint: {
      color: "rgba(255,255,255,0.85)",
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center",
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.sm,
    },
    captureRow: { alignItems: "center" },
    captureBtn: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: "rgba(255,255,255,0.22)",
      borderWidth: 4,
      borderColor: "#fff",
      alignItems: "center",
      justifyContent: "center",
    },
  });
