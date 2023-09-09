<template>
  <div style="width: 40%; height: 40%" v-show="showBox">
    <q-circular-progress v-show="showCountdown" show-value class="text-light-blue" style="width: 100%; height: 100%"
      :value="parseFloat(remainingSeconds.toFixed(1))" :min="0" :max="this.duration" reverse size="150px"
      color="light-blue" />
    <div v-show="showMessage">
      <span>{{ message }}</span>
      <q-icon :name="icon" size="200px" style="width: 100%; height: 100%" />
    </div>

  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "CountdownTimer",

  data () {
    return {
      intervalTimerId: null,
      remainingSeconds: 0,
    };
  },

  mounted () {
    this.startTimer();
  },
  beforeUnmount () {
    clearInterval(this.intervalTimerId);
  },
  computed: {

    showBox () {
      return this.remainingSeconds > 0;
    },
    showCountdown () {
      return +this.remainingSeconds >= this.messageDuration;
    },
    showMessage () {
      return !this.showCountdown;
    },
  },
  methods: {
    abortTimer () {
      clearInterval(this.intervalTimerId);
      this.remainingSeconds = 0;
    },
    startTimer () {
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

    message: {
      type: String,
      default: "Cheeeese :)",
    },

    icon: {
      type: String,
      default: "😃",
    },
  },
});
</script>
