<template>
  <q-page id="slideshow-page" class="full-height">
    <gallery-image-detail
      v-if="mediacollectionStore.collection.length > 0"
      :show-toolbar="false"
      :slideshow-timeout="5000"
      :slideshow-use-fade="true"
      :item-repository="mediacollectionStore.collection"
      :index-selected="0"
      :random-order="true"
      class="full-height"
    ></gallery-image-detail>
    <div v-else>
      <div class="fullscreen bg-blue text-white text-center q-pa-md flex flex-center">
        <div>
          <!-- eslint-disable-next-line -->
          <div class="text-h2" style="opacity: 0.4">
            {{ $t('MSG_ERROR_NOT_FOUND') }}
          </div>

          <q-btn class="q-mt-xl" color="white" text-color="blue" unelevated to="/" label="Go Home" no-caps />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script>
import { useMediacollectionStore } from '../stores/mediacollection-store.js';
import GalleryImageDetail from '../components/GalleryImageDetail.vue';

export default {
  components: { GalleryImageDetail },
  setup() {
    const mediacollectionStore = useMediacollectionStore();

    return {
      mediacollectionStore,
    };
  },
};
</script>
