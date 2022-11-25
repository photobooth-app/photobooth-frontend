import { defineStore } from "pinia";
import { ref } from "vue";

export const useMainStore = defineStore("main-store", {
  state: () => ({
    //to be in sync with booth
    serverConfig: {},

    //local settings stored in browser
    localSettings: {},

    //session data only (graph history, ...)
    stats: {
      sharpness: null,
      geolocation: null,
      metadata: null,
    },

    messages: [],

    gallery: {
      images: [],
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
