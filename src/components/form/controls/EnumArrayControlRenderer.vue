<template>
  <control-wrapper v-bind="controlWrapper" :styles="styles" :is-focused="isFocused" :applied-options="appliedOptions">
    <q-select
      :model-value="control.data"
      :id="control.id + '-input'"
      :class="styles.control.select"
      :disable="!control.enabled"
      :options="control.options"
      :error-message="control.errors"
      :error="control.errors != ''"
      multiple
      use-chips
      @add="(details) => addSelected(details.value)"
      @remove="(details) => removeSelected(details.value)"
    >
    </q-select>
  </control-wrapper>
</template>

<script lang="ts">
import { ControlElement } from '@jsonforms/core';
import { defineComponent } from 'vue';
import { rendererProps, useJsonFormsMultiEnumControl, RendererProps } from '@jsonforms/vue';
import { useQuasarBasicControl } from '../util';
import { default as ControlWrapper } from './ControlWrapper.vue';

const controlRenderer = defineComponent({
  name: 'EnumArrayControlRenderer',
  components: { ControlWrapper },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useQuasarBasicControl(useJsonFormsMultiEnumControl(props));
  },
  methods: {
    addSelected(value: any) {
      this.addItem(this.control.path, value.value);
    },
    removeSelected(value: any) {
      this.removeItem?.(this.control.path, value.value);
    },
  },
});

export default controlRenderer;
</script>
