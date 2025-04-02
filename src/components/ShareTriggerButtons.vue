<template>
  <div v-for="(trigger, index) in triggers" :key="index">
    <q-btn
      v-if="trigger.show_button && !(isEmpty(trigger.title) && isEmpty(trigger.icon))"
      stack
      rounded
      no-caps
      color="primary"
      :disabled="getShareAvailable(trigger.handles_images_only)"
      class="q-mr-sm action-button action-button-share col-auto glass-effect"
      :class="['share-button-' + index]"
      @click="triggerButtonClick(trigger.config_index)"
    >
      <q-icon v-if="!isEmpty(trigger.icon)" :name="`sym_o_${trigger.icon}`" />
      <div>{{ trigger.title }}</div>
    </q-btn>
  </div>
</template>

<script setup lang="ts">
import { isEmpty } from 'lodash'

const props = defineProps<{
  triggers: ShareSchema[]
  directAccessNumberOfButtons: number
  currentItemIsImage: boolean
}>()

export interface ShareSchema {
  show_button: boolean
  title: string
  icon?: string // icon is optional
  handles_images_only: boolean
  config_index: number
}

function getShareAvailable(handles_images_only: boolean) {
  return !props.currentItemIsImage && handles_images_only
}

const emit = defineEmits<{
  triggerAction: [config_index: number]
}>()

function triggerButtonClick(config_index: number) {
  console.log(`trigger share config_index ${config_index}`)
  emit('triggerAction', config_index)
}
</script>
