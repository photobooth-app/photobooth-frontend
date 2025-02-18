<template>
  <q-card style="width: 400px" class="">
    <q-form autofocus @submit="onSubmit" class="q-gutter-md" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">{{ parameters_dialog_caption }}</div>
        <q-space />
        <q-btn icon="sym_o_close" flat v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="q-gutter-md">
          <div v-for="parameter in props.parameters" :key="parameter.key">
            <!-- ui_type=int        -->
            <div v-if="parameter.ui_type == 'int'">
              <q-input
                filled
                v-model="formData[parameter.key]"
                :label="parameter.label"
                :key="parameter.key"
                :name="parameter.key"
                :rules="[
                  (val) => (val !== null && val !== '') || 'Please type a number', // required.
                  (val) =>
                    (parameter.valid_max && parseInt(val) <= parseInt(parameter.valid_max)) ||
                    `Please type a number lower than ${parameter.valid_max}`,
                  (val) =>
                    (parameter.valid_min && parseInt(val) >= parseInt(parameter.valid_min)) ||
                    `Please type a number more than ${parameter.valid_min}`,
                ]"
              >
                <template v-slot:before>
                  <q-btn
                    icon="sym_o_remove"
                    color="primary"
                    flat
                    @click="formData[parameter.key] = String(parseInt(formData[parameter.key]) - 1)"
                    :disable="parameter.valid_min && parseInt(formData[parameter.key]) <= parseInt(parameter.valid_min)"
                  />
                </template>
                <template v-slot:after>
                  <q-btn
                    icon="sym_o_add"
                    color="primary"
                    flat
                    @click="formData[parameter.key] = String(parseInt(formData[parameter.key]) + 1)"
                    :disable="parameter.valid_max && parseInt(formData[parameter.key]) >= parseInt(parameter.valid_max)"
                  />
                </template>
              </q-input>
            </div>
            <!-- ui_type=input (and else) -->
            <div v-else>
              <q-input
                filled
                v-model="formData[parameter.key]"
                :label="parameter.label"
                :key="parameter.key"
                :name="parameter.key"
                class=""
                :rules="[
                  (val) => (val && val.length > 0) || 'Please type something',
                  (val) =>
                    (parameter.valid_max && val.length <= parseInt(parameter.valid_max)) || `Please type text longest ${parameter.valid_max} chars.`,
                  (val) =>
                    (parameter.valid_min && val.length >= parseInt(parameter.valid_min)) || `Please type text shortest ${parameter.valid_min} chars.`,
                ]"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn stack no-caps color="primary" class="q-ma-sm" type="submit" v-close-popup size="md" padding="md lg">
          <q-icon v-if="!isEmpty(parameters_dialog_action_icon)" :name="`sym_o_${parameters_dialog_action_icon}`" />
          <div>{{ parameters_dialog_action_label }}</div>
        </q-btn>
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { onBeforeMount } from 'vue'
import { isEmpty } from 'lodash'
const formData = reactive({})

import type { components } from 'src/dto/api'

const props = defineProps<{
  config_index: number
  parameters_dialog_caption: string
  parameters_dialog_action_icon: string
  parameters_dialog_action_label: string
  parameters: components['schemas']['ShareProcessingParameters'][]
}>()

const emit = defineEmits<{
  triggerShareActionWithParameters: [config_index: number, input_data: object]
}>()

onBeforeMount(() => {
  // set form data to default values
  props.parameters.forEach((parameter) => (formData[parameter.key] = parameter.default))
})

const onSubmit = () => {
  // alternative to get form data from event:
  // const form = new FormData(evt.target as HTMLFormElement)
  // const formData = Object.fromEntries(form)
  // console.error(formData)

  emit('triggerShareActionWithParameters', props.config_index, formData)
}
</script>

<style lang="sass" scoped></style>
