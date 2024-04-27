import { createI18n } from 'vue-i18n';
import { default as messages } from 'src/i18n';

const incontextLanguageCodeSpecial = 'lol-US';
const script = '//cdn.crowdin.com/jipt/jipt.js';
function enableInContextTranslation() {
  let el = document.head.querySelector(`[src="${script}"`);
  if (!el) {
    el = document.createElement('script');
    el.setAttribute('src', script);
    el.setAttribute('type', 'text/javascript');
    document.head.appendChild(el);
  }
}
function disableInContextTranslation() {
  let el = document.head.querySelector(`[src="${script}"`);
  if (el) {
    el.remove();
    // removing does not exit the incontext translation unfortunately.
    // chose the hard way, just reload the page, next time without translator because locale stored is changed
    location.reload();
  }
}

export default ({ app }) => {
  // Create I18n instance

  const lastLocale = localStorage.getItem('locale');
  const useLocale = lastLocale ? lastLocale : 'en-US';
  if (lastLocale) {
    console.log('Loaded last locale: ', lastLocale);
  } else {
    console.log('No locale found, using default en-US');
  }

  const i18n = createI18n({
    locale: useLocale,
    fallbackLocale: 'en-US',
    legacy: false, // comment this out if not using Composition API
    fallbackWarn: false,
    missingWarn: false,
    messages,
  });

  if (useLocale == 'lol-US') enableInContextTranslation();
  else disableInContextTranslation();

  // Tell app to use the I18n instance
  app.use(i18n);
};
export { enableInContextTranslation, disableInContextTranslation, incontextLanguageCodeSpecial };
