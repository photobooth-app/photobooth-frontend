<template>
  <div v-if="open" class="row items-center q-gutter-sm q-my-sm">
    <q-btn
      no-caps
      unelevated
      color="primary"
      icon="sym_o_dashboard_customize"
      :disable="props.enabled === false"
      :label="$t('Open collage editor')"
      @click="open"
    />
    <span class="text-caption text-grey-7">{{
      $t('Arrange images, background, overlay and texts with a live preview instead of entering numbers.')
    }}</span>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'
import type { UISchemaElement } from '@jsonforms/core'
import { rendererProps } from '@jsonforms/vue'
import { OPEN_COLLAGE_EDITOR } from '@/components/collage/collage'

/** Button inside the collage processing form, opens the editor of the surrounding CollageProcessingRenderer. */

const props = defineProps({ ...rendererProps<UISchemaElement>() })
const open = inject(OPEN_COLLAGE_EDITOR, null)
</script>
