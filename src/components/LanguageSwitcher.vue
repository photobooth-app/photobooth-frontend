<template>
  <div class="row">
    <q-select
      v-model="locale"
      :options="localeOptions"
      label="Language"
      emit-value
      map-options
      @update:model-value="(locale) => switchLocale(locale)"
    >
      <template #prepend>
        <q-icon name="language" />
      </template>
    </q-select>
    <q-btn @click="switchLocale('lol-US')">{{ $t('Edit translation') }}</q-btn>
    <q-btn href="https://github.com/photobooth-app/photobooth-app/blob/main/CONTRIBUTING.md#help-translate-the-app" target="_blank">
      {{ $t('Help to translate') }}
    </q-btn>
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
const script = '//cdn.crowdin.com/jipt/jipt.js';

export default {
  setup() {
    const { locale, availableLocales } = useI18n({ useScope: 'global' });
    const languageNames = new Intl.DisplayNames(['en'], {
      type: 'language',
      languageDisplay: 'standard',
    });

    const localeOptions = availableLocales
      .map(function (locale) {
        return { value: locale, label: locale != 'lol-US' ? languageNames.of(locale) : 'Edit translation (Crowdin)' };
      })
      .sort((a, b) => a.label.localeCompare(b.label));

    return {
      locale,
      localeOptions,
    };
  },
  methods: {
    switchLocale(locale) {
      this.locale = locale;
      if (locale == 'lol-US') {
        //in context translation special locale -> load incontext translation
        console.log('enable crowdin in context translation');
        this.enableInContextTranslation();
      } else {
        console.log('disable crowdin in context translation');
        this.disableInContextTranslation();
      }

      localStorage.setItem('locale', locale);

      console.log('Stored locale: ', locale);
    },
    enableInContextTranslation() {
      let el = document.head.querySelector(`[src="${script}"`);
      if (!el) {
        el = document.createElement('script');
        el.setAttribute('src', script);
        el.setAttribute('type', 'text/javascript');
        document.head.appendChild(el);
      }
    },
    disableInContextTranslation() {
      let el = document.head.querySelector(`[src="${script}"`);
      if (el) {
        el.remove();
      }
    },
  },
};
</script>
