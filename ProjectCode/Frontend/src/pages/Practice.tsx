import { useTranslation } from "react-i18next";
import ExerciseComplete from "@/components/Practice/ExerciseComplete";
import ExerciseChoose from "@/components/Practice/ExerciseChoose";
import ExerciseClick from "@/components/Practice/ExerciseClick";
import BackgroundDesktop from "@/components/ui/backgroundDesktop";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabaseClient";

const TRANSITION_DURATION = 1800; // ms for progress bar animation between exercises

const Practice = () => {
  const { t } = useTranslation();
  const { memoryId } = useParams<{ memoryId: string }>();
  const navigate = useNavigate();

  const [loadingMemory, setLoadingMemory] = useState(true);
  const [memory, setMemory] = useState<any>(null);
  const [exercises, setExercises] = useState<any[] | null>(null);
  const [loadingExercise, setLoadingExercise] = useState(false);

  // Step-by-step state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [transitioning, setTransitioning] = useState(false);
  const [progressWidth, setProgressWidth] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  useEffect(() => {
    if (!memoryId) return;

    const fetchMemory = async () => {
      setLoadingMemory(true);
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("id", memoryId)
        .single();

      if (!error) setMemory(data);
      setLoadingMemory(false);
    };

    fetchMemory();
  }, [memoryId]);

  useEffect(() => {
    // Check if memory is loaded and prevent duplicate calls if already loading or exercises already exist (even if empty)
    if (loadingMemory || !memory || exercises !== null || loadingExercise) return;

    const generateExercises = async () => {
      setLoadingExercise(true);

      try {
        const res = await fetch(
          "http://localhost:5001/api/generate_exercise",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: memory.user_id,
              title: memory.title,
              user_description: memory.description,
              audio_transcription: memory.audio_transcription,
            }),
          }
        );

        if (!res.ok) throw new Error("API response error");

        const data = await res.json();
        setExercises(data.exercises || []);
      } catch (err) {
        console.error("Failed to generate exercises", err);
        setExercises([]); // Set to empty to avoid infinite loop on error
      } finally {
        setLoadingExercise(false);
      }
    };

    generateExercises();
  }, [memory, exercises, loadingExercise, loadingMemory]);

  const handleNext = useCallback(() => {
    if (!exercises) return;

    const isLast = currentIndex >= exercises.length - 1;

    // Start transition animation
    setTransitioning(true);
    setProgressWidth(0);

    // Kick off the progress bar animation after a tiny delay (to ensure 0% renders first)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setProgressWidth(100);
      });
    });

    setTimeout(() => {
      if (isLast) {
        // Navigate back to exercise overview
        navigate("/exercises-overview");
      } else {
        // Go to next exercise
        setCurrentIndex((prev) => prev + 1);
        setAnswered(false);
        setTransitioning(false);
        setProgressWidth(0);
      }
    }, TRANSITION_DURATION);
  }, [exercises, currentIndex, navigate]);

  const handleAnswered = useCallback(() => {
    setAnswered(true);
    // Auto-advance after showing the answer feedback for a few seconds
    setTimeout(() => {
      handleNext();
    }, 2500); // 2.5 seconds delay before auto-advancing
  }, [handleNext]);

  if (loadingMemory) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bggreen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const currentExercise = exercises?.[currentIndex];
  const totalExercises = exercises?.length ?? 0;
  const isLastExercise = currentIndex >= totalExercises - 1;

  return (
    <main
      id="main-content"
      className="relative min-h-screen w-full overflow-hidden"
    >
      <Navbar />
      <MobileNav />
      {/* Background */}
      <div className="hidden lg:block bg-white">
        <BackgroundDesktop />
      </div>
      {/* Mobile blur overlay */}
      <div className="hidden lg:block absolute inset-0 z-10 bg-white/10 backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-20 flex justify-center">
        <div className={`bg-white lg:rounded-lg w-full ${loadingExercise ? 'h-[70vh] flex flex-col items-center justify-center' : 'py-12 lg:py-16'} lg:mt-36 lg:mb-14 lg:mx-44 px-4 md:px-8 lg:px-16`}>
          <h1 className="sr-only">{t("exercises.title")}</h1>

          {loadingExercise ? (
            <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-700">
              <div className="relative h-24 w-24">
                <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
              </div>
              <div className="text-center space-y-2">
                <h2 className="font-fraunces text-3xl text-primary font-semibold">
                  {t("exercises.generating")}
                </h2>
                <p className="text-primary/60 animate-pulse">
                  {memory?.title}
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Header row: Memory title and progress */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8 border-b border-gray-100 pb-4">
                <span className="text-2xl font-fraunces text-primary font-semibold">
                  {memory?.title}
                </span>

                {totalExercises > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-primary/70">
                      {t("exercises.exerciseProgress", {
                        current: currentIndex + 1,
                        total: totalExercises,
                      })}
                    </span>
                    {/* Mini progress dots */}
                    <div className="flex gap-1.5">
                      {exercises!.map((_, i) => (
                        <div
                          key={i}
                          className={`
                            h-2.5 w-2.5 rounded-full transition-all duration-300
                            ${i < currentIndex
                              ? "bg-primary scale-100"
                              : i === currentIndex
                                ? "bg-primary/70 scale-125 ring-2 ring-primary/30"
                                : "bg-gray-300 scale-100"
                            }
                          `}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Main content grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">

                {/* Left column: Memory image */}
                <div className="lg:col-span-4 w-full h-full flex">
                  {memory && memory.image && (
                    <img
                      src={memory.image}
                      alt={memory.title}
                      className="w-full h-full min-h-[280px] lg:min-h-[340px] object-cover rounded-[2rem] shadow-sm border border-gray-100 cursor-zoom-in transition-transform duration-300 hover:scale-[1.01]"
                      onClick={() => setIsImageModalOpen(true)}
                    />
                  )}
                </div>

                {/* Right column: Transition loader OR Exercise component */}
                <div className="lg:col-span-8 w-full flex flex-col">
                  {transitioning ? (
                    <div className="animate-in fade-in duration-300 py-16 flex flex-col items-center gap-4">
                      {/* Animated message */}
                      <p className="text-xl font-medium text-primary animate-pulse">
                        {isLastExercise
                          ? t("exercises.finishingUp")
                          : t("exercises.loadingNext")}
                      </p>

                      {/* Progress bar */}
                      <div className="w-full max-w-md h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary/70 via-primary to-primary/70 rounded-full"
                          style={{
                            width: `${progressWidth}%`,
                            transition: `width ${TRANSITION_DURATION}ms ease-in-out`,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    exercises && exercises.length > 0 && currentExercise ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Exercise label */}
                        <h4 className="font-fraunces text-2xl text-primary/60 font-medium">
                          {t("exercises.exerciseLabel")}
                        </h4>

                        {/* Render the current exercise */}
                        {currentExercise.type === "fill_in_the_blank" && (
                          <ExerciseComplete
                            key={`fib-${currentIndex}`}
                            index={currentIndex + 1}
                            exercise={currentExercise}
                            userId={memory.user_id}
                            memoryId={memoryId}
                            onAnswered={handleAnswered}
                          />
                        )}
                        {currentExercise.type === "multiple_choice" && (
                          <ExerciseChoose
                            key={`mc-${currentIndex}`}
                            index={currentIndex + 1}
                            exercise={currentExercise}
                            userId={memory.user_id}
                            memoryId={memoryId}
                            onAnswered={handleAnswered}
                          />
                        )}
                        {currentExercise.type === "ordering" && (
                          <ExerciseClick
                            key={`ord-${currentIndex}`}
                            index={currentIndex + 1}
                            exercise={currentExercise}
                            userId={memory.user_id}
                            memoryId={memoryId}
                            onAnswered={handleAnswered}
                          />
                        )}
                      </div>
                    ) : (
                      exercises && exercises.length === 0 && (
                        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                          <p className="text-xl text-primary/70 font-medium">
                            No se han podido generar ejercicios para esta memoria con tu nivel actual.
                          </p>
                          <p className="text-sm text-primary/50 mt-2">
                            Contacta con tu cuidador para revisar el nivel de dificultad.
                          </p>
                        </div>
                      )
                    )
                  )}
                </div>

              </div>
            </>
          )}
        </div>
      </div>
      {/* Image Modal (Lightbox) */}
      {isImageModalOpen && memory && memory.image && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300 cursor-zoom-out"
          onClick={() => setIsImageModalOpen(false)}
        >
          <button
            className="absolute top-6 right-6 text-white text-5xl hover:text-gray-300 transition-colors focus:outline-none"
            onClick={() => setIsImageModalOpen(false)}
            aria-label="Cerrar"
          >
            &times;
          </button>
          <div className="relative max-w-[90vw] max-h-[85vh] p-4 flex items-center justify-center">
            <img
              src={memory.image}
              alt={memory.title}
              className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl border-4 border-white animate-in zoom-in-95 duration-300"
            />
          </div>
        </div>
      )}
    </main>
  );
};

export default Practice;
