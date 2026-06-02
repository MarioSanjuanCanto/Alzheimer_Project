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
  isSubmitting?: boolean;
  isProcessingAudio?: boolean;
  recording?: boolean;
}

export const FormNavigation = ({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onSubmit,
  isSubmitting = false,
  isProcessingAudio = false,
  recording = false,
}: FormNavigationProps) => {
  const isLastStep = currentStep === totalSteps;
  const { t } = useTranslation();
  const isSubmitDisabled = isLastStep && (isSubmitting || isProcessingAudio || recording);
  const submitLabel = isSubmitting
    ? t("buttons.submitting")
    : isProcessingAudio
      ? t("create.fields.processingAudio")
      : t("buttons.createMemory");

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
        disabled={isSubmitDisabled}
        aria-busy={isLastStep && (isSubmitting || isProcessingAudio)}
        className="w-1/2 button-sm button-primary disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLastStep ? submitLabel : t("buttons.continue")}
      </button>
    </div>
  );
};
