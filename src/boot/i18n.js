import { createI18n } from 'vue-i18n'
import { default as messages } from 'src/i18n'
import { usePreferredLanguages } from '@vueuse/core'

const preferredLanguages = usePreferredLanguages()
const incontextLanguageCodeSpecial = 'lol-US'
const i18n = createI18n({
  locale: resolvePreferredLocale(preferredLanguages.value[0]),
  fallbackLocale: 'en-US',
  legacy: false, // comment this out if not using Composition API
  fallbackWarn: false,
  missingWarn: false,
  messages,
})

const script = '//cdn.crowdin.com/jipt/jipt.js'
function enableInContextTranslation() {
  console.log('enable crowdin in context translation')

  const { locale } = i18n.global
  locale.value = incontextLanguageCodeSpecial

  let el = document.head.querySelector(`[src="${script}"`)
  if (!el) {
    el = document.createElement('script')
    el.setAttribute('src', script)
    el.setAttribute('type', 'text/javascript')
    document.head.appendChild(el)
  }
}
function disableInContextTranslation() {
  let el = document.head.querySelector(`[src="${script}"`)
  if (el) {
    el.remove()
    // removing does not exit the incontext translation unfortunately.
    // chose the hard way, just reload the page, next time without translator because locale stored is changed
    location.reload()
  }
}

const getLanguageName = (locale) => {
  const localeName = new Intl.DisplayNames([locale], { type: 'language', languageDisplay: 'standard' })
  return localeName.of(locale)
}
function resolvePreferredLocale(preferredLocale) {
  // exact match avail?
  if (Object.keys(messages).includes(preferredLocale)) return preferredLocale

  // if no exact match, maybe at least the base lang is avail?
  const baseLang = preferredLocale.split('-')[0]
  const fallbackLang = Object.keys(messages).find((key) => key.startsWith(baseLang))
  if (fallbackLang) return fallbackLang

  return 'en-US' // final fallback
}

export default ({ app }) => {
  console.log(
    `preferred languages configured in the browser: ${preferredLanguages.value},
     best match for ${preferredLanguages.value[0]} found is ${i18n.global.locale.value}, otherwise fallback to en-US`,
  )

  // Tell app to use the I18n instance
  app.use(i18n)
}
export { enableInContextTranslation, disableInContextTranslation, getLanguageName, preferredLanguages }
