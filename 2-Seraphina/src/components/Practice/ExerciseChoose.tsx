import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Lightbulb } from "@/assets/icons/lightbulb_icon";

interface ExerciseChooseProps {
  exercise: {
    question: string;
    options: string[];
    correct_answer: number;
    hint?: string;
  };
}

const ExerciseChoose = ({ exercise }: ExerciseChooseProps) => {
  const { t } = useTranslation();

  const [selected, setSelected] = useState<number | null>(null);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isCorrect = selected === exercise.correct_answer;
  const correctAnswerString = exercise.options[exercise.correct_answer];

  const handleCheckAnswer = () => {
    setChecked(true);
    setShowHint(false);
  };

  return (
    <section>
      <h3 className="font-fraunces text-4xl lg:text-3xl text-primary font-semibold mb-4">
        {t("exercises.question")} 2
      </h3>

      <div className="bg-bggreen w-full rounded-lg p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setShowHint((prev) => !prev)}
            disabled={checked || !exercise.hint}
            aria-label={t("exercises.showHint")}
            aria-expanded={showHint}
            className="
              flex
              items-center
              gap-2
              text-xl
              text-black
              hover:bg-primary/20
              bg-white
              rounded-full
              p-3
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
              disabled:opacity-40
              duration-500 ease-in-out
            "
          >
            <Lightbulb
              className="w-6 h-6 lg:w-6 lg:h-6 transform -scale-y-100"
              aria-hidden="true"
            />
            {t("exercises.hint")}
          </button>

          <span className="lg:bg-white rounded-full text-xl text-primary px-4 py-1">
            {t("exercises.chooseCorrectAnswer")}
          </span>
        </div>

        {/* Question */}
        <div>
          <h4 className="text-2xl lg:text-3xl font-semibold mb-4">
            {exercise.question}
          </h4>

          {/* Hint (only before checking) */}
          {!checked && showHint && exercise.hint && (
            <div
              role="note"
              aria-live="polite"
              className="mb-6 flex items-start gap-2 rounded-md bg-yellow-50 px-4 py-3"
            >
              <Lightbulb
                className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5 transform -scale-y-100"
                aria-hidden="true"
              />
              <span className="text-yellow-800 text-lg">{exercise.hint}</span>
            </div>
          )}

          {/* Options */}
          <div className="space-y-3">
            {exercise.options.map((option, index) => {
              const isSelected = selected === index;
              const isCorrectOption = index === exercise.correct_answer;

              let optionStyles = "bg-white text-black rounded-sm";

              if (!checked && isSelected) {
                optionStyles = "bg-primary/80 text-white rounded-full";
              }

              if (checked && isCorrectOption) {
                optionStyles =
                  "bg-primary/20 border-2 border-primary/40 text-primary font-bold rounded-full";
              }

              if (checked && isSelected && !isCorrectOption) {
                optionStyles =
                  "border-2 border-red-200 bg-red-100 text-red rounded-full font-bold";
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => !checked && setSelected(index)}
                  disabled={checked}
                  className={`
                    w-full
                    flex
                    items-center
                    gap-4
                    px-5
                    py-4
                    text-left
                    transition
                    ${optionStyles}
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary
                  `}
                >
                  <span
                    className={`
                      h-4
                      w-4
                      rounded-full
                      border-2
                      flex
                      items-center
                      justify-center
                      ${isSelected ? "border-current" : "border-gray-400"}
                    `}
                  >
                    {isSelected && (
                      <span className="h-2.5 w-2.5 rounded-full bg-current" />
                    )}
                  </span>

                  <span className="text-xl font-medium">{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action + feedback */}
        <div className="flex justify-end">
          {!checked && (
            <button
              className="button-primary button-sm"
              onClick={handleCheckAnswer}
              disabled={selected === null}
            >
              {t("exercises.checkAnswer")}
            </button>
          )}

          {checked && (
            <div className="mt-4 w-full">
              <div className="w-full bg-white py-3 px-4 flex flex-col rounded-md gap-2">
                {isCorrect ? (
                  <span className="text-primary text-xl font-medium">
                    {t("exercises.correctFeedback")}
                  </span>
                ) : (
                  <>
                    <span className="text-red text-xl font-semibold">
                      {t("exercises.correctAnswerIs")}
                    </span>
                    <span className="text-black text-lg">
                      <strong>{correctAnswerString}</strong>
                    </span>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ExerciseChoose;
