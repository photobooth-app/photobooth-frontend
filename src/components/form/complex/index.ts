import {
  isAllOfControl,
  isAnyOfControl,
  JsonFormsRendererRegistryEntry,
  rankWith,
  and,
  hasType,
  JsonSchema,
  schemaMatches,
  schemaSubPathMatches,
  uiTypeIs,
  isObjectControl,
} from '@jsonforms/core';

import { default as AllOfRenderer } from './AllOfRenderer.vue';
import { default as AnyOfRenderer } from './AnyOfRenderer.vue';
// import { default as ArrayControlRenderer } from "./ArrayControlRenderer.vue";
import { default as EnumArrayRenderer } from './EnumArrayRenderer.vue';
import { default as ObjectRenderer } from './ObjectRenderer.vue';
// import { default as OneOfRenderer } from "./OneOfRenderer.vue";
// import { default as OneOfTabRenderer } from "./OneOfTabRenderer.vue";

export const AllOfRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: AllOfRenderer,
  tester: rankWith(3, isAllOfControl),
};

const hasOneOfItems = (schema: JsonSchema): boolean =>
  schema.oneOf !== undefined &&
  schema.oneOf.length > 0 &&
  (schema.oneOf as JsonSchema[]).every((entry: JsonSchema) => {
    return entry.const !== undefined;
  });

const hasEnumItems = (schema: JsonSchema): boolean => schema.type === 'string' && schema.enum !== undefined;

export const AnyOfRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: AnyOfRenderer,
  tester: rankWith(3, isAnyOfControl),
};

export const EnumArrayRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: EnumArrayRenderer,
  tester: rankWith(
    5.1,
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

export const ObjectRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: ObjectRenderer,
  tester: rankWith(2, isObjectControl),
};

export const complexRenderers = [
  AllOfRendererEntry,
  AnyOfRendererEntry,
  // arrayControlRendererEntry,
  EnumArrayRendererEntry,
  ObjectRendererEntry,
  // oneOfRendererEntry,
  // oneOfTabRendererEntry,
];
