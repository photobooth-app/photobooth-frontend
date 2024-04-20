<template>
  <q-page padding>
    <div class="row col-xs-12 col-sm-4 col-md-3 col-lg-3">
      <q-card class="q-mr-md q-mb-md">
        <q-card-section>
          <q-list separator>
            <q-item-label header>{{ $t('system information') }}</q-item-label>
            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('data directory') }}</q-item-label>
                <q-item-label>{{ store.information.data_directory }} </q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-btn flat round color="primary" icon="folder_shared" to="/admin/files" />
              </q-item-section>
            </q-item>

            <q-item>
              <q-item-section>
                <q-item-label caption>{{ $t('app version') }} </q-item-label>
                <q-item-label>{{ store.information.version }}</q-item-label>
              </q-item-section>

              <q-item-section side>
                <q-btn flat round color="primary" icon="upgrade" href="https://pypi.org/project/photobooth-app/" target="_blank" />
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
          </q-list>
        </q-card-section>
      </q-card>

      <q-card class="q-mr-md q-mb-md">
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

      <q-card class="q-mr-md q-mb-md">
        <q-card-section>
          <q-list separator>
            <q-item-label header>{{ $t('primary backend') }}</q-item-label>
            <q-item v-for="(value, key, index) in store.information.backends.primary" :key="index">
              <q-item-section>
                <q-item-label caption>{{ key }}</q-item-label>
                <q-item-label>{{ value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
      <q-card v-if="Object.keys(store.information.backends.secondary).length > 0" class="q-mr-md q-mb-md">
        <q-card-section>
          <q-list separator>
            <q-item-label header>{{ $t('secondary backend') }}</q-item-label>
            <q-item v-for="(value, key, index) in store.information.backends.secondary" :key="index">
              <q-item-section>
                <q-item-label caption>{{ key }}</q-item-label>
                <q-item-label>{{ value }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-card-section>
      </q-card>
    </div>

    <q-card class="q-pa-md q-mt-md">
      <div class="row q-gutter-sm">
        <div class="text-h5">{{ $t('log messages') }}</div>
        <QBtn href="/debug/log/latest" target="_blank">{{ $t('download logs') }}</QBtn>
      </div>

      <q-markup-table>
        <thead>
          <tr class="text-left">
            <th>{{ $t('log level') }}</th>
            <th>{{ $t('time') }}</th>
            <th style="width: 100%">{{ $t('log message') }}</th>
            <th>{{ $t('module name') }}</th>
            <th>{{ $t('function name') }}</th>
            <th>{{ $t('line') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, idx) in store.logrecords" :key="idx">
            <td>
              <q-badge :color="debugLevelColor(record.level)">
                {{ record.level }}
              </q-badge>
            </td>
            <td>{{ record.time }}</td>
            <td>{{ record.message }}</td>
            <td>{{ record.name }}</td>
            <td>{{ record.funcName }}</td>
            <td>{{ record.lineno }}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent } from 'vue';
import { useMainStore } from '../stores/main-store.js';
import { remoteProcedureCall } from 'boot/fetch_api';
import { QBtn } from 'quasar';

export default defineComponent({
  name: 'MainLayout',

  components: { QBtn },
  setup() {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      remoteProcedureCall,
    };
  },
  methods: {
    debugLevelColor(level) {
      if (level == 'DEBUG') return 'info';
      if (level == 'INFO') return 'info';
      if (level == 'WARNING') return 'warning';
      if (level == 'ERROR') return 'negative';
      if (level == 'CRITICAL') return 'negative';

      return 'grey';
    },
  },
});
</script>
src/boot/fetch_api.js
