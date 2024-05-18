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
        <FrontpageTriggerButtons :triggers="triggerButtons" @trigger-action="invokeAction"></FrontpageTriggerButtons>
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
import { default as FrontpageTriggerButtons } from '../components/FrontpageTriggerButtons.vue';
import { get } from 'lodash';
export default defineComponent({
  components: { CountdownTimer, FrontpageTriggerButtons },

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
    triggerButtons: {
      get() {
        const result = [];

        const action_collections = ['actions.image', 'actions.collage', 'actions.animation', 'actions.video', 'printer.print'];
        action_collections.forEach((action_collection) => {
          const action_config = this.configurationStore.getConfigElement(action_collection, []);
          action_config.forEach((action, index) => {
            const frontpage_trigger_backend = get(action, 'trigger.frontpage_trigger');
            result.push({ ...{ action: action_collection.replace('.', '/'), config_index: index }, ...frontpage_trigger_backend });
          });
        });
        console.log(result);

        return result;
      },
    },
    showProcessing: {
      get() {
        const capture = this.stateStore.state == 'capture';
        const capturesCompleted = this.stateStore.state == 'captures_completed';

        return capturesCompleted || (capture && !this.showCountdownCounting);
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
        const capture = this.stateStore.state == 'capture';

        return (this.stateStore.duration > 0 && machineCounting) || capture;
      },
    },
    showPreview: {
      get() {
        const enabled = true;
        const machineIdle = !this.stateStore.state || this.stateStore.state == 'finished';
        const machineRecord = this.stateStore.state == 'record';
        const machineCounting = this.stateStore.state == 'counting';
        const machineCapture = this.stateStore.state == 'capture';

        return enabled && (machineIdle || machineCounting || machineRecord || machineCapture);
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
    invokeAction(action, config_index) {
      remoteProcedureCall(`/api/${action}/${config_index}`);
    },
    stopRecordingVideo() {
      remoteProcedureCall('/api/actions/stop');
    },
  },
});
</script>
