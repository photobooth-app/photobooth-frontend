<template>
  <q-layout v-if="!emptyRepository" view="hhh Lpr ffr" @click="abortTimer">
    <q-header class="bg-primary text-white">
      <q-toolbar v-if="showToolbar" id="gallery-toolbar" class="toolbar">
        <q-btn dense flat icon="close" size="1.5rem" @click="$emit('closeEvent')" />

        <q-space />

        <q-btn
          v-if="configurationStore.getConfigElement('uisettings.gallery_show_delete', false) || singleItemView"
          flat
          class="q-mr-sm"
          icon="delete"
          :label="$t('BTN_LABEL_GALLERY_DELETE')"
          @click="confirmDeleteFile = true"
        />

        <q-dialog v-model="confirmDeleteFile">
          <q-card id="gallery-confirm-delete-dialog" class="q-pa-sm" style="min-width: 350px">
            <q-card-section class="row items-center" style="flex-wrap: nowrap">
              <q-avatar icon="delete" color="primary" text-color="white" />
              <span class="q-ml-sm">{{ $t('MSG_CONFIRM_DELETE_IMAGE') }}</span>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
              <q-btn
                v-close-popup
                :label="$t('BTN_LABEL_DELETE_IMAGE')"
                color="primary"
                @click="
                  deleteItem(currentSlideId);
                  $emit('closeEvent');
                "
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <q-btn
          v-if="configurationStore.getConfigElement('uisettings.gallery_show_download', false)"
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
          v-if="configurationStore.getConfigElement('uisettings.gallery_show_print', false)"
          flat
          class="q-mr-sm"
          icon="print"
          :label="$t('BTN_LABEL_GALLERY_PRINT')"
          :disabled="!getPrintAvailable(itemRepository[currentSlideIndex]['media_type'])"
          @click="printItem(currentSlideId)"
        />
        <q-btn
          v-if="
            configurationStore.getConfigElement('uisettings.gallery_show_filter', false) &&
            configurationStore.getConfigElement('uisettings.gallery_filter_userselectable', []).length > 0
          "
          flat
          class="q-mr-sm"
          icon="filter"
          :label="$t('BTN_LABEL_GALLERY_FILTER')"
          :disabled="!getFilterAvailable(itemRepository[currentSlideIndex]['media_type'])"
          @click="toggleRightDrawer"
        />

        <q-space />

        <div v-if="!singleItemView" class="q-mr-sm">
          <q-icon name="tag" />
          <span>
            {{ $t('LABEL_ELEMENT_X_OF_Y', { no: currentSlideIndex + 1, total: itemRepository.length }) }}
          </span>
        </div>

        <q-space />

        <div class="q-mr-sm">
          <q-icon name="image" />
          {{ itemRepository[currentSlideIndex]['caption'] }}
        </div>
      </q-toolbar>

      <!-- progress bar to timeout and close -->
      <q-linear-progress
        v-if="displayLinearProgressBar && remainingSeconds > 0"
        id="gallery-linear-progress-bar"
        class="absolute"
        :value="remainingSecondsNormalized"
        animation-speed="200"
        color="grey"
      />
      <!-- progress bar to show waiting to load filter, ... -->
      <q-linear-progress v-if="displayLoadingSpinner" class="absolute" indeterminate animation-speed="2100" color="primary" />
    </q-header>

    <q-drawer
      v-if="
        configurationStore.getConfigElement('uisettings.gallery_show_filter', false) &&
        getFilterAvailable(itemRepository[currentSlideIndex]['media_type']) &&
        showToolbar
      "
      id="gallery-drawer-filters"
      v-model="rightDrawerOpen"
      class="q-pa-sm"
      side="right"
      overlay
      elevated
    >
      <div class="text-center text-overline">{{ $t('Choose your filter') }}</div>
      <q-card
        v-for="filter in configurationStore.getConfigElement('uisettings.gallery_filter_userselectable', [])"
        :key="filter"
        bordered
        class="q-mb-sm no-shadow"
      >
        <q-card-section class="q-pa-none">
          <q-img
            class="rounded-borders"
            loading="lazy"
            :src="`/api/mediaprocessing/preview/${currentSlideId}/${filter}`"
            @click="applyFilter(currentSlideId, filter)"
          >
            <div class="absolute-bottom-right text-subtitle1 text-center" style="padding: 4px; pointer-events: none">{{ filter }}</div>
          </q-img>
        </q-card-section>
      </q-card>
    </q-drawer>

    <q-page-container class="q-pa-none galleryimagedetail full-height">
      <div v-if="singleItemView" class="full-height">
        <q-card class="column no-wrap flex-center full-height q-pa-sm">
          <div v-if="itemRepository[0].media_type != 'video'" class="full-height">
            <img
              :draggable="false"
              class="rounded-borders full-height"
              style="object-fit: contain; max-width: 100%; max-height: 100%"
              :src="itemRepository[0].preview"
            />
          </div>
          <div v-else class="full-height">
            <video
              :draggable="false"
              :src="itemRepository[0].preview"
              class="rounded-borders full-height"
              muted
              autoplay
              style="object-fit: contain; max-width: 100%; max-height: 100%"
              loop
              playsinline
              controls
              controlslist="nofullscreen nodownload noremoteplayback noplaybackrate"
              disablepictureinpicture
            ></video>
          </div>
        </q-card>
      </div>

      <div v-else class="full-height">
        <q-carousel
          v-model="currentSlideId"
          v-touch-swipe.mouse.down="handleSwipeDown"
          class=" "
          style="width: 100%; height: 100%"
          control-type="flat"
          control-color="primary"
          swipeable
          animated
          :autoplay="slideshowTimeout"
          draggable="false"
          :arrows="showToolbar"
          :infinite="true"
          :transition-prev="slideshowUseFade ? 'fade' : 'slide-right'"
          :transition-next="slideshowUseFade ? 'fade' : 'slide-left'"
          @transition="
            (newVal, oldVal) => {
              if (randomOrder) {
                let arrayIndex = slicedImages.findIndex((item) => item.id == newVal);
                currentSlideIndex = rndIncides[arrayIndex];
                // Rotate array to stay in the center
                if (arrayIndex > 2) {
                  // transition to 'next' slide, i.e. one up in array
                  rndIncides = rndIncides.slice(1, 5);
                  rndIncides.push(Math.floor(Math.random() * itemRepository.length));
                } else {
                  // transition to 'prev' slide, i.e. one down in array
                  rndIncides = rndIncides.slice(0, 4);
                  rndIncides.unshift(Math.floor(Math.random() * itemRepository.length));
                }
              } else {
                currentSlideIndex = itemRepository.findIndex((item) => item.id === newVal);
              }
              console.log('Showing slide ', currentSlideIndex);
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
                autoplay
                loop
                muted
                playsinline
                :draggable="false"
                :src="slide.preview"
                class="rounded-borders full-height"
                style="object-fit: contain; max-width: 100%; max-height: 100%"
                controls
                controlslist="nofullscreen nodownload noremoteplayback noplaybackrate"
                disablepictureinpicture
              ></video>
            </div>
          </q-carousel-slide>
        </q-carousel>
      </div>

      <q-page-sticky
        v-if="configurationStore.getConfigElement('uisettings.gallery_show_qrcode', false) && showToolbar"
        position="top-right"
        :offset="[30, 30]"
      >
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
  <!-- eslint-disable-next-line --><!-- this should never be seen actually -->
  <q-layout view="hhh Lpr ffr" v-else>EMPTY</q-layout>
</template>

<script>
import VueQrcode from 'vue-qrcode';
import { ref } from 'vue';
import { useConfigurationStore } from '../stores/configuration-store.ts';
import { openURL } from 'quasar';

export default {
  components: {
    VueQrcode,
  },
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
    showToolbar: {
      // whether to display the toolbar on top
      type: Boolean,
      default: true,
    },
    slideshowTimeout: {
      // ms between automatically displaying next slide
      type: Number,
      default: 0,
    },
    slideshowUseFade: {
      // whether to use 'fade' transition used in automatic slideshow
      type: Boolean,
      default: false,
    },
    randomOrder: {
      // display images in a random order
      type: Boolean,
      default: false,
    },
  },
  emits: ['closeEvent'],
  setup() {
    const configurationStore = useConfigurationStore();
    const rightDrawerOpen = ref(false);

    return {
      // you can return the whole store instance to use it in the template
      configurationStore,
      openURL,
      fabRight: ref(false),
      currentSlideId: ref(''),
      currentSlideIndex: ref(0),
      autoplay: ref(false),
      showFilterDialog: ref(false),
      displayLoadingSpinner: ref(false),
      confirmDeleteFile: ref(false),
      rightDrawerOpen,
      toggleRightDrawer() {
        rightDrawerOpen.value = !rightDrawerOpen.value;
      },
      handleSwipeDown() {
        console.log('TODO: add method to close dialog programmatically');
        // $emit("closeEvent");
      },
    };
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
  computed: {
    emptyRepository() {
      return !this.itemRepository || this.itemRepository.length == 0;
    },
    // a computed getter
    slicedImages() {
      // `this` points to the component instance
      if (!this.randomOrder) {
        var lowerBound = Math.max(0, this.currentSlideIndex - 2);
        var upperBound = Math.max(0, this.currentSlideIndex + 3);
        console.log(this.itemRepository.slice(lowerBound, upperBound));
        return this.itemRepository.slice(lowerBound, upperBound);
      } else {
        this.currentSlideIndex; // force "computed" update
        console.log(this.rndIncides.map((i) => this.itemRepository[i]));
        return this.rndIncides.map((i) => this.itemRepository[i]);
      }
    },
  },
  beforeCreate() {
    if (!this.emptyRepository) {
      if (this.randomOrder) {
        this.rndIncides = Array.from({ length: 5 }, () => Math.floor(Math.random() * this.itemRepository.length));
        this.currentSlideIndex = this.rndIncides[2];
      } else {
        this.currentSlideIndex = this.indexSelected;
      }
      console.log('currentSlideIndex:', this.currentSlideIndex);
      this.currentSlideId = this.itemRepository[this.currentSlideIndex].id;
      //this.currentId = this.index;
    }
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
      await fetch(url, { cache: 'reload', mode: 'no-cors' });

      //now update also current displayed images (some are images, some are in background)
      // drawback: due to ?time file is transferred twice from server. but without there is no good way to force the browser to render new pic
      const time = new Date().getTime();
      document.body.querySelectorAll(`img[src*='${url}']`).forEach((img) => {
        img.src = url + '#' + time;
      });
    },
    applyFilter(id, filter) {
      this.displayLoadingSpinner = true;
      fetch(`/api/mediaprocessing/applyfilter/${id}/${filter}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Server returned ' + response.status);
          }
          const index = this.itemRepository.findIndex((item) => item.id === id);
          this.reloadImg(this.itemRepository[index].full);
          this.reloadImg(this.itemRepository[index].preview);
          this.reloadImg(this.itemRepository[index].thumbnail);
          this.displayLoadingSpinner = false;
        })
        .catch((err) => {
          console.error(err);
          this.displayLoadingSpinner = false;
        });
    },
    deleteItem(id) {
      fetch('/api/mediacollection/delete', {
        method: 'POST',
        body: JSON.stringify({ image_id: id }),
        headers: { 'Content-Type': 'application/json' },
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error('Server returned ' + response.status);
          }
        })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error('There was a problem with the Fetch operation:', error);

          this.$q.notify({
            message: 'Error deleting file! Please check logs and browser console.',
            type: 'negative',
          });
        });
    },
    printItem(id) {
      fetch(`/api/printer/print/${id}/0`, {}) // TODO: print 0 index hardcoded for now!
        .then((response) => {
          if (!response.ok && !(response.status == 425 || response.status == 405)) {
            // throw if not blocked or not disabled because notification events are sent separately for this err.
            throw new Error('Server returned ' + response.status);
          }
        })
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.error('There was a problem with the Fetch operation:', error);

          this.$q.notify({
            message: 'Error printing file! Please check logs and browser console.',
            type: 'negative',
          });
        });
    },
    getPrintAvailable(media_type) {
      return ['image', 'collage', 'collageimage', 'animationimage'].includes(media_type);
    },
    getFilterAvailable(media_type) {
      return ['image', 'collageimage', 'animationimage'].includes(media_type);
    },
    getImageQrData() {
      return this.itemRepository[this.currentSlideIndex]['share_url'];
    },
    abortTimer() {
      clearInterval(this.intervalTimerId);
      this.remainingSeconds = 0;
      this.remainingSecondsNormalized = 0;
    },
    startTimer() {
      var duration = this.configurationStore.getConfigElement('uisettings.AUTOCLOSE_NEW_ITEM_ARRIVED', 0);
      console.log(`starting newitemarrived timer, duration=${duration}`);
      this.remainingSeconds = duration;

      this.intervalTimerId = setInterval(() => {
        this.remainingSecondsNormalized = this.remainingSeconds / duration;

        this.remainingSeconds -= 0.05;

        if (this.remainingSeconds <= 0) {
          clearInterval(this.intervalTimerId);
          this.$router.push({ path: '/' });
        }
      }, 50);
    },
  },
};
</script>

<style lang="scss">
.q-carousel__slide {
  background-size: contain;
  background-repeat: no-repeat;
}
</style>
