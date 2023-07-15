<template>
  <q-page padding>
    <div class="row col-xs-12 col-sm-4 col-md-3 col-lg-3">
      <q-card style="" class="q-pa-md q-ma-md">
        <q-card-section>
          <div class="text-h5">Maintenance</div>
          <div class="q-gutter-sm q-ma-md">
            <div>
              CPU: {{ store.information["cpu1_5_15"][0] }}% /
              {{ store.information["cpu1_5_15"][1] }}% /
              {{ store.information["cpu1_5_15"][2] }}%
            </div>
            <div>
              No. active threads: {{ store.information["active_threads"] }}
            </div>
            <div>
              Free disk:
              {{ (store.information["disk"]["free"] / 1024 ** 3).toFixed(1) }}GB
            </div>
            <div>
              Memory:
              {{
                (store.information["memory"]["total"] / 1024 ** 3).toFixed(1)
              }}GB total
              {{ (store.information["memory"]["free"] / 1024 ** 3).toFixed(1) }}GB free
              {{
                (store.information["memory"]["available"] / 1024 ** 3).toFixed(1)
              }}GB available
            </div>
            <div>
              Cma:
              {{
                (store.information["cma"]["CmaTotal"] / 1024 ** 1).toFixed(1)
              }}MB total /
              {{ (store.information["cma"]["CmaFree"] / 1024 ** 1).toFixed(1) }}MB free
            </div>
          </div>

        </q-card-section>
      </q-card>
      <!--
        # currently disabled since not working
      <q-card style="" class="q-pa-md q-ma-md">
        <q-card-section>
          <div class="text-h5">Primary Backend Stats</div>
          <div class="text-subtitle2">only avail stats displayed</div>
          <table>
            <tr v-for="(value, key, index) in store.information['imageserver_stats']['primary']" v-bind:key="index">
              <td align="right">
                {{ key }}
              </td>
              <td>{{ value }}</td>
            </tr>
          </table>
        </q-card-section>
      </q-card>
      <q-card style="" class="q-pa-md q-ma-md">
        <q-card-section>
          <div class="text-h5">Secondary Backend Stats</div>
          <div class="text-subtitle2">only avail stats displayed</div>
          <table>
            <tr v-for="(value, key, index) in store.information['imageserver_stats']['secondary']" v-bind:key="index">
              <td align="right">
                {{ key }}
              </td>
              <td>{{ value }}</td>
            </tr>
          </table>
        </q-card-section>
      </q-card>
    -->
    </div>
    <q-card class="q-pa-md q-mt-md">
      <div class="row">
        <div class="text-h5">Log Records</div>

        <!--<q-badge align="top" :label="store.serverConfig['common']['DEBUG_LEVEL']" />-->
        <QBtn href="/debug/log/latest" target="_blank">download log</QBtn>
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
  setup () {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      remoteProcedureCall,
    };
  },
});
</script>
