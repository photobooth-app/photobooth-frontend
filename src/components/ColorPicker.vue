<template>
  <q-input :model-value="modelValue" :rules="['anyColor']" @update:model-value="onInput">
    <template #append>
      <q-icon name="colorize" class="cursor-pointer">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <q-color :model-value="modelValue" @update:model-value="onInput"></q-color>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup>
// const props = defineProps(['model-value']);
const emit = defineEmits(['update:model-value']);

function onInput(e) {
  emit('update:model-value', e);
}
</script>
