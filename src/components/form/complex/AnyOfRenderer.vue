<template>
  <div v-if="control.visible">
    <combinator-properties :schema="control.schema" combinator-keyword="anyOf" :path="path" />
    <q-tabs v-model="selectedIndex" dense class="text-grey" active-color="primary" indicator-color="primary" align="justify" narrow-indicator>
      <q-tab v-for="(anyOfRenderInfo, anyOfIndex) in anyOfRenderInfos" :key="`${control.path}-${anyOfIndex}`" :name="anyOfIndex">
        {{ anyOfRenderInfo.label }}
      </q-tab>
    </q-tabs>

    <q-separator />

    <q-tab-panels v-model="selectedIndex" animated>
      <q-tab-panel v-for="(anyOfRenderInfo, anyOfIndex) in anyOfRenderInfos" :key="`${control.path}-${anyOfIndex}`" :name="anyOfIndex">
        <dispatch-renderer
          v-if="selectedIndex === anyOfIndex"
          :schema="anyOfRenderInfo.schema"
          :uischema="anyOfRenderInfo.uischema"
          :path="control.path"
          :renderers="control.renderers"
          :cells="control.cells"
          :enabled="control.enabled"
        />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script lang="ts">
import { CombinatorSubSchemaRenderInfo, ControlElement, createCombinatorRenderInfos } from '@jsonforms/core';
import { DispatchRenderer, rendererProps, RendererProps, useJsonFormsAnyOfControl } from '@jsonforms/vue';

import { defineComponent, ref } from 'vue';

import { useQuasarControl } from '../util';

import { CombinatorProperties } from './components';

const controlRenderer = defineComponent({
  name: 'AnyOfRenderer',
  components: {
    DispatchRenderer,
    CombinatorProperties,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const input = useJsonFormsAnyOfControl(props);
    const control = input.control.value;
    const selectedIndex = ref(control.indexOfFittingSchema || 0);

    return {
      ...useQuasarControl(input),
      selectedIndex,
    };
  },
  computed: {
    anyOfRenderInfos(): CombinatorSubSchemaRenderInfo[] {
      const result = createCombinatorRenderInfos(
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.control.schema.anyOf!,
        this.control.rootSchema,
        'anyOf',
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
