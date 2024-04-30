import { JsonFormsRendererRegistryEntry, rankWith, uiTypeIs, isLayout, and } from '@jsonforms/core';

import { default as GroupRenderer } from './GroupRenderer.vue';
import { default as LayoutRenderer } from './LayoutRenderer.vue';
import { default as TopLevelNavigationRenderer } from './TopLevelNavigationRenderer.vue';

export const GroupRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: GroupRenderer,
  tester: rankWith(2, and(isLayout, uiTypeIs('Group'))),
};

export const LayoutRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: LayoutRenderer,
  tester: rankWith(1, isLayout),
};

export const VerticalLayoutRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: LayoutRenderer,
  tester: rankWith(2, uiTypeIs('VerticalLayout')),
};
export const TopLevelNavigationRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: TopLevelNavigationRenderer,
  tester: rankWith(2, uiTypeIs('TopLevelNavigation')),
};

export const layoutRenderers = [GroupRendererEntry, LayoutRendererEntry, VerticalLayoutRendererEntry, TopLevelNavigationRendererEntry];
