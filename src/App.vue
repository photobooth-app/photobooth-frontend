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
import { useUiSettingsStore } from 'stores/ui-settings-store.js';
import { useMediacollectionStore } from 'stores/mediacollection-store.js';
import { useRouter } from 'vue-router';
import ConnectionOverlay from './components/ConnectionOverlay.vue';
import { remoteProcedureCall } from 'boot/axios';

export default defineComponent({
  name: 'App',
  components: { ConnectionOverlay },
  data() {
    return {};
  },
  computed: {
    // a computed getter
    showConnectionOverlay() {
      return !this.connected;
    },
  },
  setup() {
    const store = useMainStore();
    const stateStore = useStateStore();
    const uiSettingsStore = useUiSettingsStore();
    const mediacollectionStore = useMediacollectionStore();
    const router = useRouter();
    const connected = ref(false);
    const lineEstablished = ref(false);

    //TODO: need to make app wait until fully init?
    console.log(uiSettingsStore.isLoaded);

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
      uiSettingsStore,
      mediacollectionStore,
      ConnectionOverlay,
      remoteProcedureCall,
    };
  },
  methods: {
    async init() {
      this.uiSettingsStore.initStore();
      this.mediacollectionStore.initStore();

      await this.until(() => this.uiSettingsStore.isLoaded == true);
      await this.until(() => this.mediacollectionStore.isLoaded == true);

      this.initSseClient();

      // for now on app start we send an abort to the backend.
      // could be improved to actually handle the state the machine is in and send ui to according state
      // remoteProcedureCall("/processing/cmd/abort");
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
          (err) => console.error('Failed to parse or lost connection:', err)
          // If this error is due to an unexpected disconnection, EventSource will
          // automatically attempt to reconnect indefinitely. You will _not_ need to
          // re-add your handlers.
          // Info there is general "message" "" and null events avail. Photobooth doesnt use the generic ones as not specific enough
          // "message" and "" and null equal!
        )
        .on('FrontendNotification', (notification) => {
          // linked to SseEventFrontendNotification, event: FrontendNotification
          const _notification = JSON.parse(notification);
          console.warn(_notification);

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
  },

  async created() {
    console.log('app created, waiting for stores to init first dataset');
    this.init();
    console.log('data initialization finished');
  },
});
</script>
