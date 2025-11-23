<template>
  <div v-if="isImage(item.unprocessed)" class="full-height full-width">
    <q-img
      :draggable="false"
      class="full-height"
      fit="contain"
      loading="eager"
      loading-show-delay="800"
      no-transition
      :src="`/media/preview/${item.id}?${item.updated_at}`"
    />
  </div>
  <div v-else-if="isVideo(item.unprocessed)" class="full-height">
    <video
      :draggable="false"
      :src="`/media/preview/${item.id}?${item.updated_at}`"
      class="rounded-borders full-height full-width"
      muted
      autoplay
      style="object-fit: contain; max-width: 100%; max-height: 100%"
      loop
      playsinline
      :controls="item.media_type === 'video'"
      controlslist="nofullscreen nodownload noremoteplayback noplaybackrate"
      disablepictureinpicture
    ></video>
  </div>

  <!--eslint-disable-next-line @intlify/vue-i18n/no-raw-text-->
  <div v-else>Element not supported to display.</div>
</template>

<script setup lang="ts">
import type { components } from 'src/dto/api'
import { isVideo, isImage } from 'src/util/media_is_type'

defineProps<{
  item: components['schemas']['MediaitemPublic']
}>()
</script>
