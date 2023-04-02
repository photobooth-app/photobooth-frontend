<template>
  <div class="q-pa-none galleryimagedetail">

    <q-carousel class="bg-image" style="width: 100%; height: 100%" control-type="unelevated" control-color="primary"
      swipeable animated v-model="currentSlideId" thumbnails :autoplay="autoplay" draggable="false" arrows
      transition-prev="slide-right" transition-next="slide-left"
      @transition="(newVal, oldVal) => { currentSlideIndex = store.gallery.images.findIndex(item => item.id === newVal); }">
      <q-carousel-slide :img-src="slide.preview" v-for="(slide, index) in slicedImages" :key="slide.id" :name="slide.id">

        <div class="absolute-bottom-left text-subtitle2">
          <div>{{ slide.caption }}</div>
          <div>index: {{ index }}, id: {{ slide.id }}</div>
        </div>
      </q-carousel-slide>
    </q-carousel>

    <q-page-sticky position="top-right" :offset="[30, 30]">
      <div class="q-gutter-sm">
        <vue-qrcode type="image/png" tag="svg" :margin="2" :color="{ dark: '#111111', light: '#EEEEEE' }" :options="{
          width: 200,
          errorCorrectionLevel: 'high',
        }" :value="getImageQrData()" />
      </div>
    </q-page-sticky>

    <q-page-sticky position="top-left" :offset="[20, 20]">
      <div class="q-gutter-sm">
        <q-btn v-close-popup color="primary" no-caps>
          <q-icon left size="5em" name="arrow_back_ios_new" />
          <div>close</div>
        </q-btn>
      </div>
    </q-page-sticky>


    <q-page-sticky position="bottom-right" :offset="[35, 35]">
      <q-fab direction="up" v-model="fabRight" vertical-actions-align="right" glossy color="grey"
        icon="keyboard_arrow_up">
        <q-fab-action label-position="left" icon="delete" label="Delete" color="secondary" v-close-popup
          @click="deleteImage(currentSlideId)" />
        <q-fab-action label-position="left" icon="download" label="Download" color="primary"
          @click="(evt) => { openURL(store.gallery.images[currentSlideIndex]['image']); }" />
        <q-fab-action label-position="left" icon="print" label="Print" color="primary" />
      </q-fab>
    </q-page-sticky>
  </div>
</template>

<style lang="sass" scoped>
  .q-carousel__slide
    background-size: contain
    background-repeat: no-repeat


</style>

<script>
import VueQrcode from "vue-qrcode";
import { ref } from "vue";
import { useMainStore } from "../stores/main-store.js";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";
import { openURL } from 'quasar'

export default {
  // name: 'ComponentName',
  props: {
    indexSelected: {
      //initially to open image
      type: Number,
      required: true,
    },
  },
  computed: {
    // a computed getter
    slicedImages () {
      // `this` points to the component instance
      const window = 5
      var totalItems = this.store.gallery.images.length;
      var lowerBound = Math.max(0, this.currentSlideIndex - 2);
      var upperBound = Math.max(0, this.currentSlideIndex + 3);


      return this.store.gallery.images.slice(lowerBound, upperBound);
    }
  },
  beforeCreate () {
    console.log(this.indexSelected);
    this.currentSlideIndex = this.indexSelected;
    this.currentSlideId = this.store.gallery.images[this.indexSelected].id;
    //this.currentId = this.index;
  },
  data () {
    return {
      //currentId: "",
    };
  },
  setup () {
    const store = useMainStore();
    const uiSettingsStore = useUiSettingsStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
      uiSettingsStore,
      openURL,
      fabRight: ref(false),
      currentSlideId: ref(""),
      currentSlideIndex: ref(0),
      autoplay: ref(false),
    };
  },
  components: {
    VueQrcode,
  },
  methods: {
    deleteImage (id) {
      this.$api
        .get("gallery/delete", { params: { image_id: id } })
        .then((response) => {
          console.log(response);
          //remove from local store also:
          this.store.gallery.images.splice(this.currentSlideIndex, 1);
        })
        .catch((err) => console.log(err));
    },
    getImageDetail (index, detail = "thumbnail") {
      return this.store.gallery.images[index][detail];
    },
    getImageQrData () {
      const link = this.store.gallery.images[this.currentSlideIndex]["ext_download_url"]
      return link;
    },
  },
};
</script>
