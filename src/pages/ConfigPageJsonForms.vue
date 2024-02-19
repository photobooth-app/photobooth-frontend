<!-- eslint-disable -->
<template>
  <q-page padding>
    <div>{{ JSON.stringify(this.data) }}</div>
    <div class="myform">
      <json-forms :data="data" :renderers="renderers" :schema="schema" @change="onChange" />
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { useMainStore } from "../stores/main-store.js";
import { JsonForms } from "@jsonforms/vue";
import { defaultStyles, mergeStyles, vanillaRenderers } from "@jsonforms/vue-vanilla";
import { quasarRenderers } from "../components/form/renderers";

// mergeStyles combines all classes from both styles definitions into one
const myStyles = mergeStyles(defaultStyles, { control: { label: "q-label" } });

const renderers = [
  ...vanillaRenderers,
  ...quasarRenderers,
  // renderersText,
  // here you can add custom renderers
];

const schema = {
  description: "Common config for photobooth.",
  properties: {
    countdown_capture_first: {
      default: 2,
      description: "Countdown in seconds, started when user start a capture process",
      maximum: 20,
      minimum: 0,
      step: 0.25,
      title: "Countdown Capture First",
      type: "number",
    },
    countdown_capture_second_following: {
      default: 1,
      description: "Countdown in seconds, used for second and following captures for collages",
      maximum: 20,
      minimum: 0,
      title: "Countdown Capture Second Following",
      type: "number",
    },
    countdown_camera_capture_offset: {
      default: 0.25,
      description:
        "Trigger camera capture by offset earlier (in seconds). 0 trigger exactly when countdown is 0. Use to compensate for delay in camera processing for better UX.",
      maximum: 20,
      minimum: 0,
      title: "Countdown Camera Capture Offset",
      type: "number",
    },
    collage_automatic_capture_continue: {
      default: true,
      description: "Automatically continue with second and following images to capture for collage. No user interaction in between.",
      title: "Collage Automatic Capture Continue",
      type: "boolean",
    },
    collage_approve_autoconfirm_timeout: {
      default: 15,
      description: "If user is required to approve collage captures, after this timeout, the job continues and user confirmation is assumed.",
      title: "Collage Approve Autoconfirm Timeout",
      type: "number",
    },
    gallery_show_individual_images: {
      default: false,
      description:
        "Show individual images of collages/animations in the gallery. Hidden images are still stored in the data folder. (Note: changing this setting will not change visibility of already captured images).",
      title: "Gallery Show Individual Images",
      type: "boolean",
    },
    DEBUG_LEVEL: {
      allOf: [
        {
          description: "enum for debuglevel",
          enum: ["DEBUG", "INFO", "WARNING", "ERROR"],
          title: "EnumDebugLevel",
          type: "string",
        },
      ],
      default: "DEBUG",
      description: "Log verbosity. File is writte to disc, and latest log is displayed also in UI.",
      title: "Debug Level",
    },
    webserver_bind_ip: {
      default: "0.0.0.0",
      description: "IP/Hostname to bind the webserver to. 0.0.0.0 means bind to all IP adresses of host.",
      title: "Webserver Bind Ip",
      type: "string",
    },
    webserver_port: {
      default: 8000,
      description: "Port to serve the photobooth website. Ensure the port is available. Ports below 1024 need root!",
      title: "Webserver Port",
      type: "integer",
    },
  },
  title: "Common Config",
  type: "object",
};

const uischema = {
  type: "Control",
  scope: "#/properties/countdown_capture_first",
  options: {
    format: "radio",
    step: 0.25,
  },
};

export default {
  // name: 'PageName',
  computed: {
    // a computed getter
  },
  components: {
    JsonForms,
  },
  data() {
    return {
      // freeze renderers for performance gains
      renderers: Object.freeze(renderers),
      data: {
        /* data store */
      },
      schema,
      uischema,
    };
  },
  methods: {
    onChange(event) {
      this.data = event.data;
    },
  },
  provide() {
    return {
      styles: myStyles,
    };
  },
  setup() {
    const $q = useQuasar();
    const store = useMainStore();

    return {
      store,

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
