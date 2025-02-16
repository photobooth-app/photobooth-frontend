<template>
  <div>
    <router-view v-if="initialInitDone" />
    <q-dialog v-model="showConnectionOverlay" persistent>
      <connection-overlay />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onUnmounted, onBeforeMount } from 'vue'
import { useMainStore } from 'src/stores/main-store'
import { useStateStore } from 'src/stores/state-store'
import { useConfigurationStore } from 'stores/configuration-store'
import { useMediacollectionStore } from 'src/stores/mediacollection-store'
import ConnectionOverlay from './components/ConnectionOverlay.vue'
import { remoteProcedureCall } from './util/fetch_api.js'
import { useQuasar } from 'quasar'
import type { EventSourceStatus } from '@vueuse/core'
import { useEventSource } from '@vueuse/core'

console.log('frontend build date', process.env.BUILD_DATE)

const store = useMainStore()
const stateStore = useStateStore()
const configurationStore = useConfigurationStore()
const mediacollectionStore = useMediacollectionStore()
const connected = ref(false)
const initialInitDone = ref(false)
const $q = useQuasar()

const showConnectionOverlay = computed(() => {
  return !connected.value
})

onBeforeMount(async () => {
  console.log('app created, waiting for stores to init first dataset')
  await init()
  console.log('data initialization finished')
  initialInitDone.value = true
})

onUnmounted(() => {
  window.removeEventListener('keyup', keyUpHandler)
})

const init = async () => {
  configurationStore.initStore()
  mediacollectionStore.initStore()

  await until(() => configurationStore.isLoaded == true)
  await until(() => mediacollectionStore.isLoaded == true)

  initSseClient()

  // for now on app start we send an abort to the backend.
  // could be improved to actually handle the state the machine is in and send ui to according state
  // remoteProcedureCall("/api/actions/abort");
  console.log('installing listener for keyboard input')
  window.addEventListener('keyup', keyUpHandler)
}

const until = (conditionFunction: { (): boolean }) => {
  const poll = (resolve) => {
    if (conditionFunction()) resolve()
    else setTimeout(() => poll(resolve), 400)
  }

  return new Promise(poll)
}

const initSseClient = () => {
  const { status, error, eventSource } = useEventSource('/api/sse', [], {
    autoReconnect: true,
    immediate: true,
  })

  watch(error, (err) => {
    if (err) {
      console.error('SSE error:', err)
    }
  })
  watch(status, (stat: EventSourceStatus) => {
    console.info('SSE connection status now', stat)
    connected.value = stat == 'OPEN'
  })

  eventSource.value?.addEventListener('LogRecord', (evt) => {
    store.logrecords = [JSON.parse(evt.data), ...store.logrecords.slice(0, 199)]
  })

  eventSource.value?.addEventListener('FrontendNotification', (evt) => {
    // linked to SseEventFrontendNotification, event: FrontendNotification
    const _notification = JSON.parse(evt.data)
    console.log(_notification)

    $q.notify({
      caption: _notification['caption'] || 'Notification',
      message: _notification['message'],
      color: _notification['color'] || 'info',
      icon: _notification['icon'] ? `sym_o_${_notification['icon']}` : 'sym_o_info',
      spinner: _notification['spinner'] || false,
      actions: [
        {
          icon: 'sym_o_close',
          color: 'white',
          round: true,
        },
      ],
    })
  })

  eventSource.value?.addEventListener('ProcessStateinfo', (evt) => {
    const _procinfo = JSON.parse(evt.data)
    console.log('ProcessStateinfo', _procinfo)
    if (Object.keys(_procinfo).length === 0 && _procinfo.constructor === Object) {
      stateStore.$reset()
    } else {
      Object.assign(stateStore, _procinfo)
    }
  })

  eventSource.value?.addEventListener('DbInsert', (evt) => {
    const _mediaitem = JSON.parse(evt.data)
    console.log('received new item to add to collection:', _mediaitem)
    mediacollectionStore.addMediaitem(_mediaitem)
  })

  eventSource.value?.addEventListener('DbUpdate', (evt) => {
    const _mediaitem = JSON.parse(evt.data)
    console.log('received item to update in collection:', _mediaitem)
    mediacollectionStore.updateMediaitem(_mediaitem)
  })

  eventSource.value?.addEventListener('DbRemove', (evt) => {
    const _mediaitem = JSON.parse(evt.data)
    console.log('received request to remove item from collection:', _mediaitem)
    mediacollectionStore.removeMediaitem(_mediaitem)
  })

  eventSource.value?.addEventListener('InformationRecord', (evt) => {
    Object.assign(store.information, JSON.parse(evt.data))
  })
}
const keyUpHandler = (e: KeyboardEvent) => {
  if (!configurationStore.configuration.hardwareinputoutput.keyboard_input_enabled) {
    console.log('keyboard input is disabled, to use keyboard input enable it in the configuration and reload the page.')
    return
  }

  configurationStore.configuration.actions.image.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/actions/image/${index}`)
      return
    }
  })
  configurationStore.configuration.actions.collage.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/actions/collage/${index}`)
      return
    }
  })
  configurationStore.configuration.actions.animation.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/actions/animation/${index}`)
      return
    }
  })
  configurationStore.configuration.actions.video.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/actions/video/${index}`)
      return
    }
  })
  configurationStore.configuration.actions.multicamera.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/actions/multicamera/${index}`)
      return
    }
  })
  configurationStore.configuration.share.actions.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/share/actions/${index}`)
      return
    }
  })
}
</script>
