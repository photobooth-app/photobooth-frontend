<template>
  <q-page class="q-pa-none column full-height">
    <!-- lowest layer: preview stream -->

    <div
      v-if="showPreview"
      id="preview-stream"
      style="background-image: url(&quot;/aquisition/stream.mjpg&quot;)"
      class="full-width column justify-center content-center"
      :class="{ mirroreffect: livestreamMirror }"
    ></div>

    <!-- layer display processing spinner grid to show user computer working hard -->
    <div class="full-height full-width column justify-center content-center" style="position: absolute" v-if="showProcessing">
      <q-spinner-grid size="20em" />
    </div>

    <!-- layer display the countdown timer -->
    <div class="full-height full-width column justify-center content-center" style="position: absolute" v-if="showCountdownCounting">
      <countdown-timer
        ref="countdowntimer"
        :duration="this.stateStore.duration"
        :messageDuration="uiSettingsStore.uiSettings.TAKEPIC_MSG_TIME"
      ></countdown-timer>
    </div>

    <!-- layer display the front page text -->
    <div v-if="showFrontpage" id="frontpage_text" v-html="uiSettingsStore.uiSettings['FRONTPAGE_TEXT']"></div>

    <q-page-sticky position="bottom" :offset="[0, 25]">
      <div v-if="showFrontpage">
        <div class="row q-gutter-sm">
          <q-btn
            v-if="uiSettingsStore.uiSettings.show_takepic_on_frontpage"
            stack
            color="primary"
            no-caps
            @click="takePicture(/**/)"
            class="action-button col-auto"
          >
            <q-icon name="photo_camera" />
            <div style="white-space: nowrap" class="gt-sm">Take a Picture!</div>
          </q-btn>
          <q-btn
            v-if="uiSettingsStore.uiSettings.show_takecollage_on_frontpage"
            stack
            color="primary"
            no-caps
            @click="takeCollage()"
            class="action-button col-auto"
          >
            <q-icon name="auto_awesome_mosaic" />
            <div style="white-space: nowrap" class="gt-sm">Create Collage!</div>
          </q-btn>
          <q-btn
            v-if="uiSettingsStore.uiSettings.show_takeanimation_on_frontpage"
            stack
            color="primary"
            no-caps
            @click="takeAnimation()"
            class="action-button col-auto"
          >
            <q-icon name="gif_box" />
            <div style="white-space: nowrap" class="gt-sm">Create Animation!</div>
          </q-btn>
        </div>
      </div>
    </q-page-sticky>

    <q-page-sticky position="top-left" :offset="[25, 25]">
      <div v-if="showFrontpage">
        <div class="q-gutter-sm">
          <q-btn v-if="uiSettingsStore.uiSettings.show_gallery_on_frontpage" color="primary" no-caps to="/gallery" class="action-button">
            <q-icon left name="photo_library" />
            <div class="gt-sm">Gallery</div>
          </q-btn>
          <q-btn v-if="uiSettingsStore.uiSettings.show_admin_on_frontpage" color="secondary" no-caps to="/admin" class="action-button">
            <q-icon left name="admin_panel_settings" />
            <div class="gt-sm">Admin</div>
          </q-btn>
        </div>
      </div>
    </q-page-sticky>
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

  setup() {
    const $q = useQuasar();
    const store = useMainStore();
    const stateStore = useStateStore();
    const uiSettingsStore = useUiSettingsStore();

    return {
      store,
      stateStore,
      uiSettingsStore,
      remoteProcedureCall,
    };
  },

  methods: {
    takePicture() {
      remoteProcedureCall("/processing/chose/1pic");
    },
    takeCollage() {
      remoteProcedureCall("/processing/chose/collage");
    },
    takeAnimation() {
      remoteProcedureCall("/processing/chose/animation");
    },
  },
  watch: {},
  computed: {
    showProcessing: {
      get() {
        return this.stateStore.state == "captures_completed";
      },
    },
    livestreamMirror: {
      get() {
        return this.uiSettingsStore.uiSettings.livestream_mirror_effect;
      },
    },

    showCountdownCounting: {
      get() {
        const machineCounting = this.stateStore.state == "counting";

        return this.stateStore.duration > 0 && machineCounting;
      },
    },
    showPreview: {
      get() {
        const enabled = true;
        const machineIdle = this.stateStore.state == "idle";
        const machineCounting = this.stateStore.state == "counting";

        return enabled && (machineIdle || machineCounting);
      },
    },
    showFrontpage: {
      get() {
        return this.stateStore.state == "idle";
      },
    },
  },
});
</script>
