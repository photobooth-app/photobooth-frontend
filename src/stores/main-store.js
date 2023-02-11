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

  // actions
  function uploadConfigAndPersist() {
    console.log("sync config to server");

    api
      .post("/config/current", this.serverConfig)
      .then((response) => {
        Notify.create("Persisted config, trying to restart service");
        console.log(response);
      })
      .catch((error) => {
        Notify.create("error saving config, check browser console");
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.log(error.response.data);
          console.log(error.response.status);
          console.log(error.response.headers);
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log(error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log("Error", error.message);
        }
        console.log(error.config);
      });
    ///api.send....
  }

  return {
    serverConfig,
    stats,
    messages,
    gallery,
    statemachine,
    ping,
    uploadConfigAndPersist,
  };
});
