import { useState } from "react";
import { Delete } from "@/assets/icons/delete_icon";
import { Edit } from "@/assets/icons/edit_icon";
import { Sound } from "@/assets/icons/sound_icon";
import "react-h5-audio-player/lib/styles.css";
import { useTranslation } from "react-i18next";

interface MemoryCard {
  id: number;
  image: string;
  title: string;
  description: string;
  audio: string;
  filter: string;
}

const MemoryCardsMobile = () => {
  const { t } = useTranslation();
  const [selectedMemory, setSelectedMemory] = useState<MemoryCard | null>(null);

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden">
      <img
        src={selectedMemory.image}
        alt={selectedMemory.title}
        className="w-full h-64 object-cover"
      />
      <div className="flex-1 p-6 overflow-y-auto">
        <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
          {selectedMemory.title}
        </h2>
        <p className="text-gray-700 mb-6">
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. In eum nihil
          sapiente aut voluptatem quam consequatur, tenetur officia pariatur
          nam?
        </p>
        <div className="absolute bottom-4 flex flex-row justify-between items-center pt-4 border-t border-gray-200">
          <div className="flex flex-row gap-6">
            <div className="flex flex-col items-center transition-transform duration-300 hover:scale-110 cursor-pointer">
              <Delete className="text-primary hover:text-red-500 transition-colors w-8 h-8" />
              <span className="text-primary text-sm mt-1">Delete</span>
            </div>
            <div className="flex flex-col items-center transition-transform duration-300 hover:scale-110 cursor-pointer">
              <Edit className="text-primary w-8 h-8 hover:text-orange-500 transition-colors" />
              <span className="text-sm text-primary mt-1">Edit</span>
            </div>
          </div>
          <div className="flex flex-col items-center transition-transform duration-300 hover:scale-110 cursor-pointer">
            <Sound className="text-primary hover:text-primary/70 transition-colors w-8 h-8" />
            <span className="text-sm text-primary mt-1">Audio</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryCardsMobile;
function setSelectedMemory(memory: MemoryCard) {
  throw new Error("Function not implemented.");
}
