<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
import { useMainStore } from "stores/main-store.js";
import { useRouter } from "vue-router";
let sseClient;

export default defineComponent({
  name: "App",
  setup() {
    const store = useMainStore();
    const router = useRouter();

    // on app init navigate to init; after init go to index(or previous requested page)
    if (store.uiState.initialized != true) {
      router.push({ path: "/init" });
    }

    return {
      // you can return the whole store instance to use it in the template
      store,
    };
  },
  created() {
    sseClient = this.$sse
      .create("/eventstream")
      .on("message", (message, lastEventId) => {
        console.info(message, lastEventId);
        this.store.messages = [
          `${message} (#${lastEventId})`,
          ...this.store.messages.slice(0, 19),
        ];
      }) // "message" and "" and null equal!
      .on("error", (err) =>
        console.error("Failed to parse or lost connection:", err)
      )
      .on("autofocus/sharpness", (focuser) => {
        this.store.stats.sharpness = JSON.parse(focuser);
      })
      .on("frameserver/metadata", (metadata) => {
        this.store.stats.metadata = JSON.parse(metadata);
      })
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
      .on("config/currentconfig", (currentconfig) => {
        this.store.serverConfig = JSON.parse(currentconfig);
        this.store.uiState.initialized = true;
      })
      .on("ping", (value) => {
        //last SSE ping
        this.store.ping = value;
        // todo: make this a computed property supervising last ping. If last ping is more than 2 secs old, assume unconnected.
        this.store.uiState.connected = true;
      })
      .connect()
      .then((sse) => {
        console.log("SSE connected!");
      })
      .catch((err) => console.error("Failed make SSE connection:", err));
  },
});
</script>
