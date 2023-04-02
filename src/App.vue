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
    const router = useRouter();

    //load initial ui settings
    uiSettingsStore.loadUiSettings();

    //TODO: need to make app wait until fully init?
    console.log(uiSettingsStore.isLoaded)

    const connected = ref(false);


    setInterval(function () {
      const timeoutConnected = 2000;
      if (Date.now() - store.lastHeartbeat > timeoutConnected)
        connected.value = false;
    }, 200);

    setInterval(function () {
      if (connected.value == false)
        console.log(
          "regular check: not connected. TODO: implement reconnect functionality once initialized"
        );
      //TODO:sseClient.connect()
    }, 500);

    return {
      connected,
      router,
      store,
      uiSettingsStore,
      ConnectionOverlay
    };
  },

  created () {
    let sseClient = this.$sse
      .create("/eventstream")
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
      )
      .on("statemachine/processinfo", (procinfo) => {
        const _procinfo = JSON.parse(procinfo);
        console.log(_procinfo);
        this.store.statemachine.countdown = _procinfo["countdown"];
        this.store.statemachine.state = _procinfo["state"];
      })
      .on("imagedb/newarrival", (data) => {
        const _data = JSON.parse(data);
        console.log(_data);
        this.store.gallery.newArrivalItem = _data;
        this.$router.push({ path: "/newItemArrived" });
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
        console.log("SSE connected!");
      })
      .catch((err) => console.error("Failed make SSE connection:", err));


  },
});
</script>
