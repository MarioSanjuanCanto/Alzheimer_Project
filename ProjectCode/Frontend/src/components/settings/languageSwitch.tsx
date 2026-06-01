"use client";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Language } from "@/assets/icons/language_icon";
import { ChevronDown, ChevronUp } from "lucide-react";

const LanguageSwitch = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language || "es";
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
  };

  const isEn = currentLang.startsWith("en");
  const isEs = currentLang.startsWith("es");

  return (
    <div className="w-full flex flex-col gap-1">
      {/* Accordion Toggle Item */}
      <li
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-between text-2xl px-4 py-3 rounded-full cursor-pointer transition-all w-full select-none
          ${isOpen ? "bg-primary/10 text-primary font-semibold" : "hover:bg-lightgrey text-black"}
        `}
      >
        <div className="flex items-center gap-2">
          <Language className="w-7 h-6" />
          <span>{t("settings.sidebar.languages") || "Idiomas"}</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-primary" />
        ) : (
          <ChevronDown className="w-5 h-5 text-darkgrey" />
        )}
      </li>

      {/* Accordion Options */}
      {isOpen && (
        <div className="flex flex-col gap-1.5 pl-6 pr-2 py-2 animate-in slide-in-from-top-2 duration-200">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLanguageChange("en");
            }}
            className={`w-full text-left px-5 py-2 rounded-full text-xl font-medium transition-all ${
              isEn
                ? "bg-primary text-white shadow-sm shadow-primary/20 font-semibold"
                : "text-darkgrey hover:bg-gray-100 hover:text-black"
            }`}
          >
            {t("buttons.english") || "Inglés"}
          </button>
          
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleLanguageChange("es");
            }}
            className={`w-full text-left px-5 py-2 rounded-full text-xl font-medium transition-all ${
              isEs
                ? "bg-primary text-white shadow-sm shadow-primary/20 font-semibold"
                : "text-darkgrey hover:bg-gray-100 hover:text-black"
            }`}
          >
            {t("buttons.spanish") || "Español"}
          </button>
        </div>
      )}
    </div>
  );
};

export default LanguageSwitch;
