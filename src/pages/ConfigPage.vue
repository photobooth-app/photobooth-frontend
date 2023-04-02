<template>
  <q-page padding>
    <q-tabs v-model="selected_group" class="text-grey" active-color="secondary" indicator-color="secondary" mobile-arrows
      align="justify">
      <q-tab v-for="tab in main_groups" :key="tab" :label="tab" :name="tab" />
    </q-tabs>

    <q-separator />
    <div>{{ group_description }}</div>
    <q-card class="q-pa-md q-mt-md">
      <blitz-form v-model="serverConfig[selected_group]" :key="selected_group" :schema="schema_blitzar"
        :internalLabels="false" :columnCount="2" v-if="renderBlitzForm" class="blitzar-form" />
    </q-card>
    <q-page-sticky position="bottom-right" :offset="[25, 25]">
      <div class="q-gutter-sm">
        <q-btn label="reset" @click="remoteProcedureCall('/cmd/config/reset')" />
        <q-btn label="restore" @click="getConfig('current')" />
        <q-btn color="primary" label="persist" @click="uploadConfigAndPersist()" />
      </div>
    </q-page-sticky>
  </q-page>
</template>
<style lang="scss"></style>
<script>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { remoteProcedureCall } from "boot/axios";

// Blitzar to create forms
// register all quasar elements used in blitzar scheme via quasar.config.js -> framework -> components
import { BlitzForm } from "blitzar";
import "blitzar/dist/style.css";

export default {
  // name: 'PageName',
  components: { BlitzForm },

  setup () {
    const $q = useQuasar();
    const serverConfig = ref({})

    let schema_dereferenced = {};
    const main_groups = ref([]);
    const renderBlitzForm = ref(false);
    const selected_group = ref("");

    const group_description = computed(() => {
      if (selected_group.value != "") {
        return schema_dereferenced[selected_group.value]["allOf"][0][
          "description"
        ];
      } else {
        return "-";
      }
    });
    const schema_blitzar = computed(() => {
      if (selected_group.value != "") {
        return mapBlitzarScheme(schema_dereferenced[selected_group.value]);
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
        // group that needs to be parsed

        Object.entries(schema["allOf"][0]["properties"]).forEach((entry) => {
          const [id, property] = entry;

          let form_entry = {
            id: id,
            label: property["title"],
            component: "QInput",
            /*subLabel: `${property["description"] || ""} (default=${
              property["default"]
            })`,*/
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

          // check whether an enum
          if (
            property["allOf"] &&
            Object.keys(property["allOf"][0]).includes("enum")
          ) {
            form_entry["component"] = "QSelect";
            form_entry["options"] = property["allOf"][0]["enum"];
          }

          form_entry["slots"] = {
            label: {
              component: "QTooltip",
              slot: `ℹ️ ${property["description"] || ""} (default=${property["default"]
                })`,
              anchor: "bottom left",
              self: "top left",
            },
          };

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
        .get("/config/schema?schema_type=dereferenced") // dereferenced input
        .then(async (response) => {
          console.log(response.data);

          schema_dereferenced = response.data.properties;
          main_groups.value = Object.keys(schema_dereferenced);
          selected_group.value = main_groups.value[0];

        })
        .catch((response) => {
          console.log(response);
          console.log("error");

          $q.notify({
            message: "error getting scheme! check logs",
            color: "red",
          });
        });
    };


    const getConfig = (which = "current") => {
      //hide form, later will be displayed again - this forces the form to rerender and reflect the latest values from store.
      renderBlitzForm.value = false;

      api
        .get(`/config/${which}`)
        .then(async (response) => {
          console.log(response.data);
          console.log(serverConfig.value);

          serverConfig.value = response.data;
          renderBlitzForm.value = true;

          $q.notify({
            message: `${which} config loaded from server`,
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


    getSchema();
    getConfig("currentActive");


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
          if (error.response.data.detail) {
            let notify_msg = "check following fields:<br/>";
            Object.values(error.response.data.detail).forEach((detail) => {
              notify_msg += detail["loc"].join(" -> ");
              notify_msg += `: ${detail["msg"]}`;
              notify_msg += "<br/>";
            });

            $q.notify({
              caption: "validation error",
              icon: "error",
              html: true,
              message: `${notify_msg}`,
              color: "red",
            });
            return;
          } else {
            $q.notify({
              message: "error saving config, check browser console and logs",
              color: "red",
            });
          }
        });
    };

    onBeforeMount(() => console.log("Composition API beforemounted"));
    onMounted(() => console.log("Composition API mounted"));

    return {
      schema_blitzar,
      renderBlitzForm,
      main_groups,
      group_description,
      selected_group,
      serverConfig,
      remoteProcedureCall,
      getConfig,
      uploadConfigAndPersist,
    };
  },
};
</script>
