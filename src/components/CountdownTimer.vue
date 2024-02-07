<template>
  <div style="width: 70vw; height: 70vh" v-show="showBox">
    <q-circular-progress
      v-show="showCountdown"
      show-value
      style="width: 100%; height: 100%"
      :value="remainingSeconds"
      :min="0"
      :max="this.duration"
      reverse
      size="70vh"
      color="primary"
      class="text-secondary"
    >
      {{ parseFloat(remainingSeconds.toFixed(0)) }}
    </q-circular-progress>
    <div v-show="showMessage" v-html="messageText"></div>
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "CountdownTimer",

  data() {
    return {
      intervalTimerId: null,
      remainingSeconds: 0,
    };
  },

  mounted() {
    this.startTimer();
  },
  beforeUnmount() {
    clearInterval(this.intervalTimerId);
  },
  computed: {
    showBox() {
      return this.remainingSeconds > 0;
    },
    showCountdown() {
      return +this.remainingSeconds >= this.messageDuration;
    },
    showMessage() {
      return !this.showCountdown;
    },
  },
  methods: {
    abortTimer() {
      clearInterval(this.intervalTimerId);
      this.remainingSeconds = 0;
    },
    startTimer() {
      console.log(`starting timer, duration=${this.duration}`);
      this.remainingSeconds = this.duration;

      this.intervalTimerId = setInterval(() => {
        this.remainingSeconds -= 0.05;

        if (this.remainingSeconds <= 0) {
          clearInterval(this.intervalTimerId);
        }
      }, 50);
    },
  },
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
      default: "😃",
    },
  },
});
</script>
