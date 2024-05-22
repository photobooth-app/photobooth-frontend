<template>
  <q-page id="admin-page" padding>
    <q-card flat class="q-pa-md">
      <div class="text-h5">{{ $t('TITLE_SERVER_CONTROL') }}</div>
      <div class="q-ma-none">
        <div>
          <q-dialog v-model="confirm_reboot">
            <q-card class="q-pa-sm" style="min-width: 350px">
              <q-card-section class="row items-center" style="flex-wrap: nowrap">
                <q-avatar icon="restart_alt" color="primary" text-color="white" />
                <span class="q-ml-sm">{{ $t('MSG_CONFIRM_REBOOT') }}</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" color="primary" />
                <q-btn v-close-popup :label="$t('BTN_LABEL_REBOOT')" color="primary" @click="remoteProcedureCall('/api/system/server/reboot')" />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="confirm_shutdown">
            <q-card class="q-pa-sm" style="min-width: 350px">
              <q-card-section class="row items-center" style="flex-wrap: nowrap">
                <q-avatar icon="power_settings_new" color="primary" text-color="white" />
                <span class="q-ml-sm">{{ $t('MSG_CONFIRM_SHUTDOWN') }}</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
                <q-btn v-close-popup :label="$t('BTN_LABEL_SHUTDOWN')" color="primary" @click="remoteProcedureCall('/api/system/server/shutdown')" />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="confirm_restart_service">
            <q-card class="q-pa-sm" style="min-width: 350px">
              <q-card-section class="row items-center" style="flex-wrap: nowrap">
                <q-avatar icon="restart_alt" color="primary" text-color="white" />
                <span class="q-ml-sm">{{ $t('MSG_CONFIRM_RESTART_SERVICE') }}</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
                <q-btn
                  v-close-popup
                  :label="$t('BTN_LABEL_RESTART_SERVICE')"
                  color="primary"
                  @click="remoteProcedureCall('/api/system/service/restart')"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="confirm_reload_service">
            <q-card class="q-pa-sm" style="min-width: 350px">
              <q-card-section class="row items-center" style="flex-wrap: nowrap">
                <q-avatar icon="restart_alt" color="primary" text-color="white" />
                <span class="q-ml-sm">{{ $t('MSG_CONFIRM_RELOAD_SERVICE') }}</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
                <q-btn
                  v-close-popup
                  :label="$t('BTN_LABEL_RELOAD_SERVICE')"
                  color="primary"
                  @click="remoteProcedureCall('/api/system/service/reload')"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="confirm_install_service">
            <q-card class="q-pa-sm" style="min-width: 350px">
              <q-card-section class="row items-center" style="flex-wrap: nowrap">
                <q-avatar icon="add_circle" color="primary" text-color="white" />
                <span class="q-ml-sm">{{ $t('MSG_CONFIRM_INSTALL_SERVICE') }}</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
                <q-btn
                  v-close-popup
                  :label="$t('BTN_LABEL_INSTALL_SERVICE')"
                  color="primary"
                  @click="remoteProcedureCall('/api/system/service/install')"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <q-dialog v-model="confirm_uninstall_service">
            <q-card class="q-pa-sm" style="min-width: 350px">
              <q-card-section class="row items-center" style="flex-wrap: nowrap">
                <q-avatar icon="cancel" color="primary" text-color="white" />
                <span class="q-ml-sm">{{ $t('MSG_CONFIRM_UNINSTALL_SERVICE') }}</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
                <q-btn
                  v-close-popup
                  :label="$t('BTN_LABEL_UNINSTALL_SERVICE')"
                  color="primary"
                  @click="remoteProcedureCall('/api/system/service/uninstall')"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <q-card-section class="q-gutter-sm q-px-none">
            <div class="text-caption">{{ $t('Host') }}</div>
            <q-btn :label="$t('BTN_LABEL_REBOOT_HOST')" @click="confirm_reboot = true" />
            <q-btn :label="$t('BTN_LABEL_SHUTDOWN_HOST')" @click="confirm_shutdown = true" />
          </q-card-section>

          <q-card-section class="q-gutter-sm q-px-none">
            <div class="text-caption">{{ $t('Service (Linux only)') }}</div>
            <q-btn :label="$t('BTN_LABEL_INSTALL_SERVICE')" @click="confirm_install_service = true" />
            <q-btn :label="$t('BTN_LABEL_UNINSTALL_SERVICE')" @click="confirm_uninstall_service = true" />
            <q-btn :label="$t('BTN_LABEL_RESTART_SERVICE')" @click="confirm_restart_service = true" />
          </q-card-section>
        </div>
      </div>
    </q-card>
    <q-card flat class="q-pa-md q-mt-md">
      <div class="text-h5">{{ $t('TITLE_MAINTAIN_GALLERY') }}</div>
      <div class="row">
        <div class="q-ma-sm">
          <div class="q-gutter-sm">
            <q-dialog v-model="confirm_delete_all">
              <q-card class="q-pa-sm">
                <q-card-section class="row items-center" style="flex-wrap: nowrap">
                  <q-avatar icon="delete" color="primary" text-color="white" />
                  <span class="q-ml-sm">{{ $t('MSG_CONFIRM_DELETE_ALL_MEDIA_FILES') }}</span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn v-close-popup flat label="Cancel" color="primary" />
                  <q-btn v-close-popup label="Delete all" color="primary" @click="remoteProcedureCall('/api/mediacollection/delete_all')" />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-dialog v-model="confirm_clear_recycle_directory">
              <q-card class="q-pa-sm">
                <q-card-section class="row items-center" style="flex-wrap: nowrap">
                  <q-avatar icon="delete" color="primary" text-color="white" />
                  <span class="q-ml-sm">{{ $t('Are you sure to clear the recycle directory?') }}</span>
                </q-card-section>

                <q-card-actions align="right">
                  <q-btn v-close-popup flat label="Cancel" color="primary" />
                  <q-btn v-close-popup label="Yes, clear!" color="primary" @click="remoteProcedureCall('/api/admin/files/clearrecycledir')" />
                </q-card-actions>
              </q-card>
            </q-dialog>

            <q-btn :label="$t('BTN_LABEL_DELETE_ALL_MEDIA_FILES')" @click="confirm_delete_all = true" />
            <q-btn :label="$t('Clear recycle directory')" @click="confirm_clear_recycle_directory = true" />
          </div>
        </div>
      </div>
    </q-card>

    <q-card flat class="q-pa-md q-mt-md">
      <div class="text-h5">{{ $t('TITLE_LOCAL_UI_SETTINGS') }}</div>
      <div class="row q-gutter-sm">
        <language-switcher />
        <q-btn href="https://github.com/photobooth-app/photobooth-app/blob/main/CONTRIBUTING.md#help-translate-the-app" target="_blank">
          {{ $t('Help to translate') }}
        </q-btn>
      </div>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { remoteProcedureCall } from '../util/fetch_api';
import LanguageSwitcher from '../components/LanguageSwitcher.vue';

export default defineComponent({
  name: 'MainLayout',
  components: { LanguageSwitcher },
  setup() {
    return {
      remoteProcedureCall,
      confirm_reboot: ref(false),
      confirm_shutdown: ref(false),
      confirm_restart_service: ref(false),
      confirm_reload_service: ref(false),
      confirm_install_service: ref(false),
      confirm_uninstall_service: ref(false),
      confirm_delete_all: ref(false),
      confirm_clear_recycle_directory: ref(false),
    };
  },
});
</script>
