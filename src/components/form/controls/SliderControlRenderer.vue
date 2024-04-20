<template>
  <control-wrapper v-bind="controlWrapper" :styles="styles" :is-focused="isFocused" :applied-options="appliedOptions">
    <q-slider
      :id="control.id + '-input'"
      :step="control.schema.multipleOf || 1"
      :min="control.schema.minimum"
      :max="control.schema.maximum"
      :class="styles.control.input"
      :disable="!control.enabled"
      :autofocus="appliedOptions.focus"
      label-always
      :hint="control.description"
      :error-messages="control.errors"
      :model-value="control.data"
      @update:model-value="onChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
  </control-wrapper>
</template>

<script lang="ts">
import { ControlElement } from '@jsonforms/core';
import { defineComponent } from 'vue';
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useQuasarControl } from '../util';

const controlRenderer = defineComponent({
  name: 'SliderControlRenderer',
  components: {
    ControlWrapper,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useQuasarControl(
      useJsonFormsControl(props),
      (value) => {
        return Number(value);
      },
      300,
    );
  },
});

export default controlRenderer;
</script>
