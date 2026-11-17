<template>
  <div v-if="isImage(item.processed)" class="full-height full-width">
    <q-img
      :draggable="false"
      class="full-height"
      fit="contain"
      loading="eager"
      loading-show-delay="800"
      no-transition
      :src="`/media/preview/${item.id}?${item.revision}`"
    />
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
import type { MediaitemPublic } from '@/dto/generated'
import { isVideo, isImage } from '@/util/media_is_type'

defineProps<{
  item: MediaitemPublic
}>()
</script>
