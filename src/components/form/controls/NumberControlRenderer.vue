<template>
  <control-wrapper v-bind="controlWrapper" :styles="styles" :is-focused="isFocused" :applied-options="appliedOptions">
    <q-input
      :model-value="control.data"
      filled
      type="number"
      :step="step"
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disable="!control.enabled"
      :autofocus="appliedOptions.focus"
      @update:model-value="onChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
      :error-message="control.errors"
      :error="control.errors != ''"
    ></q-input>
  </control-wrapper>
</template>

<script lang="ts">
import { ControlElement, JsonFormsRendererRegistryEntry, rankWith, isNumberControl, or, isIntegerControl } from '@jsonforms/core';
import { defineComponent } from 'vue';
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useQuasarControl } from '../util';

const controlRenderer = defineComponent({
  name: 'NumberControlRenderer',
  components: { ControlWrapper },
  props: {
    ...rendererProps<ControlElement>(),
  },
  computed: {
    step(): number {
      const options: any = this.appliedOptions;
      return options.step ?? 1; // TODO: how to forward steps here? not working currently!
    },
  },
  setup(props: RendererProps<ControlElement>) {
    return useQuasarControl(useJsonFormsControl(props), (value: any) => (value === '' ? undefined : Number(value)), 300);
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(1.1, or(isNumberControl, isIntegerControl)),
};
</script>
