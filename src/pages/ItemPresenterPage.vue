<template>
  <q-page id="itempresenter-page" class="q-pa-none fullscreen">
    <gallery-image-detail
      :item-repository="[stateStore.last_captured_mediaitem]"
      :index-selected="0"
      :single-item-view="true"
      :start-timer-on-open="true"
      class="full-height"
      @close-event="userCloseViewer()"
    ></gallery-image-detail>
  </q-page>
</template>

<script lang="ts">
import { useStateStore } from '../stores/state-store'
import GalleryImageDetail from '../components/GalleryImageDetail.vue'

export default {
  // name: 'PageName',
  components: { GalleryImageDetail },
  setup() {
    const stateStore = useStateStore()

    return {
      stateStore,
      GalleryImageDetail,
    }
  },
  data() {
    return {}
  },
  computed: {},
  methods: {
    userCloseViewer() {
      this.$router.push('/')
    },
  },
}
</script>
