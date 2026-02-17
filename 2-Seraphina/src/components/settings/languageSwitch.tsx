("use client");
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Language } from "@/assets/icons/language_icon";

function languageSwitch() {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);
  const [openUpwards, setOpenUpwards] = useState(false);
  const handleMouseEnter = () => {
    if (!containerRef.current || !dropdownRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - containerRect.bottom;

    setOpenUpwards(spaceBelow < dropdownHeight + 16);
  };
  return (
    <div>
      <li
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        className="relative group text-2xl px-4 py-3 cursor-pointer flex items-center gap-2 rounded-full hover:bg-lightgrey"
      >
        <Language className="w-7 h-6" />
        {t("settings.sidebar.languages")}

        <div
          ref={dropdownRef}
          className={`w-full absolute hidden group-hover:flex flex-col gap-3 border border-lightgrey rounded-2xl p-4 bg-white z-20 left-1/2 -translate-x-1/2 ${openUpwards ? "bottom-full mb-2" : "top-full mt-1"}`}
        >
          <div
            onClick={(e) => {
              e.stopPropagation();
              i18n.changeLanguage("en");
            }}
            className={`px-4 py-2 rounded-full cursor-pointer ${
              currentLang === "en"
                ? "bg-primary/15 text-primary font-semibold"
                : "hover:bg-lightgrey"
            }`}
          >
            {t("buttons.english")}
          </div>

          <div
            onClick={(e) => {
              e.stopPropagation();
              i18n.changeLanguage("es");
            }}
            className={`px-4 py-2 rounded-full cursor-pointer ${
              currentLang === "es"
                ? "bg-primary/15 text-primary font-semibold"
                : "hover:bg-lightgrey"
            }`}
          >
            {t("buttons.spanish")}
          </div>
        </div>
      </li>
    </div>
  );
}

export default languageSwitch;
