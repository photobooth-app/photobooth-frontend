<template>
  <div class="canvas-stack">
    <canvas id="canvas-blurred"></canvas>
    <canvas id="canvas-stream" :class="{ mirroreffect: props.enableMirrorEffectStream }"></canvas>
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

const streamWorker = new Worker(new URL('/src/util/stream_worker.ts', import.meta.url), { type: 'module' })
//TODO:
// -mirroreffectframe not yet used.

watchEffect(() => {
  console.log('frame changed to ', props.frameOverlayImage)

  if (props.frameOverlayImage) {
    console.log(props.frameOverlayImage)
    const overlayAbsUrl = new URL(props.frameOverlayImage, document.baseURI).href
    streamWorker.postMessage({ type: 'overlay', url: overlayAbsUrl })
  } else {
    streamWorker.postMessage({ type: 'overlay', url: null })
  }
})
// fixes https://github.com/photobooth-app/photobooth-app/issues/613, relative ws URLs seem to be an addition in 2024,
// so we generate the absolute URL to connect to
const websocketStreamUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/aquisition/stream?index_device=${props.index_device}&index_subdevice=0`

// Receive stats from worker
streamWorker.onmessage = (ev) => {
  if (ev.data.type === 'stats') {
    console.log(`FPS plain=${ev.data.fpsPlain}, augmented=${ev.data.fpsAug}, ` + `dropped=${ev.data.dropped}, avgDecode=${ev.data.avgDecode}ms`)
  }
}
const { open, close } = useWebSocket(websocketStreamUrl, {
  immediate: false,
  // autoClose: true,
  autoReconnect: {
    retries: -1,
    delay: 1000,
  },
  onConnected(ws) {
    ws.binaryType = 'arraybuffer' // arraybuffer is transferrable to the worker, blob (default) not
    console.log('stream connected via websocket')

    const canvasStream = (document.getElementById('canvas-stream') as HTMLCanvasElement).transferControlToOffscreen()
    const canvasBlurred = (document.getElementById('canvas-blurred') as HTMLCanvasElement).transferControlToOffscreen()

    streamWorker.postMessage(
      {
        type: 'init',
        canvases: { stream: canvasStream, blurred: canvasBlurred },
        blurredbackgroundHighFramerate: props.blurredbackgroundHighFramerate,
      },
      [canvasStream, canvasBlurred],
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

    streamWorker.postMessage({ type: 'frame', payload: event.data }, [event.data])
  },
})

onMounted(() => {
  console.log('preview stream mounted!')
  // set aspect ratio of overlay frame to container so stream and overlay align properly

  // const overlayAbsUrl = new URL(props.frameOverlayImage, document.baseURI).href
  // streamWorker.postMessage({ type: 'overlay', url: overlayAbsUrl })

  open()
})

onUnmounted(() => {
  close()
  streamWorker.terminate()

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

    &.mirroreffect {
      transform: scale(-1, 1);
    }
  }
}
</style>
