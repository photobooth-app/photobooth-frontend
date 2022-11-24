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
      images: [
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
        {
          thumbnail: "13-2500x1667.jpg",
          preview: "13-2500x1667.jpg",
          full: "13-2500x1667.jpg",
          raw: null,
        },
      ],
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
