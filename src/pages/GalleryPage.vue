<template>
  <q-page id="gallery-page" padding>
    <div v-if="!isGalleryEmpty" class="row justify-center q-gutter-sm">
      <q-intersection v-for="item in mediacollectionStore.collection" :key="item.id" once class="preview-item">
        <router-link :to="{ name: 'mediaviewer', params: { id: item.id } }">
          <q-card class="q-ma-xs no-shadow"> <MediaItemThumbnailViewer :item="item" /> </q-card>
        </router-link>
      </q-intersection>
    </div>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else v-html="configurationStore.getConfigElement('uisettings.GALLERY_EMPTY_MSG')"></div>

    <q-page-sticky position="top-left" :offset="[25, 25]" style="/*z-index: 10000*/">
      <q-btn id="slideshow-button-to-frontpage" color="primary" rounded no-caps to="/" class="action-button">
        <q-icon left name="sym_o_arrow_back_ios_new" />
        <div>{{ $t('BTN_LABEL_BACK') }}</div>
      </q-btn>
    </q-page-sticky>
  </q-page>
</template>
<script setup lang="ts">
import { useConfigurationStore } from '../stores/configuration-store'
import { useMediacollectionStore } from '../stores/mediacollection-store'
import { computed } from 'vue'
import { default as MediaItemThumbnailViewer } from '../components/MediaItemThumbnailViewer.vue'

const configurationStore = useConfigurationStore()
const mediacollectionStore = useMediacollectionStore()

const isGalleryEmpty = computed(() => {
  return mediacollectionStore.collection_number_of_items == 0
})
</script>

<style lang="sass" scoped>
.preview-item
  height: 400px
  width: 400px
</style>
