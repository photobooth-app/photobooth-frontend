<template>
  <div v-if="isImage(item.processed)" class="full-height full-width flex flex-center overflow-hidden">
    <div
      class="relative-position image-wrapper flex flex-center"
      :style="aspectRatio ? { aspectRatio: `${aspectRatio}` } : {}"
    >
      <transition name="fade">
        <img
          v-if="isApplyingLongRunningFilter"
          :draggable="false"
          class="preview-image absolute-top-left"
          :src="`/media/preview/${item.id}?processed=false&${item.revision}`"
        />
      </transition>

      <transition name="fade">
        <img
          v-show="isLoaded && !isApplyingLongRunningFilter"
          :key="`${item.id}-${item.revision}`"
          :draggable="false"
          class="preview-image"
          :src="`/media/preview/${item.id}?${item.revision}`"
          @load="onImageLoad"
        />
      </transition>

      <transition name="fade">
        <div v-if="isApplyingLongRunningFilter" class="rainbow-frame-overlay">
          <div class="rainbow-badge row items-center q-px-md q-py-xs text-white shadow-10">
            <q-spinner-dots size="1.6em" color="white" class="q-mr-sm" />
            <div class="text-subtitle1 text-weight-medium">{{ $t('Filter is processing...') }}</div>
          </div>
        </div>
      </transition>
    </div>
  </div>
  <div v-else-if="isVideo(item.processed)" class="full-height">
    <video
      :draggable="false"
      :src="`/media/preview/${item.id}?${item.revision}`"
      class="rounded-borders full-height full-width"
      muted
      autoplay
      style="object-fit: contain; max-width: 100%; max-height: 100%"
      loop
      playsinline
      controlslist="nofullscreen nodownload noremoteplayback noplaybackrate"
      disablepictureinpicture
    ></video>
  </div>

  <!--eslint-disable-next-line @intlify/vue-i18n/no-raw-text-->
  <div v-else>Element not supported to display.</div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { components } from '@/dto/api'
import { isVideo, isImage } from '@/util/media_is_type'

const props = defineProps<{
  item: components['schemas']['MediaitemPublic']
  isApplyingLongRunningFilter?: boolean
}>()

const aspectRatio = ref<number | null>(null)
const isLoaded = ref(false)

watch(
  () => [props.item.id, props.item.revision],
  () => {
    isLoaded.value = false
  },
  { immediate: true }
)

function onImageLoad(e: Event) {
  const target = e.target as HTMLImageElement
  if (target && target.naturalWidth && target.naturalHeight) {
    aspectRatio.value = target.naturalWidth / target.naturalHeight
  }
  isLoaded.value = true
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.image-wrapper {
  position: relative;
  height: 100%;
  width: auto;
  max-width: 100%;
  max-height: 100%;
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.rainbow-frame-overlay {
  position: absolute;
  inset: 0;
  z-index: 10;
  pointer-events: none;
  box-sizing: border-box;
}

.rainbow-frame-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 4px solid transparent;
  border-image: linear-gradient(135deg, #ff0055, #ff5000, #ffcc00, #00ff66, #00ccff, #7000ff, #ff0055) 1;
  animation: rainbow-border 3s linear infinite;
  box-shadow: inset 0 0 10px rgba(255, 255, 255, 0.3), 0 0 15px rgba(0, 204, 255, 0.4);
}

.rainbow-badge {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  white-space: nowrap;
}

@keyframes rainbow-border {
  0% {
    filter: hue-rotate(0deg);
  }
  100% {
    filter: hue-rotate(360deg);
  }
}
</style>
