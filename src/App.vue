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
      ConnectionOverlay
    };
  },
  methods: {

    async init () {
      this.uiSettingsStore.initStore();
      this.mediacollectionStore.initStore();

      await this.until(_ => this.uiSettingsStore.isLoaded == true);
      await this.until(_ => this.mediacollectionStore.isLoaded == true);

      this.initSseClient();
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
        .on("message", (message, lastEventId) => {
          console.info(message, lastEventId);
          // TODO: make this a notifier ...
        }) // "message" and "" and null equal!
        .on("logrecord", (logrecord) => {
          this.store.logrecords = [
            JSON.parse(logrecord),
            ...this.store.logrecords.slice(0, 99),
          ];
        })
        .on("error", (err) =>
          console.error("Failed to parse or lost connection:", err)
          // If this error is due to an unexpected disconnection, EventSource will
          // automatically attempt to reconnect indefinitely. You will _not_ need to
          // re-add your handlers.
        )
        .on("statemachine/processinfo", (procinfo) => {
          const _procinfo = JSON.parse(procinfo);
          console.log(_procinfo);
          this.store.statemachine.countdown = _procinfo["countdown"];
          this.store.statemachine.state = _procinfo["state"];
        })
        .on("imagedb/newarrival", (data) => {
          const _data = JSON.parse(data);
          console.log("received new item to add to collection:", _data);
          this.mediacollectionStore.collection.unshift(_data);
          this.$router.push({ path: `/itemviewer/${_data['id']}` });

        })
        .on("locationservice/geolocation", (geolocation) => {
          this.store.stats.geolocation = JSON.parse(geolocation);
        })
        .on("information", (information) => {
          Object.assign(this.store.information, JSON.parse(information));
        })
        .on("ping", () => {
          //last SSE ping
          this.store.lastHeartbeat = Date.now();
          this.connected = true;
        })
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
