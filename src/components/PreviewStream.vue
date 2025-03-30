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

const props = defineProps<{
  // from docs: An absent optional prop other than Boolean will have undefined value.
  enableMirrorEffectStream?: boolean
  enableMirrorEffectFrame?: boolean
  enableBlurredBackgroundStream?: boolean
  frameOverlayImage?: string
}>()

let canvasStream = null
let ctxStream = null
let canvasBlurred = null
let ctxBlurred = null

const { open, close } = useWebSocket('ws://localhost:8000/api/aquisition/stream', {
  immediate: false,
  // autoClose: true,
  autoReconnect: {
    retries: -1,
    delay: 1000,
  },
  onConnected() {
    console.log('stream connected via websockets')
  },
  onDisconnected(ws, event) {
    console.log('stream disconnected', event)
  },

  async onMessage(ws, event) {
    if ((canvasStream && ctxStream) || (canvasBlurred && ctxBlurred)) {
      const imageBitmap = await createImageBitmap(new Blob([event.data], { type: 'image/jpeg' }))

      if (canvasStream && ctxStream) {
        canvasStream.width = imageBitmap.width
        canvasStream.height = imageBitmap.height
        ctxStream.drawImage(imageBitmap, 0, 0)
      }
      if (canvasBlurred && ctxBlurred) {
        canvasBlurred.width = imageBitmap.width
        canvasBlurred.height = imageBitmap.height
        ctxBlurred.drawImage(imageBitmap, 0, 0)
      }
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
