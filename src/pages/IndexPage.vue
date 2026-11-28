<template>
  <q-page id="index-page" class="q-pa-none full-height">
    <preview-stream
      ref="previewStream"
      v-if="showPreviewThrottled"
      :index_device="configurationStore.configuration.cameras.index_backend_video"
      :frame-overlay="frameOverlay"
      :fixed-size="fixedSize"
      :enable-blurred-background-stream="configurationStore.configuration.uisettings.livestream_blurredbackground"
      :enable-mirror-effect-stream="configurationStore.configuration.uisettings.livestream_mirror_effect"
      :blurredbackground-high-framerate="configurationStore.configuration.uisettings.livestream_blurredbackground_high_framerate"
    ></preview-stream>

    <!-- layer showing the frozen preview frame from the moment the picture was taken while the backend processes (e.g. a filter applied as part of an action). fills the full canvas. the snapshot inherits the preview mirror, so it is flipped back when the mirror preview setting is on, making it correspond to the final (unmirrored) image. fades in right after the shot; replaced by the processed image in the item presenter once done -->
    <Transition name="processing-fade">
      <div v-if="frozenFrameUrl" class="absolute-full overflow-hidden" style="z-index: 90; background: #000">
        <img
          :src="frozenFrameUrl"
          alt=""
          class="processing-frozen-image"
          :class="{ 'processing-frozen-image-flipped': livestreamMirrorEffect }"
          draggable="false"
        />
      </div>
    </Transition>

    <!-- semitransparent processing spinner on top of the taken image. delayed and faded so short processing does not flash -->
    <Transition name="processing-fade">
      <div
        v-if="showProcessingSpinner"
        class="processing-overlay full-height full-width column justify-center content-center"
        style="position: absolute; z-index: 100"
      >
        <q-spinner-grid size="20em" />
      </div>
    </Transition>

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
    <div v-if="stateStore.isStateApproval && stateStore.jobmodel.approval_id">
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
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { remoteProcedureCall } from '@/util/fetch_api.js'
import { useMainStore } from '@/stores/main-store'
import { useStateStore } from '@/stores/state-store'
import { useConfigurationStore } from '@/stores/configuration-store'
import CountdownTimer from '@/components/CountdownTimer.vue'
import type { TriggerSchema } from '@/types/trigger-schema'
import { default as FrontpageTriggerButtons } from '@/components/FrontpageTriggerButtons.vue'
import { default as PreviewStream } from '@/components/PreviewStream.vue'
import _ from 'lodash'
import MediaItemApprovalViewer from '@/components/MediaItemApprovalViewer.vue'
import type { UiFrameOverlay } from '@/dto/generated'
import type { Size2D } from '@/util/streamRenderer.ts'
const mainStore = useMainStore()
const stateStore = useStateStore()
const configurationStore = useConfigurationStore()
const router = useRouter()
const btnAdminClickCounter = ref(0)

// delay showing the processing spinner so short-running processing (e.g. quick filters) does not flash it; then fade in/out
const PROCESSING_SPINNER_DELAY_MS = 1000
const showProcessingSpinner = ref(false)
let processingSpinnerTimer: ReturnType<typeof setTimeout> | undefined
watch(
  () => stateStore.isStateProcessing,
  processing => {
    if (processingSpinnerTimer) {
      clearTimeout(processingSpinnerTimer)
      processingSpinnerTimer = undefined
    }
    if (processing) {
      processingSpinnerTimer = setTimeout(() => {
        showProcessingSpinner.value = true
      }, PROCESSING_SPINNER_DELAY_MS)
    } else {
      showProcessingSpinner.value = false
    }
  },
  { immediate: true }
)
onBeforeUnmount(() => {
  if (processingSpinnerTimer) clearTimeout(processingSpinnerTimer)
})

// frozen preview frame from the moment the picture was taken, shown while the backend processes.
// the snapshot copies the stream canvas, which is mirrored when livestream_mirror_effect is on —
// but the final captured image is not mirrored, so flip the frozen frame back in that case
const previewStream = ref<InstanceType<typeof PreviewStream> | null>(null)
const lastFrameUrl = ref<string | null>(null)
const frozenFrameUrl = ref<string | null>(null)
const livestreamMirrorEffect = computed(() => configurationStore.configuration.uisettings.livestream_mirror_effect)

// keep track of the latest preview frame while the stream is alive
watch(
  () => previewStream.value?.lastSnapshotUrl,
  url => {
    if (url) lastFrameUrl.value = url
  }
)
// ask the stream worker for fresh snapshots while counting down / capturing, so the frame at shot time is available
watch(
  () => stateStore.isStateCountdown || stateStore.isStateCapture,
  active => previewStream.value?.setSnapshotEnabled(active)
)
watch(
  () => stateStore.isStateProcessing,
  processing => {
    if (processing) {
      previewStream.value?.requestSnapshot()
      frozenFrameUrl.value = lastFrameUrl.value
    } else {
      frozenFrameUrl.value = null
    }
  }
)

watchDebounced(
  btnAdminClickCounter,
  () => {
    if (btnAdminClickCounter.value >= 5) {
      router.push('/admin')
    }
    btnAdminClickCounter.value = 0
  },
  { debounce: 500 }
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

const fixedSize = computed((): Size2D | null => {
  console.log('fixedSize determined:')
  console.info(stateStore.jobmodel)
  const captureDefinition = stateStore.jobmodel.captures_definition

  if (captureDefinition) {
    return {
      width: captureDefinition.width,
      height: captureDefinition.height,
    }
  } else {
    return null
  }
})
const frameOverlay = computed((): UiFrameOverlay | null => {
  const idleFrameOverlay = configurationStore.configuration.uisettings.livestream_frameoverlay
  const actionFrameOverlay = stateStore.jobmodel.frame_overlay

  if (stateStore.isStateCountdown && actionFrameOverlay) {
    //during countdown the action frame is priorized if the action has this feature...
    return actionFrameOverlay
  } else if (stateStore.isStateIdle && idleFrameOverlay.enable && idleFrameOverlay.image) {
    // the live frame is shown in idle only
    return idleFrameOverlay as UiFrameOverlay
  } else {
    return null
  }
})

const onBtnAdminClick = () => {
  if (adminButtonInvisible.value) {
    btnAdminClickCounter.value++
  } else {
    router.push('/admin')
  }
}
const invokeAction = (trigger: TriggerSchema) => {
  mainStore.lastAction = trigger // save last action so it can be started from itempresenter directly again.
  remoteProcedureCall(`/api/${trigger.action}/${trigger.config_index}`)
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

<style scoped>
.processing-overlay {
  background: rgba(0, 0, 0, 0.4);
}

.processing-frozen-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  /* fully visible, scaled so the longest side fills the canvas; remaining bars stay black */
  object-fit: contain;
}

/* undo the preview mirror so the frozen frame matches the final unmirrored image */
.processing-frozen-image-flipped {
  transform: scaleX(-1);
}


.processing-fade-enter-active,
.processing-fade-leave-active {
  transition: opacity 0.4s ease;
}

.processing-fade-enter-from,
.processing-fade-leave-to {
  opacity: 0;
}
</style>
