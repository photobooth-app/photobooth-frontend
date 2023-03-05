<template>
  <q-page padding>
    <div class="row justify-center q-gutter-sm">
      <q-intersection
        :key="item.id"
        once
        v-for="(item, index) in this.store.gallery.images"
        class="preview-item"
      >
        <q-card class="q-ma-sm" @click="openPic(index)">
          <q-img
            :src="getImageDetail(index)"
            loading="eager"
            no-transition
            no-spinner
            :ratio="1"
          >
            <div class="absolute-bottom text-subtitle2">
              {{ this.store.gallery.images[index].caption }}
            </div>
          </q-img>
        </q-card>
      </q-intersection>
    </div>

    <q-dialog
      transition-show="jump-up"
      transition-hide="jump-down"
      v-model="showImageDetail"
      full-height
      full-width
    >
      <gallery-image-detail
        :indexSelected="indexSelected"
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
import { ref } from "vue";
import GalleryImageDetail from "../components/GalleryImageDetail";

export default {
  // name: 'PageName',
  components: { GalleryImageDetail },
  setup() {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      GalleryImageDetail,
      indexSelected: ref(null),
      showImageDetail: ref(false),
    };
  },
  computed: {
    numberOfImages: {
      get() {
        console.log(Object.keys(this.store.gallery["images"]).length);
        return Object.keys(this.store.gallery["images"]).length;
      },
    },
  },
  mounted() {
    //initially get all images, later use eventstream?
    this.$api
      .get("gallery/images")
      .then((response) => {
        console.log(response);
        this.store.gallery.images = response.data;
      })
      .catch((err) => console.log(err));
  },
  methods: {
    getImageDetail(index, detail = "thumbnail") {
      return this.store.gallery.images[index][detail];
    },

    openPic(index) {
      console.log(index);
      this.indexSelected = index;
      this.showImageDetail = true;
    },
  },
};
</script>
