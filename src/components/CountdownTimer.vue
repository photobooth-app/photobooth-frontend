<template>
  <div v-show="showBox" id="countdown-timer-container" class="flex flex-center" style="width: 70vw; height: 70vh">
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-show="showMessage" id="countdown-timer-message" style="position: absolute; font-size: 150px" v-html="messageText"></div>
    <div style="height: 100%">
      <!-- div-100%height fixes the max height of the svg to render the circular process not to exhaust the painting area resulting in scrollbars-->
      <q-circular-progress
        v-show="showCountdown"
        :show-value="!showMessage"
        style="width: 100%; height: 100%"
        :value="remainingSeconds"
        :min="0"
        :max="startDuration"
        reverse
        animation-speed="100"
        font-size="0.5em"
        size="70vh"
        color="primary"
        class="text-secondary"
      >
        {{ parseFloat(remainingSeconds.toFixed(0)) }}
      </q-circular-progress>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

let intervalTimerId: number
const remainingSeconds = ref(0)
const startDuration = ref(0)

interface Props {
  duration: number
  messageDuration?: number
  messageText?: string
}

const props = withDefaults(defineProps<Props>(), {
  messageDuration: 0.5,
  messageText: '😃',
})

const showBox = computed(() => {
  return remainingSeconds.value > 0
})
const showCountdown = computed(() => {
  return remainingSeconds.value > 0
})
const showMessage = computed(() => {
  return remainingSeconds.value <= props.messageDuration
})

onMounted(() => {
  startTimer()
})

onBeforeUnmount(() => {
  abortTimer()
})

const abortTimer = () => {
  clearInterval(intervalTimerId)
  remainingSeconds.value = 0
}
const startTimer = () => {
  startDuration.value = props.duration
  remainingSeconds.value = startDuration.value

  console.log(`starting timer, duration=${startDuration.value}`)

  intervalTimerId = window.setInterval(() => {
    remainingSeconds.value -= 0.05

    if (remainingSeconds.value <= 0) {
      clearInterval(intervalTimerId)
    }
  }, 50)
}
</script>
