<template>
  <div v-if="item.media_type != 'video'">
    <q-img :src="`/media/thumbnail/${item.id}?${item.updated_at}`" loading="eager" loading-show-delay="800" :ratio="1" class="rounded-borders">
    </q-img>
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
        :src="`/media/thumbnail/${item.id}?${item.updated_at}`"
        class="rounded-borders"
      ></video>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { components } from 'src/dto/api'

defineProps<{
  item: components['schemas']['MediaitemPublic']
}>()
</script>
