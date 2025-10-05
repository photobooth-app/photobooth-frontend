import { createI18n } from 'vue-i18n'
import { default as messages } from 'src/i18n'
import { usePreferredLanguages } from '@vueuse/core'

const preferredLanguages = usePreferredLanguages()
const incontextLanguageCodeSpecial = 'lol-US'
const i18n = createI18n({
  locale: preferredLanguages.value[0],
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

export default ({ app }) => {
  // Create I18n instance
  console.log(
    `preferred languages configured in the browser: ${preferredLanguages.value},
     using first ${preferredLanguages.value[0]} if available, otherwise fallback to en-US`,
  )

  // Tell app to use the I18n instance
  app.use(i18n)
}
export { enableInContextTranslation, disableInContextTranslation, getLanguageName, preferredLanguages }
