<template>
  <q-page id="admin-page" padding>
    <div class="row col-xs-12 col-sm-4 col-md-3 col-lg-3">
      <q-card flat class="q-mr-md q-mb-md">
        <q-card-section>
          <q-list>
            <q-item-label header>{{ $t('TITLE_SERVER_CONTROL') }}</q-item-label>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('Host') }}</q-item-label>
                <q-item-label> <q-btn no-caps flat color="green" :label="$t('Reboot Host')" @click="confirm_reboot_host = true" /> </q-item-label>
                <q-item-label>
                  <q-btn no-caps flat color="green" :label="$t('Shutdown Host')" @click="confirm_shutdown_host = true" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('Service') }}</q-item-label>
                <q-item-label>
                  <q-btn no-caps flat color="green" :label="$t('Reload services')" @click="confirm_reload_service = true" />
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="store.information_onetime.platform_system == 'Linux'">
              <q-item-section>
                <q-item-label caption>{{ $t('Systemctl (Linux only)') }}</q-item-label>
                <q-item-label>
                  <q-btn no-caps flat color="green" :label="$t('install systemctl service')" @click="confirm_install_systemctl = true" />
                </q-item-label>
                <q-item-label>
                  <q-btn no-caps flat color="green" :label="$t('uninstall systemctl service')" @click="confirm_uninstall_systemctl = true" />
                </q-item-label>
                <q-item-label>
                  <q-btn no-caps flat color="green" :label="$t('restart systemctl service')" @click="confirm_restart_systemctl = true" />
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card flat class="q-mr-md q-mb-md column">
        <q-card-section style="flex-grow: 1">
          <q-list>
            <q-item-label header>{{ $t('Language') }}</q-item-label>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('Selected language') }}</q-item-label>
                <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
                <q-item-label>{{ getLanguageName(locale) }}, {{ locale }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  color="green"
                  round
                  icon="sym_o_translate"
                  href="https://github.com/photobooth-app/photobooth-app/blob/main/CONTRIBUTING.md#help-translate-the-app"
                  target="_blank"
                >
                  <q-tooltip class="">{{ $t('Learn how to help translating the app') }}</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('Browsers preferred languages') }}</q-item-label>
                <q-item-label v-for="(language, index) in preferredLanguages" :key="language" :class="{ 'text-italic': index == 0 }">
                  {{ language }}
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn
                  flat
                  color="green"
                  round
                  icon="sym_o_open_in_new"
                  href="https://github.com/photobooth-app/photobooth-frontend/tree/main/src/i18n/locales"
                  target="_blank"
                >
                  <q-tooltip class="">{{ $t('Check which languages are supported by the app.') }}</q-tooltip>
                </q-btn>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" vertical>
          <q-btn no-caps flat color="green" @click="enableInContextTranslation()">{{ $t('Translate in context using Crowdin') }}</q-btn>
        </q-card-actions>
      </q-card>

      <q-card flat class="q-mr-md q-mb-md">
        <q-card-section>
          <q-list>
            <q-item-label header>{{ $t('system information') }}</q-item-label>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('data directory') }}</q-item-label>
                <q-item-label>{{ store.information_onetime.data_directory }} </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round color="green" icon="sym_o_folder_shared" to="/admin/files" />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('app version') }} </q-item-label>
                <q-item-label>{{ store.information_onetime.version }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn flat round color="green" icon="sym_o_upgrade" href="https://pypi.org/project/photobooth-app/" target="_blank" />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('Frontend build date') }} </q-item-label>
                <q-item-label>{{ builddate }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('cpu load') }} </q-item-label>
                <q-item-label>
                  <q-linear-progress color="green" size="lg" :value="store.information_interval.cpu_percent / 100"> </q-linear-progress>
                </q-item-label>

                <q-item-label>
                  <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text-->
                  {{ store.information_interval.cpu_percent }}%
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('disk space') }} </q-item-label>
                <q-item-label>
                  <q-linear-progress color="green" size="lg" :value="store.information_onetime.disk.used / store.information_onetime.disk.total" />
                </q-item-label>
                <q-item-label> {{ (store.information_onetime.disk.free / 1024 ** 3).toFixed(1) }}{{ $t('GB available') }} </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('memory') }} </q-item-label>
                <q-item-label>
                  <q-linear-progress
                    color="green"
                    size="lg"
                    :value="store.information_interval.memory.used / store.information_interval.memory.total"
                  />
                </q-item-label>
                <q-item-label> {{ (store.information_interval.memory.available / 1024 ** 3).toFixed(1) }}{{ $t('GB available') }} </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="store.information_interval.battery_percent !== null">
              <q-item-section>
                <q-item-label caption>{{ $t('Battery') }} </q-item-label>
                <q-item-label>
                  <q-linear-progress color="green" size="lg" :value="store.information_interval.battery_percent / 100" />
                </q-item-label>
                <!--eslint-disable-next-line @intlify/vue-i18n/no-raw-text-->
                <q-item-label> {{ store.information_interval.battery_percent.toFixed(0) }}% </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="Object.keys(store.information_interval.temperatures).length > 0">
              <q-item-section>
                <q-item-label caption>{{ $t('System Temperatures') }} </q-item-label>
                <div class="row">
                  <q-item v-for="(value, key, index) in store.information_interval.temperatures" :key="index">
                    <q-item-section>
                      <q-item-label caption>{{ key }}</q-item-label>
                      <q-item-label>{{ value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </q-item-section>
            </q-item>

            <q-item v-if="Object.keys(filteredPiThrottledFlags).length > 0">
              <q-item-section>
                <q-item-label caption>{{ $t('Pi Throttled Flags') }} </q-item-label>
                <div class="col">
                  <q-item v-for="(value, key, index) in filteredPiThrottledFlags" :key="index">
                    <q-item-section>
                      <q-item-label caption>{{ key }}</q-item-label>
                      <q-item-label>{{ value }}</q-item-label>
                    </q-item-section>
                  </q-item>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card flat class="q-mr-md q-mb-md">
        <q-card-section>
          <q-list>
            <q-item-label header>{{ $t('platform') }}</q-item-label>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('hostname') }}</q-item-label>
                <q-item-label>{{ store.information_onetime.platform_node }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('machine') }} </q-item-label>
                <q-item-label>{{
                  $t('{platform_machine}, {cpu_count} cores', {
                    platform_machine: store.information_onetime.platform_machine,
                    cpu_count: store.information_onetime.platform_cpu_count,
                  })
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('platform system') }} </q-item-label>
                <q-item-label>{{ store.information_onetime.platform_system }} {{ store.information_onetime.platform_release }} </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('computer model') }}</q-item-label>
                <q-item-label>{{ store.information_onetime.model }} </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('python executable') }} </q-item-label>
                <q-item-label>{{ store.information_onetime.python_executable }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('python version') }} </q-item-label>
                <q-item-label>
                  {{ store.information_onetime.platform_python_version }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card flat class="q-mr-md q-mb-md column">
        <q-card-section style="flex-grow: 1">
          <q-list>
            <q-item-label header>{{ $t('Media Database') }}</q-item-label>
            <q-item v-if="Object.keys(store.information_interval.mediacollection).length == 0">{{
              $t('Currently there is no item to display.')
            }}</q-item>

            <q-item v-for="(entry, index) in store.information_interval.mediacollection" :key="index">
              <q-item-section>
                <q-item-label caption>{{ index }} </q-item-label>

                <q-item-label>
                  <q-item-label> {{ entry }} </q-item-label>
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right" vertical>
          <q-btn no-caps flat color="green" :label="$t('BTN_LABEL_DELETE_ALL_MEDIA_FILES')" @click="confirm_delete_all = true" />
          <q-btn no-caps flat color="green" :label="$t('Clear recycle directory')" @click="confirm_clear_recycle_directory = true" />
        </q-card-actions>
      </q-card>

      <q-card v-for="(backend_stats, _, index) in store.information_interval.backends" :key="index" flat class="q-mr-md q-mb-md">
        <q-card-section>
          <q-list>
            <q-item-label header>{{ $t('Backend Index: ') }}{{ index }}</q-item-label>
            <q-item v-for="(field_value, field_key, field_index) in backend_stats" :key="field_index">
              <q-item-section>
                <q-item-label caption>{{ field_key }}</q-item-label>
                <q-item-label>{{ field_value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <!-- <DashboardGenericStatsCard :stats="sampleStats" /> -->
      <DashboardGenericStatsCard v-for="(entry, key) in store.information_interval.plugins" :key="key" :stats="entry"></DashboardGenericStatsCard>
      <!-- <DashboardGenericStatsCard :stats="store.information_interval.plugins[0]" /> -->

      <q-card flat class="q-mr-md q-mb-md column">
        <q-card-section style="flex-grow: 1">
          <q-list>
            <q-item-label header>{{ $t('Stats counter') }}</q-item-label>
            <q-item v-if="Object.keys(store.information_interval.stats_counter).length == 0">{{
              $t('Currently there is no item to display.')
            }}</q-item>

            <q-item v-for="(entry, index) in store.information_interval.stats_counter" :key="index">
              <q-item-section>
                <q-item-label caption>{{ entry.action }} </q-item-label>

                <q-item-label>
                  <!--eslint-disable-next-line @intlify/vue-i18n/no-raw-text-->
                  <q-tooltip> last used at: {{ entry.last_used_at }} </q-tooltip>
                  <q-item-label> {{ entry.count }} </q-item-label>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat color="green" icon="sym_o_history" @click="displayResetStatsConfirm(entry.action)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn no-caps flat color="green" label="Reset all" @click="displayResetStatsConfirm('')" />
        </q-card-actions>
      </q-card>

      <q-card flat class="q-mr-md q-mb-md column">
        <q-card-section style="flex-grow: 1">
          <q-list>
            <q-item-label header>{{ $t('Limits counter') }}</q-item-label>
            <q-item v-if="Object.keys(store.information_interval.limits_counter).length == 0">{{
              $t('Currently there is no item to display.')
            }}</q-item>

            <q-item v-for="(entry, index) in store.information_interval.limits_counter" :key="index">
              <q-item-section>
                <q-item-label caption>{{ entry.action }} </q-item-label>

                <q-item-label>
                  <!--eslint-disable-next-line @intlify/vue-i18n/no-raw-text-->
                  <q-tooltip> last used at: {{ entry.last_used_at }} </q-tooltip>
                  <q-item-label> {{ entry.count }} </q-item-label>
                </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat color="green" icon="sym_o_history" @click="displayResetLimitsConfirm(entry.action)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn no-caps flat color="green" label="Reset all" @click="displayResetLimitsConfirm('')" />
        </q-card-actions>
      </q-card>
    </div>
    <q-dialog v-model="confirm_reboot_host">
      <q-card class="q-pa-sm" style="min-width: 350px">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_restart_alt" color="green" text-color="white" />
          <span class="q-ml-sm">{{ $t('MSG_CONFIRM_REBOOT') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
          <q-btn no-caps v-close-popup :label="$t('BTN_LABEL_REBOOT')" color="green" @click="remoteProcedureCall('/api/system/host/reboot')" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirm_shutdown_host">
      <q-card class="q-pa-sm" style="min-width: 350px">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_power_settings_new" color="green" text-color="white" />
          <span class="q-ml-sm">{{ $t('MSG_CONFIRM_SHUTDOWN') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
          <q-btn no-caps v-close-popup :label="$t('BTN_LABEL_SHUTDOWN')" color="green" @click="remoteProcedureCall('/api/system/host/shutdown')" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirm_reload_service">
      <q-card class="q-pa-sm" style="min-width: 350px">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_restart_alt" color="green" text-color="white" />
          <span class="q-ml-sm">{{ $t('You sure to reload the services?') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
          <q-btn
            no-caps
            v-close-popup
            :label="$t('BTN_LABEL_RELOAD_SERVICE')"
            color="green"
            @click="remoteProcedureCall('/api/system/service/reload')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirm_restart_systemctl">
      <q-card class="q-pa-sm" style="min-width: 350px">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_restart_alt" color="green" text-color="white" />
          <span class="q-ml-sm">{{ $t('MSG_CONFIRM_RESTART_SERVICE') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
          <q-btn
            no-caps
            v-close-popup
            :label="$t('BTN_LABEL_RESTART_SERVICE')"
            color="green"
            @click="remoteProcedureCall('/api/system/systemctl/restart')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirm_install_systemctl">
      <q-card class="q-pa-sm" style="min-width: 350px">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_add_circle" color="green" text-color="white" />
          <span class="q-ml-sm">{{ $t('MSG_CONFIRM_INSTALL_SERVICE') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
          <q-btn
            no-caps
            v-close-popup
            :label="$t('BTN_LABEL_INSTALL_SERVICE')"
            color="green"
            @click="remoteProcedureCall('/api/system/systemctl/install')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirm_uninstall_systemctl">
      <q-card class="q-pa-sm" style="min-width: 350px">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_cancel" color="green" text-color="white" />
          <span class="q-ml-sm">{{ $t('MSG_CONFIRM_UNINSTALL_SERVICE') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
          <q-btn
            no-caps
            v-close-popup
            :label="$t('BTN_LABEL_UNINSTALL_SERVICE')"
            color="green"
            @click="remoteProcedureCall('/api/system/systemctl/uninstall')"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirm_reset_stats_counter">
      <q-card class="q-pa-sm">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_history" color="green" text-color="white" />
          <span class="q-ml-sm">{{ $t('Are you sure you want to reset the usage statistics counter?') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
          <q-btn no-caps v-close-popup :label="$t('yes, reset')" color="negative" @click="actionResetStatsConfirmed()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirm_reset_limits_counter">
      <q-card class="q-pa-sm">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_history" color="green" text-color="white" />
          <span class="q-ml-sm">{{ $t('Are you sure you want to reset the share limits counter?') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
          <q-btn no-caps v-close-popup :label="$t('yes, reset')" color="negative" @click="actionResetLimitsConfirmed()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirm_delete_all">
      <q-card class="q-pa-sm">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_delete" color="green" text-color="white" />
          <span class="q-ml-sm">{{ $t('MSG_CONFIRM_DELETE_ALL_MEDIA_FILES') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
          <q-btn no-caps v-close-popup :label="$t('Yes, delete')" color="negative" @click="mediacollectionStore.deleteAllItems()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="confirm_clear_recycle_directory">
      <q-card class="q-pa-sm">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_delete" color="green" text-color="white" />
          <span class="q-ml-sm">{{ $t('Are you sure to clear the recycle directory?') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
          <q-btn no-caps v-close-popup :label="$t('Yes, delete')" color="negative" @click="remoteProcedureCall('/api/admin/files/clearrecycledir')" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMediacollectionStore } from '../stores/mediacollection-store'
import { useMainStore } from '../stores/main-store'
import { remoteProcedureCall } from '../util/fetch_api.js'
import { useI18n } from 'vue-i18n'
import { getLanguageName, preferredLanguages, enableInContextTranslation } from 'boot/i18n'
import DashboardGenericStatsCard from '../components/DashboardGenericStatsCard.vue'

const { locale } = useI18n({ useScope: 'global' })
const store = useMainStore()
const mediacollectionStore = useMediacollectionStore()
const selected_field = ref('')
const confirm_reset_limits_counter = ref(false)
const confirm_reset_stats_counter = ref(false)
const confirm_reboot_host = ref(false)
const confirm_shutdown_host = ref(false)
const confirm_reload_service = ref(false)
const confirm_restart_systemctl = ref(false)
const confirm_install_systemctl = ref(false)
const confirm_uninstall_systemctl = ref(false)
const confirm_delete_all = ref(false)
const confirm_clear_recycle_directory = ref(false)
const builddate = new Date(process.env.BUILD_DATE).toLocaleString()

const displayResetLimitsConfirm = (field: string) => {
  selected_field.value = field
  confirm_reset_limits_counter.value = true
}

const displayResetStatsConfirm = (field: string) => {
  selected_field.value = field
  confirm_reset_stats_counter.value = true
}
const actionResetStatsConfirmed = () => {
  remoteProcedureCall('/api/admin/information/cntr/reset/' + selected_field.value)
  confirm_reset_stats_counter.value = false
}
const actionResetLimitsConfirmed = () => {
  remoteProcedureCall('/api/admin/share/cntr/reset/' + selected_field.value)
  confirm_reset_limits_counter.value = false
}

// Computed filtering logic
const filteredPiThrottledFlags = computed(() => {
  const flags = store.information_interval.pi_throttled_flags
  return Object.fromEntries(Object.entries(flags).filter(([key, value]) => key === 'undervoltage_occurred' || value === true))
})
</script>
