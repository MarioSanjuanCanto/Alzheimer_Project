import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "../ui/input";
import { Lightbulb } from "@/assets/icons/lightbulb_icon";

interface ExerciseCompleteProps {
  exercise: {
    question: string;
    correct_answer: string;
    hint?: string;
  };
  userId: string;
}

const ExerciseComplete = ({ exercise, userId }: ExerciseCompleteProps) => {
  const { t } = useTranslation();

  const [answer, setAnswer] = useState("");
  const [checked, setChecked] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isCorrect =
    answer.trim().toLowerCase() ===
    exercise.correct_answer.trim().toLowerCase();

  const handleCheckAnswer = async () => {
    setChecked(true);
    setShowHint(false);

    try {
      await fetch("http://localhost:5001/api/excercise_correction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          exercise_type: "fill_in_the_blank", // This component is for fill_in_the_blank
          resultado: isCorrect ? "succeed" : "fail",
        }),
      });
    } catch (error) {
      console.error("Error updating exercise stats:", error);
    }
  };

  return (
    <section>
      <h3 className="font-fraunces text-4xl lg:text-3xl text-primary font-semibold mb-4">
        {t("exercises.question")} 1
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
            {(t("exercises.hint"))}
          </button>

          <span className="lg:bg-white rounded-full text-xl text-primary px-4 py-1">
            {t("exercises.completeSentence")}
          </span>
        </div>

        {/* Question */}
        <div>
          <h4
            id="exercise-question-1"
            className="text-2xl lg:text-3xl font-semibold mb-4"
          >
            {exercise.question}
          </h4>

          {/* Hint (before checking only) */}
          {!checked && showHint && exercise.hint && (
            <div
              role="note"
              aria-live="polite"
              className="mb-4 flex items-start gap-2 rounded-md bg-yellow-50 px-4 py-3"
            >
              <Lightbulb
                className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5 transform -scale-y-100"
                aria-hidden="true"
              />
              <span className="text-yellow-800 text-lg">
                {exercise.hint}
              </span>
            </div>
          )}

          {/* Input */}
          <Input
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={checked}
            type="text"
            aria-labelledby="exercise-question-1"
            placeholder={t("exercises.enterAnswer")}
            className={`
              w-full
              bg-transparent
              border-0
              border-b
              py-3
              rounded-none
              text-xl
              font-normal
              placeholder-darkgrey
              focus:outline-none
              ${checked && !isCorrect
                ? "border-red focus:border-red text-red"
                : "border-gray-400 focus:border-b-black text-black"
              }
            `}
          />
        </div>

        {/* Action + feedback */}
        <div className="flex justify-end">
          {!checked && (
            <button
              className="button-primary button-sm"
              onClick={handleCheckAnswer}
              disabled={!answer.trim()}
            >
              {t("exercises.checkAnswer")}
            </button>
          )}

          {checked && (
            <div className="mt-4 w-full">
              <div className="w-full bg-white py-3 px-4 flex flex-col rounded-md gap-2">
                {isCorrect ? (
                  <span className="text-green-700 text-xl font-medium">
                    {t("exercises.correctFeedback")}
                  </span>
                ) : (
                  <>
                    <span className="text-red text-xl font-semibold">
                      {t("exercises.correctAnswerIs")}
                    </span>
                    <span className="text-black text-lg">
                      {exercise.correct_answer}
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

export default ExerciseComplete;
