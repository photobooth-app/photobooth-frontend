<template>
  <q-page id="index-page" class="q-pa-none full-height">
    <preview-stream
      v-if="showPreviewThrottled"
      :index_device="configurationStore.configuration.backends.index_backend_video"
      :frame-overlay-image="frameOverlayImage"
      :enable-blurred-background-stream="configurationStore.configuration.uisettings.livestream_blurredbackground"
      :enable-mirror-effect-stream="configurationStore.configuration.uisettings.livestream_mirror_effect"
      :enable-mirror-effect-frame="configurationStore.configuration.uisettings.livestream_frameoverlay_mirror_effect"
      :blurredbackground-high-framerate="configurationStore.configuration.uisettings.livestream_blurredbackground_high_framerate"
    ></preview-stream>

    <!-- layer display processing spinner grid to show user computer working hard -->
    <div v-if="stateStore.isStateProcessing" class="full-height full-width column justify-center content-center" style="position: absolute">
      <q-spinner-grid size="20em" />
    </div>

    <!-- layer display the countdown timer -->
    <div
      v-if="stateStore.isStateCountdown"
      id="frontpage-countdown"
      class="full-height full-width column justify-center content-center"
      style="position: absolute"
    >
      <countdown-timer
        ref="countdowntimer"
        :duration="stateStore.jobmodel.duration"
        :message-duration="configurationStore.configuration.uisettings.TAKEPIC_MSG_TIME"
        :message-text="configurationStore.configuration.uisettings.TAKEPIC_MSG_TEXT"
      ></countdown-timer>
    </div>

    <!-- layer display the front page text -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-if="stateStore.isStateIdle" id="frontpage_text" v-html="configurationStore.configuration.uisettings.FRONTPAGE_TEXT"></div>

    <!-- dialog for approval -->
    <div v-if="stateStore.isStateApproval">
      <MediaItemApprovalViewer
        :approval_id="stateStore.jobmodel.approval_id"
        :number_captures_taken="stateStore.jobmodel.number_captures_taken"
        :total_captures_to_take="stateStore.jobmodel.total_captures_to_take"
      >
      </MediaItemApprovalViewer>
    </div>

    <q-page-sticky position="bottom" class="q-mb-lg">
      <div v-if="stateStore.isStateIdle">
        <FrontpageTriggerButtons :triggers="triggerButtons" @trigger-action="invokeAction"></FrontpageTriggerButtons>
      </div>
    </q-page-sticky>

    <q-page-sticky position="top-left" class="q-ma-lg">
      <div v-if="stateStore.isStateIdle">
        <div class="q-gutter-md">
          <q-btn
            v-if="configurationStore.configuration.uisettings.show_gallery_on_frontpage"
            id="frontpage-button-to-gallery"
            color="primary"
            no-caps
            rounded
            to="/gallery"
            class="action-button glass-effect"
          >
            <q-icon left name="sym_o_photo_library" />
            <div class="gt-sm">{{ $t('BTN_LABEL_MAINPAGE_TO_GALLERY') }}</div>
          </q-btn>
        </div>
      </div>
    </q-page-sticky>

    <q-page-sticky position="top-right" class="q-ma-lg">
      <div v-if="stateStore.isStateIdle">
        <div class="q-gutter-md">
          <q-btn
            v-if="configurationStore.configuration.uisettings.show_admin_on_frontpage"
            id="frontpage-button-to-admin"
            rounded
            color="transparent"
            no-caps
            class="action-button action-button-admin glass-effect"
            :class="{ 'action-button-admin-invisible': adminButtonInvisible }"
            @click="onBtnAdminClick"
          >
            <q-icon left name="sym_o_admin_panel_settings" />
            <div class="gt-sm">{{ $t('BTN_LABEL_MAINPAGE_TO_ADMIN') }}</div>
          </q-btn>
        </div>
      </div>
    </q-page-sticky>

    <!-- video state controls -->
    <q-page-sticky v-if="stateStore.isStateRecording" id="frontpage-indicator-recording" position="top-right" :offset="[25, 25]" align="center">
      <q-spinner-puff color="red" size="12em" thickness="20" />
    </q-page-sticky>
    <q-page-sticky v-if="stateStore.isStateRecording" id="frontpage-indicator-stop-recording" position="bottom" :offset="[0, 25]" align="center">
      <q-btn stack rounded no-caps color="negative" class="action-button glass-effect" @click="stopRecordingVideo()">
        <q-icon name="sym_o_stop_circle" />
        <div>{{ $t('Stop recording') }}</div>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { watchDebounced, refThrottled } from '@vueuse/core'
