<template>
  <q-carousel
    v-model="currentMediaitemId"
    v-touch-swipe.mouse.down="handleSwipeDown"
    class=" "
    style="width: 100%; height: 100%"
    control-type="flat"
    control-color="primary"
    swipeable
    animated
    draggable="false"
    :arrows="true"
    :infinite="true"
    transition-prev="slide-right"
    transition-next="slide-left"
    @transition="carouselTransition"
  >
    <q-carousel-slide v-for="slide in props.slicedImages" :key="slide.id" :name="slide.id" class="column no-wrap flex-center full-height q-pa-sm">
      <MediaItemPreviewViewer :item="slide" />
    </q-carousel-slide>
  </q-carousel>
</template>

<script setup lang="ts">
import { toRef, watch } from 'vue'
import type { components } from 'src/dto/api'

import { default as MediaItemPreviewViewer } from '../MediaItemPreviewViewer.vue'

const props = defineProps<{
  slicedImages: components['schemas']['MediaitemPublic'][]
  mediaitemId: string // warning: if invalid ID is given, there is just shown nothing...
}>()

const currentMediaitemId = toRef(props.mediaitemId)
// update currentSlide if changed externally, so slide can be updated
watch(
  () => props.mediaitemId,
  (mediaitemId) => {
    currentMediaitemId.value = mediaitemId
  },
)

const emit = defineEmits<{
  triggerChangedItem: [id: string]
}>()

function handleSwipeDown() {
  console.log('TODO: add method to close dialog programmatically')
}

function carouselTransition(newval: string) {
  emit('triggerChangedItem', newval)
}
</script>
