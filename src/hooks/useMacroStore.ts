import { useState, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export type MealType = "breakfast" | "lunch" | "snack1" | "dinner" | "snack2";

export const MEAL_LABELS: Record<MealType, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  snack1: "Snack 1",
  dinner: "Dinner",
  snack2: "Snack 2",
};

export const MEAL_TYPES: MealType[] = [
  "breakfast",
  "lunch",
  "snack1",
  "dinner",
  "snack2",
];

export interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DayLog {
  meals: Record<MealType, FoodEntry[]>;
  weight: string;
  sleep: string;
  steps: string;
  workout: string;
  water: string;
}

export interface SavedMeal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface MacroTargets {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  stepsTarget: number;
  workoutTarget: number;
}

export const DEFAULT_TARGETS: MacroTargets = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
  stepsTarget: 10000,
  workoutTarget: 150,
};

// ─── Storage keys ─────────────────────────────────────────────────────────────

const DAYS_KEY = "macro_days";
const SAVED_MEALS_KEY = "macro_saved_meals";
const TARGETS_KEY = "macro_targets";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeEmptyDay(): DayLog {
  return {
    meals: {
      breakfast: [],
      lunch: [],
      snack1: [],
      dinner: [],
      snack2: [],
    },
    weight: "",
    sleep: "",
    steps: "",
    workout: "",
    water: "",
  };
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function persist<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore storage errors
  }
}

export function getMacroTotals(day: DayLog) {
  let calories = 0,
    protein = 0,
    carbs = 0,
    fat = 0;
  for (const entries of Object.values(day.meals) as FoodEntry[][]) {
    for (const e of entries) {
      calories += e.calories;
      protein += e.protein;
      carbs += e.carbs;
      fat += e.fat;
    }
  }
  return { calories, protein, carbs, fat };
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useMacroStore() {
  const [days, setDays] = useState<Record<string, DayLog>>(() =>
    load<Record<string, DayLog>>(DAYS_KEY, {})
  );
  const [savedMeals, setSavedMeals] = useState<SavedMeal[]>(() =>
    load<SavedMeal[]>(SAVED_MEALS_KEY, [])
  );
  const [targets] = useState<MacroTargets>(() =>
    load<MacroTargets>(TARGETS_KEY, DEFAULT_TARGETS)
  );

  /** Returns the log for a given date key (yyyy-MM-dd), initialising missing fields. */
  const getDay = useCallback(
    (key: string): DayLog => {
      const d = days[key];
      if (!d) return makeEmptyDay();
      return {
        ...d,
        meals: {
          breakfast: d.meals?.breakfast ?? [],
          lunch: d.meals?.lunch ?? [],
          snack1: d.meals?.snack1 ?? [],
          dinner: d.meals?.dinner ?? [],
          snack2: d.meals?.snack2 ?? [],
        },
      };
    },
    [days]
  );

  /** Patch non-meal fields (weight, sleep, steps, workout, water). */
  const patchDay = useCallback(
    (key: string, patch: Partial<Omit<DayLog, "meals">>) => {
      setDays((prev) => {
        const existing = prev[key] ?? makeEmptyDay();
        const next = { ...prev, [key]: { ...existing, ...patch } };
        persist(DAYS_KEY, next);
        return next;
      });
    },
    []
  );

  /** Add a food entry to a specific meal slot for a given day. */
  const addFoodEntry = useCallback(
    (key: string, mealType: MealType, entry: Omit<FoodEntry, "id">) => {
      const newEntry: FoodEntry = { ...entry, id: crypto.randomUUID() };
      setDays((prev) => {
        const existing = prev[key] ?? makeEmptyDay();
        const next = {
          ...prev,
          [key]: {
            ...existing,
            meals: {
              ...existing.meals,
              [mealType]: [...(existing.meals[mealType] ?? []), newEntry],
            },
          },
        };
        persist(DAYS_KEY, next);
        return next;
      });
    },
    []
  );

  /** Remove a food entry by id from a meal slot. */
  const deleteFoodEntry = useCallback(
    (key: string, mealType: MealType, entryId: string) => {
      setDays((prev) => {
        const existing = prev[key];
        if (!existing) return prev;
        const next = {
          ...prev,
          [key]: {
            ...existing,
            meals: {
              ...existing.meals,
              [mealType]: (existing.meals[mealType] ?? []).filter(
                (e) => e.id !== entryId
              ),
            },
          },
        };
        persist(DAYS_KEY, next);
        return next;
      });
    },
    []
  );

  /** Save a new reusable meal template (sorted alphabetically). */
  const saveNewMeal = useCallback((meal: Omit<SavedMeal, "id">) => {
    setSavedMeals((prev) => {
      const next = [
        ...prev,
        { ...meal, id: crypto.randomUUID() },
      ].sort((a, b) => a.name.localeCompare(b.name));
      persist(SAVED_MEALS_KEY, next);
      return next;
    });
  }, []);

  /** Remove a saved meal template by id. */
  const deleteSavedMeal = useCallback((id: string) => {
    setSavedMeals((prev) => {
      const next = prev.filter((m) => m.id !== id);
      persist(SAVED_MEALS_KEY, next);
      return next;
    });
  }, []);

  return {
    days,
    getDay,
    patchDay,
    addFoodEntry,
    deleteFoodEntry,
    savedMeals,
    saveNewMeal,
    deleteSavedMeal,
    targets,
  };
}

export type MacroStore = ReturnType<typeof useMacroStore>;
