<template >
  <q-page class="q-pa-none fullscreen">

    <gallery-image-detail @close-event="$router.push('/')" :itemRepository="this.mediacollectionStore.collection"
      :indexSelected="0" :singleItemView="true" :startTimerOnOpen="true" class="full-height"></gallery-image-detail>
  </q-page>
</template>


<script>
import { useMediacollectionStore } from "../stores/mediacollection-store.js";
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
  computed: {


  },
  setup () {
    const mediacollectionStore = useMediacollectionStore();
    const uiSettingsStore = useUiSettingsStore();

    return {
      // you can return the whole store instance to use it in the template
      mediacollectionStore,
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
