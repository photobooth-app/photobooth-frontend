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
        :messageText="uiSettingsStore.uiSettings.TAKEPIC_MSG_TEXT"
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
            :style="uiSettingsStore.uiSettings.action_button_style"
          >
            <q-icon name="o_photo_camera" :style="uiSettingsStore.uiSettings.action_button_icon_style" />
            <div style="white-space: nowrap" class="gt-sm" v-html="$t('BTN_LABEL_MAINPAGE_TAKE_PHOTO')"></div>
          </q-btn>
          <q-btn
            v-if="uiSettingsStore.uiSettings.show_takecollage_on_frontpage"
            stack
            color="primary"
            no-caps
            @click="takeCollage()"
            class="action-button col-auto"
            :style="uiSettingsStore.uiSettings.action_button_style"
          >
            <q-icon name="o_auto_awesome_mosaic" :style="uiSettingsStore.uiSettings.action_button_icon_style" />
            <div style="white-space: nowrap" class="gt-sm" v-html="$t('BTN_LABEL_MAINPAGE_TAKE_COLLAGE')"></div>
          </q-btn>
          <q-btn
            v-if="uiSettingsStore.uiSettings.show_takeanimation_on_frontpage"
            stack
            color="primary"
            no-caps
            @click="takeAnimation()"
            class="action-button col-auto"
            :style="uiSettingsStore.uiSettings.action_button_style"
          >
            <q-icon name="o_gif_box" :style="uiSettingsStore.uiSettings.action_button_icon_style" />
            <div style="white-space: nowrap" class="gt-sm" v-html="$t('BTN_LABEL_MAINPAGE_TAKE_ANIMATION')"></div>
          </q-btn>

          <q-btn
            v-if="uiSettingsStore.uiSettings.show_takevideo_on_frontpage"
            stack
            color="primary"
            no-caps
            @click="takeVideo()"
            class="action-button col-auto"
            :style="uiSettingsStore.uiSettings.action_button_style"
          >
            <q-icon name="o_movie" :style="uiSettingsStore.uiSettings.action_button_icon_style" />
            <div style="white-space: nowrap" class="gt-sm" v-html="$t('BTN_LABEL_MAINPAGE_TAKE_VIDEO')"></div>
          </q-btn>
        </div>
      </div>
    </q-page-sticky>

    <q-page-sticky position="top-left" :offset="[25, 25]">
      <div v-if="showFrontpage">
        <div class="q-gutter-sm">
          <q-btn
            v-if="uiSettingsStore.uiSettings.show_gallery_on_frontpage"
            color="primary"
            no-caps
            to="/gallery"
            @click="abortTimer()"
            class="action-button"
            id="frontage-gallery-button"
            :style="uiSettingsStore.uiSettings.gallery_button_style"
          >
            <q-icon left name="photo_library" :style="uiSettingsStore.uiSettings.gallery_button_icon_style" />
            <div class="gt-sm" v-html="$t('BTN_LABEL_MAINPAGE_TO_GALLERY')"></div>
          </q-btn>
          <q-btn v-if="uiSettingsStore.uiSettings.show_admin_on_frontpage" color="secondary" no-caps to="/admin" class="action-button">
            <q-icon left name="admin_panel_settings" />
            <div class="gt-sm" v-html="$t('BTN_LABEL_MAINPAGE_TO_ADMIN')"></div>
          </q-btn>
        </div>
      </div>
    </q-page-sticky>

    <!-- video state controls -->
    <q-page-sticky v-if="showRecording" position="top" :offset="[0, 25]" align="center">
      <q-spinner-puff color="red" size="7em" />
      <br />
      <q-btn flat color="red" label="Stop recording (not yet implemented)" />
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
      /* timer stuff */
      intervalTimerId: null,
      remainingSeconds: 0,
      remainingSecondsNormalized: 0,
    };
  },
  mounted() {
    this.startTimer();
  },

  beforeUnmount() {
    this.abortTimer();
  },

  methods: {
    takePicture() {
      this.abortTimer();
      remoteProcedureCall("/processing/chose/1pic");
    },
    takeCollage() {
      this.abortTimer();
      remoteProcedureCall("/processing/chose/collage");
    },
    takeAnimation() {
      this.abortTimer();
      remoteProcedureCall("/processing/chose/animation");
    },
    takeVideo() {
      this.abortTimer();
      remoteProcedureCall("/processing/chose/video");
    },
    abortTimer() {
      clearInterval(this.intervalTimerId);
      this.remainingSeconds = 0;
      this.remainingSecondsNormalized = 0;
    },
    startTimer() {
      var duration = this.uiSettingsStore.uiSettings["TIMEOUT_TO_SLIDESHOW"];
      console.log(`starting newitemarrived timer, duration=${duration}`);
      this.remainingSeconds = duration;

      this.intervalTimerId = setInterval(() => {
        this.remainingSecondsNormalized = this.remainingSeconds / duration;

        this.remainingSeconds -= 0.05;

        if (this.remainingSeconds <= 0) {
          clearInterval(this.intervalTimerId);
          this.$router.push({ path: "/slideshow/gallery" });
        }
      }, 50);
    },
  },
  watch: {},
  computed: {
    showProcessing: {
      get() {
        const capturesCompleted = this.stateStore.state == "captures_completed";
        const capture = this.stateStore.state == "capture";
        return capturesCompleted || capture;
      },
    },
    showRecording: {
      get() {
        return this.stateStore.state == "record";
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
        const machineRecord = this.stateStore.state == "record";
        const machineCounting = this.stateStore.state == "counting";

        return enabled && (machineIdle || machineCounting || machineRecord);
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
