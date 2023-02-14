<template>
  <q-page padding>
    <q-card style="" class="q-pa-md">
      <div class="text-h6">Dashboard</div>
      autofocus timer:
      <q-btn label="on" @click="remoteProcedureCall('/cmd/autofocus/on')" />
      <q-btn label="off" @click="remoteProcedureCall('/cmd/autofocus/off')" />
      <br /><br />
    </q-card>
    <q-card class="q-pa-md q-mt-md">
      <div class="text-h6">Autofocus Results</div>
      <div>
        <ul>
          <li :key="item" v-for="(item, key) in this.store.stats.sharpness">
            {{ key }}: {{ item }}
          </li>
        </ul>
      </div>
    </q-card>
    <q-card class="q-pa-md q-mt-md">
      <div class="text-h6">Metadata</div>
      <div>
        Recent Images Metadata:
        <ul>
          <li :key="item" v-for="(item, key) in this.store.stats.metadata">
            {{ key }}: {{ item }}
          </li>
        </ul>
      </div>
    </q-card>
    <q-card class="q-pa-md q-mt-md">
      <div class="text-h6">Geolocation</div>
      <div>
        Latest LocationService results:
        <span id="locationservice">{{ this.store.stats.geolocation }}</span>
        <a target="_new" id="mapslink" href="#">open in maps</a>
      </div>
    </q-card>
    <q-card class="q-pa-md q-mt-md">
      <div class="row">
        <div class="text-h6">Log Records</div>

        <q-badge
          align="top"
          :label="store.serverConfig['debugging']['DEBUG_LEVEL']"
        />
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

export default defineComponent({
  name: "MainLayout",

  components: {},
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
