<template>
  <div v-if="control.visible">
    <!-- the usual form, with the editor button placed right above the merge definition -->
    <dispatch-renderer
      :visible="control.visible"
      :enabled="control.enabled"
      :readonly="control.readonly"
      :schema="control.schema"
      :uischema="detailUiSchema"
      :path="control.path"
      :renderers="control.renderers"
      :cells="control.cells"
      :root-schema="control.rootSchema"
    />

    <q-dialog v-model="showEditor" maximized persistent transition-show="fade" transition-hide="fade">
      <collage-editor v-if="showEditor" :config="control.data" @cancel="showEditor = false" @apply="apply" />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { type ControlElement, type GroupLayout, type Layout, type UISchemaElement, findUISchema, Generate } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, useJsonFormsControlWithDetail } from '@jsonforms/vue'
import cloneDeep from 'lodash/cloneDeep'
import isEmpty from 'lodash/isEmpty'
import { Notify } from 'quasar'
import { useI18n } from 'vue-i18n'
import CollageEditor from '@/components/collage/CollageEditor.vue'
import { type CollageProcessing, OPEN_COLLAGE_EDITOR, COLLAGE_EDITOR_BUTTON } from '@/components/collage/collage'
import { useNested } from '../util'

/**
 * Collage processing settings: the normal object form plus a visual editor for the image arrangement.
 * The editor only changes the form data, it is persisted with the regular save button.
 */

const props = defineProps({ ...rendererProps<ControlElement>() })
const { control, handleChange } = useJsonFormsControlWithDetail(props)
const nested = useNested('object')
const { t } = useI18n()

const showEditor = ref(false)
// the button is rendered by CollageEditorButtonRenderer somewhere inside the form below
provide(OPEN_COLLAGE_EDITOR, () => (showEditor.value = true))

// same ui schema as the ObjectRenderer generates, plus the editor button above merge_definition
const detailUiSchema = computed<UISchemaElement>(() => {
  const generator = () => {
    const uiSchema = Generate.uiSchema(control.value.schema, 'Group', undefined, control.value.rootSchema)
    if (isEmpty(control.value.path)) uiSchema.type = 'VerticalLayout'
    else (uiSchema as GroupLayout).label = control.value.label
    return uiSchema
  }

  let result = cloneDeep(
    findUISchema(
      control.value.uischemas,
      control.value.schema,
      control.value.uischema.scope,
      control.value.path,
      generator,
      control.value.uischema,
      control.value.rootSchema
    )
  )

  if (nested.level > 0) {
    result.options = { ...result.options, bare: true, alignLeft: nested.level >= 4 || nested.parentElement === 'array' }
  }

  const elements = (result as Layout).elements
  if (elements) {
    const index = elements.findIndex(el => (el as ControlElement).scope?.endsWith('/merge_definition'))
    elements.splice(index < 0 ? 0 : index, 0, { type: COLLAGE_EDITOR_BUTTON })
  } else {
    result = { type: 'VerticalLayout', elements: [{ type: COLLAGE_EDITOR_BUTTON }, result] } as Layout
  }
  return result
})

const apply = (config: CollageProcessing) => {
  handleChange(control.value.path, config)
  showEditor.value = false
  Notify.create({ message: t('Collage layout applied. Save the configuration to keep it.'), color: 'info', icon: 'sym_o_info' })
}
</script>
