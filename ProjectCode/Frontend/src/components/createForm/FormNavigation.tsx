import { ChevronLeft } from "@/assets/icons/chevron_left_icon";
import { ChevronRight } from "@/assets/icons/chevron_right_icon";
import { ArrowRight } from "@/assets/icons/arrow_right_icon";
import { useTranslation } from "react-i18next";

interface FormNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export const FormNavigation = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
}: FormNavigationProps) => {
  const isLastStep = currentStep === totalSteps;
  const { t } = useTranslation();

  return (
    <div
      className={`flex mt-4 gap-2 ${
        currentStep === 1 ? "justify-end" : "justify-between"
      }`}
    >
      {currentStep !== 1 && (
        <button
          type="button"
          onClick={onBack}
          className={"w-1/2 button-sm button-invisible bg-lightgrey lg:bg-none"}
        >
          {t("buttons.back")}
        </button>
      )}

      <button
        type="button"
        onClick={isLastStep ? onSubmit : onNext}
          className="w-1/2 button-sm button-primary"
      >
        {isLastStep ? t("buttons.createMemory") : t("buttons.continue")}
      </button>
    </div>
  );
};

