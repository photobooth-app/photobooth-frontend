<template>
  <transition v-if="urls?.length > 0" appear enter-active-class="animated fadeIn">
    <q-card class="pb-card-qrcode no-shadow" style="width: 200px">
      <q-card-section v-if="textAbove" class="pb-qrcode-text-above q-pa-sm"> {{ textAbove }} </q-card-section>
      <q-card-section class="pb-qrcode-code q-pa-none q-px-sm" v-for="(url, index) in props.urls" v-bind:key="index">
        <div v-if="linkQrCodes">
          <a :href="url" target="_blank">
            <qrcode-vue :value="url" :size="200" level="L" render-as="svg" style="width: 100%" />
          </a>
        </div>
        <div v-else>
          <qrcode-vue :value="url" :size="200" level="L" render-as="svg" style="width: 100%" />
        </div>
      </q-card-section>
      <q-card-section v-if="textBelow" class="pb-qrcode-text-below q-pa-sm"> {{ textBelow }} </q-card-section>
    </q-card>
  </transition>
</template>

<script setup lang="ts">
import QrcodeVue from 'qrcode.vue'

interface Props {
  urls: string[]
  textAbove?: string
  textBelow?: string
  linkQrCodes?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  linkQrCodes: () => false,
})
</script>

<style lang="sass" scoped>
.pb-qrcode-text-above
  font-weight: bold
.pb-qrcode-text-above, .pb-qrcode-text-below
  text-align: center
</style>
