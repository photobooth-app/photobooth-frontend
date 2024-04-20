<template>
  <div><!-- empty --></div>
</template>

<script setup>
import { useIdle, useTimestamp } from '@vueuse/core';
import { computed, watch, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
// import { useI18n } from 'vue-i18n';
// const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const props = defineProps({
  route: {
    /* route to push after timeout */
    type: String,
    required: true,
  },
  timeoutMs: {
    /* timeout after which route is pushed */
    type: Number,
    required: true,
  },
  warningMessage: {
    type: String,
    default: 'Auto-starting slideshow... Click anywhere to stay on this page.',
  },
  warningTimeMs: {
    type: Number,
    default: 10000,
  },
});

const { idle, lastActive } = useIdle(props.timeoutMs);
const now = useTimestamp({ interval: 1000 });
const remainingTime = computed(() => props.timeoutMs - (now.value - lastActive.value));
const showWarning = computed(() => props.warningTimeMs > remainingTime.value);
let warningPopup = null;

function showNotification() {
  warningPopup = $q.notify({
    progress: true,
    message: props.warningMessage,
    type: 'info',
    multiline: true,
    timeout: remainingTime.value,
    icon: 'slideshow',
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
