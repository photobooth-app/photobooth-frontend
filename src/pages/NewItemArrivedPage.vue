<template>
  <q-page padding full-height full-width>
    <q-linear-progress :value="remainingSecondsNormalized" class="q-mt-md" animation-speed="200" />
    <q-card class="column bg-image" style="width: 100%; height: 100%">
      <q-card-section class="col no-padding" align="center">
        <q-img spinner-color="white" :src="store.gallery.newArrivalItem['preview']"
          style="max-width: 100%; max-height: 100%" fit="contain">
          <div class="absolute-bottom-left text-subtitle2">
            {{ store.gallery.newArrivalItem.caption }}
          </div>
        </q-img>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { useMainStore } from "../stores/main-store.js";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";
import { ref } from "vue";

export default {
  // name: 'PageName',
  components: {},
  data () {
    return {
      intervalId: 0,
      remainingSeconds: 0,
      remainingSecondsNormalized: 0,
    };
  },
  setup () {
    const store = useMainStore();
    const uiSettingsStore = useUiSettingsStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      uiSettingsStore,
    };
  },
  mounted () {
    this.startTimer();
  },
  beforeUnmount () {
    clearInterval(this.intervalId);
  },
  methods: {
    startTimer () {
      var duration =
        this.uiSettingsStore.uiSettings["AUTOCLOSE_NEW_ITEM_ARRIVED"];
      console.log(`starting newitemarrived timer, duration=${duration}`);
      this.remainingSeconds = duration;

      this.intervalId = setInterval(() => {
        this.remainingSecondsNormalized = this.remainingSeconds / duration;

        this.remainingSeconds -= 0.1;

        if (this.remainingSeconds <= 0) {
          clearInterval(this.intervalId);
          this.$router.push({ path: "/" });
        }
      }, 100);
    },
  },
};
</script>
