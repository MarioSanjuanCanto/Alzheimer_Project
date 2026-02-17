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
  const [memory, setMemory] = useState<any>(null);
  const [exercises, setExercises] = useState<any[]>([]);
  const [loadingExercise, setLoadingExercise] = useState(false);

  useEffect(() => {
    if (!memoryId) return;

    const fetchMemory = async () => {
      const { data, error } = await supabase
        .from("memories")
        .select("*")
        .eq("id", memoryId)
        .single();

      if (!error) setMemory(data);
    };

    fetchMemory();
  }, [memoryId]);

  useEffect(() => {
    if (!memory) return;

    const generateExercises = async () => {
      setLoadingExercise(true);

      try {
        const types = ["fill_in_the_blank", "multiple_choice", "ordering"];

        const results = await Promise.all(
          types.map(async (type) => {
            const res = await fetch(
              "http://localhost:5001/api/generate_exercise",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  title: memory.title,
                  user_description: memory.description,
                  exercise_type: type,
                }),
              }
            );

            const data = await res.json();
            return data.exercises[0];
          })
        );

        setExercises(results);
      } catch (err) {
        console.error("Failed to generate exercises", err);
      } finally {
        setLoadingExercise(false);
      }
    };

    generateExercises();
  }, [memory]);

  const completeExercise = exercises.find(
    (e) => e.type === "fill_in_the_blank"
  );

  const chooseExercise = exercises.find((e) => e.type === "multiple_choice");

  const clickExercise = exercises.find((e) => e.type === "ordering");

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
        <div className="bg-white lg:rounded-lg w-full py-12 lg:mt-36 lg:mb-14 lg:mx-44 px-4 md:px-8 lg:px-32 lg:py-16">
          <h1 className="sr-only">{t("exercises.title")}</h1>
          {memory && (
            <h2 className="font-fraunces text-5xl text-primary font-semibold mt-2 mb-8 lg:mb-16">
              {memory.title}
            </h2>
          )}
          

          <div className="space-y-12">
            {completeExercise && <ExerciseComplete exercise={completeExercise} /> }

            {chooseExercise && <ExerciseChoose exercise={chooseExercise} />}

            {clickExercise && <ExerciseClick exercise={clickExercise} />}
          </div>
        </div>
      </div>
    </main>
  );
};

export default Practice;
