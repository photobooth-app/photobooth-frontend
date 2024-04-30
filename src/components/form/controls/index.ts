// export * from './components';
// export * from './directives';

import {
  JsonFormsRendererRegistryEntry,
  rankWith,
  isStringControl,
  isRangeControl,
  isNumberControl,
  isIntegerControl,
  or,
  and,
  hasType,
  JsonSchema,
  schemaMatches,
  schemaSubPathMatches,
  uiTypeIs,
  isBooleanControl,
  formatIs,
  optionIs,
  isEnumControl,
} from '@jsonforms/core';

import { default as BooleanToggleControlRenderer } from './BooleanToggleControlRenderer.vue';
import { default as ColorControlRenderer } from './ColorControlRenderer.vue';
import { default as EnumArrayControlRenderer } from './EnumArrayControlRenderer.vue';
import { default as EnumControlRenderer } from './EnumControlRenderer.vue';
import { default as NumberControlRenderer } from './NumberControlRenderer.vue';
import { default as SliderControlRenderer } from './SliderControlRenderer.vue';
import { default as StringControlRenderer } from './StringControlRenderer.vue';

export const BooleanToggleControlRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: BooleanToggleControlRenderer,
  tester: rankWith(1.1, isBooleanControl),
};
export const ColorControlRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: ColorControlRenderer,
  tester: rankWith(1.1, and(isStringControl, or(formatIs('color'), optionIs('format', 'color')))),
};

const hasOneOfItems = (schema: JsonSchema): boolean =>
  schema.oneOf !== undefined &&
  schema.oneOf.length > 0 &&
  (schema.oneOf as JsonSchema[]).every((entry: JsonSchema) => {
    return entry.const !== undefined;
  });

const hasEnumItems = (schema: JsonSchema): boolean => schema.type === 'string' && schema.enum !== undefined;
export const EnumArrayControlRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: EnumArrayControlRenderer,
  tester: rankWith(
    5.2,
    and(
      uiTypeIs('Control'),
      and(
        schemaMatches((schema) => hasType(schema, 'array') && !Array.isArray(schema.items)),
        schemaSubPathMatches('items', (schema) => {
          return hasOneOfItems(schema) || hasEnumItems(schema);
        }),
      ),
    ),
  ),
};
export const EnumControlRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: EnumControlRenderer,
  tester: rankWith(2.1, isEnumControl),
};
export const NumberControlRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: NumberControlRenderer,
  tester: rankWith(1.1, or(isNumberControl, isIntegerControl)),
};
export const SliderControlRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: SliderControlRenderer,
  tester: rankWith(4.1, isRangeControl), //TODO: Tester not working as expected.
};
export const StringControlRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: StringControlRenderer,
  tester: rankWith(1.1, isStringControl),
};

export const controlRenderers = [
  BooleanToggleControlRendererEntry,
  ColorControlRendererEntry,
  EnumArrayControlRendererEntry,
  EnumControlRendererEntry,
  NumberControlRendererEntry,
  SliderControlRendererEntry,
  StringControlRendererEntry,
];
