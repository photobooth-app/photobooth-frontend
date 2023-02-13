import { defineStore } from "pinia";
import { api } from "src/boot/axios";
import { ref } from "vue";
import { Notify } from "quasar";

export const useMainStore = defineStore("main-store", () => {
  //state: () => ({
  //to be in sync with booth
  const serverConfig = ref({});

  //session data only (graph history, ...)
  const stats = ref({
    sharpness: [],
    geolocation: {},
    metadata: {},
  });

  const messages = ref([]);

  const gallery = ref({
    images: [],

    newArrivalItem: {},
    newArrivalPresenter: false,
  });

  const statemachine = ref({
    countdown: 0,
    state: null,
  });

  const ping = ref(null);

  const uiState = ref({
    //after first init set to true, safe to display UI, config is all set.
    initialized: false,
    // set false if connection lost, e.g. display a message if not connected
    connected: false,
  });

  return {
    serverConfig,
    stats,
    messages,
    gallery,
    statemachine,
    ping,
    uiState,
  };
});
