<template>
  <div class="row q-gutter-md action-buttons">
    <div v-for="(trigger, index) in triggers" :key="index">
      <q-btn
        v-if="trigger.show_button && !(isEmpty(trigger.title) && isEmpty(trigger.icon))"
        stack
        color="primary"
        no-caps
        rounded
        class="action-button col-auto"
        :class="['action-button-' + index]"
        @click="triggerButtonClick(trigger.action, trigger.config_index)"
      >
        <q-icon v-if="!isEmpty(trigger.icon)" :name="trigger.icon" />
        <div style="white-space: nowrap" class="gt-sm">{{ trigger.title }}</div>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isEmpty } from 'lodash';

defineProps<{
  triggers: Array<TriggerSchema>;
}>();

export interface TriggerSchema {
  show_button: boolean;
  title: string;
  icon?: string; // icon is optional
  action: string;
  config_index: number;
}

const emit = defineEmits<{
  triggerAction: [action: string, config_index: number];
}>();

function triggerButtonClick(action: string, config_index: number) {
  // console.log(`trigger action ${action}, config_index ${config_index}`);
  emit('triggerAction', action, config_index);
}
</script>
