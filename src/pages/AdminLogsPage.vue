<template>
  <q-page id="logs-page" padding>
    <q-card class="q-pa-md q-mt-md">
      <div class="row q-gutter-sm">
        <div class="text-h5">{{ $t('log messages') }}</div>
        <q-btn no-caps outline color="primary" href="/api/debug/log/latest" target="_blank">{{ $t('download logs') }}</q-btn>
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
          <tr v-for="(record, idx) in store.logrecords as any[]" :key="idx">
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

<script setup lang="ts">
import { useMainStore } from '../stores/main-store'
import { QBtn } from 'quasar'

const store = useMainStore()

const debugLevelColor = (level: string) => {
  if (level == 'DEBUG') return 'info'
  if (level == 'INFO') return 'info'
  if (level == 'WARNING') return 'warning'
  if (level == 'ERROR') return 'negative'
  if (level == 'CRITICAL') return 'negative'

  return 'grey'
}
</script>
