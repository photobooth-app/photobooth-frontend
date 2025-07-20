<template>
  <q-item-section>
    <q-item-label caption>{{ substats.name }} </q-item-label>
    <template v-if="substats.display == 'label'">
      <q-item-label>{{ formatValue(substats.val, substats.decimals, substats.unit) }} </q-item-label>
    </template>
    <template v-else-if="substats.display == 'checkbox'">
      <q-item-label><q-checkbox :model-value="substats.val"></q-checkbox> </q-item-label>
    </template>
    <template v-else-if="substats.display == 'toggle'">
      <q-item-label><q-toggle :model-value="substats.val"></q-toggle> </q-item-label>
    </template>
    <template v-else-if="substats.display == 'spinner'">
      <q-item-label>
        <template v-if="substats.val">
          <q-spinner color="primary" />
        </template>
        <template v-else></template>
      </q-item-label>
    </template>

    <template v-else>
      <q-item-label>{{ substats.val }} </q-item-label>
    </template>
  </q-item-section>
</template>

<script setup lang="ts">
import type { components } from '../dto/api'

defineProps<{
  substats: components['schemas']['SubStats']
}>()

const formatValue = (val: string | number | boolean, decimals: number, suffix: string) => {
  if (val === null || val === undefined) return 'N/A'
  if (typeof val === 'string') return val
  if (typeof val === 'boolean') return val

  return `${val.toFixed(decimals)}${suffix}`
}
</script>
