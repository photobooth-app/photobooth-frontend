<!-- eslint-disable -->
<template>
  <q-layout>
    <q-header style="z-index: 0">
      <q-toolbar>
        <q-btn flat @click="drawer = !drawer" round dense icon="menu" />
        <q-toolbar-title>{{ group_title }}</q-toolbar-title>
        <div class="q-gutter-sm">
          <q-btn :label="$t('BTN_LABEL_RESET_CONFIG')" @click="remoteProcedureCall('/admin/config/reset')" />
          <q-btn :label="$t('BTN_LABEL_RESTORE_CONFIG')" @click="getConfig('current')" />
          <q-btn color="primary" :label="$t('BTN_LABEL_PERSIST_CONFIG')" @click="uploadConfigAndPersist()" />
        </div>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" :width="300" :breakpoint="500" bordered :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'">
      <q-scroll-area class="fit">
        <div>here is the menu! TODO</div>
        <q-list>
          <q-item
            v-for="group in main_groups"
            :key="group"
            clickable
            :active="group === $route.params.section"
            :to="`/admin/config/${group}`"
            replace
            v-ripple
          >
            <q-item-section>
              {{ group }}
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <!--div>{{ JSON.stringify(this.serverConfig) }}</div-->
        <div class="config-form q-mt-md row justify-center">
          <div class="col-12 col-md-8 q-mb-xl">
            <p>Group: {{ group_description }}</p>
          </div>
          <div class="col-12 col-md-8 q-mb-xl">
            <json-forms :data="serverConfig" :renderers="renderers" :schema="schema" :uischema="uischema" @change="onChange" />
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>
<style lang="scss">
.control-wrapper {
  margin-bottom: 10px;
}

.control-wrapper .control-description-wrapper {
  color: $grey;
}
</style>
<script>
import { ref } from "vue";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { useMainStore } from "../stores/main-store.js";
import { JsonForms } from "@jsonforms/vue";
import { defaultStyles, mergeStyles, vanillaRenderers } from "@jsonforms/vue-vanilla";
import { quasarRenderers } from "../components/form/renderers";
import json from "./schemapydanticdereferenced.json";

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
const uischema = null; //{
// type: "Control",
// scope: "#/properties/DEBUG_LEVEL",
// options: {
//   format: "radio",
//   step: 0.25,
// },
// };
// const uischema = {
//   type: "Categorization",
//   elements: [
//     {
//       type: "Category",
//       label: "categoryLabelKey",
//       elements: [
//         {
//           type: "HorizontalLayout",
//           elements: [
//             {
//               type: "Control",
//               scope: "#/properties/firstName",
//             },
//             {
//               type: "Control",
//               scope: "#/properties/secondName",
//             },
//           ],
//         },
//       ],
//     },
//   ],
// };

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
      schema,
      uischema,

      //placeholder:
      main_groups: ["one", "two"],
      group_title: "one",
      group_description: "_____name would be here _____",
    };
  },
  methods: {
    onChange(event) {
      this.serverConfig = event.data;
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
    const serverConfig = ref({});

    const getConfig = (which = "current") => {
      //hide form, later will be displayed again - this forces the form to rerender and reflect the latest values from store.
      //renderBlitzForm.value = false;

      api
        .get(`/admin/config/${which}`)
        .then(async (response) => {
          console.log(response.data);
          console.log(serverConfig.value);

          serverConfig.value = response.data;
          // renderBlitzForm.value = true;
        })
        .catch((response) => {
          console.log(response);
          console.log("error");

          $q.notify({
            message: "error getting config!",
            color: "red",
          });
        });
    };

    getConfig("currentActive");

    return {
      drawer: ref(true),
      store,
      serverConfig,
    };
  },
};
</script>
