<template>
  <q-page id="slideshow-page" class="row justify-center items-center flex flex-center absolute-full">
    <div v-if="mediacollectionStore.collection_number_of_items > 0" class="full-height full-width">
      <MediaItemPreviewViewer :item="mediacollectionStore.collection[currentMediaitemIndex]" />
    </div>
    <div v-else class="full-height"><ItemNotAvailableError /></div>
  </q-page>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useMediacollectionStore } from '../stores/mediacollection-store'
import { default as MediaItemPreviewViewer } from '../components/MediaItemPreviewViewer.vue'
import ItemNotAvailableError from '../components/ItemNotAvailableError.vue'

const mediacollectionStore = useMediacollectionStore()
const nextMediaitemTimeout = 5_000
const currentMediaitemIndex = ref(0)

let intervalTimerId: number

// functions
function handleTimeout() {
  loadNextImage()
  clearTimeout(intervalTimerId)
  startTimer()
}
function startTimer() {
  intervalTimerId = window.setInterval(handleTimeout, nextMediaitemTimeout)
}
function loadNextImage() {
  currentMediaitemIndex.value = Math.floor(Math.random() * mediacollectionStore.collection.length)
}
onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  clearInterval(intervalTimerId)
})
</script>
