<template>
  <div v-if="item.media_type != 'video'" class="full-height">
    <img :draggable="false" class="rounded-borders full-height" style="object-fit: contain; max-width: 100%; max-height: 100%" :src="item.preview" />
  </div>
  <div v-else class="full-height">
    <video
      :draggable="false"
      :src="item.preview"
      class="rounded-borders full-height"
      muted
      autoplay
      style="object-fit: contain; max-width: 100%; max-height: 100%"
      loop
      playsinline
      controls
      controlslist="nofullscreen nodownload noremoteplayback noplaybackrate"
      disablepictureinpicture
    ></video>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from 'src/dto/dto'

defineProps<{
  item: MediaItem
}>()
</script>
