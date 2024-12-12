<template>
  <div v-if="item.media_type != 'video'">
    <q-img :src="item.thumbnail" loading="eager" no-transition no-spinner :ratio="1" class="rounded-borders"> </q-img>
  </div>
  <div v-else>
    <!-- mimic the q-img for video-elements to make it look same as images but display mp4 gif-like-->
    <div style="padding-bottom: 100%"></div>
    <div class="absolute-full">
      <video
        style="width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%"
        autoplay
        loop
        muted
        playsinline
        :src="item.thumbnail"
        class="rounded-borders"
      ></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MediaItem } from 'src/dto/dto'

defineProps<{
  item: MediaItem
}>()
</script>
