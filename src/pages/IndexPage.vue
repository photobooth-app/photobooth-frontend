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
            <q-icon left name="sym_o_photo_library" />
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
            <q-icon left name="sym_o_admin_panel_settings" />
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

<script setup lang="ts">
import { computed } from 'vue'
import { remoteProcedureCall } from '../util/fetch_api.js'
import { useStateStore } from '../stores/state-store'
import { useConfigurationStore } from '../stores/configuration-store'
import CountdownTimer from '../components/CountdownTimer.vue'
import type { TriggerSchema } from '../components/FrontpageTriggerButtons.vue'
import { default as FrontpageTriggerButtons } from '../components/FrontpageTriggerButtons.vue'
import { get } from 'lodash'

const stateStore = useStateStore()
const configurationStore = useConfigurationStore()

const triggerButtons = computed(() => {
  const result: TriggerSchema[] = []

  const action_collections = ['actions.image', 'actions.collage', 'actions.animation', 'actions.video', 'actions.multicamera', 'printer.print']
  action_collections.forEach((action_collection) => {
    const action_config = configurationStore.getConfigElement(action_collection, [])
    action_config.forEach((action: string, index: number) => {
      const trigger: TriggerSchema = {
        action: action_collection.replace('.', '/'),
        config_index: index,
        show_button: get(action, 'trigger.ui_trigger.show_button', false),
        title: get(action, 'trigger.ui_trigger.title', ''),
        icon: get(action, 'trigger.ui_trigger.icon', ''),
      }

      result.push(trigger)
    })
  })
  console.log(result)

  return result
})

const showProcessing = computed(() => {
  const capture = stateStore.state == 'capture'
  const capturesCompleted = stateStore.state == 'captures_completed'

  return capturesCompleted || (capture && !showCountdownCounting.value)
})

const showRecording = computed(() => {
  return stateStore.state == 'record'
})

const livestreamMirror = computed(() => {
  return configurationStore.getConfigElement('uisettings.livestream_mirror_effect')
})

const showCountdownCounting = computed(() => {
  const machineCounting = stateStore.state == 'counting'
  const capture = stateStore.state == 'capture'

  return (stateStore.duration && stateStore.duration > 0 && machineCounting) || capture
})

const showPreview = computed(() => {
  const enabledWhenIdle = configurationStore.getConfigElement('uisettings.enable_livestream_when_idle', true)
  const enabledWhenActive = configurationStore.getConfigElement('uisettings.enable_livestream_when_active', true)
  const machineIdle = !stateStore.state || stateStore.state == 'finished'
  const machineRecord = stateStore.state == 'record'
  const machineCounting = stateStore.state == 'counting'
  const machineCapture = stateStore.state == 'capture'

  // allow user to choose if shown during idle or process only. during record it cannot be disabled because video useful to show while recording
  return (machineIdle && enabledWhenIdle) || ((machineCounting || machineCapture) && enabledWhenActive) || machineRecord
})

const showFrontpage = computed(() => {
  // show if state not defined (no job ongoing or finished)
  return !stateStore.state || stateStore.state == 'finished'
})

const invokeAction = (action: string, config_index: number) => {
  remoteProcedureCall(`/api/${action}/${config_index}`)
}
const stopRecordingVideo = () => {
  remoteProcedureCall('/api/actions/stop')
}
</script>
