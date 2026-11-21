<template>
  <div v-if="layout.visible">
    <q-card flat :class="classes" :elevation="!bare ? 2 : undefined" :outlined="bare">
      <q-card-section v-if="layout.label" :class="styles.group.label">
        <div class="text-h6">{{ layout.label }}</div>
      </q-card-section>

      <q-card-section v-for="(element, index) in elements" :key="`${layout.path}-${index}`" class="q-pt-none" :class="styles.group.item">
        <dispatch-renderer
          :schema="layout.schema"
          :uischema="element"
          :path="layout.path"
          :enabled="layout.enabled"
          :renderers="layout.renderers"
          :cells="layout.cells"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script lang="ts">
import type { Layout, UISchemaElement } from '@jsonforms/core'
import { defineComponent } from 'vue'
import { DispatchRenderer, rendererProps, useJsonFormsLayout, type RendererProps } from '@jsonforms/vue'
import { useQuasarLayout, withoutConstControls } from '../util'

export default defineComponent({
  name: 'GroupRenderer',
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
    bare(): boolean {
      return !!this.appliedOptions.bare
    },
    alignLeft(): boolean {
      return !!this.appliedOptions.alignLeft
    },
    classes(): string {
      const classes = ['q-my-xs', 'q-pa-none', `${this.styles.group.root}`]
      if (this.bare) {
        classes.push(`${this.styles.group.bare}`)
      }
      if (this.alignLeft) {
        classes.push(`${this.styles.group.alignLeft}`)
      }
      return classes.join(' ')
    },
  },
})
</script>

<!-- Default styles for the 'nested' feature -->
<style>
.group.group-bare {
  border: 0;
  box-shadow: none;
}
.group-bare > .group-label,
.group-bare > .group-item {
  padding-right: 0;
}
.group-align-left > .group-label,
.group-align-left > .group-item {
  padding-left: 0;
}
</style>
