<template>
  <div v-if="showWarning">
    <div class="fullscreen bg-secondary" style="z-index: 98; opacity: 0.5"></div>
    <q-card class="q-pa-sm fixed-center text-h3" style="border-radius: 10px; z-index: 99" id="router-warn-auto-route-dialog">
      <q-card-section horizontal>
        <q-avatar icon="warning" color="primary" style="font-size: 7vh" />
        <div class="q-ml-sm">{{ warning_message }}</div>
      </q-card-section>
      <q-card-section>
        <q-linear-progress
          class="absolute"
          :value="remainingTime / warning_time_ms"
          animation-speed="200"
          color="secondary"
          id="router-linear-progress-bar"
          size="1vh"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup>
import { useIdle, useTimestamp } from "@vueuse/core";
import { computed, watch } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const props = defineProps({
  route: {
    /* route to push after timeout */
    type: String,
    required: true,
  },
  timeout_ms: {
    /* timeout after which route is pushed */
    type: Number,
    required: true,
  },
  warning_message: {
    type: String,
    default: "Auto-starting slideshow... Click anywhere to stay on this page.",
  },
  warning_time_ms: {
    type: Number,
    default: 10000,
  },
});

const { idle, lastActive, reset } = useIdle(props.timeout_ms);
const now = useTimestamp({ interval: 1000 });
const remainingTime = computed(() => props.timeout_ms - (now.value - lastActive.value));
const showWarning = computed(() => props.warning_time_ms > remainingTime.value);

watch(idle, (idleValue) => {
  if (idleValue) {
    reset(); // restarts the idle timer. Does not change lastActive value
    router.push({ path: props.route });
  }
});
</script>
