<template>
  <q-card flat class="q-mr-md q-mb-md">
    <q-card-section>
      <q-list>
        <q-item-label header>{{ stats.name }} {{ $t('(Plugin)') }}</q-item-label>

        <div class="q-gutter-y-sm">
          <template v-for="(stat, index) in stats.stats" :key="index">
            <!-- SubStats -->
            <q-item flat bordered v-if="isSubStats(stat)">
              <DashboardGenericItemSection :substats="stat"></DashboardGenericItemSection>
            </q-item>

            <!-- SubList -->
            <div v-else>
              <q-item>
                <q-item-section>
                  <q-item-label caption>{{ stat.name }} </q-item-label>
                  <div class="row">
                    <q-item v-for="(sub, i) in stat.val" :key="i">
                      <DashboardGenericItemSection :substats="sub"></DashboardGenericItemSection>
                    </q-item>
                  </div>
                </q-item-section>
              </q-item>
            </div>
          </template>
        </div>

        <q-separator v-if="stats.actions && stats.actions.length" />

        <q-card-actions v-if="stats.actions && stats.actions.length" align="right">
          <div v-for="(action, index) in stats.actions" :key="index">
            <q-btn no-caps flat color="green" :label="action" @click="actionButtonClick(action)" />
          </div>
        </q-card-actions>
      </q-list>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { components } from '../dto/api'
import DashboardGenericItemSection from './DashboardGenericItemSection.vue'

type SubStats = components['schemas']['SubStats']
type SubList = components['schemas']['SubList']
type StatEntry = SubStats | SubList

defineProps<{
  stats: components['schemas']['GenericStats']
}>()

const emit = defineEmits<{
  triggerAction: [action: string]
}>()

function actionButtonClick(action: string) {
  console.log(`trigger action  ${action}`)
  emit('triggerAction', action)
}
const isSubStats = (stat: StatEntry): stat is SubStats => {
  return !Array.isArray(stat.val)
}
</script>
