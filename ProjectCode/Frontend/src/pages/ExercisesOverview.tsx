"use client";

import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import BackgroundDesktop from "@/components/ui/backgroundDesktop";
import { useTranslation } from "react-i18next";
import { useParticipant } from "@/context/practicerContext";
import { getCurrentProfile } from "@/api/getCurrentProfile";
import NoLinkedUser from "@/components/View/NoUserLinked";
import NoMemories from "@/components/View/NoMemories";

interface MemoryCard {
  id: number;
  image: string;
  title: string;
  description: string;
  audio: string;
  filter: string;
}

const ExercisesOverview = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { selectedParticipant, setSelectedParticipant } = useParticipant();

  const [memories, setMemories] = useState<MemoryCard[]>([]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasLinkedUsers, setHasLinkedUsers] = useState(true);

  // canCreate logic moved into the render or a memo to ensure it uses the latest profile
  const canCreate = currentProfile?.allow_memory_creation !== false;

  const init = useCallback(async () => {
    try {
      setLoading(true);

      // 1. Fetch Profile
      const profileData = await getCurrentProfile();
      setCurrentProfile(profileData);

      let targetId = profileData.id;

      // 2. Handle Admin/Participant logic
      if (profileData.role === "admin") {
        const { data: links } = await supabase
          .from("user_admin_links")
          .select("users:user_id (*)")
          .eq("admin_id", profileData.id);

        if (!links || links.length === 0) {
          setHasLinkedUsers(false);
          setLoading(false);
          return; // Stop here if no users are linked
        }

        setHasLinkedUsers(true);
        const activeUser = selectedParticipant || links[0].users;

        if (!selectedParticipant) {
          setSelectedParticipant(activeUser);
        }
        targetId = activeUser.id;
      } else {
        setHasLinkedUsers(true);
        setSelectedParticipant(profileData);
        targetId = profileData.id;
      }

      // 3. Fetch Memories BEFORE stopping the loading spinner
      const { data: memoryData } = await supabase
        .from("memories")
        .select("*")
        .eq("user_id", targetId)
        .order("created_at", { ascending: false });

      setMemories(memoryData || []);
    } catch (error) {
      console.error("Initialization error:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedParticipant, setSelectedParticipant]);

  useEffect(() => {
    init();
  }, [selectedParticipant?.id]); // Only re-run if the selected ID actually changes

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bggreen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <MobileNav />

      <main
        id="main-content"
        className={`relative flex flex-1 flex-col overflow-x-hidden bg-bggreen ${
          hasLinkedUsers ? "min-h-screen" : "h-screen overflow-y-hidden"
        }`}
      >
        <BackgroundDesktop />
        <div className="absolute inset-0 z-0 bg-white/10 backdrop-blur-md" />

        {/* ANIMATION: 
          - zoom-in-95: Creates a subtle "coming towards you" effect
          - fade-in: Smooth opacity transition
          - duration-700: Slow enough to feel elegant
        */}
        <div className="relative flex flex-1 flex-col z-10 p-4 lg:pb-20 lg:px-20 animate-in fade-in zoom-in-95 duration-700">
          <header className="flex flex-col justify-between md:flex-row shrink-0">
            <div>
              <h1 className="mt-16 mb-2 text-4xl text-primary font-fraunces md:mt-24 lg:mt-40">
                {t("exercisesOverview.title")}
              </h1>

              {currentProfile?.role === "admin" &&
                hasLinkedUsers &&
                selectedParticipant && (
                  <p className="mb-2 italic text-primary/80 md:mb-8">
                    {t("exercisesOverview.exercisesShowingFor")}{" "}
                    <strong>{selectedParticipant.fullName}</strong>
                  </p>
                )}
            </div>

            {canCreate && memories.length > 0 && (
              <div className="flex justify-start md:items-end">
                <Link
                  to="/create"
                  className="mb-4 button-primary button-sm md:mb-8 transition-transform hover:scale-105 active:scale-95"
                >
                  + {t("buttons.createMemory")}
                </Link>
              </div>
            )}
          </header>

          {!hasLinkedUsers ? (
            <section className="flex-1 flex">
              <NoLinkedUser />
            </section>
          ) : memories.length === 0 ? (
            <section className="flex-1 flex">
              <NoMemories />
            </section>
          ) : (
            <section
              aria-labelledby="memories-heading"
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"
            >
              {memories.map((memory, index) => (
                <article
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/practice/${memory.id}`)}
                  key={memory.id}
                  className="w-full h-[15.125rem] lg:max-w-[31.813rem] animate-in fade-in zoom-in-95 duration-500"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="relative w-full h-full group overflow-hidden rounded-xl shadow-md border border-white/20 transition-all duration-300 hover:shadow-xl">
                    {/* Image */}
                    <img
                      src={memory.image}
                      alt=""
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Gradient Overlay - darkened top-right slightly for button visibility */}
                    <div className="absolute inset-0 z-20 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

                    {/* ALWAYS VISIBLE Start Button */}
                    <button
                      type="button"
                      className="absolute right-4 top-4 z-30 button-tertiary button-sm font-semibold shadow-lg backdrop-blur-md border border-white/30 transition-all active:scale-95"
                    >
                      {t("buttons.startExercise")}
                    </button>

                    {/* Title Card */}
                    <h2
                      className="
                        absolute z-30 bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 
                        font-fraunces text-2xl md:text-3xl font-semibold text-primary
                        bg-white/70 backdrop-blur-md
                        px-3 py-2 rounded-sm
                      "
                    >
                      {memory.title}
                    </h2>
                  </div>
                </article>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
};

export default ExercisesOverview;
