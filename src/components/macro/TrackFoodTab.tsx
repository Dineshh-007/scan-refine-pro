import { useState, useRef } from "react";
import { format } from "date-fns";
import { Plus, Trash2, ChevronDown, ChevronUp, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  MacroStore,
  MealType,
  MEAL_LABELS,
  MEAL_TYPES,
  FoodEntry,
  SavedMeal,
} from "@/hooks/useMacroStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getMealTotals(entries: FoodEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      calories: acc.calories + e.calories,
      protein:  acc.protein  + e.protein,
      carbs:    acc.carbs    + e.carbs,
      fat:      acc.fat      + e.fat,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

const MEAL_COLORS: Record<MealType, string> = {
  breakfast: "#f59e0b",
  lunch:     "#38bdf8",
  snack1:    "#34d399",
  dinner:    "#818cf8",
  snack2:    "#f472b6",
};

// ─── AddFoodDialog ────────────────────────────────────────────────────────────

interface AddFoodDialogProps {
  open: boolean;
  onClose: () => void;
  mealType: MealType;
  store: MacroStore;
  dayKey: string;
}

function AddFoodDialog({
  open,
  onClose,
  mealType,
  store,
  dayKey,
}: AddFoodDialogProps) {
  const { savedMeals, addFoodEntry, saveNewMeal, deleteSavedMeal } = store;

  const [mode,        setMode]        = useState<"saved" | "new">("saved");
  const [name,        setName]        = useState("");
  const [cal,         setCal]         = useState("");
  const [prot,        setProt]        = useState("");
  const [carb,        setCarb]        = useState("");
  const [fat,         setFat]         = useState("");
  const [saveForLater, setSaveForLater] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // Long-press detection
  const holdTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const holdFired  = useRef(false);

  const startHold = (id: string) => {
    holdFired.current = false;
    holdTimer.current = setTimeout(() => {
      holdFired.current = true;
      setDeleteTarget(id);
    }, 750);
  };

  const cancelHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
  };

  const handleSavedMealClick = (meal: SavedMeal) => {
    if (holdFired.current) {
      holdFired.current = false;
      return;
    }
    cancelHold();
    addFoodEntry(dayKey, mealType, {
      name:     meal.name,
      calories: meal.calories,
      protein:  meal.protein,
      carbs:    meal.carbs,
      fat:      meal.fat,
    });
    handleClose();
  };

  const handleAddNew = () => {
    const entry = {
      name:     name.trim() || "Unnamed Meal",
      calories: Number(cal)  || 0,
      protein:  Number(prot) || 0,
      carbs:    Number(carb) || 0,
      fat:      Number(fat)  || 0,
    };
    addFoodEntry(dayKey, mealType, entry);
    if (saveForLater) saveNewMeal(entry);
    handleClose();
  };

  const handleClose = () => {
    setMode("saved");
    setName(""); setCal(""); setProt(""); setCarb(""); setFat("");
    setSaveForLater(false);
    onClose();
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add to {MEAL_LABELS[mealType]}</DialogTitle>
          </DialogHeader>

          {/* Mode toggle */}
          <div className="flex bg-muted rounded-xl p-1 gap-1 flex-shrink-0">
            {(["saved", "new"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-1.5 px-3 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? "bg-background shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {m === "saved" ? "Saved Meals" : "New Meal"}
              </button>
            ))}
          </div>

          {/* Saved meals list */}
          {mode === "saved" && (
            <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-1">
              {savedMeals.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground">
                  <UtensilsCrossed className="h-9 w-9 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-medium">No saved meals yet</p>
                  <p className="text-xs mt-1 max-w-[200px] mx-auto">
                    Switch to "New Meal", log something, and tick "Save for later".
                  </p>
                </div>
              ) : (
                savedMeals.map((meal) => (
                  <div
                    key={meal.id}
                    className="flex items-center gap-2 p-3 rounded-xl border bg-card hover:bg-accent/40 active:bg-accent transition-colors cursor-pointer select-none"
                    onClick={() => handleSavedMealClick(meal)}
                    onMouseDown={() => startHold(meal.id)}
                    onMouseUp={cancelHold}
                    onMouseLeave={cancelHold}
                    onTouchStart={() => startHold(meal.id)}
                    onTouchEnd={cancelHold}
                    onTouchCancel={cancelHold}
                    onTouchMove={cancelHold}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{meal.name}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {meal.calories} kcal · P {meal.protein}g · C {meal.carbs}g · F {meal.fat}g
                      </p>
                    </div>
                    <Plus className="h-4 w-4 text-primary flex-shrink-0" />
                  </div>
                ))
              )}
              {savedMeals.length > 0 && (
                <p className="text-center text-[10px] text-muted-foreground/60 pt-1">
                  Hold any meal to delete it
                </p>
              )}
            </div>
          )}

          {/* New meal form */}
          {mode === "new" && (
            <div className="space-y-3 overflow-y-auto flex-1 min-h-0">
              <div>
                <Label htmlFor="mt-name">Meal Name</Label>
                <Input
                  id="mt-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Chicken Rice Bowl"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="mt-cal">Calories (kcal)</Label>
                  <Input id="mt-cal" type="number" value={cal} onChange={(e) => setCal(e.target.value)} placeholder="0" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="mt-prot">Protein (g)</Label>
                  <Input id="mt-prot" type="number" value={prot} onChange={(e) => setProt(e.target.value)} placeholder="0" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="mt-carb">Carbs (g)</Label>
                  <Input id="mt-carb" type="number" value={carb} onChange={(e) => setCarb(e.target.value)} placeholder="0" className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="mt-fat">Fat (g)</Label>
                  <Input id="mt-fat" type="number" value={fat} onChange={(e) => setFat(e.target.value)} placeholder="0" className="mt-1" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm select-none">
                <input
                  type="checkbox"
                  checked={saveForLater}
                  onChange={(e) => setSaveForLater(e.target.checked)}
                  className="rounded"
                />
                Save this meal for later reuse
              </label>
            </div>
          )}

          {mode === "new" && (
            <DialogFooter className="flex-shrink-0 pt-2">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleAddNew}>Add Meal</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete saved meal confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Saved Meal?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes it from your saved list. Meals already logged today won't be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) deleteSavedMeal(deleteTarget);
                setDeleteTarget(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── MealSection ──────────────────────────────────────────────────────────────

interface MealSectionProps {
  mealType: MealType;
  store: MacroStore;
  dayKey: string;
  entries: FoodEntry[];
  onAdd: (mealType: MealType) => void;
}

function MealSection({ mealType, store, dayKey, entries, onAdd }: MealSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const totals = getMealTotals(entries);
  const color  = MEAL_COLORS[mealType];

  return (
    <Card className="overflow-hidden">
      <div className="p-3.5">
        <div className="flex items-center gap-2">
          {/* Colour accent stripe */}
          <div
            className="w-1 h-12 rounded-full flex-shrink-0"
            style={{ backgroundColor: color }}
          />

          {/* Expand/collapse toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center gap-2 text-left min-w-0"
          >
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{MEAL_LABELS[mealType]}</p>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                {entries.length === 0
                  ? "Nothing logged yet"
                  : `${totals.calories} kcal · P ${totals.protein}g · C ${totals.carbs}g · F ${totals.fat}g`}
              </p>
            </div>
            {expanded
              ? <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              : <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            }
          </button>

          {/* Add button */}
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 ml-1 text-primary hover:text-primary hover:bg-primary/10 flex-shrink-0"
            onClick={() => onAdd(mealType)}
            aria-label={`Add food to ${MEAL_LABELS[mealType]}`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Food entries list */}
        {expanded && entries.length > 0 && (
          <div className="mt-3 space-y-1.5 pl-3">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-2 py-2 px-2.5 rounded-lg bg-muted/40 group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{entry.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {entry.calories} kcal · P {entry.protein}g · C {entry.carbs}g · F {entry.fat}g
                  </p>
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 flex-shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 transition-all"
                  onClick={() => store.deleteFoodEntry(dayKey, mealType, entry.id)}
                  aria-label="Delete food entry"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ─── TrackFoodTab (main export) ───────────────────────────────────────────────

interface TrackFoodTabProps {
  store: MacroStore;
  selectedDate: Date;
}

export default function TrackFoodTab({ store, selectedDate }: TrackFoodTabProps) {
  const dayKey = format(selectedDate, "yyyy-MM-dd");
  const dayLog = store.getDay(dayKey);
  const [dialogMealType, setDialogMealType] = useState<MealType | null>(null);

  // Overall day totals
  const allEntries = MEAL_TYPES.flatMap((m) => dayLog.meals[m] ?? []);
  const dayTotals  = getMealTotals(allEntries);

  return (
    <div className="px-4 py-4 space-y-3 pb-28">
      <p className="text-xs text-muted-foreground text-center">
        {format(selectedDate, "EEEE, MMMM d")}
      </p>

      {/* Day totals summary */}
      <Card className="p-3">
        <div className="grid grid-cols-4 gap-1 text-center">
          {[
            { label: "Calories", val: dayTotals.calories, unit: "kcal", color: "#38bdf8" },
            { label: "Protein",  val: dayTotals.protein,  unit: "g",    color: "#818cf8" },
            { label: "Carbs",    val: dayTotals.carbs,    unit: "g",    color: "#f59e0b" },
            { label: "Fat",      val: dayTotals.fat,      unit: "g",    color: "#f472b6" },
          ].map(({ label, val, unit, color }) => (
            <div key={label} className="px-1">
              <p
                className="text-base font-bold tabular-nums"
                style={{ color }}
              >
                {Math.round(val)}
              </p>
              <p className="text-[9px] text-muted-foreground">{label}</p>
              <p className="text-[8px] text-muted-foreground/60">{unit}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Meal sections */}
      {MEAL_TYPES.map((mealType) => (
        <MealSection
          key={mealType}
          mealType={mealType}
          store={store}
          dayKey={dayKey}
          entries={dayLog.meals[mealType] ?? []}
          onAdd={setDialogMealType}
        />
      ))}

      {/* Add food dialog */}
      {dialogMealType && (
        <AddFoodDialog
          open={!!dialogMealType}
          onClose={() => setDialogMealType(null)}
          mealType={dialogMealType}
          store={store}
          dayKey={dayKey}
        />
      )}
    </div>
  );
}
