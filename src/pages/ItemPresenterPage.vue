<template>
  <q-page class="q-pa-none fullscreen">
    <gallery-image-detail
      @close-event="userCloseViewer()"
      :itemRepository="[this.stateStore.last_captured_mediaitem]"
      :indexSelected="0"
      :singleItemView="true"
      :startTimerOnOpen="true"
      class="full-height"
    ></gallery-image-detail>

    <!-- auto-start slideshow after timeout -->
    <RouteAfterTimeout
      v-if="this.uiSettingsStore.uiSettings.TIMEOUT_TO_SLIDESHOW > 0"
      route="/slideshow/gallery"
      :timeout_ms="this.uiSettingsStore.uiSettings.TIMEOUT_TO_SLIDESHOW * 1000"
    ></RouteAfterTimeout>
  </q-page>
</template>

<script>
import { useMainStore } from "../stores/main-store.js";
import { useMediacollectionStore } from "../stores/mediacollection-store.js";
import { useStateStore } from "../stores/state-store.js";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";
import GalleryImageDetail from "../components/GalleryImageDetail";
import RouteAfterTimeout from "src/components/RouteAfterTimeout.vue";
import { remoteProcedureCall } from "boot/axios";

export default {
  // name: 'PageName',
  components: { GalleryImageDetail, RouteAfterTimeout },
  data() {
    return {};
  },
  computed: {},
  setup() {
    const mainStore = useMainStore();
    const mediacollectionStore = useMediacollectionStore();
    const uiSettingsStore = useUiSettingsStore();
    const stateStore = useStateStore();

    return {
      // you can return the whole store instance to use it in the template
      mainStore,
      mediacollectionStore,
      stateStore,
      uiSettingsStore,
      GalleryImageDetail,
      remoteProcedureCall,
    };
  },
  mounted() {},
  beforeUnmount() {},
  methods: {
    userCloseViewer() {
      this.$router.push("/");
    },
  },
};
</script>
