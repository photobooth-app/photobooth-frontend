<template>
  <div v-if="availableFilter.length > 0">
    <div class="text-center text-overline">{{ $t('Choose your filter') }}</div>
    <q-card v-for="filter in availableFilter" :key="filter" bordered class="q-mb-sm no-shadow">
      <q-card-section class="q-pa-none">
        <q-img class="rounded-borders" loading="lazy" :src="`/api/filter/${id}?filter=${filter}`" @click="applyFilterClick(filter)">
          <div class="absolute-bottom-right text-subtitle1 text-center" style="padding: 4px; pointer-events: none">
            {{ filter }}
          </div>
        </q-img>
      </q-card-section>
    </q-card>
  </div>
  <div v-else class="text-center">
    <q-icon name="sym_o_mood_bad" size="xl"></q-icon>
    <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
    <p>No filter available.</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  id: string
  availableFilter: string[]
}>()

const emit = defineEmits<{
  triggerApplyFilter: [id: string, filter: string]
}>()

function applyFilterClick(filter: string) {
  // console.log(`trigger action ${action}, config_index ${config_index}`);
  emit('triggerApplyFilter', props.id, filter)
}
</script>
