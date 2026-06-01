import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { supabase } from "@/supabaseClient";

interface ExerciseLimitConfigProps {
  userId: string;
}

const ExerciseLimitConfig = ({ userId }: ExerciseLimitConfigProps) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Saved limits (retrieved from Supabase or defaults)
  const [savedLimits, setSavedLimits] = useState({
    multiple_choice: 1,
    fill_in_the_blank: 1,
    ordering: 1,
  });

  // Local limits editing state
  const [limits, setLimits] = useState({
    multiple_choice: 1,
    fill_in_the_blank: 1,
    ordering: 1,
  });

  // Load from Supabase on mount / userId change
  useEffect(() => {
    if (!userId) return;

    const fetchLimits = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("users")
          .select("multiple_choice, fill_in_the_blank, ordering")
          .eq("id", userId)
          .single();

        if (error) {
          throw error;
        }

        if (data) {
          const loadedLimits = {
            multiple_choice: data.multiple_choice ?? 1,
            fill_in_the_blank: data.fill_in_the_blank ?? 1,
            ordering: data.ordering ?? 1,
          };
          setSavedLimits(loadedLimits);
          setLimits(loadedLimits);
        }
      } catch (e) {
        console.error("Failed to fetch exercise limits:", e);
        toast.error("Failed to load exercise limits.");
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, [userId]);

  const total = limits.multiple_choice + limits.fill_in_the_blank + limits.ordering;

  // Check if there are unsaved changes
  const hasChanges =
    limits.multiple_choice !== savedLimits.multiple_choice ||
    limits.fill_in_the_blank !== savedLimits.fill_in_the_blank ||
    limits.ordering !== savedLimits.ordering;

  const handleUpdateLimit = (type: keyof typeof limits, newValue: number) => {
    if (newValue < 0) return;

    const newLimits = { ...limits, [type]: newValue };
    const newTotal = newLimits.multiple_choice + newLimits.fill_in_the_blank + newLimits.ordering;

    if (newTotal > 5) {
      toast.error(t("settings.exerciseLimits.errorMax"));
      return;
    }

    // Enforce minimum total of 1
    if (newTotal < 1) {
      toast.error("Debe haber al menos un ejercicio");
      return;
    }

    setLimits(newLimits);
  };

  const handleApplyChanges = async () => {
    if (total > 5) {
      toast.error(t("settings.exerciseLimits.errorMax"));
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("users")
        .update({
          multiple_choice: limits.multiple_choice,
          fill_in_the_blank: limits.fill_in_the_blank,
          ordering: limits.ordering,
        })
        .eq("id", userId);

      if (error) throw error;

      setSavedLimits(limits);
      toast.success(t("settings.userPermissions.updated") || "Changes applied successfully!");
    } catch (e) {
      console.error("Failed to save exercise limits:", e);
      toast.error("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const exerciseTypes = [
    { id: "multiple_choice" as const, name: t("exercises.chooseCorrectAnswer") },
    { id: "fill_in_the_blank" as const, name: t("exercises.completeSentence") },
    { id: "ordering" as const, name: t("exercises.orderEvents") },
  ];

  if (loading) {
    return (
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-md rounded-3xl p-6 md:p-8 lg:p-10 max-w-[54rem] animate-in fade-in duration-500">
        <h3 className="text-black text-2xl font-bold font-fraunces">
          {t("settings.exerciseLimits.title")}
        </h3>
        <div className="flex flex-col md:flex-row gap-6 mt-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex-1 bg-white border border-gray-100 p-6 rounded-2xl flex flex-col items-center justify-between min-h-[11rem] animate-pulse"
            >
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="flex items-center gap-6">
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
                <div className="w-6 h-8 bg-gray-200 rounded"></div>
                <div className="w-10 h-10 rounded-full bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-md rounded-3xl p-6 md:p-8 lg:p-10 max-w-[54rem] animate-in fade-in duration-500">
      <h3 className="text-black text-2xl font-bold font-fraunces mb-2">
        {t("settings.exerciseLimits.title")}
      </h3>
      <p className="text-darkgrey text-lg pb-6 leading-relaxed">
        {t("settings.exerciseLimits.description")}
      </p>

      <div className="flex flex-col md:flex-row gap-6">
        {exerciseTypes.map((type) => {
          const val = limits[type.id];
          return (
            <div
              key={type.id}
              className="flex-1 bg-white border border-gray-100 p-6 rounded-2xl flex flex-col items-center justify-between min-h-[11rem] shadow-sm transition-all hover:shadow-md hover:scale-[1.01] duration-300"
            >
              <span className="text-lg font-semibold text-primary text-center mb-4 leading-snug">
                {type.name}
              </span>

              <div className="flex items-center gap-6">
                {/* Decrement Button */}
                <button
                  type="button"
                  onClick={() => handleUpdateLimit(type.id, val - 1)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all text-xl font-bold shadow-sm
                    ${val <= 0
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50/50"
                      : "border-primary/30 text-primary bg-white hover:bg-primary hover:text-white active:scale-95"
                    }`}
                >
                  −
                </button>

                {/* Number Display */}
                <span className="text-3xl font-semibold text-black select-none w-6 text-center">
                  {val}
                </span>

                {/* Increment Button */}
                <button
                  type="button"
                  disabled={total >= 5}
                  onClick={() => handleUpdateLimit(type.id, val + 1)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all text-xl font-bold shadow-sm
                    ${total >= 5
                      ? "border-gray-200 text-gray-300 cursor-not-allowed bg-gray-50/50"
                      : "border-primary/30 text-primary bg-white hover:bg-primary hover:text-white active:scale-95"
                    }`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress / Status indicator */}
      <div className="mt-8 flex items-center gap-4">
        <div className="text-lg font-medium text-darkgrey whitespace-nowrap">
          Total: <span className={total === 5 ? "text-primary font-bold animate-pulse" : "text-black font-semibold"}>{total}</span> / 5
        </div>
        <div className="flex-1 max-w-[200px] h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-200/30">
          <div
            className={`h-full transition-all duration-300 rounded-full ${total === 5 ? "bg-primary" : "bg-gradient-to-r from-primary/80 to-primary"}`}
            style={{ width: `${(total / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Apply Changes Button */}
      <div className="mt-8">
        <button
          type="button"
          onClick={handleApplyChanges}
          disabled={!hasChanges || saving}
          className={`button-sm px-8 py-3.5 rounded-full font-medium transition-all ${hasChanges && !saving
            ? "button-primary hover:shadow active:scale-[0.98]"
            : "button-disabled cursor-not-allowed"
            }`}
        >
          {saving ? t("buttons.saving") : t("buttons.applyChanges")}
        </button>
      </div>
    </div>
  );
};

export default ExerciseLimitConfig;
