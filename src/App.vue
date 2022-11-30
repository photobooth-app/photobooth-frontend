<template>
  <router-view />
</template>

<script>
import { defineComponent } from "vue";
import { useMainStore } from "stores/main-store.js";
let sseClient;

export default defineComponent({
  name: "App",
  setup() {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
    };
  },
  mounted() {
    sseClient = this.$sse
      .create("/eventstream")
      .on("message", (message, lastEventId) => {
        console.info(message, lastEventId);
        this.store.messages = [
          `${message} (#${lastEventId})`,
          ...this.store.messages.slice(0, 20),
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
      .on("locationservice/geolocation", (geolocation) => {
        this.store.stats.geolocation = JSON.parse(geolocation);
      })
      .on("config/currentconfig", (currentconfig) => {
        this.store.serverConfig = JSON.parse(currentconfig);
      })
      .on("ping", (value) => {
        //last SSE ping
        this.store.ping = value;
      })
      .connect()
      .then((sse) => {
        console.log("SSE connected!");
      })
      .catch((err) => console.error("Failed make SSE connection:", err));
  },
});
</script>
