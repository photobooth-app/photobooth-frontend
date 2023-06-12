<template>
  <q-page padding>
    <div class="row justify-center q-gutter-sm">
      <q-intersection :key="item.id" once v-for="(item, index) in this.store.gallery.images" class="preview-item">
        <q-card class="q-ma-sm" @click="openPic(index)">
          <q-img :src="getImageDetail(index)" loading="eager" no-transition no-spinner :ratio="1">
            <div class="absolute-bottom text-subtitle2">
              {{ this.store.gallery.images[index].caption }}
            </div>
          </q-img>
        </q-card>
      </q-intersection>
    </div>

    <q-dialog transition-show="jump-up" transition-hide="jump-down" v-model="showImageDetail" maximized>
      <gallery-image-detail :itemRepository="this.store.gallery.images" :indexSelected="indexSelected"
        class="full-height"></gallery-image-detail>
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
  setup () {
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
      get () {
        console.log(Object.keys(this.store.gallery["images"]).length);
        return Object.keys(this.store.gallery["images"]).length;
      },
    },
    itemId () {
      return this.$route.params.id
    },
  },
  mounted () {
    //initially get all images, later use eventstream?
    this.$api
      .get("/mediacollection/getitems")
      .then((response) => {
        console.log(response);
        this.store.gallery.images = response.data;

        if (this.itemId) {
          console.log(`initial id given, try loading image id: ${this.itemId}`)

          //try find it in the index:
          const imageIndex = this.store.gallery.images.findIndex(item => item.id === this.itemId);
          if (imageIndex != -1) {
            console.log(`found image at index no: ${imageIndex}`)
            this.openPic(imageIndex);
          }
          else {
            console.error(`initial id given not found: ${this.itemId}`);
          }
        }

      })
      .catch((err) => console.log(err));
  },
  methods: {
    getImageDetail (index, detail = "thumbnail") {
      return this.store.gallery.images[index][detail];
    },

    openPic (index) {
      this.indexSelected = index;
      this.showImageDetail = true;
    },
  },
};
</script>
