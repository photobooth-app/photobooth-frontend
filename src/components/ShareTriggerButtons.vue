<template>
  <q-btn-group rounded>
    <div v-for="(trigger, index) in triggers.slice(0, directAccessNumberOfButtons)" :key="index">
      <q-btn
        v-if="trigger.show_button && !(isEmpty(trigger.title) && isEmpty(trigger.icon))"
        flat
        rounded
        :disabled="getShareAvailable(trigger.handles_images_only)"
        class="share-button"
        :class="['share-button-' + index]"
        @click="triggerButtonClick(trigger.config_index)"
      >
        <q-icon v-if="!isEmpty(trigger.icon)" class="q-mr-sm" :name="`sym_o_${trigger.icon}`" />
        <div>{{ trigger.title }}</div>
      </q-btn>
    </div>

    <q-btn-dropdown v-if="triggers.length > directAccessNumberOfButtons" auto-close rounded color="primary" label="more">
      <div v-for="(trigger, index) in triggers.slice(directAccessNumberOfButtons)" :key="index" padding style="width: 250px">
        <q-btn
          v-if="trigger.show_button && !(isEmpty(trigger.title) && isEmpty(trigger.icon))"
          flat
          :disabled="getShareAvailable(trigger.handles_images_only)"
          class="share-button full-width"
          :class="['share-button-' + index]"
          @click="triggerButtonClick(trigger.config_index)"
        >
          <q-icon v-if="!isEmpty(trigger.icon)" class="q-mr-sm" :name="`sym_o_${trigger.icon}`" />
          <div>{{ trigger.title }}</div>
        </q-btn>
      </div>
    </q-btn-dropdown>
  </q-btn-group>
</template>

<script setup lang="ts">
import { isEmpty } from 'lodash';

const props = defineProps<{
  triggers: Array<ShareSchema>;
  directAccessNumberOfButtons: number;
  currentItemIsImage: boolean;
}>();

export interface ShareSchema {
  show_button: boolean;
  title: string;
  icon?: string; // icon is optional
  handles_images_only: boolean;
  config_index: number;
}

function getShareAvailable(handles_images_only: boolean) {
  console.log(props.currentItemIsImage, handles_images_only);
  return !props.currentItemIsImage && handles_images_only;
}

const emit = defineEmits<{
  triggerAction: [config_index: number];
}>();

function triggerButtonClick(config_index: number) {
  console.log(`trigger share config_index ${config_index}`);
  emit('triggerAction', config_index);
}
</script>
