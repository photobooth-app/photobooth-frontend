import { createI18n } from "vue-i18n";
import messages from "src/i18n";

export default ({ app }) => {
  // Create I18n instance

  const lastLocale = localStorage.getItem("locale");
  const useLocale = lastLocale ? lastLocale : "en-US";
  if (lastLocale) {
    console.log("Loaded last locale: ", lastLocale);
  } else {
    console.log("No locale found, using default en-US");
  }

  const i18n = createI18n({
    locale: useLocale,
    legacy: false, // comment this out if not using Composition API
    messages,
  });

  // Tell app to use the I18n instance
  app.use(i18n);
};
