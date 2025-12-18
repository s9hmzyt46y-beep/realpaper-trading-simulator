import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslations from "./locales/en.json";
import ltTranslations from "./locales/lt.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      lt: {
        translation: ltTranslations,
      },
    },
    lng: "en",
    fallbackLng: "en",
    supportedLngs: ["en", "lt"],
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;

