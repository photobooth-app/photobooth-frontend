<template >
  <q-page class="q-pa-none fullscreen">

    <gallery-image-detail @close-event="$router.go(-1)" :itemRepository="[this.store.gallery.newArrivalItem]"
      :indexSelected="0" :startTimerOnOpen="true" class="full-height"></gallery-image-detail>


  </q-page>
</template>


<script>
import { useMainStore } from "../stores/main-store.js";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";
import { ref } from "vue";
import GalleryImageDetail from "../components/GalleryImageDetail";

export default {
  // name: 'PageName',
  components: { GalleryImageDetail },
  data () {
    return {
      intervalTimerId: null,
      remainingSeconds: 0,
      remainingSecondsNormalized: 0,
      displayLinearProgressBar: true,
      showImageDetail: true
    };
  },
  setup () {
    const store = useMainStore();
    const uiSettingsStore = useUiSettingsStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      uiSettingsStore,
      GalleryImageDetail,
    };
  },
  mounted () {
  },
  beforeUnmount () {
  },
  methods: {

  },
};
</script>
