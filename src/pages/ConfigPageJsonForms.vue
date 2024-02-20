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
import json from "./schemapydanticdereferencednocolor.json";

// mergeStyles combines all classes from both styles definitions into one
const myStyles = mergeStyles(defaultStyles, { control: { label: "q-label" } });

const renderers = [
  ...vanillaRenderers,
  ...quasarRenderers,
  // renderersText,
  // here you can add custom renderers
];

const schema = json;
console.log(schema);
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
