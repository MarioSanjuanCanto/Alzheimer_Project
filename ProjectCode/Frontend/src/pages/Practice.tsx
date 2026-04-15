import { useTranslation } from "react-i18next";
import ExerciseComplete from "@/components/Practice/ExerciseComplete";
import ExerciseChoose from "@/components/Practice/ExerciseChoose";
import ExerciseClick from "@/components/Practice/ExerciseClick";
import BackgroundDesktop from "@/components/ui/backgroundDesktop";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const Practice = () => {
  const { t } = useTranslation();
  const { memoryId } = useParams<{ memoryId: string }>();
  const [loadingMemory, setLoadingMemory] = useState(true);
  const [memory, setMemory] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loadingExercise, setLoadingExercise] = useState(false);

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
    // Check if memory is loaded and prevent duplicate calls if already loading or exercises already exist
    if (loadingMemory || !memory || exercises.length > 0 || loadingExercise) return;

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
            }),
          }
        );

        if (!res.ok) throw new Error("API response error");

        const data = await res.json();
        setExercises(data.exercises || []);
      } catch (err) {
        console.error("Failed to generate exercises", err);
      } finally {
        setLoadingExercise(false);
      }
    };

    generateExercises();
  }, [memory, exercises.length, loadingExercise, loadingMemory]);

  if (loadingMemory) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bggreen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

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
        <div className={`bg-white lg:rounded-lg w-full ${loadingExercise ? 'h-[70vh] flex flex-col items-center justify-center' : 'py-12 lg:py-16'} lg:mt-36 lg:mb-14 lg:mx-44 px-4 md:px-8 lg:px-32`}>
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
              {memory && (
                <h2 className="font-fraunces text-5xl text-primary font-semibold mt-2 mb-8 lg:mb-16">
                  {memory.title}
                </h2>
              )}

              <div className="space-y-12">
                {exercises.map((exercise, index) => {
                  if (exercise.type === "fill_in_the_blank") {
                    return (
                      <ExerciseComplete
                        key={`fib-${index}`}
                        index={index + 1}
                        exercise={exercise}
                        userId={memory.user_id}
                      />
                    );
                  }
                  if (exercise.type === "multiple_choice") {
                    return (
                      <ExerciseChoose
                        key={`mc-${index}`}
                        index={index + 1}
                        exercise={exercise}
                        userId={memory.user_id}
                      />
                    );
                  }
                  if (exercise.type === "ordering") {
                    return (
                      <ExerciseClick
                        key={`ord-${index}`}
                        index={index + 1}
                        exercise={exercise}
                        userId={memory.user_id}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default Practice;
