<template>
  <q-layout view="hHh lpR fFf">
    <q-page-container>
      <router-view />

      <q-page-sticky position="top-left" :offset="[25, 25]">
        <div class="q-gutter-sm">
          <q-btn color="primary" no-caps to="/" class="action-button" :style="uiSettingsStore.uiSettings.gallery_button_style">
            <q-icon left name="arrow_back_ios_new" :style="uiSettingsStore.uiSettings.gallery_button_icon_style" />
            <div v-html="$t('BTN_LABEL_BACK')"></div>
          </q-btn>
        </div>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";

export default defineComponent({
  name: "GalleryLayout",

  components: {},
  computed: {},
  setup() {
    const uiSettingsStore = useUiSettingsStore();
    return {
      uiSettingsStore,
    };
  },
});
</script>
