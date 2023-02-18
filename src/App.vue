<template>
  <router-view />
</template>

<script>
import { defineComponent, ref, watch } from "vue";
import { useMainStore } from "stores/main-store.js";
import { useRouter } from "vue-router";

export default defineComponent({
  name: "App",
  setup() {
    const store = useMainStore();
    const router = useRouter();

    const connected = ref(false);

    // on app init push to init page
    //TODO: improve and make this a guard.
    router.push("/init");

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
    };
  },

  watch: {
    connected(newValue, oldValue) {
      console.log("watcher connected run");
      if (oldValue == true && newValue == false)
        this.router.push({ path: "/init" });
      if (oldValue == false && newValue == true) {
        this.router.push({ path: "/" });
      }
    },
  },
  created() {
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
      .on("config/currentconfig", (currentconfig) => {
        this.store.serverConfig = JSON.parse(currentconfig);
      })
      .on("ping", () => {
        //last SSE ping
        this.store.lastHeartbeat = Date.now();
        if (typeof this.store.serverConfig === "object") {
          //if serverConfig is of type object, a config is received already and we can assume app is able to proceed/is initialized
          this.connected = true;
        } else {
          console.log("serverconfig not yet received, waiting for next ping");
        }
      })
      .connect()
      .then((sse) => {
        console.log("SSE connected!");
      })
      .catch((err) => console.error("Failed make SSE connection:", err));
  },
});
</script>
