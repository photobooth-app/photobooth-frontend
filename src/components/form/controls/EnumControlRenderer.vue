<template>
  <control-wrapper v-bind="controlWrapper" :styles="styles" :is-focused="isFocused" :applied-options="appliedOptions">
    <q-select
      :id="control.id + '-input'"
      :model-value="control.data"
      :class="styles.control.select"
      :disable="!control.enabled"
      :options="control.options"
      :error-message="control.errors"
      :error="control.errors != ''"
      @update:model-value="onChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
    >
    </q-select>
  </control-wrapper>
</template>

<script lang="ts">
import { ControlElement } from '@jsonforms/core';
import { defineComponent } from 'vue';
import { rendererProps, useJsonFormsEnumControl, RendererProps } from '@jsonforms/vue';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useQuasarControl } from '../util';

const controlRenderer = defineComponent({
  name: 'EnumControlRenderer',
  components: {
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useQuasarControl(useJsonFormsEnumControl(props), (target) => target.value);
  },
});

export default controlRenderer;
</script>
