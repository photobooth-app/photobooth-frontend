<template>
  <q-page padding>
    <q-tabs
      v-model="selected_group"
      class="text-grey"
      active-color="secondary"
      indicator-color="secondary"
      mobile-arrows
      align="justify"
    >
      <q-tab v-for="tab in main_groups" :key="tab" :label="tab" :name="tab" />
    </q-tabs>
    <q-separator />
    <!--<q-select v-model="selected_group" :options="main_groups" color="primary" />-->
    <q-card class="q-pa-md q-mt-md">
      <div class="text-h6 q-mb-md">{{ selected_group }}</div>
      <blitz-form
        v-model="serverConfig[selected_group]"
        :key="selected_group"
        :schema="schema_blitzar"
        :internalLabels="false"
        :columnCount="2"
      />
    </q-card>
    <q-page-sticky position="bottom-right" :offset="[25, 25]">
      <div class="q-gutter-sm">
        <q-btn
          label="reset"
          @click="remoteProcedureCall('/cmd/config/reset')"
        />
        <q-btn label="restore" @click="restoreConfig()" />
        <q-btn
          color="primary"
          label="persist"
          @click="uploadConfigAndPersist()"
        />
      </div>
    </q-page-sticky>
  </q-page>
</template>
<style lang="scss"></style>
<script>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useMainStore } from "../stores/main-store.js";
import { remoteProcedureCall } from "boot/axios";
import { storeToRefs } from "pinia";

// Blitzar to create forms
// register all quasar elements used in blitzar scheme via quasar.config.js -> framework -> components
import { BlitzForm } from "blitzar";
import "blitzar/dist/style.css";

export default {
  // name: 'PageName',
  components: { BlitzForm },

  setup() {
    const $q = useQuasar();
    const mainStore = useMainStore();
    let { serverConfig } = storeToRefs(mainStore);

    let schema_axios = {};
    const main_groups = ref([]);
    const selected_group = ref("");

    const schema_blitzar = computed(() => {
      if (selected_group.value != "") {
        return mapBlitzarScheme(schema_axios[selected_group.value]);
      } else {
        return [];
      }
    });

    const mapBlitzarScheme = (schema) => {
      console.log("creating blitzar schema");
      console.log(schema);
      let blitzar_schema = [];

      console.log("allOf" in schema);
      if ("allOf" in schema) {
        // group that needs to be parsed (recursive)

        Object.entries(schema["allOf"][0]["properties"]).forEach((entry) => {
          const [id, property] = entry;

          let form_entry = {
            id: id,
            label: property["title"],
            component: "QInput",
            subLabel: `${property["description"] || ""} (default=${
              property["default"]
            })`,
          };

          if (property["type"] == "boolean") {
            form_entry["component"] = "QToggle";
          }
          if (property["type"] == "integer" || property["type"] == "float") {
            form_entry["component"] = "QInput";
            if (form_entry["ui_component"])
              form_entry["component"] = property["ui_component"];
            form_entry["type"] = "number";
            form_entry["labelAlways"] = true;
            if (property["exclusiveMinimum"])
              form_entry["min"] = property["exclusiveMinimum"];
            if (property["exclusiveMaximum"])
              form_entry["max"] = property["exclusiveMaximum"];
            if (property["minimum"]) form_entry["min"] = property["minimum"];
            if (property["maximum"]) form_entry["max"] = property["maximum"];
          }

          if (Object.keys(property).includes("enum")) {
            console.log("enum");
            //TODO: Not working yet!
            form_entry["component"] = "QSelect";
            form_entry["options"] = property["enum"];
          }

          blitzar_schema.push(form_entry);
        });
      } else {
        // we should have properties here to assign to output scheme:
        console.log("error, wrong format!, no direct props on main level");
      }
      console.log(blitzar_schema);
      return blitzar_schema;
    };

    const getSchema = () => {
      api
        //.get("http://mockbin.org/bin/7cbd6191-5fb8-4bdb-99fa-41974824d4db") // dereferenced input
        .get("/config/schema?type=dereferenced") // dereferenced input
        .then(async (response) => {
          console.log(response.data);

          schema_axios = response.data.properties;
          main_groups.value = Object.keys(schema_axios);
          selected_group.value = main_groups.value[0];

          $q.notify({
            message: "got scheme!",
            color: "green",
          });
        })
        .catch((response) => {
          console.log(response);
          console.log("error");

          $q.notify({
            message: "error getting scheme!",
            color: "red",
          });
        });
    };

    getSchema();

    const restoreConfig = () => {
      api
        .get("/config/current")
        .then(async (response) => {
          console.log(response.data);
          console.log(serverConfig.value);

          /*
          TODO: for unkonw reason after following statement, the blitzform does not update to serverloaded values. store reflects correct restored content.
          to be revisited later. ask user to f5 for now.
          */
          serverConfig.value = response.data;

          $q.notify({
            message: "config restored from server, pls reload page!",
            color: "green",
          });
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

    // actions
    const uploadConfigAndPersist = () => {
      console.log("sync config to server");
      console.log(serverConfig.value);

      api
        .post("/config/current", serverConfig.value)
        .then((response) => {
          $q.notify({
            message: "Persisted config, trying to restart service",
            color: "green",
          });
          console.log(response);
        })
        .catch((error) => {
          $q.notify({
            message: "error saving config, check browser console",
            color: "red",
          });
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.log("Error", error.message);
          }
          console.log(error.config);
        });
      ///api.send....
    };

    onBeforeMount(() => console.log("Composition API beforemounted"));
    onMounted(() => console.log("Composition API mounted"));

    return {
      schema_blitzar,
      main_groups,
      selected_group,
      serverConfig,
      remoteProcedureCall,
      restoreConfig,
      uploadConfigAndPersist,
    };
  },
};

// example scheme data for blitzar
/*
    const schema_backends = [
      {
        id: "LIVEPREVIEW_ENABLED",
        label: "LIVEPREVIEW_ENABLED",
        component: "QToggle",
        subLabel: "LIVEPREVIEW_ENABLED",
      },
      {
        id: "common.LORES_QUALITY",
        label: "common.Lores Quality",
        component: "QSlider",
      },
      { id: "MAIN_BACKEND", label: "MAIN_BACKEND", component: "QInput" },
      { id: "LIVE_BACKEND", label: "LIVE_BACKEND", component: "QInput" },
      {
        id: "LIVE_BACKEND",
        label: "LIVE_BACKEND",
        component: "QSelect",
        options: ["asdf", "jklö"],
      },
    ];

    const schema_common = [
      {
        id: "CAPTURE_CAM_RESOLUTION_HEIGHT",
        label: "CAPTURE_CAM_RESOLUTION_HEIGHT",
        component: "QInput",
        subLabel: "CAPTURE_CAM_RESOLUTION_HEIGHT",
        // component props:
        placeholder: "2500",
      },
      {
        id: "LORES_QUALITY",
        label: "Lores Quality",
        component: "QSlider",
        min: 0,
        max: 100,
        labelAlways: true,
      },
      {
        id: "LORES_QUALITY",
        label: "Lores Quality",
        component: "QInput",
        type: "number",
      },
      {
        id: "CAMERA_TRANSFORM_HFLIP",
        label: "CAMERA_TRANSFORM_HFLIP",
        component: "QToggle",
      },
    ];
    */
</script>
