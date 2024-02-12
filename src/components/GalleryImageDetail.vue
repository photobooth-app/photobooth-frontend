<template>
  <q-layout view="hhh Lpr ffr" @click="abortTimer" v-if="!emptyRepository">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar class="toolbar" id="gallery-toolbar">
        <q-btn dense flat icon="close" size="1.5rem" @click="$emit('closeEvent')" />

        <q-space />

        <q-btn
          v-if="uiSettingsStore.uiSettings.gallery_show_delete || singleItemView"
          flat
          class="q-mr-sm"
          icon="delete"
          :label="$t('BTN_LABEL_GALLERY_DELETE')"
          @click="confirmDeleteFile = true"
        />

        <q-dialog v-model="confirmDeleteFile">
          <q-card class="q-pa-sm" style="min-width: 350px" id="gallery-confirm-delete-dialog">
            <q-card-section class="row items-center">
              <q-avatar icon="delete" color="primary" text-color="white" />
              <span class="q-ml-sm" v-html="$t('MSG_CONFIRM_DELETE_IMAGE')"></span>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn flat :label="$t('BTN_LABEL_CANCEL')" v-close-popup />
              <q-btn
                :label="$t('BTN_LABEL_DELETE_IMAGE')"
                color="primary"
                v-close-popup
                @click="
                  deleteItem(currentSlideId);
                  $emit('closeEvent');
                "
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-btn
          v-if="uiSettingsStore.uiSettings.gallery_show_download"
          flat
          class="q-mr-sm"
          icon="download"
          :label="$t('BTN_LABEL_GALLERY_DOWNLOAD')"
          @click="
            (evt) => {
              openURL(itemRepository[currentSlideIndex]['full']);
            }
          "
        />
        <q-btn
          v-if="uiSettingsStore.uiSettings.gallery_show_print"
          flat
          class="q-mr-sm"
          icon="print"
          :label="$t('BTN_LABEL_GALLERY_PRINT')"
          @click="printItem(currentSlideId)"
        />
        <q-btn
          v-if="uiSettingsStore.uiSettings.gallery_show_filter && uiSettingsStore.uiSettings.gallery_filter_userselectable.length > 0"
          flat
          class="q-mr-sm"
          icon="filter"
          :label="$t('BTN_LABEL_GALLERY_FILTER')"
          :disabled="!getFilterAvailable(itemRepository[currentSlideIndex]['media_type'])"
          @click="toggleRightDrawer"
        />

        <q-space />

        <div class="q-mr-sm" v-if="!singleItemView">
          <q-icon name="tag" />
          <span>{{ currentSlideIndex + 1 }} / {{ itemRepository.length }} </span>
        </div>
        <q-space />
        <div class="q-mr-sm">
          <q-icon name="image" />
          {{ itemRepository[currentSlideIndex]["caption"] }}
        </div>
      </q-toolbar>

      <!-- progress bar to timeout and close -->
      <q-linear-progress
        class="absolute"
        :value="remainingSecondsNormalized"
        animation-speed="200"
        color="grey"
        id="gallery-linear-progress-bar"
        v-if="displayLinearProgressBar && remainingSeconds > 0"
      />
      <!-- progress bar to show waiting to load filter, ... -->
      <q-linear-progress class="absolute" indeterminate animation-speed="2100" color="primary" v-if="displayLoadingSpinner" />
    </q-header>

    <q-drawer
      class="q-pa-sm"
      v-if="uiSettingsStore.uiSettings.gallery_show_filter && getFilterAvailable(itemRepository[currentSlideIndex]['media_type'])"
      v-model="rightDrawerOpen"
      side="right"
      overlay
      id="gallery-drawer-filters"
    >
      <q-card class="q-mb-sm" :key="filter" v-for="filter in uiSettingsStore.uiSettings.gallery_filter_userselectable">
        <q-card-section class="q-pa-sm">
          <q-img
            class="rounded-borders"
            loading="lazy"
            @click="applyFilter(currentSlideId, filter)"
            v-bind:src="`/mediaprocessing/preview/${currentSlideId}/${filter}`"
          >
          </q-img>
        </q-card-section>

        <q-card-section class="q-pa-none q-pb-sm" align="center">
          <div class="text-subtitle2">{{ filter }}</div>
        </q-card-section>
      </q-card>
    </q-drawer>

    <q-page-container class="q-pa-none galleryimagedetail full-height">
      <div v-if="singleItemView" class="full-height">
        <q-card class="column no-wrap flex-center full-height q-pa-sm">
          <div v-if="this.itemRepository[0].media_type != 'video'" class="full-height">
            <img
              :draggable="false"
              class="rounded-borders full-height"
              style="object-fit: contain; max-width: 100%; max-height: 100%"
              :src="this.itemRepository[0].preview"
            />
          </div>
          <div v-else class="full-height">
            <video
              :draggable="false"
              :src="this.itemRepository[0].preview"
              class="rounded-borders full-height"
              muted
              autoplay
              style="object-fit: contain; max-width: 100%; max-height: 100%"
              controls="controls"
            ></video>
          </div>
        </q-card>
      </div>

      <div v-else class="full-height">
        <q-carousel
          class=" "
          style="width: 100%; height: 100%"
          control-type="flat"
          control-color="primary"
          swipeable
          v-touch-swipe.mouse.down="handleSwipeDown"
          animated
          v-model="currentSlideId"
          :autoplay="autoplay"
          draggable="false"
          arrows
          infinite
          transition-prev="slide-right"
          transition-next="slide-left"
          @transition="
            (newVal, oldVal) => {
              currentSlideIndex = itemRepository.findIndex((item) => item.id === newVal);
              abortTimer();
            }
          "
        >
          <q-carousel-slide v-for="slide in slicedImages" :key="slide.id" :name="slide.id" class="column no-wrap flex-center full-height q-pa-sm">
            <div v-if="slide.media_type != 'video'" class="full-height">
              <img
                :draggable="false"
                class="rounded-borders full-height"
                style="object-fit: contain; max-width: 100%; max-height: 100%"
                :src="slide.preview"
              />
            </div>
            <div v-else class="full-height">
              <video
                :draggable="false"
                :src="slide.preview"
                class="rounded-borders full-height"
                style="object-fit: contain; max-width: 100%; max-height: 100%"
                controls="controls"
              ></video>
            </div>
          </q-carousel-slide>
        </q-carousel>
      </div>

      <q-page-sticky v-if="uiSettingsStore.uiSettings.gallery_show_qrcode" position="top-right" :offset="[30, 30]">
        <div>
          <vue-qrcode
            type="image/png"
            tag="svg"
            :margin="2"
            :width="200"
            error-correction-level="low"
            :color="{ dark: '#111111', light: '#EEEEEE' }"
            :value="getImageQrData()"
          />
        </div>
      </q-page-sticky>
    </q-page-container>
  </q-layout>
  <q-layout view="hhh Lpr ffr" v-else>EMPTY</q-layout>
