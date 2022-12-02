<template>
  <div class="column q-pa-none full-height full-height">
    <q-card class="column bg-image" style="width: 100%; height: 100%">
      <q-card-section class="col no-padding" align="center">
        <q-img
          spinner-color="white"
          loading="lazy"
          :src="store.gallery.images[id]['preview']"
          style="max-width: 100%; max-height: 100%"
          fit="contain"
        >
          <div class="absolute-bottom-left text-subtitle2">
            {{ store.gallery.images[id].caption }}
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
          :value="getImageQrData(id)"
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
          @click="deleteImage(id)"
        /><q-btn
          label-position="left"
          icon="download"
          label="Download"
          :href="store.gallery.images[id]['image']"
          target="_blank"
        />
      </q-fab>
    </q-page-sticky>
  </div>
</template>

<script>
import VueQrcode from "vue-qrcode";
import { useMainStore } from "../stores/main-store.js";

export default {
  // name: 'ComponentName',
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  setup() {
    const store = useMainStore();

    return {
      // you can return the whole store instance to use it in the template
      store,
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
          delete this.store.gallery.images[id];
          //this.store.gallery.images = response.data;
        })
        .catch((err) => console.log(err));
    },
    getImageDetail(id, detail = "thumbnail") {
      return this.store.gallery.images[id][detail];
    },
    getImageQrData(id) {
      return String(this.store.serverConfig["EXT_DOWNLOAD_URL"]).replace(
        "{filename}",
        this.store.gallery.images[id]["filename"]
      );
    },
  },
};
</script>
