<template>
  <div>
    <router-view />
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
import { get } from 'lodash'
import { useQuasar } from 'quasar'
import type { EventSourceStatus } from '@vueuse/core'
import { useEventSource } from '@vueuse/core'

const store = useMainStore()
const stateStore = useStateStore()
const configurationStore = useConfigurationStore()
const mediacollectionStore = useMediacollectionStore()
const connected = ref(false)
const $q = useQuasar()

//TODO: need to make app wait until fully init?
console.log(configurationStore.isLoaded)

const showConnectionOverlay = computed(() => {
  return !connected.value
})

onBeforeMount(async () => {
  console.log('app created, waiting for stores to init first dataset')
  await init()
  console.log('data initialization finished')
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
  if (!configurationStore.getConfigElement('hardwareinputoutput.keyboard_input_enabled', false)) {
    console.log('keyboard input is disabled, to use keyboard input enable it in the configuration and reload the page.')
    return
  }

  const action_collections = ['actions.image', 'actions.collage', 'actions.animation', 'actions.video', 'actions.multicamera', 'share.actions']
  action_collections.forEach((action_collection) => {
    const action_config = configurationStore.getConfigElement(action_collection, [])
    action_config.forEach((action: string, index: number) => {
      const keycode = get(action, 'trigger.keyboard_trigger.keycode')
      if (keycode == e.key) {
        remoteProcedureCall(`/api/${action_collection.replaceAll('.', '/')}/${index}`)
        return
      }
    })
  })
}
</script>
