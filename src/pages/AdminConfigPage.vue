<template>
  <q-page id="config-page">
    <json-forms
      v-if="!isLoadingState"
      :data="configurationStore.configuration"
      :ajv="ajv"
      :renderers="renderers"
      :schema="schema"
      :uischema="cuischema"
      @change="onChange"
    />

    <div v-else class="q-pa-md flex flex-center">
      <div>
        <q-spinner-gears size="xl" color="primary" />
      </div>
    </div>

    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <div class="q-gutter-sm">
        <!-- linter error, see open issue: https://github.com/intlify/vue-i18n-next/issues/1403-->
        <q-btn :label="$t('BTN_LABEL_RESET_CONFIG')" @click="confirm_reset_config = true" />
        <q-btn :label="$t('BTN_LABEL_RESTORE_CONFIG')" @click="configurationStore.getConfig('current')" />
        <q-btn color="primary" :label="$t('BTN_LABEL_PERSIST_CONFIG')" @click="configurationStore.saveConfig()" />
      </div>
    </q-page-sticky>

    <q-dialog v-model="confirm_reset_config">
      <q-card class="q-pa-sm" style="min-width: 350px">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_delete" color="negative" text-color="white" />
          <span class="q-ml-sm">{{ $t('Are you sure you want to reset the configuration and delete config.json?') }}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" color="primary" />
          <q-btn v-close-popup :label="$t('yes, delete')" color="negative" @click="remoteProcedureCall('/api/admin/config/reset')" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>
<script setup lang="ts">
import { ref, provide } from 'vue'
import { JsonForms, type JsonFormsChangeEvent } from '@jsonforms/vue'
import { generateDefaultUISchema } from '@jsonforms/core'
import { defaultStyles, mergeStyles, createAjv, quasarRenderers } from '../components/form'
import { remoteProcedureCall, _fetch } from '../util/fetch_api'
import { useConfigurationStore } from '../stores/configuration-store'
import { Notify } from 'quasar'

const configurationStore = useConfigurationStore()
const myStyles = mergeStyles(defaultStyles, { control: { label: 'q-label' } })
const renderers = Object.freeze([...quasarRenderers])
const isLoadingState = ref(true)
const schema = ref({})
const cuischema = ref(generateDefaultUISchema({}))
const confirm_reset_config = ref(false)
const ajv = createAjv({ multipleOfPrecision: 2 }) // https://github.com/eclipsesource/jsonforms/issues/1832#issuecomment-966209856
// init with defaults not working properly yet on array lists. revisit later # useDefaults: 'empty' https://ajv.js.org/options.html#usedefaults

provide('styles', myStyles)

const getSchema = async () => {
  try {
    const response = await _fetch('/api/admin/config/schema?schema_type=dereferenced')
    console.log(response)
    if (!response.ok) {
      throw new Error('Server returned ' + response.status)
    }
    return await response.json()
  } catch (err: unknown) {
    console.warn(err)

    Notify.create({
      message: String(err),
      caption: 'Error getting configuration scheme',
      color: 'negative',
    })
  } finally {
    // commit('setLoading', false);
  }
}
const updateFormSchema = async () => {
  //loadscreen on
  isLoadingState.value = true

  schema.value = await getSchema()
  cuischema.value = generateDefaultUISchema(schema.value, 'TopLevelNavigation')

  await configurationStore.getConfig('currentActive') //reload because store could have all data but with usercontext so secrets hidden

  //loadscreen off
  console.log('disable loadscreen')
  isLoadingState.value = false
}

const onChange = (event: JsonFormsChangeEvent) => {
  configurationStore.configuration = event.data
}

updateFormSchema()
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
