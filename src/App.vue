<template>
  <div>
    <router-view />
    <q-dialog v-model="showConnectionOverlay" persistent>
      <connection-overlay />
    </q-dialog>
  </div>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useMainStore } from 'stores/main-store.js';
import { useStateStore } from 'stores/state-store.js';
import { useConfigurationStore } from 'stores/configuration-store.ts';
import { useMediacollectionStore } from 'stores/mediacollection-store.js';
import { useRouter } from 'vue-router';
import ConnectionOverlay from './components/ConnectionOverlay.vue';
import { remoteProcedureCall } from './util/fetch_api.js';
import { get } from 'lodash';
export default defineComponent({
  name: 'App',
  components: { ConnectionOverlay },
  setup() {
    const store = useMainStore();
    const stateStore = useStateStore();
    const configurationStore = useConfigurationStore();
    const mediacollectionStore = useMediacollectionStore();
    const router = useRouter();
    const connected = ref(false);
    const lineEstablished = ref(false);

    //TODO: need to make app wait until fully init?
    console.log(configurationStore.isLoaded);

    setInterval(function () {
      const timeoutConnected = 2000;
      if (Date.now() - store.lastHeartbeat > timeoutConnected) connected.value = false;
    }, 200);

    return {
      connected,
      lineEstablished,
      router,
      store,
      stateStore,
      configurationStore,
      mediacollectionStore,
      ConnectionOverlay,
      remoteProcedureCall,
    };
  },
  data() {
    return {};
  },
  computed: {
    // a computed getter
    showConnectionOverlay() {
      return !this.connected;
    },
  },

  async created() {
    console.log('app created, waiting for stores to init first dataset');
    await this.init();
    console.log('data initialization finished');
  },
  unmounted() {
    window.removeEventListener('keyup', this.keyUpHandler);
  },
  methods: {
    async init() {
      this.configurationStore.initStore();
      this.mediacollectionStore.initStore();

      await this.until(() => this.configurationStore.isLoaded == true);
      await this.until(() => this.mediacollectionStore.isLoaded == true);

      this.initSseClient();

      // for now on app start we send an abort to the backend.
      // could be improved to actually handle the state the machine is in and send ui to according state
      // remoteProcedureCall("/api/actions/abort");
      console.log('installing listener for keyboard input');
      window.addEventListener('keyup', this.keyUpHandler);
    },

    until(conditionFunction) {
      const poll = (resolve) => {
        if (conditionFunction()) resolve();
        else setTimeout(() => poll(resolve), 400);
      };

      return new Promise(poll);
    },

    initSseClient() {
      this.sseClient = this.$sse
        .create('/api/sse')

        .on(
          'error',
          (err) => console.error('Failed to parse or lost connection:', err),
          // If this error is due to an unexpected disconnection, EventSource will
          // automatically attempt to reconnect indefinitely. You will _not_ need to
          // re-add your handlers.
          // Info there is general "message" "" and null events avail. Photobooth doesnt use the generic ones as not specific enough
          // "message" and "" and null equal!
        )
        .on('FrontendNotification', (notification) => {
          // linked to SseEventFrontendNotification, event: FrontendNotification
          const _notification = JSON.parse(notification);
          console.log(_notification);

          this.$q.notify({
            caption: _notification['caption'] || 'Notification',
            message: _notification['message'],
            color: _notification['color'] || 'info',
            icon: _notification['icon'] || 'info',
            spinner: _notification['spinner'] || false,
            actions: [
              {
                icon: 'close',
                color: 'white',
                round: true,
              },
            ],
          });
        })
        .on('LogRecord', (logrecord) => {
          this.store.logrecords = [JSON.parse(logrecord), ...this.store.logrecords.slice(0, 199)];
        })
        .on('ProcessStateinfo', (procinfo) => {
          const _procinfo = JSON.parse(procinfo);
          console.log('ProcessStateinfo', _procinfo);
          if (Object.keys(_procinfo).length === 0 && _procinfo.constructor === Object) {
            this.stateStore.$reset();
          } else {
            Object.assign(this.stateStore, _procinfo);
          }
        })
        .on('DbInsert', (data) => {
          const _data = JSON.parse(data);
          console.log('received new item to add to collection:', _data);
          // this.mediacollectionStore.collection.unshift(_data["mediaitem"]);
          this.mediacollectionStore.addMediaitem(_data['mediaitem']);
        })
        .on('DbRemove', (mediaitem) => {
          const _mediaitem = JSON.parse(mediaitem);
          console.log('received request to remove item from collection:', _mediaitem);
          this.mediacollectionStore.removeMediaitem(_mediaitem);
        })

        .on('InformationRecord', (information) => {
          Object.assign(this.store.information, JSON.parse(information));
        })
        .on('ping', () => {
          //last SSE ping, used to detect connection health
          this.store.lastHeartbeat = Date.now();
          this.connected = true;
        })
        .connect()
        .then((sse) => {
          console.log(sse);
          console.log('SSE connected!');
          this.lineEstablished = true;
        })
        .catch((err) => {
          // When this error is caught, it means the initial connection to the
          // events server failed.  No automatic attempts to reconnect will be made.
          console.error('Failed make initial SSE connection!', err);
        });
    },
    keyUpHandler(e) {
      if (!this.configurationStore.getConfigElement('hardwareinputoutput.keyboard_input_enabled', false)) {
        console.log('keyboard input is disabled, to use keyboard input enable it in the configuration and reload the page.');
        return;
      }
      const action_collections = ['actions.image', 'actions.collage', 'actions.animation', 'actions.video', 'printer.print'];
      action_collections.forEach((action_collection) => {
        const action_config = this.configurationStore.getConfigElement(action_collection, []);
        action_config.forEach((action, index) => {
          const keycode = get(action, 'trigger.keyboard_trigger.keycode');
          if (keycode == e.key) {
            remoteProcedureCall(`/api/${action_collection.replace('.', '/')}/${index}`);
            return;
          }
        });
      });
    },
  },
});
</script>
