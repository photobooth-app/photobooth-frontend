<template>
  <div style="width: 40%; height: 40%" v-show="showBox">
    <q-circular-progress
      v-show="showCountdown"
      show-value
      class="text-light-blue"
      style="width: 100%; height: 100%"
      :value="remainingSeconds"
      :min="0"
      :max="totalDuration"
      reverse
      size="150px"
      color="light-blue"
    />
    <q-icon
      :name="icon"
      v-show="showMessage"
      size="200px"
      style="width: 100%; height: 100%"
    />
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "CountdownTimer",

  data() {
    return {
      remainingSeconds: 0.0,
      timerFinished: true,
    };
  },
  watch: {
    letsseewhetherweneed: function () {},
  },
  computed: {
    totalDuration() {
      return +this.duration + +this.countdownOffset;
    },
    showBox() {
      return !this.timerFinished;
    },
    showCountdown() {
      return +this.remainingSeconds >= this.messageDuration;
    },
    showMessage() {
      return !this.showCountdown;
    },
  },
  mounted() {
    //this.startTimer();
  },
  beforeUnmounted() {
    clearInterval(this.intervalId);
  },
  methods: {
    startTimer() {
      var timer = this.totalDuration;

      this.timerFinished = false;
      this.intervalId = setInterval(() => {
        this.remainingSeconds = Number.parseFloat(
          Number.parseFloat(timer).toFixed(1)
        );
        if (timer >= 0) {
          timer -= 0.01;
        } else {
          timer = 0;

          this.timerFinished = true;

          clearInterval(this.intervalId);
        }
      }, 10);
    },
  },
  props: {
    duration: {
      type: Number,
      required: true,
    },

    countdownOffset: {
      type: Number,
      default: 0.0,
    },

    message: {
      type: String,
      default: "Cheeeese :)",
    },

    messageDuration: {
      type: Number,
      default: 0.5,
    },

    icon: {
      type: String,
      default: "😃",
    },
  },
});
</script>
