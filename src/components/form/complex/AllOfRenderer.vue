<template>
  <div v-if="control.visible">
    <template v-if="delegateUISchema">
      <dispatch-renderer
        :schema="control.schema"
        :uischema="delegateUISchema"
        :path="control.path"
        :enabled="control.enabled"
        :renderers="control.renderers"
        :cells="control.cells"
      />
    </template>
    <template v-else-if="allOfRenderInfos">
      <div>
        <combinator-properties :schema="control.schema" combinator-keyword="allOf" :path="path" />
        <dispatch-renderer
          v-for="(allOfRenderInfo, allOfIndex) in allOfRenderInfos"
          :key="`${control.path}-${allOfIndex}`"
          :schema="allOfRenderInfo.schema"
          :uischema="allOfRenderInfo.uischema"
          :path="control.path"
          :enabled="control.enabled"
          :renderers="control.renderers"
          :cells="control.cells"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { CombinatorSubSchemaRenderInfo, ControlElement, createCombinatorRenderInfos, findMatchingUISchema, UISchemaElement } from '@jsonforms/core';
import { DispatchRenderer, rendererProps, RendererProps, useJsonFormsAllOfControl } from '@jsonforms/vue';
import { defineComponent } from 'vue';
import { useQuasarControl } from '../util';
import { CombinatorProperties } from './components';

const controlRenderer = defineComponent({
  name: 'AllOfRenderer',
  components: {
    DispatchRenderer,
    CombinatorProperties,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useQuasarControl(useJsonFormsAllOfControl(props));
  },
  computed: {
    delegateUISchema(): UISchemaElement {
      return findMatchingUISchema(this.control.uischemas)(this.control.schema, this.control.uischema.scope, this.control.path);
    },
    allOfRenderInfos(): CombinatorSubSchemaRenderInfo[] {
      const result = createCombinatorRenderInfos(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.control.schema.allOf!,
        this.control.rootSchema,
        'allOf',
        this.control.uischema,
        this.control.path,
        this.control.uischemas,
      );

      return result.filter((info) => info.uischema);
    },
  },
});

export default controlRenderer;
</script>
