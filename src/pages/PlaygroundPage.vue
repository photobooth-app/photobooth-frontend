<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-btn color="purple" @click="showNotif" label="Show Notification" />
    </div>

    <q-card>
      <div class="text-h6">Personalize</div>
      Frontpage-Text - Füge Smilies ein (Windows-Taste + .)
      <div class="q-pa-md q-gutter-sm">
        <q-editor
          v-model="text"
          flat
          min-height="25rem"
          content-class="bg-amber-3"
          toolbar-bg="primary"
          :toolbar="[
            [
              'left',
              'center',
              'right',
              'justify',
              'bold',
              'italic',
              'underline',
              'strike',
              'undo',
              'redo',
            ],
            [
              {
                label: $q.lang.editor.formatting,
                icon: $q.iconSet.editor.formatting,
                list: 'no-icons',
                options: ['p', 'h3', 'h4', 'h5', 'h6', 'code'],
              },
            ],
          ]"
        />
      </div>
    </q-card>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useMainStore } from "../stores/main-store.js";

export default {
  // name: 'PageName',
  computed: {
    // a computed getter
  },
  setup() {
    const $q = useQuasar();
    const store = useMainStore();

    return {
      store,

      text: ref(""),

      showNotif() {
        $q.notify({
          message: "Jim pinged you.",
          color: "purple",
        });
      },
    };
  },
};
</script>
