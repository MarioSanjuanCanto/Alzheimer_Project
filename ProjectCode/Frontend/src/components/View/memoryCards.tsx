"use client";
import { useEffect, useState } from "react";
import { Delete } from "@/assets/icons/delete_icon";
import { Edit } from "@/assets/icons/edit_icon";
import { Sound } from "@/assets/icons/sound_icon";
import "react-h5-audio-player/lib/styles.css";
import AudioPlayer from "react-h5-audio-player";
import { useTranslation } from "react-i18next";
import handleDeleteMemory from "@/api/handleDelete";
import { CloseIcon } from "@/assets/icons/close_icon";
import { useNavigate } from "react-router-dom";
import { Arrow } from "@radix-ui/react-tooltip";
import { ArrowRight } from "@/assets/icons/arrow_right_icon";

interface MemoryCard {
  id: number;
  image: string;
  title: string;
  description: string;
  audio: string;
  filter: string;
}

interface MemoryCardsProps {
  memories: MemoryCard[];
  setMemories: React.Dispatch<React.SetStateAction<MemoryCard[]>>;
  fetchMemories: () => void;
}

const MemoryCards = ({
  memories,
  setMemories,
  fetchMemories,
}: MemoryCardsProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [selectedMemory, setSelectedMemory] = useState<MemoryCard | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playAudio, setPlayAudio] = useState(false);

  useEffect(() => {
    if (selectedMemory) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }

    return () => {
      document.body.classList.remove("modal-open");
    };
  }, [selectedMemory]);

  const handleCloseDetails = () => {
    setSelectedMemory(null);
    setPlayAudio(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 px-auto">
      {memories.map((memory) => (
        <button
          type="button"
          onClick={() => setSelectedMemory(memory)}
          className="group relative w-full h-[13rem] md:h-80 lg:aspect-square cursor-pointer overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 animate-in fade-in-50 slide-in-from-right-5 duration-500 text-left"
        >
          <div>
            <img
              src={memory.image}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500"
            />
            <div className="absolute top-4 right-4 flex flex-row gap-2">
              <button
                onClick={() => setShowDeleteModal(true)}
                className="flex flex-row items-center gap-2 py-1 px-2 bg-lightgrey hover:bg-greyhover rounded-full"
              >
                <Delete className="w-5 h-5 text-primary" />
                {t("buttons.delete")}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Change 'memory' to 'selectedMemory'
                  navigate("/create", {
                    state: { memory: selectedMemory },
                  });
                }}
                className="flex flex-row items-center gap-2 py-1 px-2 bg-lightgrey hover:bg-greyhover rounded-full"
              >
                <Edit className="w-5 h-5 text-primary" />
                {t("buttons.edit")}
              </button>
            </div>
          </div>
          <div
            className="absolute flex flex-row gap-2 items-center justify-between z-30 bottom-4 left-4 right-4 md:bottom-8 md:left-8 md:right-8 bg-white/70 backdrop-blur-md
              px-3 py-2 rounded-sm"
          >
            <h2
              className="
              font-fraunces text-2xl md:text-3xl font-semibold text-primary
            "
            >
              {memory.title}
            </h2>
            <div className="font-fraunces text-primary text-3xl font-bold transition-transform duration-100 group-hover:-rotate-45">
              <ArrowRight className="w-8 h-8" />
            </div>
          </div>
        </button>
      ))}

      {/* DETAILS MODAL - SIDE BY SIDE */}
      {selectedMemory && !showDeleteModal && (
        <div
          className="
            fixed inset-0 z-50
            flex items-center justify-center
            bg-black/60 backdrop-blur-md

            animate-in
            fade-in
            duration-200
          "
        >
          <div
            className="
              relative
              bg-white
              w-full
              h-full
              md:max-w-6xl
              md:h-[80vh]
              md:rounded-3xl
              overflow-hidden
              flex
              flex-col
              md:flex-row
              shadow-2xl

              animate-in
              fade-in
              slide-in-from-bottom-4
              zoom-in-95
              duration-500
              ease-out
            "
          >
            {/* Increased z-index to stay above everything in full-screen mode */}
            <button
              onClick={handleCloseDetails}
              className="absolute top-4 right-4 md:top-8 md:right-8 p-1 rounded-full bg-lightgrey flex items-center justify-center hover:bg-greyhover transition"
            >
              <CloseIcon className="text-darkgrey h-5 w-5" />
            </button>

            {/* Left Side: Image */}
            <div className="relative w-full md:w-1/2 h-72 sm:h-96 md:h-auto bg-white flex-shrink-0">
              <img
                src={selectedMemory.image}
                className="w-full h-full object-cover p-4 rounded-3xl"
                alt={selectedMemory.title}
              />
            </div>

            {/* Right Side: Content */}
            <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col overflow-hidden bg-white">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-3xl md:text-4xl font-fraunces text-primary font-bold">
                  {selectedMemory.title}
                </h2>
              </div>

              <div className="flex-grow overflow-y-auto mb-6 pr-2 custom-scrollbar">
                <p className="text-black text-lg leading-relaxed whitespace-pre-wrap">
                  {selectedMemory.description}
                </p>
              </div>

              {/* Audio Controls Section */}
              {playAudio && (
                <div className="bg-lightgrey rounded-sm mb-6 w-full animate-in slide-in-from-left-4 duration-300">
                  <AudioPlayer
                    src={selectedMemory.audio}
                    autoPlay
                    showJumpControls={false}
                    customVolumeControls={[]}
                    customAdditionalControls={[]}
                    style={{
                      boxShadow: "none",
                      background: "transparent",
                      borderRadius: "12px",
                      padding: "8px",
                    }}
                  />
                </div>
              )}

              <div className="border-t pt-6 mt-auto">
                <div className="flex flex-col justify-between sm:flex-row items-center gap-4">
                  <button
                    onClick={() => setPlayAudio(!playAudio)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-all shadow-md w-full sm:w-auto flex-shrink-0"
                  >
                    {playAudio ? (
                      <CloseIcon className="w-5 h-5" />
                    ) : (
                      <Sound className="w-5 h-5" />
                    )}
                    {playAudio
                      ? t("buttons.hideAudio")
                      : t("buttons.playAudio")}
                  </button>

                  <div className="flex gap-1 md:gap-2">
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex flex-row gap-2 items-center py-1 px-2 bg-lightgrey hover:bg-greyhover rounded-full"
                    >
                      <Delete className="w-5 h-5 text-primary" />
                      {t("buttons.delete")}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Change 'memory' to 'selectedMemory'
                        navigate("/create", {
                          state: { memory: selectedMemory },
                        });
                      }}
                      className="flex flex-row items-center gap-2 py-1 px-2 bg-lightgrey hover:bg-greyhover rounded-full"
                    >
                      <Edit className="w-5 h-5 text-primary" />
                      {t("buttons.edit")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60]">
          <div className="bg-white rounded-xl p-4 md:p-8 w-[33.938rem] m-4">
            <h3 className="text-2xl font-semibold text-black">
              {t("deleteMemory.title")}
            </h3>
            <p className="text-black text-xl mb-6">
              {t("deleteMemory.description")}
            </p>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center pt-2 md:pt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="button-sm button-invisible"
              >
                {t("buttons.cancel")}
              </button>
              <button
                className="button-sm button-destructive"
                onClick={async () => {
                  if (!selectedMemory) return;

                  try {
                    await handleDeleteMemory(selectedMemory.id, () => {
                      setMemories((prev) =>
                        prev.filter((m) => m.id !== selectedMemory.id)
                      );
                    });
                  } catch (error) {
                    console.error("Delete failed", error);
                  } finally {
                    setShowDeleteModal(false);
                    setSelectedMemory(null);
                    fetchMemories = { fetchMemories };
                  }
                }}
              >
                {t("buttons.deleteMemory")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemoryCards;
