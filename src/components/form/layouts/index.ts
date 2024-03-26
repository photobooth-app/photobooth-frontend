import { JsonFormsRendererRegistryEntry, rankWith, uiTypeIs, isLayout } from '@jsonforms/core';

import { default as LayoutRenderer } from './LayoutRenderer.vue';
import { default as TopLevelNavigationRenderer } from './TopLevelNavigationRenderer.vue';

export const LayoutRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: LayoutRenderer,
  tester: rankWith(1, isLayout),
};
export const TopLevelNavigationRendererEntry: JsonFormsRendererRegistryEntry = {
  renderer: TopLevelNavigationRenderer,
  tester: rankWith(2, uiTypeIs('TopLevelNavigation')),
};

export const layoutRenderers = [LayoutRendererEntry, TopLevelNavigationRendererEntry];
