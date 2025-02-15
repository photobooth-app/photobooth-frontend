<template>
  <div v-if="item.media_type != 'video'" class="full-height full-width">
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
  <div v-else class="full-height">
    <video
      :draggable="false"
      :src="`/media/preview/${item.id}?${item.updated_at}`"
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
import type { components } from 'src/dto/api'

defineProps<{
  item: components['schemas']['MediaitemPublic']
}>()
</script>
