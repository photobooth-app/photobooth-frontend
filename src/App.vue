<template>
  <div :class="`route-name-${String($route.name) ?? 'undefined'}`">
    <router-view v-if="initialInitDone" />
    <q-dialog v-model="showConnectionOverlay" persistent>
      <connection-overlay />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed, onBeforeMount } from 'vue'
import { useMainStore } from 'src/stores/main-store'
import { useStateStore } from 'src/stores/state-store'
import { useConfigurationStore } from 'stores/configuration-store'
import { useMediacollectionStore } from 'src/stores/mediacollection-store'
import ConnectionOverlay from './components/ConnectionOverlay.vue'
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

const init = async () => {
  configurationStore.initStore()
  mediacollectionStore.initStore()

  await until(() => configurationStore.isLoaded == true)
  await until(() => mediacollectionStore.isLoaded == true)

  initSseClient()
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
</script>
