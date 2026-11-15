<template>
  <div v-if="control.visible">
    <div class="collage-processing-renderer__editor row items-center q-gutter-sm q-mb-sm">
      <q-btn
        no-caps
        unelevated
        color="primary"
        icon="sym_o_dashboard_customize"
        :disable="!control.enabled"
        :label="$t('Open collage editor')"
        @click="showEditor = true"
      />
      <span class="text-caption text-grey-7">{{ $t('Arrange the images with a live preview instead of entering numbers.') }}</span>
    </div>

    <!-- the usual form below, so every setting stays available -->
    <object-renderer v-bind="$props" />

    <q-dialog v-model="showEditor" maximized persistent transition-show="fade" transition-hide="fade">
      <collage-editor v-if="showEditor" :config="control.data" @cancel="showEditor = false" @apply="apply" />
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ControlElement } from '@jsonforms/core'
import { rendererProps, useJsonFormsControl } from '@jsonforms/vue'
import { Notify } from 'quasar'
import { useI18n } from 'vue-i18n'
import CollageEditor from '@/components/collage/CollageEditor.vue'
import type { CollageProcessing } from '@/components/collage/collage'
import ObjectRenderer from './ObjectRenderer.vue'

/**
 * Collage processing settings: the normal object form plus a visual editor for the image arrangement.
 * The editor only changes the form data, it is persisted with the regular save button.
 */

const props = defineProps({ ...rendererProps<ControlElement>() })
const { control, handleChange } = useJsonFormsControl(props)
const { t } = useI18n()

const showEditor = ref(false)

const apply = (config: CollageProcessing) => {
  handleChange(control.value.path, config)
  showEditor.value = false
  Notify.create({ message: t('Collage layout applied. Save the configuration to keep it.'), color: 'info', icon: 'sym_o_info' })
}
</script>
