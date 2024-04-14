<template>
  <q-page padding>
    <q-card>
      <!-- progress bar to show waiting to load filter, ... -->
      <q-card-section class="">
        <div class="row">
          <div class="text-h5">{{ $t('TITLE_UTILITIES') }}</div>
          <q-spinner v-if="isLoading"></q-spinner>
        </div>

        <div class="q-ma-sm">
          <div class="q-gutter-sm">
            <q-btn label="gphoto2 list avail config" @click="remoteUtilCall('/gphoto2config')" />
            <q-btn :label="'BTN_LABEL_GPHOTO2_LIST_AVAILABLE_CONFIG'" @click="remoteUtilCall('/gphoto2config')" />
            <q-btn :label="'BTN_LABEL_GPHOTO2_LIST_AVAILABLE_CONFIG'" @click="remoteUtilCall('/gphoto2config')" />
            <q-btn :label="'BTN_LABEL_GPHOTO2_LIST_AVAILABLE_CONFIG'" />
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section id="response" class="" v-if="showResponse">
        <div class="text-h6">Response</div>
        <div id="response_status" v-if="response_status">Status: {{ response_status }}</div>
        <div id="response_text">Text: <br />{{ response_text }}</div>
        <div id="response_text2">
          <pre>Text2: <br />{{ JSON.stringify(response_text, null, 2) }}</pre>
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { defineComponent, ref } from 'vue';
import { useMainStore } from '../stores/main-store.js';

export default defineComponent({
  name: 'MainLayout',
  components: {},
  computed: {
    showResponse() {
      return this.response_text != '' || this.response_status != '';
    },
  },
  setup() {
    const store = useMainStore();
    const isLoading = ref(false);
    const response_status = ref('');
    const response_text = ref('');

    async function remoteUtilCall(endpoint = '') {
      isLoading.value = true;

      try {
        let response = await fetch(`/api/admin/utils/${endpoint}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        if (response.ok) {
          let json = await response.json();
          // if HTTP-status is 200-299
          // get the response body (the method explained below)
          console.log(json);
          response_status.value = json.status;
          response_text.value = json.output;
        } else {
          console.error(response);
          $q.notify({
            message: `Error ${response.status}. Please check logs.`,
            caption: 'Server Error!',
            type: 'negative',
          });
        }
      } catch {
        $q.notify({
          message: 'Please check logs and connectivity.',
          caption: 'Request Error!',
          type: 'negative',
        });
      }

      isLoading.value = false;
    }

    return {
      // you can return the whole store instance to use it in the template
      store,
      remoteUtilCall,
      isLoading,
      response_status,
      response_text,
    };
  },
});
</script>
