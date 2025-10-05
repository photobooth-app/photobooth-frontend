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
      @input-value="onChange"
      @focus="isFocused = true"
      @blur="((isFocused = false), (availableOptions = null))"
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

export default defineComponent({
  name: 'StringAutosuggestControlRenderer',
  components: { ControlWrapper },
  props: {
    ...rendererProps<ControlElement>(),
  },
  computed: {},
  setup(props: RendererProps<ControlElement>) {
    const availableOptions = ref(null)
    const filteredOptions = ref([])
    const useControl = useQuasarControl(useJsonFormsControl(props), (value: any) => value || undefined, 300)

    return {
      ...useControl,
      filteredOptions,
      availableOptions,

      async filterFn(val, update) {
        // on first filter load the avail options. on blur the var is reset to null so its fetched again
        if (availableOptions.value === null) {
          // for now just send a "" to request that means it would list all items. filtering is done locally.
          // should be acceptable since there are only a few 10s items, maybe 100 and no need to trigger a search on every char typed

          await _fetch(`${useControl.control.value.schema['list_api']}?q=`, {})
            .then((res) => {
              return res.json()
            })
            .then((json: [string]) => {
              availableOptions.value = json
            })
            .catch((err) => {
              console.log(err)
            })
            .finally(() => {})
        }

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
</script>
