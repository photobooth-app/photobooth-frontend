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
    return {};
  },
  watch: {},
  computed: {
    totalDuration() {
      return +this.duration + +this.countdownOffset;
    },
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
  methods: {},
  props: {
    remainingSeconds: {
      type: Number,
      required: true,
    },

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
