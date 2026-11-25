<template>
  <div v-if="isImage(item.processed)" ref="imageContainer" class="full-height full-width relative-position flex flex-center overflow-hidden">
    <div v-if="displayedImage" class="relative-position" :style="imageFrameStyle">
      <Transition name="preview-fade">
        <img
          :key="displayedImage.src"
          :src="displayedImage.src"
          :draggable="false"
          alt=""
          class="preview-image absolute-full full-height full-width"
        />
      </Transition>
      <div v-if="showProcessingEffect" class="rainbow-frame-overlay"> </div>
    </div>
    <q-spinner v-else-if="isLoading" class="preview-loading" size="2em" />

    <div
      v-if="isProcessing"
      class="full-height full-width column justify-center content-center"
      style="position: absolute; pointer-events: none"
      role="status"
    >
      <q-spinner-grid size="20em" />
    </div>

    <div v-if="imageLoadFailed" class="absolute-center text-center" role="alert">{{ $t('Error loading image.') }}</div>
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
import { computed, ref, watch } from 'vue'
import { useElementSize } from '@vueuse/core'
import type { MediaitemPublic } from '@/dto/generated'
import { isVideo, isImage } from '@/util/media_is_type'

const props = defineProps<{
  item: MediaitemPublic
  isProcessing?: boolean
  showProcessingEffect?: boolean
}>()

const imageContainer = ref<HTMLElement | null>(null)
const { width, height } = useElementSize(imageContainer)
const displayedImage = ref<{ id: string; src: string; width: number; height: number } | null>(null)
const isLoading = ref(false)
const imageLoadFailed = ref(false)
const imageFrameStyle = computed(() => {
  const image = displayedImage.value
  if (!image) return {}
  const scale = Math.min(width.value / image.width, height.value / image.height)
  return { width: `${image.width * scale}px`, height: `${image.height * scale}px` }
})

watch(
  () => [props.item.id, props.item.revision, isImage(props.item.processed)] as const,
  ([id, revision, image], _, onCleanup) => {
    if (displayedImage.value?.id !== id || !image) displayedImage.value = null
    imageLoadFailed.value = false
    isLoading.value = image
    if (!image) return

    const preview = new Image()
    preview.onload = () => {
      displayedImage.value = { id, src: preview.src, width: preview.naturalWidth, height: preview.naturalHeight }
      isLoading.value = false
    }
    preview.onerror = () => {
      console.error('Error loading image preview:', preview.src)
      imageLoadFailed.value = true
      isLoading.value = false
    }
    onCleanup(() => {
      preview.onload = null
      preview.onerror = null
    })
    preview.src = `/media/preview/${id}?${revision}`
  },
  { immediate: true }
)
</script>

<style scoped>
.preview-image {
  object-fit: contain;
}

.preview-fade-enter-active,
.preview-fade-leave-active {
  transition: opacity 1s ease;
}

.preview-fade-enter-from,
.preview-fade-leave-to {
  opacity: 0;
}

.preview-loading {
  animation: preview-loading-delay 800ms step-end;
}

@keyframes preview-loading-delay {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.rainbow-frame-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

.rainbow-frame-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  border: 4px solid transparent;
  border-image: linear-gradient(135deg, #ff0055, #ff5000, #ffcc00, #00ff66, #00ccff, #7000ff, #ff0055) 1;
  animation: rainbow-border 3s linear infinite;
  box-shadow:
    inset 0 0 10px rgba(255, 255, 255, 0.3),
    0 0 15px rgba(0, 204, 255, 0.4);
}

.rainbow-badge {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  max-width: calc(100% - 16px);
  flex-wrap: nowrap;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 24px;
  text-align: center;
}

@keyframes rainbow-border {
  to {
    filter: hue-rotate(360deg);
  }
}
</style>
