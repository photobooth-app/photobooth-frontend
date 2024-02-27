<template>
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
</template>

<script lang="ts">
import {
  ControlElement,
  JsonFormsRendererRegistryEntry,
  rankWith,
  and,
  hasType,
  JsonSchema,
  schemaMatches,
  schemaSubPathMatches,
  uiTypeIs,
} from '@jsonforms/core';
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
      this.addItem(this.control.path, value.value);
    },
    removeSelected(value: any) {
      this.removeItem?.(this.control.path, value.value);
    },
  },
});

export default controlRenderer;

const hasOneOfItems = (schema: JsonSchema): boolean =>
  schema.oneOf !== undefined &&
  schema.oneOf.length > 0 &&
  (schema.oneOf as JsonSchema[]).every((entry: JsonSchema) => {
    return entry.const !== undefined;
  });

const hasEnumItems = (schema: JsonSchema): boolean => schema.type === 'string' && schema.enum !== undefined;

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(
    5,
    and(
      uiTypeIs('Control'),
      and(
        schemaMatches((schema) => hasType(schema, 'array') && !Array.isArray(schema.items)),
        schemaSubPathMatches('items', (schema) => {
          return hasOneOfItems(schema) || hasEnumItems(schema);
        })
      )
    )
  ),
};
</script>
