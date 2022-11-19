<template>
  <q-page padding>
    <!-- content -->
    Admin
    <q-card style="" class="q-pa-md">
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

export default defineComponent({
  name: "MainLayout",

  components: {},
  setup() {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      logmessagesDisplay: ref(false),
    };
  },
});
</script>
