<template>
  <div v-if="isImagePreview" ref="imageContainer" class="full-height full-width relative-position flex flex-center overflow-hidden">
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
    </div>
    <q-spinner v-else-if="isLoading" class="preview-loading" size="2em" />

    <div
      v-if="isProcessing"
      class="full-height full-width column no-wrap justify-center items-center q-pa-md"
      style="position: absolute; pointer-events: none"
      role="status"
    >
      <q-spinner-grid class="processing-spinner" size="20em" />

      <q-chip class="processing-message q-mt-sm text-center" :style="{ visibility: showProcessingMessage ? 'visible' : 'hidden' }">
        <span class="processing-message-text">{{ $t('Getting your photo ready...') }}</span>
      </q-chip>
    </div>

    <div v-if="imageLoadFailed" class="absolute-center text-center" role="alert">{{ $t('Error loading image.') }}</div>
  </div>
  <div v-else-if="item && isVideo(item.processed)" class="full-height">
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
  item?: MediaitemPublic
  src?: string
  isProcessing?: boolean
}>()

const isImagePreview = computed(() => Boolean(props.src) || Boolean(props.item && isImage(props.item.processed)))
const previewSrc = computed(() => props.src ?? (props.item ? `/media/preview/${props.item.id}?${props.item.revision}` : null))
const showProcessingMessage = ref(false)
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
  () => [previewSrc.value, isImagePreview.value] as const,
  ([src, image], _, onCleanup) => {
    if (displayedImage.value?.src !== src || !image) displayedImage.value = null
    imageLoadFailed.value = false
    isLoading.value = image && src !== null
    if (!isLoading.value || !src) return

    const preview = new Image()
    preview.onload = () => {
      displayedImage.value = { id: src, src: preview.src, width: preview.naturalWidth, height: preview.naturalHeight }
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
    preview.src = src
  },
  { immediate: true }
)

watch(
  () => props.isProcessing,
  (isProcessing, _, onCleanup) => {
    showProcessingMessage.value = false
    if (!isProcessing) return

    const timer = setTimeout(() => {
      showProcessingMessage.value = true
    }, 2000)
    onCleanup(() => clearTimeout(timer))
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

.processing-spinner {
  min-height: 0;
  max-width: 100%;
}

.processing-message {
  flex-shrink: 0;
  height: auto;
  max-width: 100%;
}

.processing-message-text {
  overflow-wrap: anywhere;
  white-space: normal;
}
</style>
