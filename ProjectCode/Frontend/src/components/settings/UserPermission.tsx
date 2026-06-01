import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/supabaseClient";
import { toast } from "sonner";

const Toggle = ({ enabled, onChange, loading, ...ariaProps }) => (
  <button
    type="button"
    role="switch"
    aria-checked={enabled}
    disabled={loading}
    onClick={() => onChange(!enabled)}
    className={`
      w-12 h-7 rounded-full flex items-center transition-all duration-300 px-1 shadow-inner
      ${enabled ? "bg-primary shadow-sm shadow-primary/20" : "bg-gray-300"}
      ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:brightness-105 active:scale-95"}
    `}
    {...ariaProps}
  >
    <div
      className={`
        w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-300 transform
        ${enabled ? "translate-x-5" : "translate-x-0"}
      `}
    />
  </button>
);


const UserPermission = ({ user }) => {
  const { t } = useTranslation();
  const [allowMemory, setAllowMemory] = useState(
    user?.allow_memory_creation ?? true
  );
  const [updating, setUpdating] = useState(false);

  // Sync state if the user prop changes
  useEffect(() => {
    if (user) {
      setAllowMemory(user.allow_memory_creation);
    }
  }, [user]);

  const updatePermission = async (column: string, value: boolean) => {
    if (!user?.id) return;

    setUpdating(true);
    const { error } = await supabase
      .from("users")
      .update({ [column]: value })
      .eq("id", user.id);

    if (error) {
      console.error("Error updating permissions:", error);
      toast.error("Failed to update permission");
      // Revert local state on error
      if (column === "allow_memory_creation") setAllowMemory(!value);
    } else {
      toast.success(
        t("settings.userPermissions.updated") || "Permission updated"
      );
    }
    setUpdating(false);
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/50 shadow-md rounded-3xl p-6 md:p-8 lg:p-10 max-w-[54rem] animate-in fade-in duration-500">
      <h3 className="text-black text-2xl font-bold font-fraunces mb-2">
        {t("settings.userPermissions.title")}
      </h3>
      <p className="text-darkgrey text-lg pb-6 leading-relaxed">
        {t("settings.userPermissions.description")}
      </p>

      <div className="space-y-6">
        {/* Allow memory creation */}
        <div className="flex items-center gap-6 bg-white border border-gray-100 p-5 rounded-2xl shadow-sm transition-all hover:shadow-md duration-300">
          <Toggle
            enabled={allowMemory}
            loading={updating}
            aria-labelledby="allow-memory-label allow-memory-hint"
            onChange={(val) => {
              setAllowMemory(val);
              updatePermission("allow_memory_creation", val);
            }}
          />
          <div>
            <h3
              id="allow-memory-label"
              className="text-lg font-semibold text-black mb-1"
            >
              {t("settings.userPermissions.allowMemoryCreation")}
            </h3>

            <p id="allow-memory-hint" className="text-darkgrey text-base leading-normal">
              {t("settings.userPermissions.allowMemoryCreationHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPermission;
