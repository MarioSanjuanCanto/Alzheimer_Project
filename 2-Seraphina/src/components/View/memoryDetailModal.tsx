"use client";
import { useState } from "react";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import handleDeleteMemory from "@/api/handleDelete";
import { CloseIcon } from "@/assets/icons/close_icon";
import { Delete } from "@/assets/icons/delete_icon";

interface MemoryCard {
  id: number;
  image: string;
  title: string;
  description: string;
  audio: string;
}

interface Props {
  memory: MemoryCard;
  onClose: () => void;
  setMemories: React.Dispatch<React.SetStateAction<MemoryCard[]>>;
}

const MemoryDetailModal = ({ memory, onClose, setMemories }: Props) => {
  const [playAudio, setPlayAudio] = useState(false);

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center">
      <div className="relative bg-white w-full h-full md:max-w-6xl md:h-[80vh] md:rounded-3xl overflow-hidden flex">

        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-50 bg-lightgrey p-2 rounded-full"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <div className="w-1/2 hidden md:block">
          <img
            src={memory.image}
            className="w-full h-full object-cover"
            alt={memory.title}
          />
        </div>

        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <h2 className="text-4xl font-bold text-primary mb-4">
            {memory.title}
          </h2>

          <p className="flex-grow overflow-y-auto mb-6">
            {memory.description}
          </p>

          <button
            onClick={() => setPlayAudio(!playAudio)}
            className="button-primary mb-4"
          >
            {playAudio ? "Stop Audio" : "Listen"}
          </button>

          {playAudio && <AudioPlayer src={memory.audio} autoPlay />}

          <button
            onClick={async () => {
              await handleDeleteMemory(memory.id, () => {
                setMemories((prev) => prev.filter((m) => m.id !== memory.id));
                onClose();
              });
            }}
            className="flex items-center gap-2 text-red mt-6"
          >
            <Delete /> Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemoryDetailModal;
