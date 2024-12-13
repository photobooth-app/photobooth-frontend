<template>
  <q-card class="pb-card-qrcode no-shadow" style="width: 200px">
    <q-card-section v-if="textAbove" class="pb-qrcode-text-above q-pa-sm"> {{ textAbove }} </q-card-section>
    <q-card-section class="pb-qrcode-code q-pa-none q-px-sm">
      <img :src="qrcode" style="width: 100%" />
    </q-card-section>
    <q-card-section v-if="textBelow" class="pb-qrcode-text-below q-pa-sm"> {{ textBelow }} </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useQRCode } from '@vueuse/integrations/useQRCode'
import { toRef } from 'vue'

const props = defineProps<{
  url: string
  textAbove?: string
  textBelow?: string
}>()

const qrUrl = toRef(props, 'url')
const qrcode = useQRCode(qrUrl, {
  errorCorrectionLevel: 'L',
  margin: 1,
  width: 200,
})
</script>

<style lang="sass" scoped>
.pb-qrcode-text-above
  font-weight: bold
.pb-qrcode-text-above, .pb-qrcode-text-below
  text-align: center
</style>
