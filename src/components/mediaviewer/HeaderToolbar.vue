<template>
  <q-toolbar id="gallery-toolbar" class="toolbar" v-if="item">
    <q-btn dense flat icon="sym_o_close" size="1.5rem" @click="$router.back()" />

    <q-space />

    <q-btn v-if="showDownload" flat class="q-mr-sm" icon="sym_o_download" :label="$t('BTN_LABEL_GALLERY_DOWNLOAD')" @click="openURL(item.full)" />
    <q-btn v-if="showDelete" flat class="q-mr-sm" icon="sym_o_delete" :label="$t('BTN_LABEL_GALLERY_DELETE')" @click="confirmDeleteDialog = true" />

    <q-btn
      v-if="showFilter"
      flat
      class="q-mr-sm"
      icon="sym_o_filter"
      :label="$t('BTN_LABEL_GALLERY_FILTER')"
      :disabled="!enableFilter"
      @click="invokeToggleDisplayFilter"
    />

    <ShareTriggerButtons
      v-if="showShare"
      :triggers="shareButtons"
      :direct-access-number-of-buttons="shareDirectAccessButtons"
      :current-item-is-image="['image', 'collage', 'collageimage', 'animationimage'].includes(item.media_type)"
      @trigger-action="invokeShareAction"
    ></ShareTriggerButtons>

    <q-space />

    <div v-if="props.image_number && props.images_total" class="q-mr-sm">
      <q-icon name="sym_o_tag" />
      <span>
        {{
          $t('LABEL_ELEMENT_X_OF_Y', {
            no: props.image_number,
            total: props.images_total,
          })
        }}
      </span>
    </div>

    <q-space />

    <div class="q-mr-sm">
      <q-icon name="sym_o_image" />
      {{ item.caption }}
    </div>
  </q-toolbar>

  <q-dialog v-model="confirmDeleteDialog">
    <q-card id="gallery-confirm-delete-dialog" class="q-pa-sm" style="min-width: 350px">
      <q-card-section class="row items-center" style="flex-wrap: nowrap">
        <q-avatar icon="sym_o_delete" color="primary" text-color="white" />
        <span class="q-ml-sm">{{ $t('MSG_CONFIRM_DELETE_IMAGE') }}</span>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
        <q-btn v-close-popup :label="$t('BTN_LABEL_DELETE_IMAGE')" color="primary" @click="[invokeDeleteMediaitem(item.id), $emit('closeEvent')]" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { openURL } from 'quasar'
import type { MediaItem } from 'src/dto/dto'
import { default as ShareTriggerButtons, type ShareSchema } from '../ShareTriggerButtons.vue'
const confirmDeleteDialog = ref(false)

const props = defineProps<{
  item: MediaItem
  image_number?: number
  images_total?: number
  showDownload: boolean
  showDelete: boolean
  showFilter: boolean
  showShare: boolean
  shareDirectAccessButtons: number
  shareButtons: ShareSchema[]
  enableFilter: boolean
}>()

const emit = defineEmits<{
  triggerShareAction: [config_index: number]
  triggerToggleDisplayFilter: []
  triggerDeleteMediaitem: [id: string]
  closeEvent: [] // from quasar
}>()

function invokeShareAction(config_index: number) {
  emit('triggerShareAction', config_index)
}

function invokeToggleDisplayFilter() {
  emit('triggerToggleDisplayFilter')
}

function invokeDeleteMediaitem(id: string) {
  emit('triggerDeleteMediaitem', id)
}
</script>
