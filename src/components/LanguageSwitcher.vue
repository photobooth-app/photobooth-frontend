<template>
  <!-- ...... -->
  <q-icon style="font-size: 24px" name="language"> </q-icon>
  <q-select
    v-model="locale"
    :options="localeOptions"
    label="Language"
    dense
    borderless
    emit-value
    map-options
    options-dense
    style="min-width: 80px"
  />
  <!-- ...... -->
</template>

<script>
import { useI18n } from "vue-i18n";

export default {
  setup() {
    const { locale } = useI18n({ useScope: "global" });

    return {
      locale,
      localeOptions: [
        { value: "en-US", label: "English" },
        { value: "de-DE", label: "German" },
      ],
    };
  },
};
</script>
