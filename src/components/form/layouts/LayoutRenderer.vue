<template>
  <div v-if="layout.visible" :class="layoutClassObject.root">
    <div v-for="(element, index) in elements" :key="`${layout.path}-${index}`" :class="layoutClassObject.item">
      <dispatch-renderer
        :schema="layout.schema"
        :uischema="element"
        :path="layout.path"
        :enabled="layout.enabled"
        :renderers="layout.renderers"
        :cells="layout.cells"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { Layout, UISchemaElement } from '@jsonforms/core'
import { defineComponent } from 'vue'
import { DispatchRenderer, rendererProps, useJsonFormsLayout, type RendererProps } from '@jsonforms/vue'
import { useQuasarLayout, withoutConstControls } from '../util'

export default defineComponent({
  name: 'LayoutRenderer',
  components: {
    DispatchRenderer,
  },
  props: {
    ...rendererProps<Layout>(),
  },
  setup(props: RendererProps<Layout>) {
    return useQuasarLayout(useJsonFormsLayout(props))
  },
  computed: {
    elements(): UISchemaElement[] {
      return withoutConstControls((this.layout.uischema as Layout).elements, this.layout.schema)
    },
    layoutClassObject(): any {
      return this.layout.direction === 'row' ? this.styles.horizontalLayout : this.styles.verticalLayout
    },
  },
})
</script>
