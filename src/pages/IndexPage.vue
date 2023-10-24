<template>
  <q-page class="q-pa-none column full-height">
    <div class="full-height full-width column justify-center content-center" style="position: absolute;"
      v-if="showProcessing">
      <q-spinner-grid size="20em" />
    </div>

    <div v-if="showPreview" id="preview-stream" style="background-image: url('/aquisition/stream.mjpg')"
      class="full-width column justify-center content-center">
      <countdown-timer v-if="showCountdownCounting" ref="countdowntimer" :duration="this.stateStore.duration"
        :messageDuration="uiSettingsStore.uiSettings.TAKEPIC_MSG_TIME"></countdown-timer>


      <div v-if="showFrontpage" id="frontpage_text" v-html="uiSettingsStore.uiSettings['FRONTPAGE_TEXT']"></div>

      <q-page-sticky position="bottom" :offset="[0, 25]">
        <div v-if="showFrontpage">
          <div class="q-gutter-sm">
            <q-btn v-if="uiSettingsStore.uiSettings.show_takepic_on_frontpage" color="primary" no-caps
              @click="takePicture()" class="action-button">
              <q-icon left name="photo_camera" />
              <div>Take<br />Picture!</div>
            </q-btn>
            <q-btn v-if="uiSettingsStore.uiSettings.show_collage_on_frontpage" color="primary" no-caps
              @click="takeCollage()" class="action-button">
              <q-icon left name="auto_awesome_mosaic" />
              <div>Create<br />Collage!</div>
            </q-btn>
            <q-btn v-if="uiSettingsStore.uiSettings.show_gallery_on_frontpage" color="primary" no-caps to="/gallery"
              class="action-button">
              <q-icon left name="photo_library" />
              <div>Gallery</div>
            </q-btn>
            <q-btn v-if="uiSettingsStore.uiSettings.show_admin_on_frontpage" color="secondary" no-caps to="/admin"
              class="action-button">
              <q-icon left name="admin_panel_settings" />
              <div>Admin</div>
            </q-btn>
          </div>
        </div>
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { remoteProcedureCall } from "boot/axios";
import { useQuasar } from "quasar";
import { useMainStore } from "../stores/main-store.js";
import { useStateStore } from "../stores/state-store.js";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";
import CountdownTimer from "../components/CountdownTimer";

export default defineComponent({
  components: { CountdownTimer },

  setup () {
    const $q = useQuasar();
    const store = useMainStore();
    const stateStore = useStateStore();
    const uiSettingsStore = useUiSettingsStore();


    return {
      store,
      stateStore,
      uiSettingsStore,
      remoteProcedureCall
    };
  },

  methods: {
    takePicture () {
      remoteProcedureCall("/processing/chose/1pic");
    },
    takeCollage () {
      remoteProcedureCall("/processing/chose/collage");

    },
  },
  watch: {

  },
  computed: {

    showProcessing: {
      get () {
        return this.stateStore.state == "job_postprocess";
      },
    },

    showCountdownCounting: {
      get () {
        const machineCounting = this.stateStore.state == "counting"

        return this.stateStore.duration > 0 && (machineCounting);
      },
    },
    showPreview: {
      get () {
        const enabled = true
        const machineIdle = this.stateStore.state == "idle"
        const machineCounting = this.stateStore.state == "counting"

        return enabled && (machineIdle || machineCounting);
      },
    },
    showFrontpage: {
      get () {
        return this.stateStore.state == "idle";
      },
    },
  },
});
</script>
