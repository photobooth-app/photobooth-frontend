<template>
  <control-wrapper v-bind="controlWrapper" :styles="styles" :is-focused="isFocused" :applied-options="appliedOptions">
    <q-input
      :id="control.id + '-input'"
      filled
      :model-value="control.data"
      :class="styles.control.input"
      :disable="!control.enabled"
      :autofocus="appliedOptions.focus"
      :error-message="control.errors"
      :error="control.errors != ''"
      @focus="isFocused = true"
      @blur="isFocused = false"
      bordered
    >
      <template v-slot:prepend>
        <q-icon name="sym_o_fullscreen_portrait" :style="{ color: control.data }" />
      </template>
      <template v-slot:append>
        <q-icon name="sym_o_colorize" class="cursor-pointer" :color="control.data">
          <q-popup-proxy cover transition-show="scale" transition-hide="scale">
            <q-color :model-value="control.data" @update:model-value="onChange" no-header-tabs format-model="hex" :rules="['hexColor']" />
          </q-popup-proxy>
        </q-icon>
      </template>
    </q-input>
  </control-wrapper>
</template>

<script lang="ts">
import type { ControlElement } from '@jsonforms/core'
import { defineComponent } from 'vue'
import { rendererProps, useJsonFormsControl, type RendererProps } from '@jsonforms/vue'
import { default as ControlWrapper } from './ControlWrapper.vue'
import { useQuasarControl } from '../util'

export default defineComponent({
  name: 'ColorControlRenderer',
  components: { ControlWrapper },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useQuasarControl(useJsonFormsControl(props), (value: string) => value || undefined, 300)
  },
  methods: {},
})
</script>
