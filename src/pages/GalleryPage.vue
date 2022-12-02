<template>
  <q-page padding>
    {{ numberOfImages }}
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
            loading="lazy"
            spinner-color="white"
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
      <gallery-image-detail :id="selected"></gallery-image-detail>
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
      selected: ref(0),
      showImageDetail: ref(false),
      fabRight: ref(false),
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
    getImageDetail(id, detail = "thumbnail") {
      return this.store.gallery.images[id][detail];
    },

    openPic(id) {
      console.log(id);
      this.selected = id;
      this.showImageDetail = true;
    },
  },
};
</script>
