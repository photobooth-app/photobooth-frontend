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

  const logrecords = ref([]);

  const gallery = ref({
    images: [],

    newArrivalItem: {},
    newArrivalPresenter: false,
  });

  const statemachine = ref({
    countdown: 0,
    state: null,
  });

  const information = ref({});

  const lastHeartbeat = ref(null);

  return {
    serverConfig,
    stats,
    information,
    lastHeartbeat,
    logrecords,
    gallery,
    statemachine,
  };
});
