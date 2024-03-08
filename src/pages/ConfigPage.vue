<!-- eslint-disable -->
<template>
  <json-forms
    v-if="!isLoadingState"
    :data="serverConfig"
    :ajv="ajv"
    :renderers="renderers"
    :schema="cschema"
    :uischema="cuischema"
    @change="onChange"
  />
  <div v-else class="q-pa-md flex flex-center">
    <div>
      <div>Please wait while loading config...</div>
      <q-spinner-gears size="xl" color="primary" />
    </div>
  </div>

  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <div class="q-gutter-sm">
      <!-- linter error, see open issue: https://github.com/intlify/vue-i18n-next/issues/1403-->
      <q-btn :label="$t('BTN_LABEL_RESET_CONFIG')" @click="remoteProcedureCall('/admin/config/reset')" />
      <q-btn :label="$t('BTN_LABEL_RESTORE_CONFIG')" @click="getConfig('current')" />
      <q-btn color="primary" :label="$t('BTN_LABEL_PERSIST_CONFIG')" @click="uploadConfigAndPersist()" />
    </div>
  </q-page-sticky>
</template>
<style lang="scss">
.control-wrapper {
  margin-bottom: 10px;
}

.control-wrapper .control-description-wrapper,
.array-list-description {
  color: $grey;
}
</style>
<script lang="ts">
import { ref, computed } from 'vue';
import { api } from 'boot/axios';
import { useMainStore } from '../stores/main-store.js';
import { JsonForms, JsonFormsChangeEvent } from '@jsonforms/vue';
import { vanillaRenderers } from '@jsonforms/vue-vanilla';
import { generateDefaultUISchema } from '@jsonforms/core';
import { defaultStyles, mergeStyles, createAjv, quasarRenderers } from '../components/form';
import { remoteProcedureCall } from 'boot/axios';

import { useUiSettingsStore } from 'stores/ui-settings-store.js';
import { Notify } from 'quasar';

const uiSettingsStore = useUiSettingsStore();
const serverConfig = ref({});
const myStyles = mergeStyles(defaultStyles, { control: { label: 'q-label' } });
const renderers = [...quasarRenderers];
const isLoadingState = ref(true);
let schema = null;

const updateFormSchema = async () => {
  //loadscreen on
  isLoadingState.value = true;

  console.log(1);
  await getSchema();
  console.log(2);
  await getConfig('currentActive');
  console.log(3);

  //loadscreen off
  console.log('disable loadscreen');
  isLoadingState.value = false;
};

const getSchema = async () => {
  try {
    const response = await fetch('/api/admin/config/schema?schema_type=dereferenced');
    console.log(response);

    schema = await response.json();
    console.log('updated schema!');
  } catch (error) {
    console.warn(error);

    Notify.create({
      message: 'error getting scheme! check logs',
      color: 'red',
    });
  } finally {
    // commit('setLoading', false);
  }
};

const getConfig = async (which = 'current') => {
  try {
    const response = await fetch(`/api/admin/config/${which}`);
    console.log(response);

    serverConfig.value = await response.json();
  } catch (error) {
    console.warn(error);

    Notify.create({
      message: 'error getting config!',
      color: 'red',
    });
  } finally {
    // commit('setLoading', false);
  }
};

// actions
const uploadConfigAndPersist = () => {
  console.log('sync config to server');
  console.log(serverConfig.value);

  api
    .post('/admin/config/current', serverConfig.value)
    .then((response) => {
      // reload ui settings into store as on app startup.
      uiSettingsStore.initStore(true);

      Notify.create({
        // TODO: How to access the translated strings here??
        // message: $t("MSG_CONFIG_PERSIST_OK"),
        message: 'Config persisted and reloaded from server. If changed hardware settings, pls reload/restart services!',
        color: 'green',
      });
    })
    .catch((error) => {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        let notify_msg = 'check following fields:<br/>';
        Object.values(error.response.data.detail).forEach((detail) => {
          notify_msg += detail['loc'].join(' -> ');
          notify_msg += `: ${detail['msg']}`;
          notify_msg += '<br/>';
        });

        Notify.create({
          caption: 'validation error',
          icon: 'error',
          html: true,
          message: `${notify_msg}`,
          color: 'red',
        });
        return;
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error(error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error', error.message);
      }
      Notify.create({
        message: 'error saving config, check browser console and logs',
        color: 'red',
      });
    });
};

const cschema = computed(() => {
  return !isLoadingState.value ? schema : null;
});

const cuischema = computed(() => {
  return !isLoadingState.value ? generateDefaultUISchema(schema, 'TopLevelNavigation') : null;
});
export default {
  // name: 'PageName',
  computed: {
    // a computed getter
  },
  components: {
    JsonForms,
  },
  data() {
    // non-reactive ajv
    this.ajv = createAjv(); // https://github.com/eclipsesource/jsonforms/issues/1832#issuecomment-966209856
    // reactive data below
    return {
      // freeze renderers for performance gains
      renderers: Object.freeze(renderers),
      cschema,
      cuischema,

      serverConfig,
      isLoadingState,
    };
  },
  methods: {
    onChange(event: JsonFormsChangeEvent) {
      this.serverConfig = event.data;
    },
  },
  provide() {
    return {
      styles: myStyles,
    };
  },
  setup() {
    const store = useMainStore();

    updateFormSchema();

    return {
      store,
      uploadConfigAndPersist,
      remoteProcedureCall,
      getConfig,
    };
  },
};
</script>
