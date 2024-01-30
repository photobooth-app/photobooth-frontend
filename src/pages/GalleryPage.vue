<template>
  <q-page padding>
    <div v-if="!isGalleryEmpty" class="row justify-center q-gutter-sm">
      <q-intersection :key="item.id" once v-for="(item, index) in this.mediacollectionStore.collection" class="preview-item">
        <q-card class="q-ma-sm" @click="openPic(index)">
          <div v-if="item.media_type != 'video'">
            <q-img :src="getImageDetail(index)" loading="eager" no-transition no-spinner :ratio="1" class="rounded-borders"> </q-img>
          </div>
          <div v-else>
            <!-- mimic the q-img for video-elements to make it look same as images but display mp4 gif-like-->
            <div style="padding-bottom: 100%"></div>
            <div class="absolute-full">
              <video
                style="width: 100%; height: 100%; object-fit: cover; object-position: 50% 50%"
                autoplay
                loop
                muted
                playsinline
                :src="getImageDetail(index)"
                class="rounded-borders"
              ></video>
            </div>
          </div>
        </q-card>
      </q-intersection>
    </div>
    <div v-else v-html="uiSettingsStore.uiSettings.GALLERY_EMPTY_MSG"></div>

    <q-dialog transition-show="jump-up" transition-hide="jump-down" v-model="showImageDetail" maximized>
      <gallery-image-detail
        @close-event="showImageDetail = false"
        :itemRepository="this.mediacollectionStore.collection"
        :indexSelected="indexSelected"
        :deleteButtonLabel="uiSettingsStore.uiSettings.DELETE_BUTTON_TEXT"
        :downloadButtonLabel="uiSettingsStore.uiSettings.DOWNLOAD_BUTTON_TEXT"
        :filterButtonLabel="uiSettingsStore.uiSettings.FILTER_BUTTON_TEXT"
        :printButtonLabel="uiSettingsStore.uiSettings.PRINT_BUTTON_TEXT"
        class="full-height"
      ></gallery-image-detail>
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
  setup() {
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
    itemId() {
      return this.$route.params.id;
    },

    isGalleryEmpty() {
      return this.mediacollectionStore.collection_number_of_items == 0;
    },
  },
  mounted() {
    //initially get all images, later use eventstream?
  },
  watch: {
    // whenever question changes, this function will run
    itemId(newItemId, oldItemId) {
      const index = this.mediacollectionStore.getIndexOfItemId(newItemId);
      if (index == -1) console.error(`image id not found ${newItemId}`);
      else this.openPic(index);
    },
  },
  methods: {
    getImageDetail(index, detail = "thumbnail") {
      return this.mediacollectionStore.collection[index][detail];
    },

    openPic(index) {
      this.indexSelected = index;
      this.showImageDetail = true;
    },
  },
};
</script>