</template>

<style lang="scss">
.q-carousel,
.q-drawer {
  background: linear-gradient(120deg, rgba(245, 245, 245, 1) 0%, rgb(227, 229, 240) 50%, rgb(245, 245, 245) 100%);
}

.q-carousel__slide {
  background-size: contain;
  background-repeat: no-repeat;
}
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
      //repo to display / array or single item
      type: Array,
      required: true,
    },
    startTimerOnOpen: {
      //start timer to auto-close
      type: Boolean,
      required: false,
      default: false,
    },
    singleItemView: {
      // viewing single captured file, dont load carousel. used for itempresenter on approval during job processing.
      type: Boolean,
      default: false,
    },
  },
  computed: {
    emptyRepository() {
      return !this.itemRepository || this.itemRepository.length == 0;
    },
    // a computed getter
    slicedImages() {
      // `this` points to the component instance
      console.log("changed");
      const window = 5;
      var totalItems = this.itemRepository.length;
      var lowerBound = Math.max(0, this.currentSlideIndex - 2);
      var upperBound = Math.max(0, this.currentSlideIndex + 3);
      console.log(this.itemRepository.slice(lowerBound, upperBound));
      return this.itemRepository.slice(lowerBound, upperBound);
    },
  },
  beforeCreate() {
    console.log(this.indexSelected);
    this.currentSlideIndex = this.indexSelected;
    this.currentSlideId = this.itemRepository[this.indexSelected].id;
    //this.currentId = this.index;
  },
  data() {
    return {
      //currentId: "",
      intervalTimerId: null,
      remainingSeconds: 0,
      remainingSecondsNormalized: 0,
      displayLinearProgressBar: true,
    };
  },
  setup() {
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
      displayLoadingSpinner: ref(false),
      confirmDeleteFile: ref(false),
      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },
      handleSwipeDown({ evt }) {
        console.log("TODO: add method to close dialog programmatically");
        // $emit("closeEvent");
      },
    };
  },
  components: {
    VueQrcode,
  },
  mounted() {
    if (this.startTimerOnOpen) this.startTimer();
  },
  beforeUnmount() {
    clearInterval(this.intervalTimerId);
  },

  methods: {
    //https://stackoverflow.com/questions/1077041/refresh-image-with-a-new-one-at-the-same-url/66312176#66312176
    async reloadImg(url) {
      // fetch to update cache on regular images, if we do not fetch, on next gallery visit old images are displayed
      await fetch(url, { cache: "reload", mode: "no-cors" });

      //now update also current displayed images (some are images, some are in background)
      // drawback: due to ?time file is transferred twice from server. but without there is no good way to force the browser to render new pic
      const time = new Date().getTime();
      document.body.querySelectorAll(`img[src*='${url}']`).forEach((img) => {
        img.src = url + "#" + time;
      });
    },
    applyFilter(id, filter) {
      this.displayLoadingSpinner = true;
      this.$api
        .get(`/mediaprocessing/applyfilter/${id}/${filter}`)
        .then((response) => {
          const index = this.itemRepository.findIndex((item) => item.id === id);
          this.reloadImg(this.itemRepository[index].full);
          this.reloadImg(this.itemRepository[index].preview);
          this.reloadImg(this.itemRepository[index].thumbnail);
          this.displayLoadingSpinner = false;
        })
        .catch((err) => {
          console.log(err);
          this.displayLoadingSpinner = false;
        });
    },
    deleteItem(id) {
      this.$api
        .get("/mediacollection/delete", { params: { image_id: id } })
        .then((response) => {
          console.log(response);
          // no need to delete here - we get SSE notification once deleted
        })
        .catch((err) => console.log(err));
    },
    printItem(id) {
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
                message: error.response.data["detail"],
                caption: "Print Service",
                type: "info",
              });
            } else {
              this.$q.notify({
                message: error.response.data["detail"],
                caption: "Print Service",
                type: "negative",
              });
            }
          } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.error(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            console.error("Error", error.message);
          }
          //console.error(error.config);
        });
    },
    getFilterAvailable(media_type) {
      return ["image", "collageimage", "animationimage"].includes(media_type);
    },
    getImageQrData() {
      return this.itemRepository[this.currentSlideIndex]["share_url"];
    },
    abortTimer() {
      clearInterval(this.intervalTimerId);
      this.remainingSeconds = 0;
      this.remainingSecondsNormalized = 0;
    },
    startTimer() {
      var duration = this.uiSettingsStore.uiSettings["AUTOCLOSE_NEW_ITEM_ARRIVED"];
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
