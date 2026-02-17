"use client";

import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import BackgroundDesktop from "@/components/ui/backgroundDesktop";
import MemoryCards from "@/components/View/memoryCards";
import MemoryDetailModal from "@/components/View/memoryDetailModal";
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

const View = () => {
  const { t } = useTranslation();
  const { selectedParticipant, setSelectedParticipant } = useParticipant();

  const [selectedMemory, setSelectedMemory] = useState<MemoryCard | null>(null);
  const [memories, setMemories] = useState<MemoryCard[]>([]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasLinkedUsers, setHasLinkedUsers] = useState(true);

  const canCreate = currentProfile?.allow_memory_creation !== false;
  const isModalOpen = Boolean(selectedMemory);

  // 1. Unified Initialization - This ensures a smooth transition
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        // Step 1: Get the current user profile
        const profileData = await getCurrentProfile();
        setCurrentProfile(profileData);

        let targetId = profileData.id;

        // Step 2: Handle Admin vs Participant logic
        if (profileData.role === "admin") {
          const { data: links, error: linkError } = await supabase
            .from("user_admin_links")
            .select("users:user_id (*)")
            .eq("admin_id", profileData.id);

          if (linkError || !links || links.length === 0) {
            setHasLinkedUsers(false);
            setLoading(false);
            return; // Stop here, we know there are no users to fetch memories for
          }

          setHasLinkedUsers(true);
          const activeUser = selectedParticipant || links[0].users;
          
          if (!selectedParticipant) {
            setSelectedParticipant(activeUser);
          }
          targetId = activeUser.id;
        } else {
          // It's a participant
          setHasLinkedUsers(true);
          setSelectedParticipant(profileData);
          targetId = profileData.id;
        }

        // Step 3: Fetch Memories BEFORE ending the loading state
        // This is the key to stopping the "flicker"
        const { data: memoryData } = await supabase
          .from("memories")
          .select("*")
          .eq("user_id", targetId)
          .order("created_at", { ascending: false });

        setMemories(memoryData || []);
      } catch (error) {
        console.error("Error initializing view:", error);
      } finally {
        setLoading(false);
      }
    };

    init();
    // We only depend on setSelectedParticipant to avoid unnecessary re-runs
  }, [setSelectedParticipant]);

  // Stable Fetch Function for manual refreshes (like after a delete)
  const fetchMemories = useCallback(async () => {
    const targetId =
      currentProfile?.role === "admin"
        ? selectedParticipant?.id
        : currentProfile?.id;

    if (!targetId) return;

    const { data, error } = await supabase
      .from("memories")
      .select("*")
      .eq("user_id", targetId)
      .order("created_at", { ascending: false });

    if (!error) {
      setMemories(data || []);
    }
  }, [currentProfile, selectedParticipant]);

  // Loading Screen
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bggreen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {!isModalOpen && <Navbar forceMinimized={false} />}
      {!isModalOpen && <MobileNav />}

      <main
        id="main-content"
        className={`relative flex flex-1 flex-col overflow-x-hidden bg-bggreen ${
          hasLinkedUsers ? "min-h-screen" : "h-screen overflow-y-hidden"
        }`}
      >
        <BackgroundDesktop />
        <div className="absolute inset-0 z-0 bg-white/10 backdrop-blur-md" />

        <div className="relative flex flex-1 flex-col z-10 p-4 lg:pb-20 lg:px-20 animate-in fade-in duration-500">
          <header className="flex shrink-0 flex-col justify-between md:flex-row">
            <div>
              <h1 className="mt-16 mb-2 text-4xl font-fraunces text-primary md:mt-24 lg:mt-40">
                {t("view.title")}
              </h1>
              {currentProfile?.role === "admin" &&
                hasLinkedUsers &&
                selectedParticipant && (
                  <p className="mb-2 italic text-primary/80 md:mb-8">
                    {t("view.showingFor")}{" "}
                    <strong>{selectedParticipant.fullName}</strong>
                  </p>
                )}
            </div>

            {canCreate && memories.length > 0 && (
              <div className="flex justify-end items-start md:items-end">
                <Link
                  to="/create"
                  className="mb-4 button-primary button-sm md:mb-8"
                >
                  + {t("buttons.createMemory")}
                </Link>
              </div>
            )}
          </header>

          {/* Logic Branching */}
          {!hasLinkedUsers ? (
            <section className="flex-1 flex">
              <NoLinkedUser />
            </section>
          ) : memories.length === 0 ? (
            <section className="flex-1 flex">
              <NoMemories />
            </section>
          ) : (
            <MemoryCards
              memories={memories}
              setMemories={setMemories}
              fetchMemories={fetchMemories}
            />
          )}
        </div>
      </main>

      {selectedMemory && (
        <MemoryDetailModal
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
          fetchMemories={fetchMemories}
          setMemories={setMemories}
        />
      )}
    </>
  );
};

export default View;