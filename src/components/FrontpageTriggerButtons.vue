<template>
  <div class="row q-gutter-md action-buttons">
    <div v-for="(trigger, index) in visibleTriggers" :key="index">
      <q-btn
        stack
        :color="trigger.use_custom_color ? 'custom' : 'primary'"
        no-caps
        rounded
        class="action-button col-auto glass-effect"
        :class="['action-button-' + index]"
        :style="{ '--bg-custom': trigger.use_custom_color ? trigger.custom_color : null }"
        @click="triggerButtonClick(trigger)"
      >
        <q-icon v-if="!isEmpty(trigger.icon)" :name="`sym_o_${trigger.icon}`" />
        <div style="white-space: nowrap" class="gt-sm">{{ trigger.title }}</div>
      </q-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { isEmpty } from 'lodash'
import { computed } from 'vue'
import type { TriggerSchema } from '@/types/trigger-schema'

const props = defineProps<{
  triggers: TriggerSchema[]
}>()

const visibleTriggers = computed(() => props.triggers.filter(t => t.show_button && !(isEmpty(t.title) && isEmpty(t.icon))))

const emit = defineEmits<{
  triggerAction: [trigger: TriggerSchema]
}>()

function triggerButtonClick(trigger: TriggerSchema) {
  // console.log(`trigger action ${action}, config_index ${config_index}`)
  emit('triggerAction', trigger)
}
</script>
