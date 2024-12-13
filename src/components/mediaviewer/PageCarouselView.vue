<template>
  <q-carousel
    v-model="currentSlideId"
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
import { ref, onMounted } from 'vue'
import type { MediaItem } from 'src/dto/dto'
import { default as MediaItemPreviewViewer } from '../MediaItemPreviewViewer.vue'

const currentSlideId = ref('')

const props = defineProps<{
  slicedImages: MediaItem[]
  initialSlideId: string // warning: if invalid ID is given, there is just shown nothing...
}>()

onMounted(() => {
  currentSlideId.value = props.initialSlideId
})

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
