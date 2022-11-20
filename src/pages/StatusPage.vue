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
        <iframe
          width="425"
          height="350"
          frameborder="0"
          scrolling="no"
          marginheight="0"
          marginwidth="0"
          src="https://www.openstreetmap.org/export/embed.html?&amp;layer=mapnik&amp;marker=52.35885%2C9.74953"
          style="border: 1px solid black"
        ></iframe
        ><br /><small
          ><a
            href="https://www.openstreetmap.org/?mlat=52.35896&amp;mlon=9.74939#map=19/52.35896/9.74939"
            >Größere Karte anzeigen</a
          ></small
        >
      </div>
    </q-card>
    <q-card class="q-pa-md q-mt-md">
      <div class="text-h6">Log Messages</div>

      <q-markup-table>
        <thead>
          <tr>
            <th class="text-left">Time</th>
            <th class="text-right">Message</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(message, idx) in this.store.messages" :key="idx">
            <td>-</td>
            <td>{{ message }}</td>
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
