<template>
  <q-page>
    <q-card>
      <q-tabs
        v-model="tab"
        class="text-grey"
        active-color="secondary"
        indicator-color="secondary"
        align="justify"
      >
        <q-tab name="common" label="Common" />
        <q-tab name="personalize" label="Personalize" />
        <q-tab name="camera" label="Camera" />
        <q-tab name="fullconfig" label="Full Config" />
      </q-tabs>
      <q-separator />

      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="common">
          <div>
            <div class="text-h5">Debug</div>
            <div class="row">
              <div class="col-4 q-ma-sm">
                <div class="text-h6">Debug Level</div>
                <div class="text-no-wrap">
                  <q-radio
                    val="DEBUG"
                    v-model="store.serverConfig['DEBUG_LEVEL']"
                    label="debug"
                  />
                  <q-radio
                    v-model="store.serverConfig['DEBUG_LEVEL']"
                    val="INFO"
                    label="info"
                  />
                  <q-radio
                    v-model="store.serverConfig['DEBUG_LEVEL']"
                    val="WARNING"
                    label="warning"
                  />
                  <q-radio
                    v-model="store.serverConfig['DEBUG_LEVEL']"
                    val="ERROR"
                    label="error"
                  />
                </div>
              </div>
              <div class="col-4 q-ma-sm">
                <div class="text-h6">Debug Overlay</div>
                <div class="text-no-wrap">
                  <q-toggle
                    v-model="store.serverConfig['DEBUG_OVERLAY']"
                    label="Show debug overlay in preview"
                  />
                </div>
              </div>
            </div>
          </div>

          <div class="q-gutter-sm q-ma-md">
            Server Control

            <q-dialog v-model="confirm_reboot">
              <q-card>
                <q-card-section class="row items-center">
                  <q-avatar
                    icon="restart_alt"
                    color="primary"
                    text-color="white"
                  />
                  <span class="q-ml-sm">You sure to reboot the system?</span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" color="primary" v-close-popup />
                  <q-btn
                    label="Reboot"
                    color="primary"
                    @click="remoteProcedureCall('/cmd/server/reboot')"
                    v-close-popup
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-dialog v-model="confirm_shutdown">
              <q-card>
                <q-card-section class="row items-center">
                  <q-avatar
                    icon="power_settings_new"
                    color="primary"
                    text-color="white"
                  />
                  <span class="q-ml-sm">You sure to shutdown the system?</span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" v-close-popup />
                  <q-btn
                    label="Shutdown"
                    color="primary"
                    v-close-popup
                    @click="remoteProcedureCall('/cmd/server/shutdown')"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-btn label="Reboot" @click="confirm_reboot = true" />
            <q-btn label="Shutdown" @click="confirm_shutdown = true" />

            Health: CPU load, Connection Status, CPU Temperature
          </div>
        </q-tab-panel>

        <q-tab-panel name="personalize">
          <div class="text-h6">Personalize</div>
          Frontpage-Text - Füge Smilies ein (Windows-Taste + .)
          <div class="q-pa-md q-gutter-sm">
            <q-editor
              v-model="store.serverConfig['UI_FRONTPAGE_TEXT']"
              flat
              min-height="25rem"
              content-class="bg-amber-3"
              toolbar-bg="primary"
              :toolbar="[
                [
                  'left',
                  'center',
                  'right',
                  'justify',
                  'bold',
                  'italic',
                  'underline',
                  'strike',
                  'undo',
                  'redo',
                ],
                [
                  {
                    label: $q.lang.editor.formatting,
                    icon: $q.iconSet.editor.formatting,
                    list: 'no-icons',
                    options: ['p', 'h3', 'h4', 'h5', 'h6', 'code'],
                  },
                ],
              ]"
            />
          </div>
        </q-tab-panel>

        <q-tab-panel name="camera">
          <div>
            <div class="text-h5">Camera Settings</div>
            <div class="row">
              <div class="col-4 q-ma-sm">
                <div class="text-h6">Exposure Mode</div>
                <div class="text-no-wrap">
                  <q-radio
                    v-model="store.serverConfig['CAPTURE_EXPOSURE_MODE']"
                    val="normal"
                    label="normal"
                  />
                  <q-radio
                    v-model="store.serverConfig['CAPTURE_EXPOSURE_MODE']"
                    val="short"
                    label="short"
                  />
                  <q-radio
                    v-model="store.serverConfig['CAPTURE_EXPOSURE_MODE']"
                    val="long"
                    label="long"
                    disable
                  />
                  <q-radio
                    v-model="store.serverConfig['CAPTURE_EXPOSURE_MODE']"
                    val="custom"
                    label="custom"
                    disable
                  />
                </div>
              </div>

              <div class="col-4 q-ma-sm">
                <div class="text-h6">Autofocus</div>
                <div class="text-no-wrap">
                  <q-toggle
                    label="Automatic Autofocus"
                    v-model="store.serverConfig['FOCUSER_ENABLED']"
                  ></q-toggle>
                </div>
              </div>
            </div>
          </div>

          <div class="text-h5 q-mt-lg">Image Processing</div>
          <div class="row">
            <div class="col-4 q-ma-sm">
              <div class="text-h6">Quality</div>

              <div class="q-pa-md">
                <q-badge>
                  LORES_QUALITY: {{ store.serverConfig["LORES_QUALITY"] }}
                </q-badge>
                <q-slider
                  v-model="store.serverConfig['LORES_QUALITY']"
                  :min="0"
                  :max="100"
                  label
                />
              </div>

              <div class="q-pa-md">
                <q-badge>
                  THUMBNAIL_QUALITY:
                  {{ store.serverConfig["THUMBNAIL_QUALITY"] }}
                </q-badge>
                <q-slider
                  v-model="store.serverConfig['THUMBNAIL_QUALITY']"
                  :min="0"
                  :max="100"
                  label
                />
              </div>

              <div class="q-pa-md">
                <q-badge>
                  PREVIEW_QUALITY: {{ store.serverConfig["PREVIEW_QUALITY"] }}
                </q-badge>
                <q-slider
                  v-model="store.serverConfig['PREVIEW_QUALITY']"
                  :min="0"
                  :max="100"
                  label
                />
              </div>

              <div class="q-pa-md">
                <q-badge>
                  HIRES_QUALITY: {{ store.serverConfig["HIRES_QUALITY"] }}
                </q-badge>
                <q-slider
                  v-model="store.serverConfig['HIRES_QUALITY']"
                  :min="0"
                  :max="100"
                  label
                />
              </div>
            </div>
            <div class="col-4 q-ma-sm">
              <div class="text-h6">Image Sizes</div>

              <div class="q-pa-md">
                <q-select
                  v-model="store.serverConfig['PREVIEW_SCALE_FACTOR']"
                  :options="scale_options"
                  emit-value
                  map-options
                  label="PREVIEW_SCALE_FACTOR"
                />
              </div>

              <div class="q-pa-md">
                <q-select
                  v-model="store.serverConfig['THUMBNAIL_SCALE_FACTOR']"
                  :options="scale_options"
                  emit-value
                  map-options
                  label="THUMBNAIL_SCALE_FACTOR"
                />
              </div>
            </div>
          </div>
        </q-tab-panel>

        <q-tab-panel name="fullconfig">
          <div class="text-h6">
            Current Configuration - ATTENTION: Messing around can break the
            Booth :(
          </div>

          <q-form @submit="onSubmit" @reset="onReset">
            <q-input
              name="config"
              filled
              type="textarea"
              v-model="currentConfigStr"
            />

            <div class="q-mt-md">
              <q-btn label="Apply" type="submit" color="primary" />
              <q-btn
                label="Revert"
                type="reset"
                color="primary"
                flat
                class="q-ml-sm"
              />
            </div>
          </q-form>
        </q-tab-panel>
      </q-tab-panels>
    </q-card>
    <q-page-sticky position="bottom-right" :offset="[25, 25]">
      <div class="q-gutter-sm">
        <q-btn
          label="reset"
          @click="remoteProcedureCall('/cmd/config/reset')"
        />
        <q-btn
          label="restore"
          @click="remoteProcedureCall('/cmd/config/load')"
        />
        <q-btn
          color="primary"
          label="persist"
          @click="uploadConfigAndPersist()"
        />
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { mapActions } from "pinia";
import { useMainStore } from "../stores/main-store.js";
import { remoteProcedureCall } from "boot/axios";
import { LocalStorage } from "quasar";

export default defineComponent({
  name: "MainLayout",

  components: {},
  watch: {
    // whenever question changes, this function will run
    tab(newVal, oldVal) {
      LocalStorage.set("adminPage_tab", newVal);
    },
  },
  mounted() {
    if (LocalStorage.has("adminPage_tab")) {
      this.tab = LocalStorage.getItem("adminPage_tab");
    }
  },
  computed: {
    currentConfigStr: {
      get() {
        return JSON.stringify(this.store.serverConfig, null, 4);
      },
      set() {
        //ignored, will be updated via submit
      },
    },
    /*tab: {
      // this seems like a good solution, but does not work unfortunately. change to routed tabs later maybe...
      get() {
        if (LocalStorage.has("adminPage_tab")) {
          return LocalStorage.getItem("adminPage_tab");
        } else {
          return "common";
        }
      },
      set(val) {
        console.log(val);
        LocalStorage.set("adminPage_tab", val);
        this.$emit("tab");
        return val;
      },
    },*/
  },
  methods: {
    ...mapActions(useMainStore, ["uploadConfigAndPersist"]),
  },
  setup() {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      tab: ref("common"),
      remoteProcedureCall,
      confirm_reboot: ref(false),
      confirm_shutdown: ref(false),
      scale_options: [
        {
          label: "12.5%",
          value: [1, 8],
        },
        {
          label: "25%",
          value: [1, 4],
        },
        {
          label: "37.5%",
          value: [3, 8],
        },
        {
          label: "50%",
          value: [1, 2],
        },
        {
          label: "62.5%",
          value: [5, 8],
        },
        {
          label: "75%",
          value: [3, 4],
        },
        {
          label: "87.5%",
          value: [7, 8],
        },
      ],
    };
  },
});
</script>
