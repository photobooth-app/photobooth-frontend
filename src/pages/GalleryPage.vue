<template>
  <q-page padding>

    <div v-if="!isGalleryEmpty" class="row justify-center q-gutter-sm">
      <q-intersection :key="item.id" once v-for="(item, index) in this.mediacollectionStore.collection"
        class="preview-item">
        <q-card class="q-ma-sm" @click="openPic(index)">
          <q-img :src="getImageDetail(index)" loading="eager" no-transition no-spinner :ratio="1">
            <div class="absolute-bottom text-subtitle2">
              {{ this.mediacollectionStore.collection[index].caption }}
            </div>
          </q-img>
        </q-card>
      </q-intersection>
    </div>
    <div v-else v-html="uiSettingsStore.uiSettings.GALLERY_EMPTY_MSG"></div>



    <q-dialog transition-show="jump-up" transition-hide="jump-down" v-model="showImageDetail" maximized>
      <gallery-image-detail @close-event="showImageDetail = false" :itemRepository="this.mediacollectionStore.collection"
        :indexSelected="indexSelected" class="full-height"></gallery-image-detail>
    </q-dialog>
  </q-page>
</template>
<style lang="sass" scoped>
.preview-item
  height: 400px
  width: 400px
</style>

<script>
import { useMainStore } from "../stores/main-store.js";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";
import { useMediacollectionStore } from "../stores/mediacollection-store.js";
import { ref } from "vue";
import GalleryImageDetail from "../components/GalleryImageDetail";

export default {
  // name: 'PageName',
  components: { GalleryImageDetail },
  setup () {
    const store = useMainStore();
    const uiSettingsStore = useUiSettingsStore();
    const mediacollectionStore = useMediacollectionStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      uiSettingsStore,
      mediacollectionStore,
      GalleryImageDetail,
      indexSelected: ref(null),
      showImageDetail: ref(false),
    };
  },
  computed: {

    itemId () {
      return this.$route.params.id
    },

    isGalleryEmpty () {
      return this.mediacollectionStore.collection_number_of_items == 0
    },
  },
  mounted () {
    //initially get all images, later use eventstream?

  },
  watch: {
    // whenever question changes, this function will run
    itemId (newItemId, oldItemId) {
      const index = this.mediacollectionStore.getIndexOfItemId(newItemId);
      if (index == -1)
        console.error(`image id not found ${newItemId}`);
      else
        this.openPic(index);
    }
  },
  methods: {
    getImageDetail (index, detail = "thumbnail") {
      return this.mediacollectionStore.collection[index][detail];
    },

    openPic (index) {
      this.indexSelected = index;
      this.showImageDetail = true;
    },
  },
};
</script>
