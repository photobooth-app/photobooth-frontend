<template>
  <q-page class="q-pa-none column">
    <div id="preview-stream" style="background-image: url('/aquisition/stream.mjpg')"
      class="full-width column justify-center content-center">
      <countdown-timer ref="countdowntimer" :duration="3" :remainingSeconds="countdown"
        :countdownOffset="0.5"></countdown-timer>

      <q-spinner-grid size="20em" v-show="showProcessing" />

      <div v-show="showFrontpage" style="position: absolute; width: 100%; height: 100%" id="frontpage_text"
        v-html="uiSettingsStore.uiSettings['FRONTPAGE_TEXT']"></div>

      <!--
      <q-dialog transition-show="jump-up" transition-hide="jump-down" v-model="showImageDetail" maximized>
        <gallery-image-detail :indexSelected="0" class="full-height"></gallery-image-detail>
      </q-dialog>
    -->
      <q-page-sticky position="bottom" :offset="[0, 25]">
        <div class="q-gutter-sm">
          <q-btn color="primary" no-caps @click="takePicture()">
            <q-icon left size="5em" name="photo_camera" />
            <div>Take<br />Picture!</div>
          </q-btn>
          <q-btn color="primary" no-caps to="/gallery">
            <q-icon left size="5em" name="photo_library" />
            <div>Gallery</div>
          </q-btn>
          <q-btn color="secondary" no-caps to="/admin" v-if="uiSettingsStore.uiSettings.SHOW_ADMIN_LINK_ON_FRONTPAGE">
            <q-icon left size="5em" name="admin_panel_settings" />
            <div>Admin</div>
          </q-btn>
        </div>
      </q-page-sticky>
    </div>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { ref } from "vue";
import { api, remoteProcedureCall } from "boot/axios";
import { useQuasar } from "quasar";
import { useMainStore } from "../stores/main-store.js";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";
import CountdownTimer from "../components/CountdownTimer";

export default defineComponent({
  components: { CountdownTimer },

  setup () {
    const $q = useQuasar();
    const store = useMainStore();
    const uiSettingsStore = useUiSettingsStore();

    return {
      store,
      uiSettingsStore,
      remoteProcedureCall
    };
  },

  methods: {
    takePicture () {
      remoteProcedureCall("/processing/chose/1pic");
    },
  },
  computed: {

    showProcessing: {
      get () {
        return this.store.statemachine.state == "postprocess_still";
      },
    },
    countdown: {
      get () {
        return this.store.statemachine.countdown
          ? this.store.statemachine.countdown
          : 0;
      },
    },
    showFrontpage: {
      get () {
        return this.store.statemachine.state == "idle";
      },
    },
    newItemReceived: {
      get () {
        return this.store.statemachine.state == "idle";
      },
    },
  },
});
</script>
