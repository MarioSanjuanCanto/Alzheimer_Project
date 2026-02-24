import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

interface RoleSelectionProps {
  selectedRole: "user" | "admin" | null;
  setSelectedRole: (role: "user" | "admin") => void;
  isRoleLocked: boolean;
  nextStep: () => void;
  currentParams: string;
}

export const RoleSelection = ({ 
  selectedRole, 
  setSelectedRole, 
  isRoleLocked, 
  nextStep, 
  currentParams 
}: RoleSelectionProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col h-full flex-1">
      <div>
        <h1 className="font-fraunces text-5xl font-bold text-primary text-center">
          {t("auth.createAccountTitle")}
        </h1>
        <p className="text-darkgrey text-xl font-medium mb-8 text-center">
          {isRoleLocked ? t("auth.inviteDetected") : t("auth.welcomeChooseRole")}
        </p>
      </div>

      <div className="flex flex-col flex-1 justify-center gap-6">
        {(["user", "admin"] as const).map((role) => (
          <button
            key={role}
            type="button"
            disabled={isRoleLocked}
            onClick={() => setSelectedRole(role)}
            className={`flex-1 p-6 rounded-2xl border-2 transition text-center ${
              selectedRole === role
                ? "bg-bggreen border-bggreen"
                : `border-gray-300 ${!isRoleLocked ? "hover:border-primary" : ""}`
            } ${isRoleLocked && selectedRole !== role ? "opacity-40 grayscale cursor-not-allowed" : ""}`}
          >
            <h2 className="text-xl md:text-2xl lg:text-xl font-semibold md:font-medium mb-1">
              {t(`auth.${role === "user" ? "userAccount" : "supporterAccount"}.title`)}
            </h2>
            <p className="text-md md:text-xl font-light text-darkgray">
              {t(`auth.${role === "user" ? "userAccount" : "supporterAccount"}.description`)}
            </p>
          </button>
        ))}
      </div>

      <div className="mt-auto">
        <button
          type="button"
          onClick={nextStep}
          disabled={!selectedRole}
          className="w-full button-primary mt-8 button-sm disabled:opacity-50"
        >
          {t("buttons.continue")}
        </button>
        <p className="flex flex-col md:flex-row gap-2 justify-center text-center text-darkgrey mt-6">
          {t("auth.alreadyHaveAccount")}
          <Link to={`/login?${currentParams}`} className="text-primary underline">
            {t("buttons.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
};