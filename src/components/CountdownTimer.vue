<template>
  <div style="width: 40%; height: 40%" v-show="showBox">
    <q-circular-progress v-show="showCountdown" show-value class="text-light-blue" style="width: 100%; height: 100%"
      :value="remainingSeconds" :min="0" :max="this.duration" reverse size="150px" color="light-blue" />
    <q-icon :name="icon" v-show="showMessage" size="200px" style="width: 100%; height: 100%" />
  </div>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "CountdownTimer",

  data () {
    return {
      //remainingSeconds: 0,
    };
  },
  watch: {},
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

  },
  props: {
    remainingSeconds: {
      type: Number,
      required: true,
    },

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
