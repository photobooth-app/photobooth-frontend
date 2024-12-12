<template>
  <!-- progress bar to timeout and close -->
  <q-linear-progress
    v-if="remainingSeconds >= 0"
    id="gallery-linear-progress-bar"
    class="absolute"
    :value="remainingSeconds / props.duration"
    animation-speed="200"
    color="grey"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps<{
  duration: number
}>()

const remainingSeconds = ref(0)
let intervalTimerId: number

const emit = defineEmits<{
  triggerTimeout: []
}>()

// functions
function abortTimer() {
  clearInterval(intervalTimerId)
  remainingSeconds.value = 0
}
function startTimer() {
  remainingSeconds.value = props.duration

  intervalTimerId = window.setInterval(() => {
    remainingSeconds.value -= 0.1

    if (remainingSeconds.value <= 0) {
      clearInterval(intervalTimerId)
      emit('triggerTimeout') //TODO: this.$router.push({ path: '/' })
    }
  }, 100)
}

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  abortTimer()
})
</script>
