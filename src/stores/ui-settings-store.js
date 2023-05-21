import { defineStore } from "pinia";
import { api } from "src/boot/axios";

//https://stackoverflow.com/a/75060220

const STATES = {
  INIT: 0,
  DONE: 1,
  WIP: 2,
  ERROR: 3,
};

export const useUiSettingsStore = defineStore("ui-settings-store", {
  state: () => ({
    uiSettings: {
      FRONTPAGE_TEXT: null,
      GALLERY_ENABLE: null,
      GALLERY_EMPTY_MSG: null,
      TAKEPIC_MSG: null,
      TAKEPIC_MSG_TIME: null,
      AUTOCLOSE_NEW_ITEM_ARRIVED: null,
      SHOW_ADMIN_LINK_ON_FRONTPAGE: null,
      EXT_DOWNLOAD_URL: null,
    },

    storeState: STATES.INIT,
  }),
  actions: {
    loadUiSettings() {
      console.log("loadUiSettings");
      if (this.isLoaded) {
        console.log("settings loaded once already, skipping");
        return;
      }
      this.storeState = STATES.WIP;
      api
        .get("/config/ui")
        .then((res) => {
          console.log("loadUiSettings finished successfully");
          console.log(res.data);
          this.uiSettings = res.data;
          this.storeState = STATES.DONE;
        })
        .catch((e) => {
          console.log("loadUiSettings failed");
          this.storeState = STATES.ERROR;
        });
    },
  },
  getters: {
    isLoaded() {
      console.log("isLoaded");
      return this.storeState === STATES.DONE;
    },
    isLoading() {
      console.log("isLoading");
      return this.storeState === STATES.WIP;
    },
  },
});
