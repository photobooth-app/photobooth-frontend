<template>
  <div v-if="control.visible">
    <combinator-properties :schema="control.schema" combinatorKeyword="oneOf" :path="path" :rootSchema="control.rootSchema" />
    <!-- {{ control.schema }} -->
    <q-tabs
      v-model="selectIndex"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
      @update:model-value="handleTabChange"
    >
      <q-tab
        :name="oneOfIndex"
        :label="oneOfRenderInfo.label"
        v-for="(oneOfRenderInfo, oneOfIndex) in oneOfRenderInfos"
        :key="`${control.path}-${oneOfIndex}`"
      />
    </q-tabs>

    <q-tab-panels v-model="selectedIndex">
      <q-tab-panel v-for="(oneOfRenderInfo, oneOfIndex) in oneOfRenderInfos" :name="oneOfIndex" :key="`${control.path}-${oneOfIndex}`">
        <!-- {{ oneOfRenderInfo }} -->
        <dispatch-renderer
          v-if="selectedIndex === oneOfIndex"
          :schema="oneOfRenderInfo.schema"
          :uischema="oneOfRenderInfo.uischema"
          :path="control.path"
          :renderers="control.renderers"
          :cells="control.cells"
        />
      </q-tab-panel>
    </q-tab-panels>

    <q-dialog v-model="dialog">
      <q-card class="q-pa-sm" style="min-width: 350px">
        <q-card-section class="row items-center" style="flex-wrap: nowrap">
          <q-avatar icon="sym_o_delete" color="green" text-color="white" />
          <span class="q-ml-sm">When switching the tab, the data is cleared. Continue?</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn no-caps v-close-popup flat label="cancel" />
          <q-btn no-caps v-close-popup label="continue" color="green" @click="confirm" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script lang="ts">
import { type CombinatorSubSchemaRenderInfo, type ControlElement, createCombinatorRenderInfos, createDefaultValue } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, type RendererProps, useJsonFormsOneOfControl } from '@jsonforms/vue'
import isEmpty from 'lodash/isEmpty'
import { defineComponent, ref } from 'vue'
import { CombinatorProperties } from './components'
import { useQuasarControl } from '../util'

const controlRenderer = defineComponent({
  name: 'one-of-renderer',
  components: {
    DispatchRenderer,
    CombinatorProperties,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsOneOfControl(props)
    const control = input.control.value

    const selectedIndex = ref(control.indexOfFittingSchema || 0)
    const selectIndex = ref(selectedIndex.value)
    const newSelectedIndex = ref(0)
    const dialog = ref(false)

    return {
      ...useQuasarControl(input),
      selectedIndex,
      selectIndex,
      dialog,
      newSelectedIndex,
    }
  },
  computed: {
    oneOfRenderInfos(): CombinatorSubSchemaRenderInfo[] {
      const result = createCombinatorRenderInfos(
        this.control.schema.oneOf!,
        this.control.rootSchema,
        'oneOf',
        this.control.uischema,
        this.control.path,
        this.control.uischemas,
      )
      return result.filter((info) => info.uischema)
    },
  },
  methods: {
    handleTabChange(): void {
      this.newSelectedIndex = this.selectIndex
      // revert back to the orginal value until the dialog is done
      this.selectIndex = this.selectedIndex

      if (isEmpty(this.control.data)) {
        this.openNewTab(this.newSelectedIndex)
      } else {
        this.dialog = true
        this.$nextTick(() => {
          // cast to 'any' instead of 'Vue' because of Typescript problems (excessive stack depth when comparing types) during rollup build
          // ;((this.$refs.confirm as any).$el as HTMLElement).focus()
        })
      }
    },
    confirm(): void {
      this.openNewTab(this.newSelectedIndex)
      this.dialog = false
    },
    cancel(): void {
      this.dialog = false
    },
    openNewTab(newIndex: number): void {
      this.handleChange(this.control.path, createDefaultValue(this.oneOfRenderInfos[newIndex].schema, this.control.rootSchema))
      this.selectIndex = newIndex
      this.selectedIndex = newIndex
    },
  },
})

export default controlRenderer
</script>
