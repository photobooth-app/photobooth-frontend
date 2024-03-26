import { JsonFormsRendererRegistryEntry, rankWith, schemaTypeIs } from '@jsonforms/core';

import { default as ArrayListRenderer } from './ArrayListRenderer.vue';

export const ArrayListRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: ArrayListRenderer,
  tester: rankWith(2.1, schemaTypeIs('array')),
};
export const arrayRenderers = [ArrayListRendererEntry];
