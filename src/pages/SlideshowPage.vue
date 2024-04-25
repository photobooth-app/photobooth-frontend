<template>
  <q-page id="slideshow-page" class="full-height">
    <gallery-image-detail
      :show-toolbar="false"
      :slideshow-timeout="5000"
      :slideshow-use-fade="true"
      :item-repository="mediacollectionStore.collection"
      :index-selected="0"
      :random-order="true"
      class="full-height"
    ></gallery-image-detail>
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
