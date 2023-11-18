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

    <div class="q-mt-md row justify-center">
      <div class="col-12 col-md-8 q-mb-xl">
        <div class="text-h5">{{ group_title }}</div>
        <p>{{ group_description }}</p>
      </div>

      <div class="col-12 col-md-8 q-mb-xl">
        <!--some empty space for sticky not to overlay last element-->
        <BlitzForm
          v-model="serverConfig[selected_group]"
          :key="selected_group"
          :schema="schema_blitzar"
          :internalLabels="false"
          label-position="left"
          v-if="renderBlitzForm"
          class="blitzar-form"
        />
      </div>
    </div>
    <q-page-sticky position="bottom-right" :offset="[25, 25]">
      <div class="q-gutter-sm">
        <q-btn
          label="reset"
          @click="remoteProcedureCall('/admin/config/reset')"
        />
        <q-btn label="restore" @click="getConfig('current')" />
        <q-btn
          color="primary"
          label="persist"
          @click="uploadConfigAndPersist()"
        />
      </div>
    </q-page-sticky>
  </q-page>
</template>

<style lang="scss">
.blitz-field {
  margin-bottom: 8px;
}

.blitz-field .blitz-field__sub-label {
  font-weight: normal;
  opacity: initial;
  color: $grey;
}

.blitz-field--label-left {
  grid-template-columns: 1fr 1fr;
}
</style>
<script>
import { ref, onMounted, onBeforeMount, computed, watch } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useUiSettingsStore } from "stores/ui-settings-store.js";
import { remoteProcedureCall } from "boot/axios";

// Blitzar to create forms
// register all quasar elements used in blitzar scheme via quasar.config.js -> framework -> components
import { BlitzForm, BlitzListForm } from "blitzar";
import "blitzar/dist/style.css";

export default {
  // name: 'PageName',
  // eslint-disable-next-line
  components: { BlitzForm, BlitzListForm },

  setup() {
    const $q = useQuasar();
    const serverConfig = ref({});

    let schema_dereferenced = {};
    const main_groups = ref([]);
    const renderBlitzForm = ref(false);
    const selected_group = ref("");

    const uiSettingsStore = useUiSettingsStore();

    const group_title = computed(() => {
      if (selected_group.value != "") {
        return schema_dereferenced[selected_group.value]["allOf"][0]["title"];
      } else {
        return "-";
      }
    });
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
      const escapeHTML = (str) =>
        str.replace(
          /[&<>'"]/g,
          (tag) =>
            ({
              "&": "&amp;",
              "<": "&lt;",
              ">": "&gt;",
              "'": "&#39;",
              '"': "&quot;",
            })[tag],
        );

      const createFormEntry = (id, property) => {
        let form_entry = {
          id: id,
          label: property["title"],
          component: "QInput",
          filled: true,
        };

        if (property["type"] == "boolean") {
          form_entry["component"] = "QToggle";
        }
        if (property["type"] == "integer" || property["type"] == "float") {
          form_entry["component"] = "QInput";
          if (property["ui_component"])
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

        form_entry["subLabel"] = `${
          property["description"] || ""
        } (default=${escapeHTML(
          ("default" in property
            ? property["default"]
            : "undefined"
          ).toString(),
        )})`;

        return form_entry;
      };

      console.log("creating blitzar schema");
      console.log(schema);
      let blitzar_schema = [];

      if ("allOf" in schema) {
        // group that needs to be parsed

        Object.entries(schema["allOf"][0]["properties"]).forEach((entry) => {
          const [id, property] = entry;

          let form_entry = createFormEntry(id, property);

          if (
            property["type"] == "array" &&
            property["items"] &&
            property["items"]["type"] == "object"
          ) {
            // pydantic list[Group(BaseModel)] render to BlitzListForms:
            form_entry["component"] = "BlitzListForm";
            form_entry["schema"] = [];
            Object.entries(property["items"]["properties"]).forEach(
              (item_property) => {
                const [id, property] = item_property;
                form_entry["schema"].push(createFormEntry(id, property));
              },
            );
          } else if (
            property["type"] == "array" &&
            property["items"] &&
            property["items"]["enum"] &&
            property["items"]["type"] == "string"
          ) {
            // pydantic list[Enum(str, Enum)] render to multiselect currently:
            form_entry["component"] = "QSelect";
            form_entry["multiple"] = true;
            form_entry["use-chips"] = true;
            form_entry["stack-label"] = true;
            form_entry["options"] = property["items"]["enum"];
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
        .get("/admin/config/schema?schema_type=dereferenced") // dereferenced input
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
        .get(`/admin/config/${which}`)
        .then(async (response) => {
          console.log(response.data);
          console.log(serverConfig.value);

          serverConfig.value = response.data;
          renderBlitzForm.value = true;
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
        .post("/admin/config/current", serverConfig.value)
        .then((response) => {
          // reload ui settings into store as on app startup.
          uiSettingsStore.initStore(true);

          $q.notify({
            message:
              "Config persisted and reloaded from server. If changed hardware settings, pls reload/restart services!",
            color: "green",
          });
        })
        .catch((error) => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
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
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.error(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error", error.message);
          }
          $q.notify({
            message: "error saving config, check browser console and logs",
            color: "red",
          });
        });
    };

    onBeforeMount(() => console.log("Composition API beforemounted"));
    onMounted(() => console.log("Composition API mounted"));

    return {
      schema_blitzar,
      renderBlitzForm,
      main_groups,
      group_title,
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
