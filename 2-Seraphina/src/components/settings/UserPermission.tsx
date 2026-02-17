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
      w-12 h-6 rounded-full flex items-center transition-all duration-300 px-1
      ${enabled ? "bg-primary/20" : "bg-gray-300"}
      ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
    `}
    {...ariaProps}
  >
    <div
      className={`
        w-5 h-5 rounded-full transition-all duration-300
        ${enabled ? "bg-primary translate-x-5" : "bg-gray-500 translate-x-0"}
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
    <div>
      <h3 className="text-black text-2xl font-semibold">
        {t("settings.userPermissions.title")}
      </h3>
      <p className="text-black text-xl pb-4 lg:pb-8">
        {t("settings.userPermissions.description")}
      </p>

      <div className="space-y-6 md:ml-12 lg:ml-0">
        {/* Allow memory creation */}
        <div className="flex items-center gap-6">
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
              className="text-xl font-semibold text-black"
            >
              {t("settings.userPermissions.allowMemoryCreation")}
            </h3>

            <p id="allow-memory-hint" className="text-black text-xl md:w-full">
              {t("settings.userPermissions.allowMemoryCreationHint")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPermission;
