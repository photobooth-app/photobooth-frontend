<template >
  <q-page class="q-pa-none fullscreen" @click="abortTimer">
    <q-linear-progress :value="remainingSecondsNormalized" animation-speed="200" v-if="displayLinearProgressBar" />

    <!-- latest img is always index 0 -->
    <gallery-image-detail :indexSelected="0" style="height:100%"></gallery-image-detail>


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
    this.startTimer();
  },
  beforeUnmount () {
    clearInterval(this.intervalTimerId);
  },
  methods: {
    abortTimer () {
      clearInterval(this.intervalTimerId);
      this.remainingSeconds = 0
      this.remainingSecondsNormalized = 0
    },
    startTimer () {
      var duration = this.uiSettingsStore.uiSettings["AUTOCLOSE_NEW_ITEM_ARRIVED"];
      console.log(`starting newitemarrived timer, duration=${duration}`);
      this.remainingSeconds = duration;

      this.intervalTimerId = setInterval(() => {
        this.remainingSecondsNormalized = this.remainingSeconds / duration;

        this.remainingSeconds -= 0.05;

        if (this.remainingSeconds <= 0) {
          clearInterval(this.intervalTimerId);
          this.$router.push({ path: "/" });
        }
      }, 50);
    },
  },
};
</script>
