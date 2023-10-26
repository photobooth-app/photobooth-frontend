<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="text-h5">Server Control</div>
      <div class="row">
        <div class="q-ma-sm">
          <div class="text-no-wrap">
            <q-dialog v-model="confirm_reboot">
              <q-card class="q-pa-sm">
                <q-card-section class="row items-center">
                  <q-avatar icon="restart_alt" color="primary" text-color="white" />
                  <span class="q-ml-sm">You sure to reboot the system?</span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" color="primary" v-close-popup />
                  <q-btn label="Reboot" color="primary" @click="remoteProcedureCall('/system/server/reboot')"
                    v-close-popup />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-dialog v-model="confirm_shutdown">
              <q-card class="q-pa-sm">
                <q-card-section class="row items-center">
                  <q-avatar icon="power_settings_new" color="primary" text-color="white" />
                  <span class="q-ml-sm">You sure to shutdown the system?</span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" v-close-popup />
                  <q-btn label="Shutdown" color="primary" v-close-popup
                    @click="remoteProcedureCall('/system/server/shutdown')" />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-dialog v-model="confirm_restart_service">
              <q-card class="q-pa-sm">
                <q-card-section class="row items-center">
                  <q-avatar icon="restart_alt" color="primary" text-color="white" />
                  <span class="q-ml-sm">You sure to restart the service?</span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" v-close-popup />
                  <q-btn label="Restart" color="primary" v-close-popup
                    @click="remoteProcedureCall('/system/service/restart')" />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-dialog v-model="confirm_reload_service">
              <q-card class="q-pa-sm">
                <q-card-section class="row items-center">
                  <q-avatar icon="restart_alt" color="primary" text-color="white" />
                  <span class="q-ml-sm">You sure to reload the service?</span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" v-close-popup />
                  <q-btn label="Reload" color="primary" v-close-popup
                    @click="remoteProcedureCall('/system/service/reload')" />
                </q-card-actions>
              </q-card>
            </q-dialog>


            <q-dialog v-model="confirm_install_service">
              <q-card class="q-pa-sm">
                <q-card-section class="row items-center">
                  <q-avatar icon="add_circle" color="primary" text-color="white" />
                  <span class="q-ml-sm">You sure to install the service?</span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" v-close-popup />
                  <q-btn label="Install" color="primary" v-close-popup
                    @click="remoteProcedureCall('/system/service/install')" />
                </q-card-actions>
              </q-card>
            </q-dialog>


            <q-dialog v-model="confirm_uninstall_service">
              <q-card class="q-pa-sm">
                <q-card-section class="row items-center">
                  <q-avatar icon="cancel" color="primary" text-color="white" />
                  <span class="q-ml-sm">You sure to uninstall the service?</span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" v-close-popup />
                  <q-btn label="Uninstall" color="primary" v-close-popup
                    @click="remoteProcedureCall('/system/service/uninstall')" />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-btn class="q-mr-sm" label="Reboot Host" @click="confirm_reboot = true" />
            <q-btn class="q-mr-sm" label="Shutdown Host" @click="confirm_shutdown = true" />
            <q-btn class="q-mr-sm" label="Restart Service" @click="confirm_restart_service = true" />
            <!--TODO: does not work reliable. may be removed <q-btn class="q-mr-sm" label="Reload Service" @click="confirm_reload_service = true" /> -->
            <q-btn class="q-mr-sm" label="Install Service" @click="confirm_install_service = true" />
            <q-btn class="q-mr-sm" label="Uninstall Service" @click="confirm_uninstall_service = true" />
          </div>
        </div>
      </div>
    </q-card>
    <q-card class="q-pa-md q-mt-md">
      <div class="text-h5">Maintain Gallery</div>
      <div class="row">
        <div class="q-ma-sm">
          <div class="text-no-wrap">
            <q-dialog v-model="confirm_delete_all">
              <q-card class="q-pa-sm">
                <q-card-section class="row items-center">
                  <q-avatar icon="delete" color="primary" text-color="white" />
                  <span class="q-ml-sm">Are you sure to delete all media items from gallery?</span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" color="primary" v-close-popup />
                  <q-btn label="Delete all" color="primary" @click="remoteProcedureCall('/mediacollection/delete_all')"
                    v-close-popup />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-btn class="q-mr-sm" label="Delete all media files" @click="confirm_delete_all = true" />
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

  setup () {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      remoteProcedureCall,
      confirm_reboot: ref(false),
      confirm_shutdown: ref(false),
      confirm_restart_service: ref(false),
      confirm_reload_service: ref(false),
      confirm_install_service: ref(false),
      confirm_uninstall_service: ref(false),
      confirm_delete_all: ref(false),
    };
  },
});
</script>
