<template>
  <q-card class="column no-wrap flex-center full-height q-pa-sm">
    <MediaItemPreviewViewer :item="item" />
  </q-card>
</template>

<script setup lang="ts">
import { default as MediaItemPreviewViewer } from '../MediaItemPreviewViewer.vue'
import type { components } from 'src/dto/api'


defineProps<{
  item: components['schemas']['MediaitemPublic']
}>()
</script>
