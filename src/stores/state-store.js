import { defineStore } from "pinia";

export const useStateStore = defineStore("state-store", {
  state: () => ({
    state: null,
    duration: null,
    //  processing = ref(null);   //could be implemented later to check server state more accurate. for now: computed prob checking for job_postprocessing state because only this one takes a bit
    current_capture_no: null,
    total_captures_no: null,
  }),
  actions: {},
  getters: {},
});
