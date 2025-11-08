<template>
  <div>
    <!-- Display Elements -->
    <div v-if="isImage(item.unprocessed)">
      <q-img :src="`/media/thumbnail/${item.id}?${item.updated_at}`" loading="eager" loading-show-delay="800" :ratio="1" class="rounded-borders">
      </q-img>
    </div>

    <div v-else-if="isVideo(item.unprocessed)" class="full-height">
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
    <!--eslint-disable-next-line @intlify/vue-i18n/no-raw-text-->
    <div v-else>Element not supported to display.</div>

    <!-- Small Icons for Collages, Multicam, ... -->

    <q-icon
      v-if="item.media_type == 'collage'"
      class="absolute all-pointer-events"
      size="32px"
      name="sym_o_auto_awesome_mosaic"
      color="white"
      style="top: 8px; right: 8px"
    />
    <q-icon
      v-else-if="item.media_type == 'animation'"
      class="absolute all-pointer-events"
      size="32px"
      name="sym_o_gif_box"
      color="white"
      style="top: 8px; right: 8px"
    />
    <q-icon
      v-else-if="item.media_type == 'video'"
      class="absolute all-pointer-events"
      size="32px"
      name="sym_o_movie"
      color="white"
      style="top: 8px; right: 8px"
    />
    <q-icon
      v-else-if="item.media_type == 'multicamera'"
      class="absolute all-pointer-events"
      size="32px"
      name="sym_o_burst_mode"
      color="white"
      style="top: 8px; right: 8px"
    />
    <!-- else nothing, also no icon for basic image -->
  </div>
</template>

<script setup lang="ts">
import type { components } from 'src/dto/api'
import { isVideo, isImage } from 'src/util/media_is_type'
defineProps<{
  item: components['schemas']['MediaitemPublic']
}>()
</script>
