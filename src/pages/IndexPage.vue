<template>
  <q-page id="index-page" class="q-pa-none column full-height">
    <!-- lowest layer: preview stream -->

    <div id="preview-stream-wrapper" :class="{ mirroreffect: livestreamMirror }">
      <div
        v-if="showPreview"
        id="preview-stream"
        style="background-image: url('/api/aquisition/stream.mjpg')"
        class="full-width column justify-center content-center"
        :class="{ countdowncounting: showCountdownCounting }"
      ></div>
    </div>

    <!-- layer display processing spinner grid to show user computer working hard -->
    <div v-if="showProcessing" class="full-height full-width column justify-center content-center" style="position: absolute">
      <q-spinner-grid size="20em" />
    </div>

    <!-- layer display the countdown timer -->
    <div
      v-if="showCountdownCounting"
      id="frontpage-countdown"
      class="full-height full-width column justify-center content-center"
      style="position: absolute"
    >
      <countdown-timer
        ref="countdowntimer"
        :duration="stateStore.duration"
        :message-duration="configurationStore.getConfigElement('uisettings.TAKEPIC_MSG_TIME')"
        :message-text="configurationStore.getConfigElement('uisettings.TAKEPIC_MSG_TEXT')"
      ></countdown-timer>
    </div>

    <!-- layer display the front page text -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="showFrontpage" id="frontpage_text" v-html="configurationStore.getConfigElement('uisettings.FRONTPAGE_TEXT')"></div>

    <q-page-sticky position="bottom" :offset="[0, 25]">
      <div v-if="showFrontpage">
        <div class="row q-gutter-md">
          <q-btn
            v-if="configurationStore.getConfigElement('uisettings.show_takepic_on_frontpage')"
            id="frontpage-button-take-pic"
            stack
            color="primary"
            no-caps
            rounded
            class="action-button col-auto"
            @click="takePicture(/**/)"
          >
            <q-icon name="o_photo_camera" />
            <div style="white-space: nowrap" class="gt-sm">
              {{ $t('BTN_LABEL_MAINPAGE_TAKE_PHOTO') }}
            </div>
          </q-btn>
          <q-btn
            v-if="configurationStore.getConfigElement('uisettings.show_takecollage_on_frontpage')"
            id="frontpage-button-take-collage"
            stack
            color="primary"
            no-caps
            rounded
            class="action-button col-auto"
            @click="takeCollage()"
          >
            <q-icon name="o_auto_awesome_mosaic" />
            <div style="white-space: nowrap" class="gt-sm">
              {{ $t('BTN_LABEL_MAINPAGE_TAKE_COLLAGE') }}
            </div>
          </q-btn>
          <q-btn
            v-if="configurationStore.getConfigElement('uisettings.show_takeanimation_on_frontpage')"
            id="frontpage-button-take-animation"
            stack
            color="primary"
            no-caps
            rounded
            class="action-button col-auto"
            @click="takeAnimation()"
          >
            <q-icon name="o_gif_box" />
            <div style="white-space: nowrap" class="gt-sm">
              {{ $t('BTN_LABEL_MAINPAGE_TAKE_ANIMATION') }}
            </div>
          </q-btn>

          <q-btn
            v-if="configurationStore.getConfigElement('uisettings.show_takevideo_on_frontpage')"
            id="frontpage-button-take-video"
            stack
            color="primary"
            no-caps
            rounded
            class="action-button col-auto"
            @click="takeVideo()"
          >
            <q-icon name="o_movie" />
            <div style="white-space: nowrap" class="gt-sm">
              {{ $t('BTN_LABEL_MAINPAGE_TAKE_VIDEO') }}
            </div>
          </q-btn>
        </div>
      </div>
    </q-page-sticky>

    <q-page-sticky position="top-left" :offset="[25, 25]">
      <div v-if="showFrontpage">
        <div class="q-gutter-md">
          <q-btn
            v-if="configurationStore.getConfigElement('uisettings.show_gallery_on_frontpage')"
            id="frontpage-button-to-gallery"
            color="primary"
            no-caps
            rounded
            to="/gallery"
            class="action-button"
            :style="configurationStore.getConfigElement('uisettings.gallery_button_style')"
          >
            <q-icon left name="photo_library" />
            <div class="gt-sm">{{ $t('BTN_LABEL_MAINPAGE_TO_GALLERY') }}</div>
          </q-btn>
          <q-btn
            v-if="configurationStore.getConfigElement('uisettings.show_admin_on_frontpage')"
            id="frontpage-button-to-admin"
            rounded
            color="secondary"
            no-caps
            to="/admin"
            class="action-button"
          >
            <q-icon left name="admin_panel_settings" />
            <div class="gt-sm">{{ $t('BTN_LABEL_MAINPAGE_TO_ADMIN') }}</div>
          </q-btn>
        </div>
      </div>
    </q-page-sticky>

    <!-- video state controls -->
    <q-page-sticky v-if="showRecording" id="frontpage-indicator-recording" position="top" :offset="[0, 25]" align="center">
      <q-spinner-puff color="red" size="10em" />
      <br />
      <q-btn flat color="red" label="Stop recording" @click="stopRecordingVideo()" />
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import { remoteProcedureCall } from '../util/fetch_api.js';
import { useMainStore } from '../stores/main-store.js';
import { useStateStore } from '../stores/state-store.js';
import { useConfigurationStore } from '../stores/configuration-store.ts';
import CountdownTimer from '../components/CountdownTimer.vue';

export default defineComponent({
  components: { CountdownTimer },

  setup() {
    const store = useMainStore();
    const stateStore = useStateStore();
    const configurationStore = useConfigurationStore();

    return {
      store,
      stateStore,
      configurationStore,
      remoteProcedureCall,
    };
  },
  computed: {
    showProcessing: {
      get() {
        const capturesCompleted = this.stateStore.state == 'captures_completed';
        const capture = this.stateStore.state == 'capture';
        return capturesCompleted || capture;
      },
    },
    showRecording: {
      get() {
        return this.stateStore.state == 'record';
      },
    },
    livestreamMirror: {
      get() {
        return this.configurationStore.getConfigElement('uisettings.livestream_mirror_effect');
      },
    },

    showCountdownCounting: {
      get() {
        const machineCounting = this.stateStore.state == 'counting';

        return this.stateStore.duration > 0 && machineCounting;
      },
    },
    showPreview: {
      get() {
        const enabled = true;
        const machineIdle = !this.stateStore.state || this.stateStore.state == 'finished';
        const machineRecord = this.stateStore.state == 'record';
        const machineCounting = this.stateStore.state == 'counting';

        return enabled && (machineIdle || machineCounting || machineRecord);
      },
    },
    showFrontpage: {
      get() {
        // show if state not defined (no job ongoing or finished)
        return !this.stateStore.state || this.stateStore.state == 'finished';
      },
    },
  },
  watch: {},
  methods: {
    takePicture() {
      remoteProcedureCall('/api/processing/chose/1pic');
    },
    takeCollage() {
      remoteProcedureCall('/api/processing/chose/collage');
    },
    takeAnimation() {
      remoteProcedureCall('/api/processing/chose/animation');
    },
    takeVideo() {
      remoteProcedureCall('/api/processing/chose/video');
    },
    stopRecordingVideo() {
      remoteProcedureCall('/api/processing/cmd/stop');
    },
  },
});
</script>
