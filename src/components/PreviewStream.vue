<template>
  <div class="canvas-stack">
    <canvas id="canvas-stream" v-show="!stalled"></canvas>
    <!-- canvas kept on dom because it's not expensive and keeps the stream worker simple as we just don't process the data -->
    <canvas id="canvas-blurred" v-show="enableBlurredBackgroundStream"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watch, watchEffect, ref } from 'vue'
import { useWebSocket, useDocumentVisibility, useDebounceFn } from '@vueuse/core'

const props = defineProps<{
  // from docs: An absent optional prop other than Boolean will have undefined value.
  index_device: number
  enableMirrorEffectStream?: boolean
  enableMirrorEffectFrame?: boolean
  enableBlurredBackgroundStream?: boolean
  blurredbackgroundHighFramerate?: boolean
  frameOverlayImage?: string
}>()

let wsRef: WebSocket | null = null
const visibility = useDocumentVisibility()
const streamRenderer = new Worker(new URL('/src/util/streamRenderer.ts', import.meta.url), { type: 'module' })
const streamRendererImageDecoderMode = typeof ImageDecoder !== 'undefined'
const stalled = ref(false) //can replace by useDebounceFn once next vueuse is released: https://vueuse.org/shared/useDebounceFn/#pending-state
const markFrameReceived = useDebounceFn(() => {
  stalled.value = true // set to true after timeout
}, 4000)

// handle worker messages
streamRenderer.onmessage = ev => {
  const msg = ev.data
  if (msg?.type === 'frame-finished') {
    // worker finished rendering the last frame
    if (wsRef && wsRef.readyState === WebSocket.OPEN) {
      wsRef.send('ready')
    }

    return
  }
  // other worker messages like stats or errors
  console.log(ev.data)
}

watchEffect(() => {
  if (props.frameOverlayImage) {
    const overlayAbsUrl = new URL(props.frameOverlayImage, document.baseURI).href
    streamRenderer.postMessage({ type: 'overlay', url: overlayAbsUrl })
  } else {
    streamRenderer.postMessage({ type: 'overlay', url: null })
  }
})
// fixes https://github.com/photobooth-app/photobooth-app/issues/613, relative ws URLs seem to be an addition in 2024,
// so we generate the absolute URL to connect to
const websocketStreamUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/aquisition/stream?index_device=${props.index_device}&index_subdevice=0`

const { open: openWebSocketStream, close: closeWebSocketStream } = useWebSocket(websocketStreamUrl, {
  immediate: false,
  // autoClose: true,
  autoReconnect: {
    retries: -1,
    delay: 1000,
  },
  onConnected(ws) {
    wsRef = ws
    if (streamRendererImageDecoderMode)
      ws.binaryType = 'arraybuffer' // arraybuffer is transferrable to the worker, blob (default) not
    else ws.binaryType = 'blob' // blob is not transferrable to worker but we use it as it avoid recreation in the worker

    console.log(
      'stream connected via websocket, set binaryType to',
      ws.binaryType,
      'streamRendererImageDecoderMode is ',
      streamRendererImageDecoderMode,
      '(only modern browser and secure contexts)'
    )

    // should not be needed, as we shove down the first frame from backend to client anyways right after connect...
    ws.send('ready')
  },
  onDisconnected() {
    wsRef = null
    console.log('stream disconnected from websocket')
  },

  async onMessage(ws, event) {
    // mark stream as not stalled once a frame is received.
    // there is a timer marking it as stalled after 1 sec to show it in the ui
    stalled.value = false
    markFrameReceived()

    if (document.hidden) {
      console.log('The document was hidden while receiving a frame. The frame is not processed to save cpu.')
      // if paused, the app needs to ensure sending a ready via websocket, to resume streaming.
      // this means, postMessage does not trigger the onMessage to receive the ready flag back -> see visibilitychange
      return
    }

    streamRenderer.postMessage({ type: 'frame', payload: event.data })

    // the ImageDecoder consumes arraybuffer which would be transferable - we do not transfer as there is no speed improvement
    // streamRenderer.postMessage({ type: 'frame', payload: event.data }, [event.data])
  },
})

watch(visibility, currentVisibility => {
  if (currentVisibility === 'hidden') {
    console.log('The document is now hidden!')
  } else {
    console.log('The document is visible again, send a ready signal to resume streaming.')
    if (wsRef && wsRef.readyState === WebSocket.OPEN) {
      wsRef.send('ready')
    }
  }
})

onMounted(() => {
  console.log('preview stream mounted!')

  const canvasStream = (document.getElementById('canvas-stream') as HTMLCanvasElement).transferControlToOffscreen()
  const canvasBlurred = (document.getElementById('canvas-blurred') as HTMLCanvasElement).transferControlToOffscreen()

  streamRenderer.postMessage(
    {
      type: 'init',
      enableBlurredBackgroundStream: props.enableBlurredBackgroundStream,
      enableMirrorEffectStream: props.enableMirrorEffectStream,
      enableMirrorEffectFrame: props.enableMirrorEffectFrame,
      blurredbackgroundHighFramerate: props.blurredbackgroundHighFramerate,
      canvases: { stream: canvasStream, blurred: canvasBlurred },
      streamRendererImageDecoderMode: streamRendererImageDecoderMode,
    },
    [canvasStream, canvasBlurred]
  )

  openWebSocketStream()
})

onUnmounted(() => {
  closeWebSocketStream()
  streamRenderer.terminate()

  console.log('preview stream unmounted!')
})
</script>

<style lang="scss">
.canvas-stack {
  position: fixed;
  height: 100%;
  width: 100%;

  /* Prevent interaction */
  pointer-events: none;
  user-select: none;

  display: grid; // Create a sizing context
  place-items: center;

  > canvas {
    grid-area: 1 / 1; // overlap in same cell
    overflow: hidden; // this tells the browser to resize the canvas if exceeding in height (it doesn't clip)
    width: 100%;
    height: 100%;

    &#canvas-blurred {
      z-index: 1;
      object-fit: cover;

      filter: blur(6px) brightness(0.5);

      width: 105%;
      height: 105%;
    }

    &#canvas-stream {
      z-index: 2;
      object-fit: contain;
    }
  }
}
</style>
