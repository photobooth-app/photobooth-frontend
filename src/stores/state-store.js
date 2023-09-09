import { defineStore } from "pinia";
import { api } from "src/boot/axios";
import { ref } from "vue";

export const useStateStore = defineStore("state-store", () => {
  const state = ref(null);

  const duration = ref(null);

  const processing = ref(null);

  const current_capture_no = ref(null);
  const total_captures_no = ref(null);

  return {
    state,
    duration,
    processing,
  };
});
