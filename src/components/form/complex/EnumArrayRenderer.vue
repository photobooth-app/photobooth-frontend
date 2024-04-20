<template>
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
    @add="(details) => addSelected(details.value)"
    @remove="(details) => removeSelected(details.value)"
  >
  </q-select>
</template>

<script lang="ts">
import { ControlElement } from '@jsonforms/core';
import { defineComponent } from 'vue';
import { rendererProps, useJsonFormsMultiEnumControl, RendererProps } from '@jsonforms/vue';
import { useQuasarBasicControl } from '../util';

const controlRenderer = defineComponent({
  name: 'EnumArrayRenderer',
  components: {},
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useQuasarBasicControl(useJsonFormsMultiEnumControl(props));
  },
  methods: {
    addSelected(value: any) {
      this.addItem(this.control.path, value);
    },
    removeSelected(value: any) {
      this.removeItem?.(this.control.path, value);
    },
  },
});

export default controlRenderer;
</script>
