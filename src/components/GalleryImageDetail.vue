<template>
  <q-layout view="hhh Lpr ffr" @click="abortTimer">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-btn dense flat icon="close" v-close-popup />

        <q-space />

        <q-btn v-if="uiSettingsStore.uiSettings.gallery_show_delete" flat class="q-mr-sm" icon="delete" label="Delete"
          v-close-popup @click="deleteItem(currentSlideId)" />
        <q-btn v-if="uiSettingsStore.uiSettings.gallery_show_download" flat class="q-mr-sm" icon="download"
          label="Download" @click="(evt) => {
            openURL(itemRepository[currentSlideIndex]['full']);
          }
            " />
        <q-btn v-if="uiSettingsStore.uiSettings.gallery_show_print" flat class="q-mr-sm" icon="print" label="Print"
          @click="printItem(currentSlideId)" />
        <q-btn
          v-if="uiSettingsStore.uiSettings.gallery_show_filter && uiSettingsStore.uiSettings.gallery_filter_userselectable.length > 0"
          flat class="q-mr-sm" icon="filter" label="Filter" @click="toggleRightDrawer" />

        <q-space />

        <div class="q-mr-sm">
          <q-icon name="tag" />
          <span>{{ currentSlideIndex + 1 }} of
            {{ itemRepository.length }} total</span>
        </div>
        <q-space />
        <div class="q-mr-sm">
          <q-icon name="image" />
          {{ itemRepository[currentSlideIndex]["caption"] }}
        </div>
      </q-toolbar>

      <q-linear-progress :value="remainingSecondsNormalized" animation-speed="200" color="grey"
        v-if="displayLinearProgressBar && remainingSeconds > 0" />
    </q-header>

    <q-drawer v-if="uiSettingsStore.uiSettings.gallery_show_filter" v-model="rightDrawerOpen" side="right" elevated
      overlay>
      <q-img v-bind:src="`/mediaprocessing/preview/${currentSlideId}/${filter}`" :key="filter"
        @click="applyFilter(currentSlideId, filter)"
        v-for="filter in uiSettingsStore.uiSettings.gallery_filter_userselectable">
        <div class="absolute-bottom-left text-subtitle2">
          {{ filter }}
        </div>
      </q-img>
    </q-drawer>

    <q-page-container class="q-pa-none galleryimagedetail full-height">
      <q-carousel class="bg-image" style="width: 100%; height: 100%" control-type="flat" control-color="primary" swipeable
        v-touch-swipe.mouse.down="handleSwipeDown" animated v-model="currentSlideId" thumbnails :autoplay="autoplay"
        draggable="false" arrows transition-prev="slide-right" transition-next="slide-left" @transition="(newVal, oldVal) => {
          currentSlideIndex = itemRepository.findIndex(
            (item) => item.id === newVal
          );
          abortTimer();
        }
          ">
        <q-carousel-slide :img-src="slide.preview" v-for="slide in slicedImages" :key="slide.id" :name="slide.id" />
      </q-carousel>

      <q-page-sticky position="top-right" :offset="[30, 30]">
        <div class="q-gutter-sm">
          <vue-qrcode type="image/png" tag="svg" :margin="2" :width="200" error-correction-level="low"
            :color="{ dark: '#111111', light: '#EEEEEE' }" :value="getImageQrData()" />
        </div>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
</template>

<style lang="sass" scoped>
.q-carousel__slide
  background-size: contain
  background-repeat: no-repeat
</style>

<script>
import VueQrcode from "vue-qrcode";
import { ref } from "vue";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";
import { openURL, useQuasar } from "quasar";