import { computed, ref } from 'vue'
import { remoteProcedureCall } from '../util/fetch_api.js'
import { useStateStore } from '../stores/state-store'
import { useConfigurationStore } from '../stores/configuration-store'
import CountdownTimer from '../components/CountdownTimer.vue'
import type { TriggerSchema } from '../components/FrontpageTriggerButtons.vue'
import { default as FrontpageTriggerButtons } from '../components/FrontpageTriggerButtons.vue'
import { default as PreviewStream } from '../components/PreviewStream.vue'
import _ from 'lodash'
import MediaItemApprovalViewer from 'src/components/MediaItemApprovalViewer.vue'

const stateStore = useStateStore()
const configurationStore = useConfigurationStore()
const router = useRouter()
const btnAdminClickCounter = ref(0)

watchDebounced(
  btnAdminClickCounter,
  () => {
    if (btnAdminClickCounter.value >= 5) {
      router.push('/admin')
    }
    btnAdminClickCounter.value = 0
  },
  { debounce: 500 },
)
const triggerButtons = computed(() => {
  const result: TriggerSchema[] = []

  Object.entries(configurationStore.configuration.actions).forEach(([key, actions]) => {
    actions.forEach((action, index: number) => {
      const trigger: TriggerSchema = {
        action: `actions/${key}`,
        config_index: index,
        show_button: action.trigger.ui_trigger.show_button,
        title: action.trigger.ui_trigger.title,
        icon: action.trigger.ui_trigger.icon,
        use_custom_color: action.trigger.ui_trigger.use_custom_color,
        custom_color: action.trigger.ui_trigger.custom_color,
      }

      result.push(trigger)
    })
  })

  return result
})

const adminButtonInvisible = computed(() => {
  return configurationStore.configuration.uisettings.admin_button_invisible
})

const showPreview = computed(() => {
  const enabledWhenIdle = configurationStore.configuration.uisettings.enable_livestream_when_idle
  const enabledWhenActive = configurationStore.configuration.uisettings.enable_livestream_when_active
  const machineIdle = stateStore.isStateIdle
  const machineRecord = stateStore.isStateRecording
  const machineCounting = stateStore.isStateCountdown
  const machineCapture = stateStore.isStateCapture

  // allow user to choose if shown during idle or process only. during record it cannot be disabled because video useful to show while recording
  return (machineIdle && enabledWhenIdle) || ((machineCounting || machineCapture) && enabledWhenActive) || machineRecord
})
// following is to avoid short time preview requested. there is a race condition when the state machine finishes and short time target is present.
// right after present it changes to finished and so the route is changed to presenter + the preview component is enabled which causes issues because
// just a moment later it's disabled again.
const showPreviewThrottled = refThrottled(showPreview, 500)

const frameOverlayImage = computed(() => {
  const enable_action_frame_overlay = _.get(stateStore.jobmodel.configuration_set, 'processing.img_frame_enable', false)
  const action_frame_overlay_image = _.get(stateStore.jobmodel.configuration_set, 'processing.img_frame_file', '')
  if (stateStore.isStateCountdown && enable_action_frame_overlay) {
    //during countdown the action frame is priorized.
    return action_frame_overlay_image
  } else if (stateStore.isStateIdle && configurationStore.configuration.uisettings.enable_livestream_frameoverlay) {
    // the live frame is shown in idle only
    return configurationStore.configuration.uisettings.livestream_frameoverlay_image
  } else {
    return ''
  }
})

const onBtnAdminClick = () => {
  if (adminButtonInvisible.value) {
    btnAdminClickCounter.value++
  } else {
    router.push('/admin')
  }
}
const invokeAction = (action: string, config_index: number) => {
  remoteProcedureCall(`/api/${action}/${config_index}`)
}
const stopRecordingVideo = () => {
  remoteProcedureCall('/api/processing/next')
}
</script>

<style lang="sass">

// if button shall be invisible, set it to transparent and on mouseover use default cursor, no pointer
.action-button-admin-invisible
  opacity: 0.0
  cursor: default
</style>
