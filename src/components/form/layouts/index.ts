export { default as LayoutRenderer } from './LayoutRenderer.vue';
// export { default as GroupRenderer } from './GroupRenderer.vue';
export { default as TopLevelNavigationRenderer } from '../layouts/TopLevelNavigationRenderer.vue';

import { entry as layoutRendererEntry } from './LayoutRenderer.vue';
// import { entry as groupRendererEntry } from './GroupRenderer.vue';
import { entry as TopLevelNavigationRendererEntry } from '../layouts/TopLevelNavigationRenderer.vue';

export const layoutRenderers = [layoutRendererEntry, TopLevelNavigationRendererEntry];
