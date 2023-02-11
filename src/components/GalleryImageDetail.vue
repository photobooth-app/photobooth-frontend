<template>
  <div class="q-pa-none">
    <swiper :navigation="true" :modules="modules" class="mySwiper">
      <swiper-slide>Slide 1</swiper-slide><swiper-slide>Slide 2</swiper-slide
      ><swiper-slide>Slide 3</swiper-slide><swiper-slide>Slide 4</swiper-slide
      ><swiper-slide>Slide 5</swiper-slide><swiper-slide>Slide 6</swiper-slide
      ><swiper-slide>Slide 7</swiper-slide><swiper-slide>Slide 8</swiper-slide
      ><swiper-slide>Slide 9</swiper-slide>
    </swiper>
    <q-card class="column bg-image" style="width: 100%; height: 100%">
      <q-card-section class="col no-padding" align="center">
        <q-img
          spinner-color="white"
          loading="lazy"
          :src="store.gallery.images[indexSelected]['preview']"
          style="max-width: 100%; max-height: 100%"
          fit="contain"
        >
          <div class="absolute-bottom-left text-subtitle2">
            {{ store.gallery.images[indexSelected].caption }}
          </div>
        </q-img>
      </q-card-section>
    </q-card>

    <q-page-sticky position="top-right" :offset="[30, 30]">
      <div class="q-gutter-sm">
        <vue-qrcode
          type="image/png"
          tag="svg"
          :margin="2"
          :color="{ dark: '#111111', light: '#EEEEEE' }"
          :options="{
            width: 200,
            errorCorrectionLevel: 'high',
          }"
          :value="getImageQrData(indexSelected)"
        />
        <div>Scan to Download!</div>
      </div>
    </q-page-sticky>

    <q-page-sticky position="top-left" :offset="[20, 20]">
      <div class="q-gutter-sm">
        <q-btn color="primary" no-caps to="/">
          <q-icon left size="5em" name="arrow_back_ios_new" />
          <div>Start</div>
        </q-btn>
      </div>
    </q-page-sticky>

    <q-page-sticky position="bottom" :offset="[0, 25]">
      <div class="q-gutter-sm">
        <q-btn v-close-popup color="primary" no-caps>
          <q-icon left size="5em" name="close" />
          <div>back to gallery</div>
        </q-btn>
        <q-btn label="next" @onclick="currentId = 'NEXT'" target="_blank" />
      </div>
    </q-page-sticky>

    <q-page-sticky position="bottom-right" :offset="[35, 35]">
      <q-fab
        direction="up"
        v-model="fabRight"
        vertical-actions-align="right"
        glossy
        icon="keyboard_arrow_up"
      >
        <q-fab-action
          label-position="left"
          icon="delete"
          label="Delete"
          color="negative"
          v-close-popup
          @click="deleteImage(store.gallery.images[indexSelected]['id'])"
        /><q-btn
          label-position="left"
          icon="download"
          label="Download"
          :href="store.gallery.images[indexSelected]['image']"
          target="_blank"
        />
      </q-fab>
    </q-page-sticky>
  </div>
</template>

<script>
import VueQrcode from "vue-qrcode";
import { ref } from "vue";
import { useMainStore } from "../stores/main-store.js";

// import Swiper bundle with all modules installed
import Swiper from "swiper/bundle";

// import styles bundle
import "swiper/css/bundle";

// init Swiper:
const swiper = new Swiper(".swiper", {
  // Optional parameters
  direction: "vertical",
  loop: true,

  // If we need pagination
  pagination: {
    el: ".swiper-pagination",
  },

  // Navigation arrows
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },

  // And if we need scrollbar
  scrollbar: {
    el: ".swiper-scrollbar",
  },
});

export default {
  // name: 'ComponentName',
  props: {
    indexSelected: {
      type: Number,
      required: true,
    },
  },
  beforeCreate() {
    console.log(this.indexSelected);
    //this.currentId = this.index;
  },
  data() {
    return {
      //currentId: "",
    };
  },
  setup() {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      fabRight: ref(false),
    };
  },
  components: {
    VueQrcode,
  },
  methods: {
    deleteImage(id) {
      this.$api
        .get("gallery/delete", { params: { id: id } })
        .then((response) => {
          console.log(response);
          //remove from local store also:
          this.store.gallery.images.splice(this.indexSelected, 1);
        })
        .catch((err) => console.log(err));
    },
    getImageDetail(index, detail = "thumbnail") {
      return this.store.gallery.images[index][detail];
    },
    getImageQrData(index) {
      return String(this.store.serverConfig["EXT_DOWNLOAD_URL"]).replace(
        "{filename}",
        this.store.gallery.images[index]["filename"]
      );
    },
  },
};
</script>