export default {
  // name: 'ComponentName',
  props: {
    indexSelected: {
      //initially to open image
      type: Number,
      required: true,
    },
    itemRepository: {
      //repo to display
      type: Array,
      required: true,
    },
  },
  computed: {
    // a computed getter
    slicedImages () {
      // `this` points to the component instance
      const window = 5;
      var totalItems = this.itemRepository.length;
      var lowerBound = Math.max(0, this.currentSlideIndex - 2);
      var upperBound = Math.max(0, this.currentSlideIndex + 3);

      return this.itemRepository.slice(lowerBound, upperBound);
    },
  },
  beforeCreate () {
    console.log(this.indexSelected);
    this.currentSlideIndex = this.indexSelected;
    this.currentSlideId = this.itemRepository[this.indexSelected].id;
    //this.currentId = this.index;
  },
  data () {
    return {
      //currentId: "",
      intervalTimerId: null,
      remainingSeconds: 0,
      remainingSecondsNormalized: 0,
      displayLinearProgressBar: true,
    };
  },
  setup () {
    const uiSettingsStore = useUiSettingsStore();
    const rightDrawerOpen = ref(false);
    const $q = useQuasar();

    return {
      // you can return the whole store instance to use it in the template
      uiSettingsStore,
      openURL,
      fabRight: ref(false),
      currentSlideId: ref(""),
      currentSlideIndex: ref(0),
      autoplay: ref(false),
      showFilterDialog: ref(false),
      rightDrawerOpen,
      toggleRightDrawer () {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },
      handleSwipeDown ({ evt }) {
        console.log("TODO: add method to close dialog programmatically");
      },
    };
  },
  components: {
    VueQrcode,
  },
  mounted () {
    this.startTimer();
  },
  beforeUnmount () {
    clearInterval(this.intervalTimerId);
  },

  methods: {
    //https://stackoverflow.com/questions/1077041/refresh-image-with-a-new-one-at-the-same-url/66312176#66312176
    async reloadImg (url) {
      // fetch to update cache on regular images, if we do not fetch, on next gallery visit old images are displayed
      await fetch(url, { cache: "reload", mode: "no-cors" });

      //now update also current displayed images (some are images, some are in background)
      // drawback: due to ?time file is transferred twice from server. but without there is no good way to force the browser to render new pic
      const time = new Date().getTime();
      document.body.querySelectorAll(`img[src*='${url}']`).forEach((img) => {
        img.src = url + "?" + time;
      });
      document.body
        .querySelectorAll(`div[style*="background-image"][style*="${url}"]`)
        .forEach((div) => (div.style.backgroundImage = `url(${url}?${time})`));
    },
    applyFilter (id, filter) {
      this.$api
        .get(`/mediaprocessing/applyfilter/${id}/${filter}`)
        .then((response) => {
          const index = this.itemRepository.findIndex((item) => item.id === id);
          this.reloadImg(this.itemRepository[index].full);
          this.reloadImg(this.itemRepository[index].preview);
          this.reloadImg(this.itemRepository[index].thumbnail);
        })
        .catch((err) => console.log(err));
    },
    deleteItem (id) {
      this.$api
        .get("/mediacollection/delete", { params: { image_id: id } })
        .then((response) => {
          console.log(response);
          //remove from local store also:
          // TODO:
          // eslint-disable-next-line vue/no-mutating-props
          this.itemRepository.splice(this.currentSlideIndex, 1);
        })
        .catch((err) => console.log(err));
    },
    printItem (id) {
      this.$api
        .get(`/print/item/${id}`)
        .then((response) => {
          console.log(response);
          this.$q.notify({
            message: "Started printing...",
            type: "positive",
            spinner: true,
            //timeout: 2000
          });
        })
        .catch((error) => {
          if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response);

            if (error.response.status == 425) {
              this.$q.notify({
                message: error.response.data['detail'],
                caption: "Print Service",
                type: "info"
              });
            } else {
              this.$q.notify({
                message: error.response.data['detail'],
                caption: "Print Service",
                type: "negative"
              });
            }
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.error(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error', error.message);
          }
          //console.error(error.config);
        });
    },
    getImageDetail (index, detail = "thumbnail") {
      return this.itemRepository[index][detail];
    },
    getImageQrData () {
      return this.itemRepository[this.currentSlideIndex]['share_url'];
    },
    abortTimer () {
      clearInterval(this.intervalTimerId);
      this.remainingSeconds = 0;
      this.remainingSecondsNormalized = 0;
    },
    startTimer () {
      var duration =
        this.uiSettingsStore.uiSettings["AUTOCLOSE_NEW_ITEM_ARRIVED"];
      console.log(`starting newitemarrived timer, duration=${duration}`);
      this.remainingSeconds = duration;

      this.intervalTimerId = setInterval(() => {
        this.remainingSecondsNormalized = this.remainingSeconds / duration;

        this.remainingSeconds -= 0.05;

        if (this.remainingSeconds <= 0) {
          clearInterval(this.intervalTimerId);
          this.$router.push({ path: "/" });
        }
      }, 50);
    },
  },
};
</script>
