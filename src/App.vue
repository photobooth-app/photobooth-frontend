<template>
  <router-view />
  <q-dialog v-model="showConnectionOverlay" persistent>
    <connection-overlay />
  </q-dialog>
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import { useMainStore } from "stores/main-store.js";
import { useUiSettingsStore } from "stores/ui-settings-store.js";
import { useMediacollectionStore } from "stores/mediacollection-store.js";
import { useRouter } from "vue-router";
import ConnectionOverlay from "./components/ConnectionOverlay";
import { remoteProcedureCall } from "boot/axios";

export default defineComponent({
  name: "App",
  components: { ConnectionOverlay },
  data () {
    return {

    }
  },
  computed: {
    // a computed getter
    showConnectionOverlay () {
      return !this.connected
    }
  },
  setup () {
    const store = useMainStore();
    const uiSettingsStore = useUiSettingsStore();
    const mediacollectionStore = useMediacollectionStore();
    const router = useRouter();
    let sseClient = null;
    const connected = ref(false);
    const lineEstablished = ref(false);


    //TODO: need to make app wait until fully init?
    console.log(uiSettingsStore.isLoaded)

    setInterval(function () {
      const timeoutConnected = 2000;
      if (Date.now() - store.lastHeartbeat > timeoutConnected)
        connected.value = false;
    }, 200);



    return {
      connected,
      lineEstablished,
      router,
      store,
      uiSettingsStore,
      mediacollectionStore,
      ConnectionOverlay,
      remoteProcedureCall
    };
  },
  methods: {

    async init () {
      this.uiSettingsStore.initStore();
      this.mediacollectionStore.initStore();

      await this.until(_ => this.uiSettingsStore.isLoaded == true);
      await this.until(_ => this.mediacollectionStore.isLoaded == true);

      this.initSseClient();


      // for now on app start we send an abort to the backend.
      // could be improved to actually handle the state the machine is in and send ui to according state
      remoteProcedureCall("/processing/cmd/abort");

    },


    until (conditionFunction) {

      const poll = resolve => {
        if (conditionFunction()) resolve();
        else setTimeout(_ => poll(resolve), 400);
      }

      return new Promise(poll);
    },


    initSseClient () {
      this.sseClient = this.$sse
        .create("/sse")

        .on(
          "error", (err) =>
          console.error("Failed to parse or lost connection:", err)
          // If this error is due to an unexpected disconnection, EventSource will
          // automatically attempt to reconnect indefinitely. You will _not_ need to
          // re-add your handlers.
          // Info there is general "message" "" and null events avail. Photobooth doesnt use the generic ones as not specific enough
          // "message" and "" and null equal!
        )
        .on(
          "FrontendNotification", (message, lastEventId) => {
            // linked to SseEventFrontendNotification, event: FrontendNotification
            // TODO: make this a notifier ...
            console.warn(message, lastEventId);
          }
        )
        .on(
          "LogRecord", (logrecord) => {
            this.store.logrecords = [
              JSON.parse(logrecord),
              ...this.store.logrecords.slice(0, 99),
            ];
          }
        )
        .on(
          "ProcessStateinfo", (procinfo) => {
            const _procinfo = JSON.parse(procinfo);
            console.log(_procinfo);
            this.store.statemachine = _procinfo;
          }
        )
        .on(
          "DbInsert", (data) => {
            const _data = JSON.parse(data);
            console.log("received new item to add to collection:", _data);
            this.mediacollectionStore.collection.unshift(_data['mediaitem']);

            // also to present? // or also to confirm/repeat?
            if (this.$route.path.indexOf('/admin') >= 0)  // not display if on admin path
              return
            if (_data['present'] || _data['to_confirm_or_reject'])
              this.$router.push({ path: `/itemviewer/${_data['mediaitem']['id']}`, query: { approval: _data['to_confirm_or_reject'] } });


          }
        )
        .on(
          "InformationRecord", (information) => {
            Object.assign(this.store.information, JSON.parse(information));
          }
        )
        .on(
          "ping", () => {
            //last SSE ping, used to detect connection health
            this.store.lastHeartbeat = Date.now();
            this.connected = true;
          }
        )
        .connect()
        .then((sse) => {
          console.log(sse);
          console.log("SSE connected!");
          this.lineEstablished = true;
        })
        .catch((err) => {
          // When this error is caught, it means the initial connection to the
          // events server failed.  No automatic attempts to reconnect will be made.
          console.error("Failed make initial SSE connection!", err)
        });

    }
  },


  async created () {

    console.log("app created, waiting for stores to init first dataset")
    this.init();
    console.log("data initialization finished")


    // setInterval(() => {
    //   if (!this.lineEstablished) {
    //     console.log(
    //       "initial connection has not been made yet! retrying. Once connection was successful, sseclient auto reestablishes connection on loss."
    //     );

    //     this.init();
    //   }
    // }, 1500);



  },
});
</script>
