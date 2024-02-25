export { default as ControlWrapper } from './ControlWrapper.vue';

export { default as BooleanToggleControlRenderer } from './BooleanToggleControlRenderer.vue';
export { default as ColorControlRenderer } from './ColorControlRenderer.vue';
export { default as EnumControlRenderer } from './EnumControlRenderer.vue';
export { default as NumberControlRenderer } from './NumberControlRenderer.vue';
export { default as SliderControlRenderer } from './SliderControlRenderer.vue';
export { default as StringControlRenderer } from './StringControlRenderer.vue';

import { entry as BooleanToggleControlRendererEntry } from './BooleanToggleControlRenderer.vue';
import { entry as ColorControlRendererEntry } from './ColorControlRenderer.vue';
import { entry as EnumControlRendererEntry } from './EnumControlRenderer.vue';
import { entry as NumberControlRendererEntry } from './NumberControlRenderer.vue';
import { entry as SliderControlRendererEntry } from './SliderControlRenderer.vue';
import { entry as StringControlRendererEntry } from './StringControlRenderer.vue';

export const controlRenderers = [
  BooleanToggleControlRendererEntry,
  ColorControlRendererEntry,
  EnumControlRendererEntry,
  NumberControlRendererEntry,
  SliderControlRendererEntry,
  StringControlRendererEntry,
];
