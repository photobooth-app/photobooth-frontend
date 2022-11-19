import { defineStore } from "pinia";
import { ref } from "vue";

export const useMainStore = defineStore("main-store", {
  state: () => ({
    //to be in sync with booth
    settings: {
      asdf: "1",
    },

    //local settings stored in browser
    localSettings: {},

    //session data only (graph history, ...)
    stats: {
      focuser: null,
      geolocation: null,
      wifi: null,
    },

    messages: [],

    gallery: {
      images: { thumbnail: "", preview: "", full: "", raw: null },
    },

    ping: null,
  }),

  getters: {
    //doubleCount: (state) => state.counter * 2,
  },
  actions: {
    /*increment() {
      this.counter++;
    },*/
  },
});
