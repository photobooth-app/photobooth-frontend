<template>
  <q-page id="gallery-page" padding>
    <div v-if="!isGalleryEmpty" class="row justify-center q-gutter-sm">
      <q-intersection v-for="(item, index) in mediacollectionStore.collection" :key="item.id" once class="preview-item">
        <q-card class="q-ma-xs no-shadow" @click="openPic(index)">
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
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else v-html="configurationStore.getConfigElement('uisettings.GALLERY_EMPTY_MSG')"></div>

    <q-dialog v-model="showImageDetail" transition-show="jump-up" transition-hide="jump-down" maximized>
      <gallery-image-detail
        :item-repository="mediacollectionStore.collection"
        :index-selected="indexSelected"
        class="full-height"
        @close-event="showImageDetail = false"
      ></gallery-image-detail>
    </q-dialog>
  </q-page>
</template>
<script>
import { useMainStore } from '../stores/main-store.js';
import { useConfigurationStore } from '../stores/configuration-store.ts';
import { useMediacollectionStore } from '../stores/mediacollection-store.js';
import { ref } from 'vue';
import GalleryImageDetail from '../components/GalleryImageDetail.vue';

export default {
  // name: 'PageName',
  components: { GalleryImageDetail },
  setup() {
    const store = useMainStore();
    const configurationStore = useConfigurationStore();
    const mediacollectionStore = useMediacollectionStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      configurationStore,
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
  watch: {
    // whenever question changes, this function will run
    itemId(newItemId) {
      const index = this.mediacollectionStore.getIndexOfItemId(newItemId);
      if (index == -1) console.error(`image id not found ${newItemId}`);
      else this.openPic(index);
    },
  },
  mounted() {
    //initially get all images, later use eventstream?
  },
  methods: {
    getImageDetail(index, detail = 'thumbnail') {
      return this.mediacollectionStore.collection[index][detail];
    },

    openPic(index) {
      this.indexSelected = index;
      this.showImageDetail = true;
    },
  },
};
</script>

<style lang="sass" scoped>
.preview-item
  height: 400px
  width: 400px
</style>
