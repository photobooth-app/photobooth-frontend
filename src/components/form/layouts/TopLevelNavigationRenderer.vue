<template>
  <q-layout v-if="layout.visible">
    <q-drawer side="left" v-model="drawer" :width="250" :breakpoint="800">
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
            style="text-transform: capitalize"
          >
            <q-item-section> {{ visibleCategoryLabels[index].replace(/_/g, ' ') }}</q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>

      <div style="position: absolute; top: 5px; right: -17px">
        <q-btn dense round unelevated color="green" icon="sym_o_chevron_left" @click="drawer = !drawer" />
      </div>
    </q-drawer>
    <q-page-container>
      <q-page>
        <div v-if="!drawer" style="position: absolute; top: 5px; left: -12px; z-index: 2">
          <q-btn dense round unelevated color="green" icon="sym_o_chevron_right" @click="drawer = !drawer" />
        </div>

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
import { type Layout, type Categorization, type Category, isVisible, type Scoped } from '@jsonforms/core'
import { defineComponent, ref } from 'vue'
import { DispatchRenderer, rendererProps, useJsonFormsLayout, type RendererProps } from '@jsonforms/vue'
import { useQuasarLayout, useAjv } from '../util'

export default defineComponent({
  name: 'TopLevelNavigationRenderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    const ajv = useAjv()
    const drawer = ref(true)
    const activeCategory = ref(0)

    return {
      ...useQuasarLayout(useJsonFormsLayout(props)),

      activeCategory,
      ajv,
      drawer,
    }
  },
  computed: {
    visibleCategories(): (Category | Categorization)[] {
      return (this.layout.uischema as Categorization).elements.filter((category: Category | Categorization) =>
        isVisible(category, this.layout.data, this.layout.path, this.ajv, this.config),
      )
    },
    visibleCategoryLabels(): string[] {
      return this.visibleCategories.map((element: any) => {
        return element.label ?? `${(element as Category & Scoped).scope.split('/').pop()}` //TODO: this is a workaround until categorization is well implemented.
      })
    },
  },
})
</script>
