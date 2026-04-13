import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useRef, useState } from "react";

export type ExerciseMemoryEntry = {
  weight: number;
  reps: number;
  date: string;
};

type MemoryListener = (storageKey: string, history: ExerciseMemoryEntry[]) => void;

const listeners = new Set<MemoryListener>();

const normalizeExerciseKey = (exerciseName: string) =>
  exerciseName.trim().replace(/\s/g, "_") || "exercise";

const normalizeLegacyKey = (exerciseName: string) =>
  exerciseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "") || "exercise";

export const getExerciseMemoryKey = (exerciseName: string) =>
  `exercise_${normalizeExerciseKey(exerciseName || "exercise")}`;

const getLegacyStorageKey = (exerciseName: string) =>
  `fitos-exercise-memory-${normalizeLegacyKey(exerciseName || "exercise")}`;

const notifyListeners = (storageKey: string, history: ExerciseMemoryEntry[]) => {
  listeners.forEach((listener) => listener(storageKey, history));
};

const normalizeEntry = (entry: unknown): ExerciseMemoryEntry | null => {
  if (!entry || typeof entry !== "object") return null;

  const candidate = entry as {
    weight?: unknown;
    weightKg?: unknown;
    reps?: unknown;
    date?: unknown;
  };

  const weight =
    typeof candidate.weight === "number"
      ? candidate.weight
      : typeof candidate.weightKg === "number"
        ? candidate.weightKg
        : null;

  if (weight === null || typeof candidate.reps !== "number") return null;

  return {
    weight,
    reps: candidate.reps,
    date: typeof candidate.date === "string" ? candidate.date : new Date().toISOString()
  };
};

const parseHistory = (raw: string | null): ExerciseMemoryEntry[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeEntry).filter((entry): entry is ExerciseMemoryEntry => entry !== null);
  } catch {
    return [];
  }
};

const pickBestSet = (history: ExerciseMemoryEntry[]) =>
  history.reduce<ExerciseMemoryEntry | null>((best, entry) => {
    if (!best) return entry;
    if (entry.weight > best.weight) return entry;
    if (entry.weight === best.weight && entry.reps > best.reps) return entry;
    return best;
  }, null);

const loadStoredHistory = async (storageKey: string, legacyKey: string) => {
  const currentRaw = await AsyncStorage.getItem(storageKey);
  if (currentRaw !== null) return parseHistory(currentRaw);

  const legacyRaw = await AsyncStorage.getItem(legacyKey);
  const migrated = parseHistory(legacyRaw);
  if (migrated.length > 0) {
    await AsyncStorage.setItem(storageKey, JSON.stringify(migrated));
  }
  return migrated;
};

export const readExerciseMemory = async (exerciseName: string) => {
  const storageKey = getExerciseMemoryKey(exerciseName);
  const legacyKey = getLegacyStorageKey(exerciseName);
  return loadStoredHistory(storageKey, legacyKey);
};

export const useExerciseMemory = (exerciseName: string) => {
  const storageKey = useMemo(() => getExerciseMemoryKey(exerciseName), [exerciseName]);
  const legacyKey = useMemo(() => getLegacyStorageKey(exerciseName), [exerciseName]);
  const [history, setHistory] = useState<ExerciseMemoryEntry[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const historyRef = useRef<ExerciseMemoryEntry[]>([]);

  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  useEffect(() => {
    const syncHistory = (updatedKey: string, nextHistory: ExerciseMemoryEntry[]) => {
      if (updatedKey !== storageKey) return;
      historyRef.current = nextHistory;
      setHistory(nextHistory);
      setHydrated(true);
    };

    listeners.add(syncHistory);
    return () => {
      listeners.delete(syncHistory);
    };
  }, [storageKey]);

  useEffect(() => {
    let cancelled = false;
    setHydrated(false);
    setHistory([]);
    historyRef.current = [];

    loadStoredHistory(storageKey, legacyKey)
      .then((nextHistory) => {
        if (cancelled) return;
        historyRef.current = nextHistory;
        setHistory(nextHistory);
        setHydrated(true);
      })
      .catch(() => {
        if (cancelled) return;
        historyRef.current = [];
        setHistory([]);
        setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [storageKey, legacyKey]);

  const persistHistory = async (nextHistory: ExerciseMemoryEntry[]) => {
    historyRef.current = nextHistory;
    setHistory(nextHistory);
    notifyListeners(storageKey, nextHistory);
    await AsyncStorage.setItem(storageKey, JSON.stringify(nextHistory));
  };

  const logSet = async (weight: number, reps: number) => {
    const entry: ExerciseMemoryEntry = {
      weight,
      reps,
      date: new Date().toISOString()
    };
    const nextHistory = [...historyRef.current, entry];
    await persistHistory(nextHistory);
    return entry;
  };

  const logSets = async (sets: Array<{ weight?: number; weightKg?: number; reps: number }>) => {
    const batchTimestamp = new Date().toISOString();
    const validEntries = sets
      .map((set) => ({
        weight: typeof set.weight === "number" ? set.weight : set.weightKg,
        reps: set.reps
      }))
      .filter(
        (set): set is { weight: number; reps: number } =>
          typeof set.weight === "number" && Number.isFinite(set.weight) && Number.isFinite(set.reps) && set.reps > 0
      )
      .map<ExerciseMemoryEntry>((set) => ({
        weight: set.weight,
        reps: set.reps,
        date: batchTimestamp
      }));

    if (validEntries.length === 0) return [];
    const nextHistory = [...historyRef.current, ...validEntries];
    await persistHistory(nextHistory);
    return validEntries;
  };

  const lastSet = history.length > 0 ? history[history.length - 1] : null;
  const bestSet = pickBestSet(history);

  return {
    hydrated,
    history,
    lastSet,
    bestSet,
    logSet,
    logSets
  };
};


