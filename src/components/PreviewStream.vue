<template>
  <div class="canvas-stack">
    <canvas id="canvas-stream"></canvas>
    <!-- canvas kept on dom because it's not expensive and keeps the stream worker simple as we just don't process the data -->
    <canvas id="canvas-blurred" v-show="enableBlurredBackgroundStream"></canvas>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, watchEffect } from 'vue'
import { useWebSocket } from '@vueuse/core'

const props = defineProps<{
  // from docs: An absent optional prop other than Boolean will have undefined value.
  index_device: number
  enableMirrorEffectStream?: boolean
  enableMirrorEffectFrame?: boolean
  enableBlurredBackgroundStream?: boolean
  blurredbackgroundHighFramerate?: boolean
  frameOverlayImage?: string
}>()

const streamRenderer = new Worker(new URL('/src/util/streamRenderer.ts', import.meta.url), { type: 'module' })
const streamRendererImageDecoderMode = typeof ImageDecoder !== 'undefined'
// Receive stats from worker
// streamRenderer.onmessage = (ev) => {
//   console.log(ev)
// }

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
    if (streamRendererImageDecoderMode)
      ws.binaryType = 'arraybuffer' // arraybuffer is transferrable to the worker, blob (default) not
    else ws.binaryType = 'blob' // blob is not transferrable to worker but we use it as it avoid recreation in the worker

    console.log(
      'stream connected via websocket, set binaryType to',
      ws.binaryType,
      'streamRendererImageDecoderMode is ',
      streamRendererImageDecoderMode,
      '(only modern browser and secure contexts)',
    )
  },
  onDisconnected() {
    console.log('stream disconnected from websocket')
  },

  async onMessage(ws, event) {
    if (document.hidden) {
      // if doc is hidden, do not process any decoding to save cpu/memory.
      // otherwise it seems to write in the background and leak memory
      return
    }

    streamRenderer.postMessage({ type: 'frame', payload: event.data })
    // the ImageDecoder consumes arraybuffer which would be transferable - we do not transfer as there is no speed improvement
    // streamRenderer.postMessage({ type: 'frame', payload: event.data }, [event.data])
  },
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
    [canvasStream, canvasBlurred],
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

      filter: blur(6px);
      opacity: 0.6;
    }

    &#canvas-stream {
      z-index: 2;
      object-fit: contain;
    }
  }
}
</style>
