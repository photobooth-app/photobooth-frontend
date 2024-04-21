<template>
  <q-page class="q-pa-none fullscreen">
    <gallery-image-detail
      :item-repository="[stateStore.last_captured_mediaitem]"
      :index-selected="0"
      :single-item-view="true"
      :start-timer-on-open="true"
      class="full-height"
      @close-event="userCloseViewer()"
    ></gallery-image-detail>
  </q-page>
</template>

<script>
import { useMainStore } from '../stores/main-store.js';
import { useMediacollectionStore } from '../stores/mediacollection-store.js';
import { useStateStore } from '../stores/state-store.js';
import { useUiSettingsStore } from '../stores/ui-settings-store.js';
import GalleryImageDetail from '../components/GalleryImageDetail.vue';
import { remoteProcedureCall } from '../util/fetch_api.js';

export default {
  // name: 'PageName',
  components: { GalleryImageDetail },
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
  data() {
    return {};
  },
  computed: {},
  methods: {
    userCloseViewer() {
      this.$router.push('/');
    },
  },
};
</script>
