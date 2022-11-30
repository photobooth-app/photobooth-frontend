import { defineStore } from "pinia";
import { api } from "src/boot/axios";
import { ref } from "vue";

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
    images: {},
  });

  const statemachine = ref({
    countdown: 99,
    state: "",
  });

  const ping = ref(null);

  // actions
  function uploadConfigAndPersist() {
    console.log("sync config to server");
    api
      .post("/config/current", this.serverConfig)
      .then((response) => {
        console.log(response);
      })
      .catch(() => {
        console.log("error saving config");
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
