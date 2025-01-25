<template>
  <!-- lowest layer: preview stream -->
  <div id="preview-container" :class="{ mirroreffect: props.enableMirrorEffect }">
    <div id="preview-blurredback" v-if="props.enableBlurredBackgroundStream" style="background-image: url('/api/aquisition/stream.mjpg')"></div>

    <div id="overlay-wrapper" v-if="props.frameOverlayImage ?? true">
      <img id="overlay-image" style="background-image: url('/api/aquisition/stream.mjpg')" :src="props.frameOverlayImage" />
    </div>
    <div id="stream-wrapper" v-else>
      <img id="stream-image" src="/api/aquisition/stream.mjpg" />
    </div>
  </div>
</template>

<script setup lang="ts">
// import type { components } from 'src/dto/api'

const props = defineProps<{
  // from docs: An absent optional prop other than Boolean will have undefined value.
  enableMirrorEffect?: boolean
  enableBlurredBackgroundStream?: boolean
  frameOverlayImage?: string
}>()
</script>

<style lang="scss">
#preview-container {
  position: fixed;
  display: flex;
  justify-content: center;

  align-items: center;
  height: 100%;
  width: 100%;
}

#preview-container.mirroreffect {
  transform: scale(-1, 1);
}

#preview-blurredback {
  z-index: 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 110%;
  height: 110%;
  top: -5%;
  left: -5%;
  filter: blur(10px);
  transform: translateZ(0);
  opacity: 0.6;
  position: fixed;
}

#stream-wrapper,
#overlay-wrapper {
  z-index: 2;
  transform: translateZ(0);
}

#stream-wrapper {
  height: 100%;
}
#overlay-image {
  height: 100%;
  max-height: 100vh;
  max-width: 100vw;
  background-position: center;
  background-repeat: no-repeat;
  object-fit: contain;
  background-size: cover;
}

#stream-image {
  height: 100%;
  max-height: 100vh;
  max-width: 100vw;
  object-fit: contain;
}

#preview-container {
  pointer-events: none;
  user-select: none;
}
</style>
