import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import en from "./locales/en/site.json";
import es from "./locales/es/site.json";

i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
});

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    load: "languageOnly",
    fallbackLng: {
      ca: ["es"],
      gl: ["es"],
      eu: ["es"],
      default: ["en"],
    },
    supportedLngs: ["en", "es"],
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"],
      lookupFromPathIndex: 0,
      checkWhitelist: true,
    },
    interpolation: {
      escapeValue: false,
    },
  })
  .then(() => {
    document.documentElement.lang = i18n.language;
  });

export default i18n;
