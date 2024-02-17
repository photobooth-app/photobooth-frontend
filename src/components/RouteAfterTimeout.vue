<template>
  <div><!-- empty --></div>
</template>

<script setup>
import { useIdle, useTimestamp } from "@vueuse/core";
import { computed, watch, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";

const $q = useQuasar();
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
let warningPopup = null;

function showNotification() {
  warningPopup = $q.notify({
    progress: true,
    message: props.warning_message,
    type: "info",
    multiline: true,
    timeout: remainingTime.value,
    icon: "slideshow",
  });
}

function hideNotification() {
  if (warningPopup) {
    //programatically close: https://quasar.dev/quasar-plugins/notify/#programmatically-closing
    warningPopup(); // this will close the notification
  }
}

onBeforeUnmount(() => {
  hideNotification();
});

watch(showWarning, (showWarningValue) => {
  if (showWarningValue) {
    showNotification();
  } else {
    hideNotification();
  }
});

watch(idle, (idleValue) => {
  if (idleValue) {
    hideNotification();
    router.push({ path: props.route });
  }
});
</script>
