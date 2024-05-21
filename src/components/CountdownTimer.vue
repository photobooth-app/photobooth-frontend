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

<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'CountdownTimer',
  props: {
    duration: {
      type: Number,
      required: true,
    },

    messageDuration: {
      type: Number,
      default: 0.5,
    },

    messageText: {
      type: String,
      default: '😃',
    },
  },

  data() {
    return {
      intervalTimerId: null,
      remainingSeconds: 0,
      startDuration: 0,
    };
  },
  computed: {
    showBox() {
      return this.remainingSeconds > 0;
    },
    showCountdown() {
      return this.remainingSeconds > 0;
    },
    showMessage() {
      return +this.remainingSeconds <= this.messageDuration;
    },
  },

  mounted() {
    this.startTimer();
  },
  beforeUnmount() {
    clearInterval(this.intervalTimerId);
  },
  methods: {
    abortTimer() {
      clearInterval(this.intervalTimerId);
      this.remainingSeconds = 0;
    },
    startTimer() {
      this.startDuration = this.duration;
      this.remainingSeconds = this.startDuration;

      console.log(`starting timer, duration=${this.startDuration}`);

      this.intervalTimerId = setInterval(() => {
        this.remainingSeconds -= 0.05;

        if (this.remainingSeconds <= 0) {
          clearInterval(this.intervalTimerId);
        }
      }, 50);
    },
  },
});
</script>
