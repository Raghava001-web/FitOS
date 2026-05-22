import React, { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { HabitHeatmap } from "../components/HabitHeatmap";
import { GhostButton, LabeledInput, MetricPill, MiniStat, OptionChip, PrimaryButton, ScreenHero, SectionCard } from "../components/ui";
import { generateProgressBotMessage, getMonthlySummary, getWeeklySummary, getWorkoutPR, normalizeHabitForToday } from "../engine/habits";
import type { ProgressStackParamList } from "../navigation/types";
import { useApp } from "../store/AppContext";
import { radius, shadows, spacing } from "../theme";
import { FoodItem, HabitCategory } from "../types";

type ProgressMode = "today" | "nutrition" | "habits";
type Props = NativeStackScreenProps<ProgressStackParamList, "ProgressHome">;

type FoodSearchResult = {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

const habitCategories: HabitCategory[] = [
  "Gym",
  "Water",
  "Tablets",
  "Sleep",
  "Meals",
  "Assignments/Studies",
  "Recovery",
  "Custom"
];

const progressModes: Array<{ id: ProgressMode; label: string }> = [
  { id: "today", label: "Today" },
  { id: "nutrition", label: "Nutrition" },
  { id: "habits", label: "Habits" }
];

const roundMacro = (value: unknown) => {
  const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : 0;
  if (!Number.isFinite(numeric)) return 0;
  return Math.round(numeric * 10) / 10;
};

const normalizeFoodProduct = (product: unknown, index: number): FoodSearchResult | null => {
  if (!product || typeof product !== "object") return null;

  const candidate = product as {
    product_name?: unknown;
    nutriments?: Record<string, unknown>;
  };

  const name = typeof candidate.product_name === "string" ? candidate.product_name.trim() : "";
  if (!name) return null;

  const nutriments = candidate.nutriments ?? {};
  const calories = roundMacro(nutriments["energy-kcal_100g"] ?? nutriments["energy-kcal"]);
  const protein = roundMacro(nutriments.proteins_100g);
  const carbs = roundMacro(nutriments.carbohydrates_100g);
  const fats = roundMacro(nutriments.fat_100g);

  return {
    id: `off-${name.replace(/\s+/g, "-").toLowerCase()}-${index}`,
    name,
    calories,
    protein,
    carbs,
    fats
  };
};

const normalizeBarcodeProduct = (payload: unknown, barcode: string): FoodSearchResult | null => {
  if (!payload || typeof payload !== "object") return null;
  const candidate = payload as { status?: unknown; product?: unknown };
  if (candidate.status !== 1 && candidate.status !== "1" && !candidate.product) return null;
  const normalized = normalizeFoodProduct(candidate.product, 0);
  return normalized ? { ...normalized, id: `barcode-${barcode}-${normalized.id}` } : null;
};

export const ProgressScreen = ({ navigation }: Props) => {
  const { state, metrics, dietPlan, rank, completeHabitSlot, addHabit, drawChallenge, completeChallenge, logFood, palette } = useApp();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const profile = state.profile;
  const [mode, setMode] = useState<ProgressMode>("today");
  const [foodQuery, setFoodQuery] = useState("");
  const [foodResults, setFoodResults] = useState<FoodSearchResult[]>([]);
  const [foodLoading, setFoodLoading] = useState(false);
  const [foodError, setFoodError] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [barcodeLoading, setBarcodeLoading] = useState(false);
  const [lastBarcode, setLastBarcode] = useState("");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const scanLockRef = useRef(false);
  const [habitName, setHabitName] = useState("");
  const [habitSlots, setHabitSlots] = useState("07:00, 22:00");
  const [habitCategory, setHabitCategory] = useState<HabitCategory>("Recovery");
  const [trackedHabitId, setTrackedHabitId] = useState("");
  const [actionNote, setActionNote] = useState("Tap a habit slot, log a meal, or create a reminder to see live feedback here.");

  const normalizedHabits = state.habits.map(normalizeHabitForToday);
  const trackedHabit = normalizedHabits.find((habit) => habit.id === trackedHabitId) ?? normalizedHabits[0];
  const weekly = getWeeklySummary(state.workoutLogs);
  const monthly = getMonthlySummary(state.workoutLogs);
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayFoods = state.foodLogs.filter((entry) => entry.loggedAt.slice(0, 10) === todayKey);
  const fallbackTotals = todayFoods.reduce(
    (acc, item) => ({
      calories: acc.calories + item.calories,
      protein: acc.protein + item.protein,
      carbs: acc.carbs + item.carbs,
      fats: acc.fats + item.fats
    }),
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );
  const todaysTotals = state.dailyTotals[todayKey] ?? fallbackTotals;
  const progressBot =
    profile && metrics
      ? generateProgressBotMessage(profile, metrics, state.workoutLogs, normalizedHabits)
      : "Complete onboarding to unlock the daily coach note.";
  const pr = getWorkoutPR(state.workoutLogs);
  const brokenHabits = normalizedHabits.filter(
    (habit) => habit.streak > 0 && habit.completedSlotsToday.length < habit.timeSlots.length
  );
  const topHabit = [...normalizedHabits].sort((a, b) => b.streak - a.streak)[0];

  useEffect(() => {
    const query = foodQuery.trim();
    if (query.length < 2) {
      setFoodResults([]);
      setFoodLoading(false);
      setFoodError("");
      return;
    }

    let cancelled = false;
    const timeout = setTimeout(() => {
      const loadFoodResults = async () => {
        setFoodLoading(true);
        setFoodError("");

        try {
          const response = await fetch(
            `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&json=1&page_size=10&lc=en&tagtype_0=countries&tag_contains_0=contains&tag_0=india&fields=product_name,nutriments`
          );

          if (!response.ok) {
            throw new Error(`Search failed with ${response.status}`);
          }

          const payload = (await response.json()) as { products?: unknown[] };
          const nextResults = Array.isArray(payload.products)
            ? payload.products
                .map((item, index) => normalizeFoodProduct(item, index))
                .filter((item): item is FoodSearchResult => item !== null)
                .slice(0, 8)
            : [];

          if (cancelled) return;
          setFoodResults(nextResults);
          if (nextResults.length === 0) {
            setFoodError("No matching foods found. Try a broader search term.");
          }
        } catch {
          if (cancelled) return;
          setFoodResults([]);
          setFoodError("Live food search is unavailable right now. Try again in a moment.");
        } finally {
          if (!cancelled) {
            setFoodLoading(false);
          }
        }
      };

      void loadFoodResults();
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [foodQuery]);

  const handleLogFood = (item: FoodItem) => {
    logFood(item);
    setActionNote(`Logged ${item.name} for ${item.calories} kcal. Today's macros updated.`);
    setMode("nutrition");
  };

  const handleSelectFoodResult = (item: FoodSearchResult) => {
    handleLogFood({
      id: item.id,
      name: item.name,
      calories: item.calories,
      protein: item.protein,
      carbs: item.carbs,
      fats: item.fats,
      tags: ["open food facts"]
    });
  };

  const handleStartBarcodeScanner = async () => {
    if (barcodeLoading) return;
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        setFoodError("Camera permission is needed to scan food barcodes.");
        return;
      }
    }

    scanLockRef.current = false;
    setFoodError("");
    setScannerOpen(true);
    setMode("nutrition");
  };

  const handleLookupBarcode = async (barcode: string) => {
    setBarcodeLoading(true);
    setFoodError("");
    setLastBarcode(barcode);

    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,nutriments`
      );

      if (!response.ok) {
        throw new Error(`Barcode lookup failed with ${response.status}`);
      }

      const payload = await response.json();
      const product = normalizeBarcodeProduct(payload, barcode);

      if (!product) {
        setFoodError(`No Open Food Facts product found for barcode ${barcode}.`);
        return;
      }

      setFoodQuery(product.name);
      setFoodResults([product]);
      handleSelectFoodResult(product);
      setActionNote(`Scanned and logged ${product.name}.`);
      setScannerOpen(false);
    } catch {
      setFoodError("Barcode lookup is unavailable right now. Try manual search.");
    } finally {
      scanLockRef.current = false;
      setBarcodeLoading(false);
    }
  };

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (!scannerOpen || scanLockRef.current || barcodeLoading) return;
    const barcode = result.data?.trim();
    if (!barcode) return;
    scanLockRef.current = true;
    void handleLookupBarcode(barcode);
  };

  const handleCompleteHabitSlot = (habitId: string, slot: string, habitNameLabel: string) => {
    completeHabitSlot(habitId, slot);
    setTrackedHabitId(habitId);
    setActionNote(`${habitNameLabel} marked complete for ${slot}.`);
    setMode("habits");
  };

  const saveHabit = () => {
    const trimmedName = habitName.trim();
    const slots = habitSlots
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (!trimmedName) {
      setActionNote("Add a habit name before creating a reminder.");
      return;
    }

    if (slots.length === 0) {
      setActionNote("Add at least one reminder time like 07:00 or 22:00.");
      return;
    }

    addHabit({
      name: trimmedName,
      category: habitCategory,
      timeSlots: slots
    });
    setHabitName("");
    setHabitSlots("07:00, 22:00");
    setActionNote(`Created ${trimmedName} with ${slots.length} reminder${slots.length === 1 ? "" : "s"}.`);
    setMode("habits");
  };

  const clearHabitDraft = () => {
    setHabitName("");
    setHabitSlots("07:00, 22:00");
    setHabitCategory("Recovery");
    setActionNote("Habit draft cleared.");
  };

  const handleDrawChallenge = () => {
    drawChallenge();
    setActionNote("A new streak recovery challenge is ready.");
    setMode("habits");
    navigation.push("RecoveryChallenge", {});
  };

  const handleOpenChallenge = () => {
    setActionNote("Recovery challenge opened.");
    navigation.push("RecoveryChallenge", {});
  };

  const handleCompleteChallenge = () => {
    completeChallenge();
    setActionNote("Challenge completed. Streak recovery has been applied.");
    setMode("today");
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <ScreenHero
        eyebrow="Daily command center"
        title="Progress"
        subtitle="A live board for macros, habits, streak pressure, and the coach note that tells you what changed today."
        metric={`${todaysTotals.protein}`}
        metricLabel="protein"
        accent={palette.lime}
        icon="stats-chart-outline"
      />

      <SectionCard
        title="Progress board"
        subtitle="A simpler dashboard: see the day score first, then switch into nutrition or habits only when you need them."
        accent={palette.lime}
      >
        <View style={styles.metricRow}>
          <MetricPill label="Calories in" value={`${todaysTotals.calories}`} tone="good" />
          <MetricPill
            label="Protein"
            value={`${todaysTotals.protein} g`}
            tone={dietPlan && todaysTotals.protein >= dietPlan.protein * 0.7 ? "good" : "warn"}
          />
          <MetricPill label="Sets week" value={`${metrics?.totalSetsWeek ?? 0}`} tone="neutral" />
        </View>
        <View style={styles.overviewGrid}>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Coach note</Text>
            <Text style={styles.overviewValue}>{metrics?.readinessScore && metrics.readinessScore < 40 ? "Recovery day" : "Momentum building"}</Text>
            <Text style={styles.copy}>{progressBot}</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Top habit</Text>
            <Text style={styles.overviewValue}>{topHabit?.name ?? "No habit yet"}</Text>
            <Text style={styles.copy}>{topHabit ? `${topHabit.streak} day streak` : "Create one reminder to start the streak loop."}</Text>
          </View>
          <View style={styles.overviewCard}>
            <Text style={styles.overviewLabel}>Weekly lift</Text>
            <Text style={styles.overviewValue}>{weekly.volume} kg</Text>
            <Text style={styles.copy}>PR {pr ?? "not set"} - Rank {rank}</Text>
          </View>
        </View>
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Latest action</Text>
          <Text style={styles.statusText}>{actionNote}</Text>
        </View>
        <View style={styles.modeRow}>
          {progressModes.map((entry) => (
            <OptionChip key={entry.id} label={entry.label} selected={mode === entry.id} onPress={() => setMode(entry.id)} />
          ))}
        </View>
      </SectionCard>

      {mode === "today" ? (
        <>
          <SectionCard
            title="Daily snapshot"
            subtitle="The most useful numbers for today without opening every tracker."
            accent={palette.gold}
          >
            <View style={styles.metricRow}>
              <MiniStat label="PR" value={pr ?? "Not yet"} />
              <MiniStat label="Rank" value={rank} />
              <MiniStat label="Consistency" value={`${metrics?.consistencyRank ?? 0}`} />
            </View>
            <View style={styles.metricRow}>
              <MiniStat label="Weekly sessions" value={`${weekly.sessions}`} />
              <MiniStat label="Monthly volume" value={`${monthly.volume} kg`} />
              <MiniStat label="Body fat" value={`${profile?.bodyFatPct ?? "--"}%`} />
            </View>
          </SectionCard>

          <SectionCard
            title="Habit heatmap"
            subtitle="A single visual streak tracker so the page still feels lightweight."
            accent={palette.teal}
          >
            {trackedHabit ? (
              <>
                <View style={styles.chips}>
                  {normalizedHabits.map((habit) => (
                    <OptionChip
                      key={habit.id}
                      label={habit.name}
                      selected={trackedHabit.id === habit.id}
                      onPress={() => setTrackedHabitId(habit.id)}
                    />
                  ))}
                </View>
                <HabitHeatmap
                  habitName={trackedHabit.name}
                  streak={trackedHabit.streak}
                  historyDates={trackedHabit.historyDates ?? []}
                />
              </>
            ) : (
              <Text style={styles.copy}>Create your first habit to unlock the calendar-style tracker.</Text>
            )}
          </SectionCard>
        </>
      ) : null}

      {mode === "nutrition" ? (
        <SectionCard
          title="Macro tracker + food log"
          subtitle={
            dietPlan
              ? `Target ${dietPlan.calories} kcal - P ${dietPlan.protein} / C ${dietPlan.carbs} / F ${dietPlan.fats}`
              : "Set up your profile to unlock a generated diet."
          }
          accent={palette.orange}
        >
          <LabeledInput
            label="Search food database"
            value={foodQuery}
            onChangeText={setFoodQuery}
            placeholder="Chicken, paneer, yogurt..."
          />

          <View style={styles.actionRow}>
            <View style={styles.actionItem}>
              <PrimaryButton
                label={barcodeLoading ? "Looking up..." : scannerOpen ? "Scanner active" : "Scan barcode"}
                onPress={handleStartBarcodeScanner}
              />
            </View>
            {scannerOpen ? (
              <View style={styles.actionItem}>
                <GhostButton
                  label="Close scanner"
                  onPress={() => {
                    scanLockRef.current = false;
                    setScannerOpen(false);
                  }}
                />
              </View>
            ) : null}
          </View>

          {scannerOpen ? (
            <View style={styles.scannerShell}>
              <CameraView
                style={styles.scannerCamera}
                facing="back"
                onBarcodeScanned={handleBarcodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"] }}
              />
              <View pointerEvents="none" style={styles.scannerOverlay}>
                <View style={styles.scannerFrame} />
                <Text style={styles.scannerHint}>
                  {barcodeLoading ? "Looking up product..." : "Place the food barcode inside the frame"}
                </Text>
              </View>
            </View>
          ) : null}

          {lastBarcode ? <Text style={styles.copy}>Last scanned barcode: {lastBarcode}</Text> : null}

          {foodLoading ? (
            <View style={styles.searchState}>
              <ActivityIndicator color={palette.orange} />
              <Text style={styles.copy}>Searching Open Food Facts...</Text>
            </View>
          ) : null}

          {!foodLoading && foodResults.length > 0 ? (
            <View style={styles.foodList}>
              {foodResults.map((item) => (
                <Pressable
                  key={item.id}
                  onPress={() => handleSelectFoodResult(item)}
                  style={({ pressed }) => [styles.searchRow, pressed ? styles.searchRowPressed : null]}
                >
                  <View style={styles.foodMeta}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    <Text style={styles.copy}>{item.calories} kcal per 100 g</Text>
                    <Text style={styles.copy}>Protein {item.protein} g per 100 g</Text>
                  </View>
                  <Text style={styles.rowAction}>Tap to log</Text>
                </Pressable>
              ))}
            </View>
          ) : null}

          {!foodLoading && foodError ? <Text style={styles.errorText}>{foodError}</Text> : null}
          {!foodLoading && !foodError && foodQuery.trim().length > 0 && foodResults.length === 0 ? (
            <Text style={styles.copy}>Keep typing to search the live food database.</Text>
          ) : null}

          {dietPlan ? (
            <View style={styles.mealWrap}>
              {dietPlan.meals.map((meal) => (
                <View key={meal.title} style={styles.mealCard}>
                  <Text style={styles.cardTitle}>{meal.title}</Text>
                  <Text style={styles.copy}>{meal.foods.join(" - ")}</Text>
                </View>
              ))}
            </View>
          ) : null}
        </SectionCard>
      ) : null}

      {mode === "habits" ? (
        <>
          <SectionCard
            title="Habit tracker + reminders"
            subtitle="One habit can own multiple reminder slots, and every completed day feeds your streak."
            accent={palette.blue}
          >
            {normalizedHabits.map((habit) => (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitHeader}>
                  <View>
                    <Text style={styles.cardTitle}>{habit.name}</Text>
                    <Text style={styles.copy}>
                      {habit.category} - streak {habit.streak}
                    </Text>
                  </View>
                  <MetricPill
                    label="Done"
                    value={`${habit.completedSlotsToday.length}/${habit.timeSlots.length}`}
                    tone={habit.completedSlotsToday.length === habit.timeSlots.length ? "good" : "warn"}
                  />
                </View>
                <View style={styles.chips}>
                  {habit.timeSlots.map((slot) => (
                    <OptionChip
                      key={`${habit.id}-${slot}`}
                      label={slot}
                      selected={habit.completedSlotsToday.includes(slot)}
                      onPress={() => handleCompleteHabitSlot(habit.id, slot, habit.name)}
                    />
                  ))}
                </View>
              </View>
            ))}
            <View style={styles.formCard}>
              <Text style={styles.cardTitle}>Add custom habit</Text>
              <LabeledInput
                label="Habit name"
                value={habitName}
                onChangeText={setHabitName}
                placeholder="Mobility, study block, meds..."
              />
              <LabeledInput
                label="Time slots"
                value={habitSlots}
                onChangeText={setHabitSlots}
                placeholder="07:10, 22:00"
              />
              <View style={styles.chips}>
                {habitCategories.map((item) => (
                  <OptionChip
                    key={item}
                    label={item}
                    selected={habitCategory === item}
                    onPress={() => setHabitCategory(item)}
                  />
                ))}
              </View>
              <View style={styles.actionRow}>
                <View style={styles.actionItem}>
                  <PrimaryButton label="Create habit" onPress={saveHabit} />
                </View>
                <View style={styles.actionItem}>
                  <GhostButton label="Clear draft" onPress={clearHabitDraft} />
                </View>
              </View>
            </View>
          </SectionCard>

          <SectionCard
            title="Streak recovery"
            subtitle={
              brokenHabits.length > 0
                ? `You have ${brokenHabits.length} habit streaks under pressure.`
                : "Pull a random challenge any time for bonus badges."
            }
            accent={palette.red}
          >
            {state.activeChallenge ? (
              <View style={styles.challengeCard}>
                <Text style={styles.challengeTitle}>{state.activeChallenge.title}</Text>
                <Text style={styles.copy}>{state.activeChallenge.description}</Text>
                <Text style={styles.copy}>Badge reward: {state.activeChallenge.rewardBadge}</Text>
                <View style={styles.actionRow}>
                  <View style={styles.actionItem}>
                    <PrimaryButton label="Open challenge" onPress={handleOpenChallenge} tone={palette.orange} />
                  </View>
                  <View style={styles.actionItem}>
                    <GhostButton label="Mark complete here" onPress={handleCompleteChallenge} />
                  </View>
                </View>
              </View>
            ) : (
              <PrimaryButton label="Draw random challenge" onPress={handleDrawChallenge} tone={palette.orange} />
            )}
          </SectionCard>
        </>
      ) : null}
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
      paddingBottom: 120,
      gap: spacing.lg
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
    modeRow: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    metricRow: {
      flexDirection: "row",
      gap: spacing.sm,
      flexWrap: "wrap"
    },
    overviewGrid: {
      gap: spacing.sm
    },
    overviewCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: 6,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    overviewLabel: {
      color: palette.textMuted,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 2
    },
    overviewValue: {
      color: palette.text,
      fontSize: 20,
      fontWeight: "800"
    },
    copy: {
      color: palette.textMuted,
      lineHeight: 20
    },
    statusCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: 6,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    statusLabel: {
      color: palette.textMuted,
      fontSize: 12,
      textTransform: "uppercase",
      letterSpacing: 2
    },
    statusText: {
      color: palette.text,
      lineHeight: 20,
      fontWeight: "600"
    },
    chips: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm
    },
    searchState: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      paddingVertical: 6
    },
    scannerShell: {
      height: 320,
      overflow: "hidden",
      borderRadius: radius.md,
      backgroundColor: "#000",
      borderWidth: 1,
      borderColor: palette.line
    },
    scannerCamera: {
      ...StyleSheet.absoluteFillObject
    },
    scannerOverlay: {
      ...StyleSheet.absoluteFillObject,
      alignItems: "center",
      justifyContent: "center",
      padding: spacing.md
    },
    scannerFrame: {
      width: "78%",
      aspectRatio: 1.55,
      borderWidth: 2,
      borderRadius: radius.md,
      borderColor: palette.orange,
      backgroundColor: "transparent"
    },
    scannerHint: {
      position: "absolute",
      bottom: spacing.md,
      left: spacing.md,
      right: spacing.md,
      color: "#fff",
      textAlign: "center",
      fontWeight: "700",
      backgroundColor: "rgba(0, 0, 0, 0.58)",
      borderRadius: radius.sm,
      padding: spacing.sm
    },
    foodList: {
      gap: spacing.sm
    },
    searchRow: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    searchRowPressed: {
      opacity: 0.88,
      transform: [{ scale: 0.985 }]
    },
    foodMeta: {
      gap: 4
    },
    cardTitle: {
      color: palette.text,
      fontWeight: "700",
      fontSize: 17
    },
    rowAction: {
      color: palette.orange,
      fontWeight: "700"
    },
    errorText: {
      color: palette.orange,
      lineHeight: 20
    },
    mealWrap: {
      gap: spacing.sm
    },
    mealCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: 4,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    habitCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    habitHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      gap: spacing.sm
    },
    formCard: {
      backgroundColor: palette.panelAlt,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    actionRow: {
      flexDirection: "row",
      gap: spacing.sm
    },
    actionItem: {
      flex: 1
    },
    challengeCard: {
      backgroundColor: palette.dangerSoft,
      borderRadius: radius.md,
      padding: spacing.md,
      gap: spacing.sm,
      borderWidth: 1,
      borderColor: palette.line,
      ...shadows.card
    },
    challengeTitle: {
      color: palette.text,
      fontSize: 20,
      fontWeight: "800"
    }
  });





