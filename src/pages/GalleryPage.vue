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
    <div v-else v-html="configurationStore.configuration.uisettings.GALLERY_EMPTY_MSG"></div>

    <ReturnButton v-if="!props.standaloneMode" @trigger-return="$router.back()"></ReturnButton>
    <!-- go back to index after inactivity -->
    <RouteAfterTimeout
      v-if="!props.standaloneMode"
      route="/"
      :timeout-ms="configurationStore.configuration.uisettings.show_frontpage_timeout * 60 * 1000"
    ></RouteAfterTimeout>
  </q-page>
</template>
<script setup lang="ts">
import { useConfigurationStore } from '../stores/configuration-store'
import { useMediacollectionStore } from '../stores/mediacollection-store'
import { computed } from 'vue'
import { default as MediaItemThumbnailViewer } from '../components/MediaItemThumbnailViewer.vue'
import { default as ReturnButton } from '../components/ReturnButton.vue'
import RouteAfterTimeout from 'src/components/RouteAfterTimeout.vue'

const props = defineProps({
  standaloneMode: Boolean,
})

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
