<template>
  <q-page padding>
    <q-card style="" class="q-pa-md q-mt-md">
      <div class="text-h5">Maintenance / Information</div>
      <div class="q-gutter-sm q-ma-md">
        <div>
          CPU: 1min: {{ store.information["cpu1_5_15"][0] }} 5min:
          {{ store.information["cpu1_5_15"][1] }} 15min:
          {{ store.information["cpu1_5_15"][2] }}
          #active threads: {{ store.information["active_threads"] }}
        </div>
        <div>
          Disk: total
          {{ (store.information["disk"]["total"] / 1024 ** 3).toFixed(1) }}GB
          free:
          {{ (store.information["disk"]["free"] / 1024 ** 3).toFixed(1) }}GB
        </div>
        <div>
          Memory: total
          {{ (store.information["memory"]["total"] / 1024 ** 3).toFixed(1) }}GB
          free:
          {{ (store.information["memory"]["free"] / 1024 ** 3).toFixed(1) }}GB
          available:
          {{
            (store.information["memory"]["available"] / 1024 ** 3).toFixed(1)
          }}GB
        </div>
        <div>
          Cma: total
          {{ (store.information["cma"]["CmaTotal"] / 1024 ** 1).toFixed(1) }}MB
          free:
          {{ (store.information["cma"]["CmaFree"] / 1024 ** 1).toFixed(1) }}MB
        </div>
        <div>TODO: RPI Temp, ...</div>
      </div>
    </q-card>
    <q-card class="q-pa-md q-mt-md">
      <div class="row">
        <div class="text-h5">Log Records</div>

        <q-badge
          align="top"
          :label="store.serverConfig['common']['DEBUG_LEVEL']"
        />
        <QBtn href="/log/latest" target="_blank">download log</QBtn>
      </div>

      <q-markup-table>
        <thead>
          <tr class="text-left">
            <th>Level</th>
            <th>Time</th>
            <th>Name</th>
            <th>Function Name</th>
            <th>LineNo</th>
            <th style="width: 100%">Message</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(record, idx) in this.store.logrecords" :key="idx">
            <td>{{ record.level }}</td>
            <td>{{ record.time }}</td>
            <td>{{ record.name }}</td>
            <td>{{ record.funcName }}</td>
            <td>{{ record.lineno }}</td>
            <td>{{ record.message }}</td>
          </tr>
        </tbody>
      </q-markup-table>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from "vue";
import { useMainStore } from "../stores/main-store.js";
import { remoteProcedureCall } from "boot/axios";
import { QBtn } from "quasar";

export default defineComponent({
  name: "MainLayout",

  components: { QBtn },
  setup() {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      remoteProcedureCall,
    };
  },
});
</script>
