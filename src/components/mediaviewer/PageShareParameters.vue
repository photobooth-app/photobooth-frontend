<template>
  <q-card style="min-width: 350px" class="">
    <q-form autofocus @submit="onSubmit" class="q-gutter-md" autocorrect="off" autocapitalize="off" autocomplete="off" spellcheck="false">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">How many copies?</div>
        <q-space />
        <q-btn icon="sym_o_close" flat v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-md">
        <div class="q-gutter-md">
          <div v-for="parameter in props.parameters" :key="parameter.name">
            <!-- ui_type=int        -->
            <div v-if="parameter.ui_type == 'int'">
              <div class="row">
                <q-btn icon="sym_o_remove" color="primary" flat />
                <q-input
                  filled
                  v-model="formData[parameter.name]"
                  :label="parameter.name"
                  :key="parameter.name"
                  :name="parameter.name"
                  class=""
                  :rules="[
                    (val) => (val !== null && val !== '') || 'Please type your age',
                    (val) => (val > 0 && val < 100) || 'Please type a real age',
                  ]"
                />
                <q-btn icon="sym_o_add" color="primary" flat />
              </div>
            </div>
            <!-- ui_type=input (and else) -->
            <div v-else>
              <q-input
                filled
                v-model="formData[parameter.name]"
                :label="parameter.name"
                :key="parameter.name"
                :name="parameter.name"
                class=""
                :rules="[(val) => (val && val.length > 0) || 'Please type something']"
              />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="text-primary">
        <!-- <q-btn label="cancel" v-close-popup /> -->
        <q-btn type="submit" label="GO" color="primary" v-close-popup size="xl" padding="lg" rounded />
      </q-card-actions>
    </q-form>
  </q-card>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { onBeforeMount } from 'vue'

const formData = reactive({})

import type { components } from 'src/dto/api'

const props = defineProps<{
  config_index: number
  parameters: components['schemas']['ShareProcessingParameters'][]
}>()

const emit = defineEmits<{
  triggerShareActionWithParameters: [config_index: number, input_data: object]
}>()

onBeforeMount(() => {
  // set form data to default values
  props.parameters.forEach((parameter) => (formData[parameter.name] = parameter.default))
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
