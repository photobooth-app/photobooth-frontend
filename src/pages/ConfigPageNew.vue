<template>
  <q-page padding>
    <q-card>
      <div class="text-h6">Dynamic Form rendering.</div>

      <component
        v-for="(component, i) in form_schema"
        v-model="serverConfig[component.id]"
        :key="i"
        :id="component.id"
        :is="component.component"
        :options="component.options"
        :label="component.label"
      />

      <q-input label="test"> </q-input>
      <div class="q-pa-md q-gutter-sm"></div>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useMainStore } from "../stores/main-store.js";
import Vue from "vue";

export default {
  // name: 'PageName',
  computed: {
    // a computed getter
  },
  setup() {
    const $q = useQuasar();
    const store = useMainStore();

    return {
      store,

      form_schema: [
        {
          id: "countdown_capture_first",
          label: "Countdown Capture First",
          component: "QInput",
          filled: true,
          subLabel:
            "Countdown in seconds, started when user start a capture process (default=2)",
        },
        {
          id: "countdown_capture_second_following",
          label: "Countdown Capture Second Following",
          component: "QInput",
          filled: true,
          subLabel:
            "Countdown in seconds, used for second and following captures for collages (default=1)",
        },
        {
          id: "countdown_camera_capture_offset",
          label: "Countdown Camera Capture Offset",
          component: "QInput",
          filled: true,
          subLabel:
            "Trigger camera capture by offset earlier (in seconds). 0 trigger exactly when countdown is 0. Use to compensate for delay in camera processing for better UX. (default=0.25)",
        },
        {
          id: "collage_automatic_capture_continue",
          label: "Collage Automatic Capture Continue",
          component: "QToggle",
          filled: true,
          subLabel:
            "Automatically continue with second and following images to capture for collage. No user interaction in between. (default=true)",
        },
        {
          id: "DEBUG_LEVEL",
          label: "Debug Level",
          component: "QSelect",
          filled: true,
          options: ["DEBUG", "INFO", "WARNING", "ERROR"],
          subLabel:
            "Log verbosity. File is writte to disc, and latest log is displayed also in UI. (default=DEBUG)",
        },
        {
          id: "webserver_bind_ip",
          label: "Webserver Bind Ip",
          component: "QInput",
          filled: true,
          subLabel:
            "IP/Hostname to bind the webserver to. 0.0.0.0 means bind to all IP adresses of host. (default=0.0.0.0)",
        },
        {
          id: "webserver_port",
          label: "Webserver Port",
          component: "QInput",
          filled: true,
          type: "number",
          labelAlways: true,
          subLabel:
            "Port to serve the photobooth website. Ensure the port is available. Ports below 1024 need root! (default=8000)",
        },
      ],

      serverConfig: ref({
        countdown_capture_first: 2,
        countdown_capture_second_following: 1,
        countdown_camera_capture_offset: 0.25,
        collage_automatic_capture_continue: true,
        DEBUG_LEVEL: "DEBUG",
        webserver_bind_ip: "0.0.0.0",
        webserver_port: 8000,
      }),

      text: ref(""),

      showNotif() {
        $q.notify({
          message: "Jim pinged you.",
          color: "purple",
        });
      },
    };
  },
};
</script>
