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
          `${message} (Msg received, lastEventId: ${lastEventId})`,
          ...this.store.messages.slice(0, 10),
        ];
      }) // "message" and "" and null equal!
      .on("error", (err) =>
        console.error("Failed to parse or lost connection:", err)
      )
      .on("stats/focuser", (focuser) => {
        this.store.stats.focuser = focuser;
      })
      .on("stats/geolocation", (geolocation) => {
        this.store.stats.geolocation = geolocation;
      })
      .on("ping", (value) => {
        //last SSE ping
        this.store.ping = value;
      })
      .connect()
      .then((sse) => {
        console.log("SSE connected!");
      })
      .catch((err) =>
        console.error("Failed make initial SSE connection:", err)
      );
  },
});
</script>
