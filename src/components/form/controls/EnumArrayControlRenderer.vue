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
      multiple
      use-chips
      emit-value
      @add="(details) => addSelected(details)"
      @remove="(details) => removeSelected(details)"
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
