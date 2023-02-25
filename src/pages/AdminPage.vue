<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div>
        <div class="text-h5">Server</div>
        <div class="row">
          <div class="q-ma-sm">
            <div class="text-h6">Host Control</div>
            <div class="text-no-wrap">
              <q-dialog v-model="confirm_reboot">
                <q-card class="q-pa-sm">
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
                <q-card class="q-pa-sm">
                  <q-card-section class="row items-center">
                    <q-avatar
                      icon="power_settings_new"
                      color="primary"
                      text-color="white"
                    />
                    <span class="q-ml-sm"
                      >You sure to shutdown the system?</span
                    >
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

              <q-dialog v-model="confirm_restart_service">
                <q-card class="q-pa-sm">
                  <q-card-section class="row items-center">
                    <q-avatar
                      icon="restart_alt"
                      color="primary"
                      text-color="white"
                    />
                    <span class="q-ml-sm"
                      >You sure to restart the service?</span
                    >
                  </q-card-section>

                  <q-card-actions align="right">
                    <q-btn flat label="Cancel" v-close-popup />
                    <q-btn
                      label="Restart"
                      color="primary"
                      v-close-popup
                      @click="remoteProcedureCall('/cmd/service/restart')"
                    />
                  </q-card-actions>
                </q-card>
              </q-dialog>
              <q-btn
                class="q-mr-sm"
                label="Reboot Host"
                @click="confirm_reboot = true"
              />
              <q-btn
                class="q-mr-sm"
                label="Shutdown Host"
                @click="confirm_shutdown = true"
              />
              <q-btn
                class="q-mr-sm"
                label="Restart Service"
                @click="confirm_restart_service = true"
              />
            </div>
          </div>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useMainStore } from "../stores/main-store.js";
import { remoteProcedureCall } from "boot/axios";

export default defineComponent({
  name: "MainLayout",

  setup() {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      remoteProcedureCall,
      confirm_reboot: ref(false),
      confirm_shutdown: ref(false),
      confirm_restart_service: ref(false),
    };
  },
});
</script>
