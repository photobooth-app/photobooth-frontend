<template>
  <q-page padding>
    <q-card class="q-pa-md">
      <div class="text-h5" v-html="$t('TITLE_SERVER_CONTROL')"></div>
      <div class="row">
        <div class="q-ma-sm">
          <div class="text-no-wrap">
            <q-dialog v-model="confirm_reboot">
              <q-card class="q-pa-sm" style="min-width: 350px">
                <q-card-section class="row items-center">
                  <q-avatar icon="restart_alt" color="primary" text-color="white" />
                  <span class="q-ml-sm" v-html="$t('MSG_CONFIRM_REBOOT')"></span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat :label="$t('BTN_LABEL_CANCEL')" color="primary" v-close-popup />
                  <q-btn :label="$t('BTN_LABEL_REBOOT')" color="primary" @click="remoteProcedureCall('/system/server/reboot')" v-close-popup />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-dialog v-model="confirm_shutdown">
              <q-card class="q-pa-sm" style="min-width: 350px">
                <q-card-section class="row items-center">
                  <q-avatar icon="power_settings_new" color="primary" text-color="white" />
                  <span class="q-ml-sm" v-html="$t('MSG_CONFIRM_SHUTDOWN')"></span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat :label="$t('BTN_LABEL_CANCEL')" v-close-popup />
                  <q-btn :label="$t('BTN_LABEL_SHUTDOWN')" color="primary" v-close-popup @click="remoteProcedureCall('/system/server/shutdown')" />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-dialog v-model="confirm_restart_service">
              <q-card class="q-pa-sm" style="min-width: 350px">
                <q-card-section class="row items-center">
                  <q-avatar icon="restart_alt" color="primary" text-color="white" />
                  <span class="q-ml-sm" v-html="$t('MSG_CONFIRM_RESTART_SERVICE')"></span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat :label="$t('BTN_LABEL_CANCEL')" v-close-popup />
                  <q-btn
                    :label="$t('BTN_LABEL_RESTART_SERVICE')"
                    color="primary"
                    v-close-popup
                    @click="remoteProcedureCall('/system/service/restart')"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-dialog v-model="confirm_reload_service">
              <q-card class="q-pa-sm" style="min-width: 350px">
                <q-card-section class="row items-center">
                  <q-avatar icon="restart_alt" color="primary" text-color="white" />
                  <span class="q-ml-sm" v-html="$t('MSG_CONFIRM_RELOAD_SERVICE')"></span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat :label="$t('BTN_LABEL_CANCEL')" v-close-popup />
                  <q-btn
                    :label="$t('BTN_LABEL_RELOAD_SERVICE')"
                    color="primary"
                    v-close-popup
                    @click="remoteProcedureCall('/system/service/reload')"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-dialog v-model="confirm_install_service">
              <q-card class="q-pa-sm" style="min-width: 350px">
                <q-card-section class="row items-center">
                  <q-avatar icon="add_circle" color="primary" text-color="white" />
                  <span class="q-ml-sm" v-html="$t('MSG_CONFIRM_INSTALL_SERVICE')"></span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat :label="$t('BTN_LABEL_CANCEL')" v-close-popup />
                  <q-btn
                    :label="$t('BTN_LABEL_INSTALL_SERVICE')"
                    color="primary"
                    v-close-popup
                    @click="remoteProcedureCall('/system/service/install')"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-dialog v-model="confirm_uninstall_service">
              <q-card class="q-pa-sm" style="min-width: 350px">
                <q-card-section class="row items-center">
                  <q-avatar icon="cancel" color="primary" text-color="white" />
                  <span class="q-ml-sm" v-html="$t('MSG_CONFIRM_UNINSTALL_SERVICE')"></span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat :label="$t('BTN_LABEL_CANCEL')" v-close-popup />
                  <q-btn
                    :label="$t('BTN_LABEL_UNINSTALL_SERVICE')"
                    color="primary"
                    v-close-popup
                    @click="remoteProcedureCall('/system/service/uninstall')"
                  />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-btn class="q-mr-sm" :label="$t('BTN_LABEL_REBOOT_HOST')" @click="confirm_reboot = true" />
            <q-btn class="q-mr-sm" :label="$t('BTN_LABEL_SHUTDOWN_HOST')" @click="confirm_shutdown = true" />
            <q-btn class="q-mr-sm" :label="$t('BTN_LABEL_RESTART_SERVICE')" @click="confirm_restart_service = true" />
            <q-btn class="q-mr-sm" :label="$t('BTN_LABEL_INSTALL_SERVICE')" @click="confirm_install_service = true" />
            <q-btn class="q-mr-sm" :label="$t('BTN_LABEL_UNINSTALL_SERVICE')" @click="confirm_uninstall_service = true" />
          </div>
        </div>
      </div>
    </q-card>
    <q-card class="q-pa-md q-mt-md">
      <div class="text-h5" v-html="$t('TITLE_MAINTAIN_GALLERY')"></div>
      <div class="row">
        <div class="q-ma-sm">
          <div class="text-no-wrap">
            <q-dialog v-model="confirm_delete_all">
              <q-card class="q-pa-sm">
                <q-card-section class="row items-center">
                  <q-avatar icon="delete" color="primary" text-color="white" />
                  <span class="q-ml-sm" v-html="$t('MSG_CONFIRM_DELETE_ALL_MEDIA_FILES')"></span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn flat label="Cancel" color="primary" v-close-popup />
                  <q-btn label="Delete all" color="primary" @click="remoteProcedureCall('/mediacollection/delete_all')" v-close-popup />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-btn class="q-mr-sm" :label="$t('BTN_LABEL_DELETE_ALL_MEDIA_FILES')" @click="confirm_delete_all = true" />
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
      confirm_reload_service: ref(false),
      confirm_install_service: ref(false),
      confirm_uninstall_service: ref(false),
      confirm_delete_all: ref(false),
    };
  },
});
</script>
