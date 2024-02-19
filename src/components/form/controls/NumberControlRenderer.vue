<template>
  <control-wrapper v-bind="controlWrapper" :styles="styles" :is-focused="isFocused" :applied-options="appliedOptions">
    <q-input
      :model-value="control.data"
      type="number"
      min="0"
      max="20"
      :step="step"
      :id="control.id + '-input'"
      :class="styles.control.input"
      :disable="!control.enabled"
      :autofocus="appliedOptions.focus"
      :placeholder="appliedOptions.placeholder"
      @update:model-value="onChange"
    ></q-input>
  </control-wrapper>
</template>

<script lang="ts">
import { ControlElement, JsonFormsRendererRegistryEntry, rankWith, isNumberControl } from "@jsonforms/core";
import { defineComponent } from "vue";
import { rendererProps, useJsonFormsControl, RendererProps } from "@jsonforms/vue";
import { default as ControlWrapper } from "./ControlWrapper.vue";
import { useQuasarControl } from "../util";

const controlRenderer = defineComponent({
  name: "NumberControlRenderer",
  components: { ControlWrapper },
  props: {
    ...rendererProps<ControlElement>(),
  },
  computed: {
    step(): number {
      console.log(this.appliedOptions);
      const options: any = this.appliedOptions;
      console.log(options.step);
      return options.step ?? 1;
    },
  },
  setup(props: RendererProps<ControlElement>) {
    return useQuasarControl(useJsonFormsControl(props), (value: any) => value || undefined);
  },
});

export default controlRenderer;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(2, isNumberControl),
};
</script>
