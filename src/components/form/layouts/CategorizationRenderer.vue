<template>
  <q-page v-if="layout.visible">
    active category: {{ activeCategory }}, label: {{ visibleCategoryLabels[activeCategory] }}<br />
    Menu:
    <div v-for="(_, index) in visibleCategories" :key="`${layout.path}-${index}`">- {{ visibleCategoryLabels[index] }}</div>

    <div v-for="(element, index) in visibleCategories" :key="`${layout.path}-${index}`">
      <dispatch-renderer
        :schema="layout.schema"
        :uischema="element"
        :path="layout.path"
        :enabled="layout.enabled"
        :renderers="layout.renderers"
        :cells="layout.cells"
      />
    </div>
  </q-page>
</template>

<script lang="ts">
import {
  JsonFormsRendererRegistryEntry,
  Layout,
  rankWith,
  and,
  uiTypeIs,
  Categorization,
  Category,
  Tester,
  isVisible,
  categorizationHasCategory,
  deriveLabelForUISchemaElement,
} from '@jsonforms/core';
import { defineComponent, ref } from 'vue';
import { DispatchRenderer, rendererProps, useJsonFormsLayout, RendererProps } from '@jsonforms/vue';
import { useQuasarLayout } from '../util';

const layoutRenderer = defineComponent({
  name: 'categorization-renderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const activeCategory = ref(0);
    return {
      ...useQuasarLayout(useJsonFormsLayout(props)),
      activeCategory,
    };
  },
  computed: {
    visibleCategories(): (Category | Categorization)[] {
      return (this.layout.uischema as Categorization).elements.filter((category: Category | Categorization) => true);
    },
    visibleCategoryLabels(): string[] {
      return this.visibleCategories.map((element) => {
        return element.label ?? '';
      });
    },
  },
});

export default layoutRenderer;

export const isSingleLevelCategorization: Tester = and(uiTypeIs('Categorization'), categorizationHasCategory);

export const entry: JsonFormsRendererRegistryEntry = {
  renderer: layoutRenderer,
  tester: rankWith(2, isSingleLevelCategorization),
};
</script>

<style>
.v-window {
  width: 100%;
}
</style>
