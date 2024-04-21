<template>
  <div v-if="!isLoadingState">
    <json-forms :data="serverConfig" :ajv="ajv" :renderers="renderers" :schema="schema" :uischema="cuischema" @change="onChange" />
  </div>
  <div v-else class="q-pa-md flex flex-center">
    <div>
      <q-spinner-gears size="xl" color="primary" />
    </div>
  </div>

  <q-page-sticky position="bottom-right" :offset="[18, 18]">
    <div class="q-gutter-sm">
      <!-- linter error, see open issue: https://github.com/intlify/vue-i18n-next/issues/1403-->
      <q-btn :label="$t('BTN_LABEL_RESET_CONFIG')" @click="remoteProcedureCall('/api/admin/config/reset')" />
      <q-btn :label="$t('BTN_LABEL_RESTORE_CONFIG')" @click="getConfig('current')" />
      <q-btn color="primary" :label="$t('BTN_LABEL_PERSIST_CONFIG')" @click="uploadConfigAndPersist()" />
    </div>
  </q-page-sticky>
</template>
<script lang="ts">
import { ref, computed } from 'vue';
import { useMainStore } from '../stores/main-store.js';
import { JsonForms, JsonFormsChangeEvent } from '@jsonforms/vue';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { generateDefaultUISchema } from '@jsonforms/core';
import { defaultStyles, mergeStyles, createAjv, quasarRenderers } from '../components/form';
import { remoteProcedureCall } from '../util/fetch_api.js';
import { useUiSettingsStore } from 'stores/ui-settings-store.js';
import { Notify } from 'quasar';
// import { useI18n } from 'vue-i18n';
// const { t } = useI18n();

const uiSettingsStore = useUiSettingsStore();
const serverConfig = ref({});
const myStyles = mergeStyles(defaultStyles, { control: { label: 'q-label' } });
const renderers = [...quasarRenderers];
const isLoadingState = ref(true);
const schema = ref({});

const updateFormSchema = async () => {
  //loadscreen on
  isLoadingState.value = true;

  // console.log(1);
  await getSchema();
  // console.log(2);
  await getConfig('currentActive');
  // console.log(3);

  //loadscreen off
  console.log('disable loadscreen');
  isLoadingState.value = false;
};

const getSchema = async () => {
  try {
    const response = await fetch('/api/admin/config/schema?schema_type=dereferenced');
    console.log(response);

    schema.value = await response.json();
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
const uploadConfigAndPersist = async () => {
  console.log('sync config to server');
  console.log(serverConfig.value);

  try {
    let response = await fetch('/api/admin/config/current', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serverConfig.value),
    });

    if (response.ok) {
      // if HTTP-status is 200-299
      // reload ui settings into store as on app startup.
      uiSettingsStore.initStore(true);
      Notify.create({
        // TODO: How to access the translated strings here??
        // message: $t("MSG_CONFIG_PERSIST_OK"),
        message: 'Config persisted and reloaded from server. If changed hardware settings, pls reload/restart services!',
        color: 'positive',
      });
    } else {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      type ResponseErrorData = {
        detail: Array<{
          loc: Array<string>;
          msg: string;
        }>;
      };
      // https://kentcdodds.com/blog/using-fetch-with-type-script
      let json: ResponseErrorData = await response.json();

      let notify_msg = 'check following fields:<br/>';
      Object.values(json.detail).forEach((detail) => {
        notify_msg += detail['loc'].join(' -> ');
        notify_msg += `: ${detail['msg']}`;
        notify_msg += '<br/>';
      });

      Notify.create({
        caption: 'configuration validation error',
        icon: 'error',
        html: true,
        message: `${notify_msg}`,
        color: 'negative',
      });
      return;
    }
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
    Notify.create({
      message: 'error saving config, check browser console and logs',
      color: 'negative',
    });
  }
};

const cuischema = computed(() => {
  return !isLoadingState.value ? generateDefaultUISchema(schema.value, 'TopLevelNavigation') : undefined;
});
export default {
  components: {
    JsonForms,
  },
  provide() {
    return {
      styles: myStyles,
    };
  },
  setup() {
    const store = useMainStore();
    const ajv = createAjv({ multipleOfPrecision: 2 }); // https://github.com/eclipsesource/jsonforms/issues/1832#issuecomment-966209856

    updateFormSchema();

    return {
      store,
      ajv,
      remoteProcedureCall,
      uploadConfigAndPersist,
      getConfig,
      updateFormSchema,
    };
  },
  data() {
    // non-reactive ajv

    // reactive data below
    return {
      // freeze renderers for performance gains
      renderers: Object.freeze(renderers),
      schema,
      cuischema,

      serverConfig,
      isLoadingState,
    };
  },
  // name: 'PageName',
  computed: {
    // a computed getter
  },
  methods: {
    onChange(event: JsonFormsChangeEvent) {
      this.serverConfig = event.data;
    },
  },
};
</script>
<style lang="scss">
.control-wrapper {
  margin-bottom: 10px;
}

.control-wrapper .control-description-wrapper,
.array-list-description {
  color: $grey;
}
</style>
