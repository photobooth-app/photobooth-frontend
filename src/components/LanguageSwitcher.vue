<template>
  <q-select v-model="locale" :options="localeOptions" label="Language" emit-value map-options @update:model-value="(locale) => storeLocale(locale)">
    <template #prepend>
      <q-icon name="language" />
    </template>
  </q-select>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const { locale, availableLocales } = useI18n({ useScope: 'global' });
    const languageNames = new Intl.DisplayNames(['en'], {
      type: 'language',
      languageDisplay: 'standard',
    });

    const localeOptions = availableLocales.map(function (locale) {
      return { value: locale, label: languageNames.of(locale) };
    });

    return {
      locale,
      localeOptions,
    };
  },
  methods: {
    storeLocale(locale) {
      localStorage.setItem('locale', locale);
      console.log('Stored locale: ', locale);
    },
  },
};
</script>
