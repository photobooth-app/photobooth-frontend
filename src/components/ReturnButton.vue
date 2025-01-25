<template>
  <!-- show back button on all pages except / -->
  <q-page-sticky position="top-left" class="q-ma-lg">
    <q-btn id="layout-button-back" color="primary" rounded no-caps @click="emit('triggerReturn')" class="action-button glass-effect">
      <q-icon left :name="icon" />
      <div>{{ t('BTN_LABEL_BACK') }}</div>
    </q-btn>
  </q-page-sticky>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n'
</script>

<script setup lang="ts">
const { t } = useI18n()

const { icon = 'sym_o_arrow_back_ios_new' } = defineProps<{
  icon?: string
}>()

const emit = defineEmits<{
  triggerReturn: []
}>()
</script>

<style lang="scss"></style>
