<template>
  <control-wrapper v-bind="controlWrapper" :styles="styles" :is-focused="isFocused" :applied-options="appliedOptions">
    <q-select
      :id="control.id + '-input'"
      :model-value="control.data"
      filled
      :class="styles.control.input"
      :disable="!control.enabled"
      :autofocus="appliedOptions.focus"
      :error-message="control.errors"
      :error="control.errors != ''"
      @update:model-value="onChange"
      @focus="((isFocused = true), getOptions())"
      @blur="isFocused = false"
      use-input
      hide-selected
      fill-input
      input-debounce="0"
      :options="filteredOptions"
      @filter="filterFn"
      @filter-abort="abortFilterFn"
    >
      <template v-slot:no-option>
        <q-item>
          <q-item-section class="text-grey">{{ $t('No results') }}</q-item-section>
        </q-item>
      </template>
    </q-select>
  </control-wrapper>
</template>

<script lang="ts">
import type { ControlElement } from '@jsonforms/core'
import { defineComponent, ref } from 'vue'
import { rendererProps, useJsonFormsControl, type RendererProps } from '@jsonforms/vue'
import { default as ControlWrapper } from './ControlWrapper.vue'
import { useQuasarControl } from '../util'
import { _fetch } from '../../../util/fetch_api'
import type { components } from '../../../dto/api'

const controlRenderer = defineComponent({
  name: 'FilePathControlRenderer',
  components: { ControlWrapper },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const availableOptions = ref([])
    const filteredOptions = ref([])

    return {
      ...useQuasarControl(useJsonFormsControl(props), (value: any) => value || undefined, 300),
      filteredOptions,
      availableOptions,

      getOptions() {
        // for now just send a . to request that means it would list all files. filtering is done locally.
        // should be acceptable since there are only a few 10s files, maybe 100 and no need to trigger a search on every char typed
        _fetch(`${this.control.schema['files_list_api']}?q=.`, {})
          .then((res) => {
            return res.json()
          })
          .then((json: components['schemas']['PathListItem'][]) => {
            const updatedEntries = []
            json.forEach((entry) => {
              updatedEntries.push(entry.filepath)
            })
            availableOptions.value = updatedEntries
          })
          .catch((err) => {
            console.log(err)
          })
      },

      filterFn(val, update) {
        update(() => {
          if (val === '') {
            filteredOptions.value = availableOptions.value
          } else {
            const needle = val.toLowerCase()
            filteredOptions.value = availableOptions.value.filter((v) => v.toLowerCase().indexOf(needle) > -1)
          }
        })
      },

      abortFilterFn() {
        // console.log('delayed filter aborted')
      },
    }
  },
})

export default controlRenderer
</script>
