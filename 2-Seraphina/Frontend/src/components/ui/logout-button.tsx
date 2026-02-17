import { supabase } from "@/supabaseClient";
import { LogoutIcon } from "@/assets/icons/logout_icon";
import { useTranslation } from "react-i18next";
import { useParticipant } from "@/context/practicerContext";

export default function LogoutButton() {
  const { t } = useTranslation();
  const { clearParticipant } = useParticipant();
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    clearParticipant();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    window.location.href = "/login"; 
  };

  return (
    <button
      onClick={handleLogout}
      className="flex flex-row items-center text-2xl gap-2 button-sm button-tertiary z-30 transition-transform duration-300 ease-out"
    >
      <LogoutIcon className="h-5 w-5" />
      <span>{t("buttons.signOut")}</span>
    </button>
  );
}
