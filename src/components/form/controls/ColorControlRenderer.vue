<template>
  <control-wrapper v-bind="controlWrapper" :styles="styles" :is-focused="isFocused" :applied-options="appliedOptions">
    <q-color
      :id="control.id + '-input'"
      :model-value="standardized_color"
      no-header-tabs
      no-footer
      :rules="['anyColor']"
      :class="styles.control.input"
      :disable="!control.enabled"
      :autofocus="appliedOptions.focus"
      :error-message="control.errors"
      :error="control.errors != ''"
      @update:model-value="onChange"
      @focus="isFocused = true"
      @blur="isFocused = false"
    ></q-color>
  </control-wrapper>
</template>

<script lang="ts">
import { ControlElement } from '@jsonforms/core';
import { defineComponent } from 'vue';
import { rendererProps, useJsonFormsControl, RendererProps } from '@jsonforms/vue';
import { default as ControlWrapper } from './ControlWrapper.vue';
import { useQuasarControl } from '../util';

const controlRenderer = defineComponent({
  name: 'ColorControlRenderer',
  components: { ControlWrapper },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useQuasarControl(useJsonFormsControl(props), (value: string) => value || undefined, 300);
  },
  computed: {
    standardized_color(): string {
      const ctx: CanvasRenderingContext2D = document.createElement('canvas').getContext('2d')!;
      ctx.fillStyle = this.control.data;
      return ctx.fillStyle.toString();
    },
  },
  methods: {},
});

export default controlRenderer;
</script>
