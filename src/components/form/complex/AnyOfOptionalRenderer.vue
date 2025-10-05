<template>
  <div v-if="control.visible">
    <dispatch-renderer
      :schema="NonNullType.schema"
      :uischema="anyOfRenderInfos.uischema"
      :path="control.path"
      :renderers="control.renderers"
      :cells="control.cells"
      :enabled="control.enabled"
    />
  </div>
</template>

<script lang="ts">
//https://jsonforms.discourse.group/t/altering-schema-during-dispatching/2172
import type { CombinatorSubSchemaRenderInfo, JsonSchema } from '@jsonforms/core'
import { createCombinatorRenderInfos, type ControlElement } from '@jsonforms/core'
import { DispatchRenderer, rendererProps, type RendererProps, useJsonFormsAnyOfControl } from '@jsonforms/vue'
import { defineComponent } from 'vue'
import { useQuasarControl } from '../util'

export default defineComponent({
  name: 'AnyOfOptionalRenderer',
  components: { DispatchRenderer },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsAnyOfControl(props)
    const control = input.control.value

    // console.info(control)
    // console.log(control.schema)
    const editedSchema = { ...control.schema } as JsonSchema
    // console.log(editedSchema)

    const nonNullType = editedSchema.anyOf?.find((obj) => obj.type !== 'null') as { type: string }
    delete editedSchema.anyOf
    // console.warn(nonNullType)
    // console.error(editedSchema)
    // console.error({ ...input.control.value, schema: { ...editedSchema, ...nonNullType } })

    return {
      ...useQuasarControl(input),
      editedSchema,
      nonNullType,
    }
  },
  computed: {
    NonNullType() {
      return { ...this.control.value, schema: { ...this.editedSchema, ...this.nonNullType } }
    },

    anyOfRenderInfos(): CombinatorSubSchemaRenderInfo {
      const result = createCombinatorRenderInfos(
        this.control.schema.anyOf!,
        this.control.rootSchema,
        'anyOf',
        this.control.uischema,
        this.control.path,
        this.control.uischemas,
      )
      return result.filter((info) => info.uischema)[0]
    },
  },
})
</script>
