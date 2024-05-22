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
  </div>
</template>

<script>
import { useI18n } from 'vue-i18n';
import { enableInContextTranslation, disableInContextTranslation, incontextLanguageCodeSpecial } from 'boot/i18n';

export default {
  setup() {
    const { locale, availableLocales } = useI18n({ useScope: 'global' });
    const languageNames = new Intl.DisplayNames(['en'], {
      type: 'language',
      languageDisplay: 'standard',
    });

    const localeOptions = availableLocales
      .map(function (locale) {
        return { value: locale, label: locale != incontextLanguageCodeSpecial ? languageNames.of(locale) : 'Edit translation (Crowdin)' };
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
      if (locale == incontextLanguageCodeSpecial) {
        //in context translation special locale -> load incontext translation
        console.log('enable crowdin in context translation');
        enableInContextTranslation();
      } else {
        console.log('disable crowdin in context translation');
        disableInContextTranslation();
      }

      localStorage.setItem('locale', locale);

      console.log('Stored locale: ', locale);
    },
  },
};
</script>
