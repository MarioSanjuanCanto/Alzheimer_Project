import { Lightbulb } from "@/assets/icons/lightbulb_icon";
import { useState } from "react";
import { useTranslation } from "react-i18next";

interface ExerciseClickProps {
  exercise: {
    question: string;
    options: string[];
    correct_answer: string[];
    hint?: string;
  };
}

const ExerciseClick = ({ exercise }: ExerciseClickProps) => {
  const { t } = useTranslation();

  const items = exercise.options;
  const [selected, setSelected] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isCorrect =
    JSON.stringify(selected) === JSON.stringify(exercise.correct_answer);

  const addItem = (item: string) => {
    if (checked) return;
    if (selected.includes(item)) return;
    setSelected([...selected, item]);
  };

  const removeItem = (item: string) => {
    if (checked) return;
    setSelected(selected.filter((i) => i !== item));
  };

  const handleCheckAnswer = () => {
    setChecked(true);
    setShowHint(false); // hide hint once answer is checked
  };

  return (
    <section>
      <h3 className="font-fraunces text-4xl lg:text-3xl text-primary font-semibold mb-4">
        {t("exercises.question")} 3
      </h3>

      <div className="bg-bggreen w-full rounded-lg p-4 md:p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
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

          <span className="lg:bg-white rounded-full text-xl text-primary lg:px-4 lg:py-1 ml-auto align-right">
            {t("exercises.orderEvents")}
          </span>
        </div>

        {/* Question */}
        <div>
          <h4 className="text-2xl lg:text-3xl font-semibold mb-2">
            {exercise.question}
          </h4>

          <p className="text-xl text-darkgrey mb-6">
            {t("exercises.orderEventsHint")}
          </p>

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

          <div className="space-y-4">
            {/* Options */}
            <div className="flex flex-wrap gap-3">
              {items.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => addItem(item)}
                  disabled={selected.includes(item) || checked}
                  className="
                    rounded-full
                    bg-primary/80
                    px-5
                    py-2
                    text-white
                    text-xl
                    transition
                    disabled:opacity-40
                    focus:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary
                  "
                >
                  {item}
                </button>
              ))}
            </div>

            {/* Drop area */}
            <div
              className={`
                min-h-16
                rounded-xl
                border-2
                border-dashed
                ${
                  !checked
                    ? "border-gray-400"
                    : isCorrect
                      ? "border-gray-400"
                      : "border-red-600"
                }
                p-3
                flex
                flex-wrap
                gap-3
                bg-white
              `}
            >
              {selected.map((item, index) => {
                const isItemCorrect =
                  checked && exercise.correct_answer[index] === item;

                return (
                  <div
                    key={`${item}-${index}`}
                    className={`
                      flex
                      items-center
                      gap-2
                      rounded-full
                      px-4
                      py-2
                      text-xl
                      font-medium
                      ${
                        !checked
                          ? "bg-primary text-white"
                          : isItemCorrect
                            ? "bg-primary text-white"
                            : "border-2 border-red-200 bg-red-100 text-red"
                      }
                    `}
                  >
                    {item}
                    <button
                      type="button"
                      onClick={() => removeItem(item)}
                      disabled={checked}
                      aria-label={t("exercises.removeItem")}
                      className={`
                        text-2xl
                        font-medium
                        leading-none
                        focus:outline-none
                        ${
                          !checked
                            ? "text-white"
                            : isItemCorrect
                              ? "text-white"
                              : "text-red"
                        }
                      `}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action + feedback */}
        <div className="flex justify-end">
          {!checked && (
            <button
              className="button-primary button-sm"
              onClick={handleCheckAnswer}
              disabled={selected.length !== exercise.options.length}
            >
              {t("exercises.checkAnswer")}
            </button>
          )}

          {checked && (
            <div className="mt-4 w-full">
              <div className="bg-white py-3 px-4 flex flex-col rounded-md gap-2">
                {isCorrect ? (
                  <span className="text-primary text-xl font-medium">
                    {t("exercises.correctFeedback")}
                  </span>
                ) : (
                  <>
                    <span className="text-red text-xl font-semibold">
                      {t("exercises.correctAnswerIs")}
                    </span>
                    <span className="text-black">
                      <strong>{exercise.correct_answer.join(" → ")}</strong>
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

export default ExerciseClick;
