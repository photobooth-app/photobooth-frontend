<template>
  <vue-qrcode
    type="image/png"
    tag="svg"
    :margin="2"
    :width="200"
    error-correction-level="low"
    :color="{ dark: '#111111', light: '#EEEEEE' }"
    :value="url"
  />
</template>

<script setup lang="ts">
import VueQrcode from 'vue-qrcode'

defineProps<{
  url: string
}>()
</script>
