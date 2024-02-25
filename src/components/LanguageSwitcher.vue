<template>
  <q-select v-model="locale" :options="localeOptions" label="Language" emit-value map-options @update:model-value="(locale) => storeLocale(locale)">
    <template v-slot:prepend>
      <q-icon name="language" />
    </template>
  </q-select>
</template>

<script>
import { useI18n } from 'vue-i18n';

export default {
  setup() {
    const { locale } = useI18n({ useScope: 'global' });

    return {
      locale,
      localeOptions: [
        { value: 'en-US', label: 'English' },
        { value: 'de-DE', label: 'German' },
      ],
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
