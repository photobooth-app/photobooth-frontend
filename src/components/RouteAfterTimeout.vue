<template>
  <q-card class="q-pa-sm" v-if="timeBeforeRoute < warning_time_ms" id="router-warn-auto-route-dialog">
    <q-card-section class="row items-center">
      <q-avatar icon="warning" color="primary" />
      <span class="q-ml-sm">{{ warning_message }}</span>
    </q-card-section>
  </q-card>
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
const timeBeforeRoute = computed(() => props.timeout_ms - (now.value - lastActive.value));

watch(idle, (idleValue) => {
  if (idleValue) {
    reset(); // restarts the idle timer. Does not change lastActive value
    router.push({ path: props.route });
  }
});
</script>
