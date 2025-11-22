<template>
  <div id="preview-container" class="">
    <canvas
      v-if="props.enableBlurredBackgroundStream"
      id="preview-outer-blurred"
      class="preview-center-element"
      :class="{ mirroreffect: props.enableMirrorEffectStream }"
    ></canvas>

    <div id="preview-outer-container" class="preview-center-element">
      <div
        id="preview-inner-container"
        class="preview-center-element"
        :class="{
          'stream-no-preview': !showFrameOverlay,
        }"
      >
        <canvas
          id="preview-inner-stream"
          class="preview-center-element"
          :class="{
            mirroreffect: props.enableMirrorEffectStream,
            cover: showFrameOverlay,
            contain: !showFrameOverlay,
          }"
        ></canvas>

        <!-- keep element on dom, so the aspect ratio update listener is always registered, even if no permanent overlay but only per actions -->
        <img
          v-show="showFrameOverlay"
          id="preview-inner-overlay"
          class="preview-center-element contain"
          :class="{ mirroreffect: props.enableMirrorEffectFrame }"
          :src="props.frameOverlayImage"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useWebSocket } from '@vueuse/core'
import { useThrottleFn } from '@vueuse/core'

const props = defineProps<{
  // from docs: An absent optional prop other than Boolean will have undefined value.
  index_device: number
  enableMirrorEffectStream?: boolean
  enableMirrorEffectFrame?: boolean
  enableBlurredBackgroundStream?: boolean
  blurredbackgroundHighFramerate?: boolean
  frameOverlayImage?: string
}>()

let canvasStream = null
let ctxStream = null
let canvasBlurred = null
let ctxBlurred = null
const refreshBlurredTimeout = props.blurredbackgroundHighFramerate === true ? 50 : 300

const updateCanvas = (canvas: HTMLCanvasElement, ctx, img) => {
  if (canvas.width != img.width || canvas.height != img.height) {
    canvas.width = img.width
    canvas.height = img.height
  }
  ctx.drawImage(img, 0, 0)
}

const throttledUpdateCanvas = useThrottleFn((canvas, ctx, img) => {
  updateCanvas(canvas, ctx, img)
}, refreshBlurredTimeout)

// fixes https://github.com/photobooth-app/photobooth-app/issues/613, relative ws URLs seem to be an addition in 2024,
// so we generate the absolute URL to connect to
const websocketStreamUrl = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/aquisition/stream?index_device=${props.index_device}&index_subdevice=0`
const { open, close } = useWebSocket(websocketStreamUrl, {
  immediate: false,
  // autoClose: true,
  autoReconnect: {
    retries: -1,
    delay: 1000,
  },
  onConnected() {
    console.log('stream connected via websocket')
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

    if ((canvasStream && ctxStream) || (canvasBlurred && ctxBlurred)) {
      const imageBitmap = await createImageBitmap(new Blob([event.data], { type: 'image/jpeg' }))

      if (canvasStream && ctxStream) {
        updateCanvas(canvasStream, ctxStream, imageBitmap)
      }
      if (canvasBlurred && ctxBlurred) {
        throttledUpdateCanvas(canvasBlurred, ctxBlurred, imageBitmap)
      }

      imageBitmap.close() // descroy after drawing to avoid mem leak
    } else {
      console.error('jpeg bytes received but no canvas to draw to.')
    }
  },
})

const showFrameOverlay = computed(() => {
  return props.frameOverlayImage ?? true
})

onMounted(() => {
  console.log('preview stream mounted!')
  // set aspect ratio of overlay frame to container so stream and overlay align properly
  const overlayImage = document.getElementById('preview-inner-overlay') as HTMLImageElement
  if (overlayImage) {
    overlayImage.onload = function () {
      console.log(overlayImage.naturalWidth / overlayImage.naturalHeight)
      const container = document.getElementById('preview-inner-container')
      container.style.aspectRatio = Number(overlayImage.naturalWidth / overlayImage.naturalHeight).toFixed(4)
    }
  }

  canvasStream = document.getElementById('preview-inner-stream') as HTMLCanvasElement
  canvasBlurred = document.getElementById('preview-outer-blurred') as HTMLCanvasElement

  if (canvasStream) ctxStream = canvasStream.getContext('2d')
  if (canvasBlurred) ctxBlurred = canvasBlurred.getContext('2d')
  if (canvasStream || canvasBlurred) open()
})

onUnmounted(() => {
  close()

  // reset to void memory leaking
  canvasStream = null
  ctxStream = null
  canvasBlurred = null
  ctxBlurred = null
  console.log('preview stream unmounted!')
})
</script>

<style lang="scss">
.mirroreffect {
  transform: translate(-50%, -50%) scale(-1, 1) !important;
}

#preview-container {
  position: fixed;
  height: 100%;
  width: 100%;

  /* Prevent interaction */
  pointer-events: none;
  user-select: none;
}
#preview-outer-container {
  position: relative;

  /* change following to resize the preview stream and frame container */
  height: 100%;
  width: 100%;
}

#preview-outer-blurred {
  width: 110%;
  height: 110%;

  object-fit: cover;

  filter: blur(8px);
  opacity: 0.6;
}

#preview-inner-container {
  position: relative;

  aspect-ratio: 1/1;
  /* fallback */
  max-width: 100%;
  max-height: 100%;
}

#preview-inner-container img,
#preview-inner-container canvas {
  width: 100%;
  height: 100%;
}

#preview-inner-container.stream-no-preview {
  width: 100%;
  height: 100%;
}

#preview-inner-container > .cover {
  object-fit: cover;
}

#preview-inner-container > .contain {
  object-fit: contain;
}

/* position elements */
.preview-center-element {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
