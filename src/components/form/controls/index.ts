export { default as ControlWrapper } from "./ControlWrapper.vue";

export { default as StringControlRenderer } from "./StringControlRenderer.vue";
export { default as NumberControlRenderer } from "./NumberControlRenderer.vue";
export { default as BooleanToggleControlRenderer } from "./BooleanToggleControlRenderer.vue";
export { default as EnumControlRenderer } from "./EnumControlRenderer.vue";

import { entry as StringControlRendererEntry } from "./StringControlRenderer.vue";
import { entry as NumberControlRendererEntry } from "./NumberControlRenderer.vue";
import { entry as BooleanToggleControlRendererEntry } from "./BooleanToggleControlRenderer.vue";
import { entry as EnumControlRendererEntry } from "./EnumControlRenderer.vue";

export const controlRenderers = [StringControlRendererEntry, NumberControlRendererEntry, BooleanToggleControlRendererEntry, EnumControlRendererEntry];
