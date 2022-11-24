<template>
  <q-page padding>
    <div class="row justify-center q-gutter-sm">
      <q-intersection
        :key="item.id"
        once
        v-for="(item, index) in this.store.gallery.images"
        transition="jump-up"
        class="preview-item"
      >
        <q-card class="q-ma-sm" @click="openPic(index)">
          <q-img
            :src="getPic(index)"
            loading="lazy"
            spinner-color="white"
            :ratio="1"
          >
            <div class="absolute-bottom text-subtitle2">
              #{{ index }}: {{ this.store.gallery.images[index].thumbnail }}
            </div>
          </q-img>
        </q-card>
      </q-intersection>
    </div>

    <q-dialog
      transition-show="jump-up"
      transition-hide="jump-down"
      v-model="ImageDetail"
      full-height
      full-width
    >
      <div class="column q-pa-none full-height full-height">
        <q-card class="column" style="width: 100%; height: 100%">
          <q-card-section class="col no-padding" align="center">
            <q-img
              spinner-color="white"
              loading="lazy"
              :src="getPic(this.selected)"
              style="max-width: 100%; max-height: 100%"
              fit="contain"
            >
              <div class="absolute-top-left text-subtitle2">
                {{ this.store.gallery.images[0].thumbnail }}
              </div>
            </q-img>
          </q-card-section>
        </q-card>

        <q-page-sticky position="top" align="right">
          <div class="q-gutter-sm">
            <q-btn flat label="close" v-close-popup />
          </div>
        </q-page-sticky>

        <q-page-sticky position="bottom" :offset="[0, 25]">
          <div class="q-gutter-sm">
            <q-btn v-close-popup color="primary" no-caps>
              <q-icon left size="5em" name="close" />
              <div>Close</div>
            </q-btn>
            <q-btn color="primary" no-caps to="">
              <q-icon left size="5em" name="download" />
              <div>Download</div>
            </q-btn>
            <q-btn color="primary" no-caps to="">
              <q-icon left size="5em" name="qr_code" />
              <div>Download</div>
            </q-btn>
            <q-btn color="primary" no-caps to="">
              <q-icon left size="5em" name="delete" />
              <div>Delete</div>
            </q-btn>
          </div>
        </q-page-sticky>
      </div>
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

export default {
  // name: 'PageName',
  setup() {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      selected: ref(0),
      ImageDetail: ref(false),
    };
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
    getPic(index, type = "thumbnail") {
      return this.store.gallery.images[index][type];
    },
    openPic(index = 0) {
      this.selected = index;
      this.ImageDetail = true;
    },
  },
};
</script>
