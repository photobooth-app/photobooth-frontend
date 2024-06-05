import { defineStore } from 'pinia';
import { setCssVar } from 'quasar';
import { Notify } from 'quasar';
import { get } from 'lodash';
import { _fetch } from 'src/util/fetch_api';
//https://stackoverflow.com/a/75060220

const STATES = {
  INIT: 0,
  DONE: 1,
  WIP: 2,
  ERROR: 3,
};

export const useConfigurationStore = defineStore('configuration-store', {
  state: () => ({
    // all config settings. used by app as well as to configure in admin and update to server.
    configuration: {},

    storeState: STATES.INIT,
  }),
  actions: {
    async getConfig(which = 'current') {
      try {
        const response = await _fetch(`/api/admin/config/${which}`);
        console.log(response);

        this.configuration = await response.json();
      } catch (error) {
        console.warn(error);

        Notify.create({
          message: String(error),
          caption: 'Error getting config!',
          color: 'red',
        });
      } finally {
        // commit('setLoading', false);
      }
    },

    // actions
    async saveConfig() {
      console.log('sync config to server');
      console.log(this.configuration);

      try {
        const response = await _fetch('/api/admin/config/current', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.configuration),
        });

        if (response.ok) {
          // if HTTP-status is 200-299
          // reload configuration again because some default values could be set by server during processing
          await this.getConfig('currentActive');
          Notify.create({
            // TODO: How to access the translated strings here??
            // message: $t("MSG_CONFIG_PERSIST_OK"),
            message: 'Configuration successfully persisted. To apply hardware settings changed, restart the app!',
            color: 'positive',
          });
        } else {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          type ResponseErrorData = {
            detail: Array<{
              loc: Array<string>;
              msg: string;
            }>;
          };
          // https://kentcdodds.com/blog/using-fetch-with-type-script
          const json: ResponseErrorData = await response.json();

          let notify_msg = '';
          Object.values(json.detail).forEach((detail) => {
            notify_msg += `${detail['msg']}: ${detail['loc'].join('→')}<br/>`;
          });

          Notify.create({
            caption: 'Configuration Validation Error',
            icon: 'error',
            html: true,
            message: notify_msg,
            color: 'negative',
          });
          return;
        }
      } catch (error) {
        console.error(error);
        Notify.create({
          message: String(error),
          caption: 'Error saving config',
          color: 'negative',
        });
      }
    },
    postInitStore() {
      // apply theme settings
      setCssVar('primary', this.getConfigElement('uisettings.PRIMARY_COLOR', 'black'));
      setCssVar('secondary', this.getConfigElement('uisettings.SECONDARY_COLOR', 'black'));
    },
    initStore(forceReload = false) {
      console.log('loading configuration store');
      if (this.isLoaded && forceReload == false) {
        console.log('settings loaded once already, skipping');
        return;
      }

      this.storeState = STATES.WIP;

      fetch('/api/config/currentActive')
        .then((response) => response.json())
        .then((data) => {
          console.log('finished successfully');
          console.log(data);

          this.configuration = data;

          this.postInitStore();

          this.storeState = STATES.DONE;
        })
        .catch((e) => {
          console.log('get config failed', e);
          console.log(e);
          this.storeState = STATES.ERROR;
        });
    },
  },
  getters: {
    isLoaded(): boolean {
      return this.storeState === STATES.DONE;
    },
    isLoading(): boolean {
      return this.storeState === STATES.WIP;
    }, // getConfigElement: (state) => state.configuration,
    getConfigElement:
      (state) =>
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (path: string, defaultValue?: any) =>
        get(state.configuration, path, defaultValue),
  },
});
