import { CheckIcon } from "@/assets/icons/check_icon";
import { cn } from "@/lib/utils";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export const StepIndicator = ({ currentStep, totalSteps }: StepIndicatorProps) => {
  return (
    <div className="flex justify-center">
      <div className="flex items-center">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step, index) => {
          const isCompleted = step < currentStep;
          const isCurrent = step === currentStep;

          return (
            <div key={step} className="flex items-center">
              {/* Circle */}
              <div
                className={cn(
                  "w-12 h-12 md:w-[3.75rem] md:h-[3.75rem] lg:w-12 lg:h-12 text-xl md:text-3xl lg:text-xl rounded-full flex items-center justify-center font-semibold border-2 z-10",
                  isCompleted && "bg-primary border-primary text-white",
                  isCurrent && "bg-primary border-primary text-white",
                  !isCompleted && !isCurrent && "bg-transparent border-primary/50 text-primary/50"
                )}
              >
                {isCompleted ? <CheckIcon className="w-6 h-6" /> : step}
              </div>

              {/* Line BETWEEN circles */}
              {index !== totalSteps - 1 && (
                <div
                  className={cn(
                    "h-[3px] md:h-[5px] w-12 md:w-16 lg:h-[3px] lg:w-12",
                    isCompleted ? "bg-primary" : "bg-primary/30"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
