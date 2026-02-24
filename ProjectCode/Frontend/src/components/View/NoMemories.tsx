"use client";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { Add } from "@/assets/icons/add_icon";

const NoMemories = () => {
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const canCreate = currentProfile?.allow_memory_creation !== false;

  const { t } = useTranslation();
  return (
    <section className="h-full bg-white/70 backdrop-blur-sm flex-1 flex flex-col h-full rounded-3xl text-center p-8 border border-white/50 animate-in zoom-in-95 duration-500">
      <p className="text-primary mb-6">{t("view.noMemoriesYet")}</p>
      {canCreate && (
        <Link
          to="/create"
          className="button-primary button-sm flex flex-row items-center gap-2 w-fit mx-auto"
        >
          <Add className="w-6 h-6" />
          {t("buttons.createMemory")}
        </Link>
      )}
    </section>
  );
};

export default NoMemories;
