<template>
  <control-wrapper v-bind="controlWrapper" :styles="styles" :is-focused="isFocused" :applied-options="appliedOptions">
    <q-input
      :id="control.id + '-input'"
      :model-value="control.data"
      filled
      type="number"
      :step="control.schema.multipleOf || 1"
      :class="styles.control.input"
      :disable="!control.enabled"
      :autofocus="appliedOptions.focus"
      :error-message="control.errors"
      :error="control.errors != ''"
      @update:model-value="onChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
    ></q-input>
  </control-wrapper>
</template>

<script lang="ts">
import { ControlElement } from '@jsonforms/core';
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
  setup(props: RendererProps<ControlElement>) {
    return useQuasarControl(useJsonFormsControl(props), (value: any) => (value === '' ? undefined : Number(value)), 300);
  },
  computed: {},
});

export default controlRenderer;
</script>
