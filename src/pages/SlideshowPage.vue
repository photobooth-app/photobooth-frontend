<template>
  <q-page class="full-height">
    <gallery-image-detail
      :showToolbar="false"
      :slideshowTimeout="5000"
      :slideshowUseFade="true"
      :itemRepository="this.mediacollectionStore.collection"
      :indexSelected="0"
      :randomOrder="true"
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
