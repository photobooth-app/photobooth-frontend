<template>
  <q-page-sticky position="bottom-right" class="q-ma-lg">
    DEBUG INFO <br />
    {{ props.parameters }}
  </q-page-sticky>
  <q-card style="min-width: 350px">
    <q-card-section>
      <div class="text-h6">How many copies?</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-form>
        <div v-for="parameter in props.parameters" :key="parameter.name">
          <!-- ui_type=int        -->
          <div v-if="parameter.ui_type == 'int'">
            <div class="row">
              <q-btn label="-" />
              <q-input filled v-model="parameter.default" :label="parameter.name" :key="parameter.name" :name="parameter.name" class="" />
              <q-btn label="+" />
            </div>
          </div>
          <!-- ui_type=input (and else) -->
          <div v-else>
            <q-input filled v-model="parameter.default" :label="parameter.name" :key="parameter.name" :name="parameter.name" class="" />
          </div>
        </div>
      </q-form>
      <br />
    </q-card-section>

    <q-card-actions align="right" class="text-primary">
      <q-btn label="cancel" v-close-popup />
      <q-btn label="GO" color="primary" @click="invokeShareActionWithParameters()" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
// import { toRef } from 'vue'
// import { ref } from 'vue'

import type { components } from 'src/dto/api'

const props = defineProps<{
  parameters: components['schemas']['ShareProcessingParameters'][]
}>()

const emit = defineEmits<{
  triggerShareActionWithParameters: [config_index: number, parameters: unknown]
}>()

function invokeShareActionWithParameters(testParameter: number) {
  console.warn('trigger share', testParameter)
  emit('triggerShareActionWithParameters', testParameter, props.parameters.value)
}

// const qrUrl = toRef(props, 'url')
</script>

<style lang="sass" scoped></style>
