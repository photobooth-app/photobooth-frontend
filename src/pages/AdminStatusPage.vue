<template>
  <q-page id="status-page" padding>
    <div class="row col-xs-12 col-sm-4 col-md-3 col-lg-3">
      <q-card flat class="q-mr-md q-mb-md">
        <q-card-section>
          <q-list separator>
            <q-item-label header>{{ $t('system information') }}</q-item-label>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('data directory') }}</q-item-label>
                <q-item-label>{{ store.information.data_directory }} </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round color="primary" icon="sym_o_folder_shared" to="/admin/files" />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('app version') }} </q-item-label>
                <q-item-label>{{ store.information.version }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn flat round color="primary" icon="sym_o_upgrade" href="https://pypi.org/project/photobooth-app/" target="_blank" />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('cpu load') }} </q-item-label>
                <q-item-label>
                  <q-linear-progress size="lg" :value="store.information['cpu1_5_15'][0] / 100"> </q-linear-progress>
                </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('disk space') }} </q-item-label>
                <q-item-label>
                  <q-linear-progress size="lg" :value="store.information['disk']['used'] / store.information['disk']['total']" />
                </q-item-label>
                <q-item-label> {{ (store.information['disk']['free'] / 1024 ** 3).toFixed(1) }}{{ $t('GB available') }} </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('memory') }} </q-item-label>
                <q-item-label>
                  <q-linear-progress size="lg" :value="store.information['memory']['used'] / store.information['memory']['total']" />
                </q-item-label>
                <q-item-label> {{ (store.information['memory']['available'] / 1024 ** 3).toFixed(1) }}{{ $t('GB available') }} </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="store.information['battery_percent'] !== null">
              <q-item-section>
                <q-item-label caption>{{ $t('Battery') }} </q-item-label>
                <q-item-label>
                  <q-linear-progress size="lg" :value="store.information['battery_percent'] / 100" />
                </q-item-label>
                <!--eslint-disable-next-line @intlify/vue-i18n/no-raw-text-->
                <q-item-label> {{ store.information['battery_percent'].toFixed(0) }}% </q-item-label>
              </q-item-section>
            </q-item>

            <q-item v-if="Object.keys(store.information.temperatures).length > 0">
              <q-item-section>
                <q-item-label caption>{{ $t('System Temperatures') }} </q-item-label>

                <q-item v-for="(value, key, index) in store.information.temperatures" :key="index">
                  <q-item-section>
                    <q-item-label caption>{{ key }}</q-item-label>
                    <q-item-label>{{ value }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card flat class="q-mr-md q-mb-md">
        <q-card-section>
          <q-list separator>
            <q-item-label header>{{ $t('platform') }}</q-item-label>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('hostname') }}</q-item-label>
                <q-item-label>{{ store.information.platform_node }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('machine') }} </q-item-label>
                <q-item-label>{{
                  $t('{platform_machine}, {cpu_count} cores', {
                    platform_machine: store.information.platform_machine,
                    cpu_count: store.information.platform_cpu_count,
                  })
                }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('platform system') }} </q-item-label>
                <q-item-label>{{ store.information.platform_system }} {{ store.information.platform_release }} </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('computer model') }}</q-item-label>
                <q-item-label>{{ store.information.model }} </q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('python executable') }} </q-item-label>
                <q-item-label>{{ store.information.python_executable }}</q-item-label>
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('python version') }} </q-item-label>
                <q-item-label>
                  {{ store.information.platform_python_version }}
                </q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>

      <q-card v-for="(backend_stats, _, index) in store.information.backends" :key="index" flat class="q-mr-md q-mb-md">
        <q-card-section>
          <q-list separator>
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

      <q-card flat class="q-mr-md q-mb-md">
        <q-card-section>
          <q-list separator>
            <q-item-label header>{{ $t('Stats counter') }}</q-item-label>

            <q-item v-for="(value, field, index) in store.information.stats_counter" :key="index">
              <q-item-section>
                <q-item-label caption>{{ field }}</q-item-label>
                <q-item-label v-if="value && typeof value === 'object'">
                  <!--eslint-disable-next-line @intlify/vue-i18n/no-raw-text-->
                  <q-item-label v-for="(sub_val, sub_field, sub_index) in value" :key="sub_index"> {{ sub_field }}: {{ sub_val }} </q-item-label>
                </q-item-label>
                <q-item-label v-else>
                  {{ value }}
                </q-item-label>
              </q-item-section>
              <q-item-section v-if="!['last_reset'].includes(field)" side>
                <q-btn flat color="primary" icon="sym_o_history" @click="displayResetConfirm(field)" />
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
        <q-separator />
        <q-card-actions align="right">
          <q-btn flat color="primary" icon="sym_o_history" label="reset" @click="displayResetConfirm('')" />
        </q-card-actions>
      </q-card>
    </div>

    <q-dialog v-model="confirm_reset_counter">
      <q-card class="q-pa-sm">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_history" color="primary" text-color="white" />
          <span class="q-ml-sm">{{ $t('Are you sure to reset the counter?') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat label="Cancel" color="primary" />
          <q-btn v-close-popup label="Yes, reset!" color="primary" @click="confirmAction()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useMainStore } from '../stores/main-store.js';
import { remoteProcedureCall } from '../util/fetch_api.js';
import { QBtn } from 'quasar';

export default defineComponent({
  name: 'MainLayout',

  components: { QBtn },
  setup() {
    const store = useMainStore();
    const confirm_reset_counter = ref(false);
    const selected_field = ref('');

    return {
      // you can return the whole store instance to use it in the template
      store,
      remoteProcedureCall,
      confirm_reset_counter,
      selected_field,
    };
  },
  methods: {
    displayResetConfirm(field) {
      this.selected_field = field;
      this.confirm_reset_counter = true;
    },
    confirmAction() {
      remoteProcedureCall('/api/admin/information/sttscntr/reset/' + this.selected_field);
      this.confirm_reset_counter = false;
    },
  },
});
</script>
