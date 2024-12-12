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
<script lang="ts">
import { useMainStore } from '../stores/main-store'
import { useConfigurationStore } from '../stores/configuration-store'
import { useMediacollectionStore } from '../stores/mediacollection-store'
import { ref } from 'vue'
import { default as MediaItemThumbnailViewer } from '../components/MediaItemThumbnailViewer.vue'

export default {
  // name: 'PageName',
  components: { MediaItemThumbnailViewer },
  setup() {
    const store = useMainStore()
    const configurationStore = useConfigurationStore()
    const mediacollectionStore = useMediacollectionStore()

    return {
      // you can return the whole store instance to use it in the template
      store,
      configurationStore,
      mediacollectionStore,
      indexSelected: ref(0),
      showImageDetail: ref(false),
    }
  },
  computed: {
    itemId() {
      return this.$route.params.id
    },

    isGalleryEmpty() {
      return this.mediacollectionStore.collection_number_of_items == 0
    },
  },
  watch: {
    // whenever question changes, this function will run
    itemId(newItemId) {
      const index = this.mediacollectionStore.getIndexOfItemId(newItemId)
      if (index == -1) console.error(`image id not found ${newItemId}`)
      else this.openPic(index)
    },
  },
  mounted() {
    //initially get all images, later use eventstream?
  },
  methods: {
    openPic(index: number) {
      this.indexSelected = index
      this.showImageDetail = true
    },
  },
}
</script>

<style lang="sass" scoped>
.preview-item
  height: 400px
  width: 400px
</style>
