<template>
  <q-input v-model="model" dense outlined :label="label" :disable="disable">
    <template #prepend>
      <span class="color-input__swatch" :style="{ background: model ?? 'transparent' }" />
    </template>
    <template #append>
      <q-icon name="sym_o_colorize" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-color v-model="model" no-header-tabs format-model="hex" />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
/** Color field with picker, value is a hex color like the backend expects. */
const model = defineModel<string | null | undefined>()
defineProps<{ label?: string; disable?: boolean }>()
</script>

<style lang="scss">
.color-input__swatch {
  display: inline-block;
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.3);
}
</style>
