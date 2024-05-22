<template>
  <q-layout v-if="layout.visible">
    <q-header style="z-index: 0">
      <q-toolbar>
        <q-btn flat round dense icon="menu" @click="drawer = !drawer" />
        <!-- eslint-disable-next-line @intlify/vue-i18n/no-raw-text -->
        <q-toolbar-title>{{ visibleCategoryLabels[activeCategory] }} ({{ activeCategory }})</q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer v-model="drawer" :width="300" :breakpoint="500" bordered :class="$q.dark.isActive ? 'bg-grey-9' : 'bg-grey-3'">
      <q-scroll-area class="fit">
        <q-list>
          <q-item
            v-for="(_, index) in visibleCategories"
            :key="`${layout.path}-${index}`"
            v-ripple
            clickable
            :active="activeCategory == index"
            replace
            @click="activeCategory = index"
          >
            <q-item-section> {{ visibleCategoryLabels[index] }}</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <q-page-container>
      <q-page padding>
        <!--div>{{ JSON.stringify(this.serverConfig) }}</div-->
        <div class="config-form q-mt-md row justify-center">
          <div class="col-12 col-md-10 q-mb-xl">
            <div v-for="(element, index) in visibleCategories" :key="`${layout.path}-${index}`">
              <!--div class="col-12 col-md-8 q-mb-xl">{{ layout.schema.description }} TODO: maybe find out later how to read description</div-->
              <dispatch-renderer
                v-if="index == activeCategory"
                :schema="layout.schema"
                :uischema="element"
                :path="layout.path"
                :enabled="layout.enabled"
                :renderers="layout.renderers"
                :cells="layout.cells"
              />
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">
import { Layout, Categorization, Category, isVisible, Scoped } from '@jsonforms/core';
import { defineComponent, ref } from 'vue';
import { DispatchRenderer, rendererProps, useJsonFormsLayout, RendererProps } from '@jsonforms/vue';
import { useQuasarLayout, useAjv } from '../util';

const TopLevelNavigationRenderer = defineComponent({
  name: 'TopLevelNavigation',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const ajv = useAjv();
    const drawer = ref(true);
    const activeCategory = ref(0);

    return {
      ...useQuasarLayout(useJsonFormsLayout(props)),

      activeCategory,
      ajv,
      drawer,
    };
  },
  computed: {
    visibleCategories(): (Category | Categorization)[] {
      return (this.layout.uischema as Categorization).elements.filter((category: Category | Categorization) =>
        isVisible(category, this.layout.data, this.layout.path, this.ajv),
      );
    },
    visibleCategoryLabels(): string[] {
      return this.visibleCategories.map((element) => {
        return element.label ?? `${(element as Category & Scoped).scope.split('/').pop()}`; //TODO: this is a workaround until categorization is well implemented.
      });
    },
  },
});

export default TopLevelNavigationRenderer;

// export const entry: JsonFormsRendererRegistryEntry = {
//   renderer: TopLevelNavigationRenderer,
//   tester: rankWith(2, uiTypeIs('TopLevelNavigation')),
// };
</script>
