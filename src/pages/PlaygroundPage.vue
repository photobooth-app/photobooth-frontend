<template>
  <q-page padding>
    <div class="q-pa-md">
      <q-btn color="purple" @click="showNotif" label="Show Notification" />
    </div>
    <div class="q-pa-md">
      <q-carousel
        swipeable
        animated
        v-model="slide"
        thumbnails
        infinite
        :autoplay="autoplay"
        draggable="false"
        arrows
        transition-prev="slide-right"
        transition-next="slide-left"
      >
        <q-carousel-slide
          :name="1"
          img-src="https://cdn.quasar.dev/img/mountains.jpg"
        />
        <q-carousel-slide
          :name="2"
          img-src="https://cdn.quasar.dev/img/parallax1.jpg"
        />
        <q-carousel-slide
          :name="3"
          img-src="https://cdn.quasar.dev/img/parallax2.jpg"
        />
        <q-carousel-slide
          :name="4"
          img-src="https://cdn.quasar.dev/img/quasar.jpg"
        /><q-carousel-slide
          :name="4"
          img-src="https://cdn.quasar.dev/img/quasar.jpg"
        /><q-carousel-slide
          :name="4"
          img-src="https://cdn.quasar.dev/img/quasar.jpg"
        /><q-carousel-slide
          :name="4"
          img-src="https://cdn.quasar.dev/img/quasar.jpg"
        /><q-carousel-slide
          :name="4"
          img-src="https://cdn.quasar.dev/img/quasar.jpg"
        /><q-carousel-slide
          :name="4"
          img-src="https://cdn.quasar.dev/img/quasar.jpg"
        /><q-carousel-slide
          :name="4"
          img-src="https://cdn.quasar.dev/img/quasar.jpg"
        />
      </q-carousel>
    </div>

    capture:
    <a id="countdown" href="javascript:cmdGet('/cmd/infoled/countdown')"
      >countdown</a
    ><br />

    <form target="_blank" method="post" action="/cmd/capture">
      <input type="text" name="filename" value="test.jpeg" /><input
        type="submit"
        value="take hq pic"
      />
    </form>

    Last Focuser Run results
    <LineChart :chart-data="datasetsfull" />
    <div style="width: 500px">
      <canvas id="myChart"></canvas>
    </div>
  </q-page>
</template>

<script>
import { ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";
import { useMainStore } from "../stores/main-store.js";

export default {
  // name: 'PageName',
  setup() {
    const $q = useQuasar();
    const store = useMainStore();

    function loadData(url) {
      api
        .get(url)
        .then((response) => {
          data.value = response.data;
          console.log(response);
        })
        .catch(() => {
          console.log("error");
        });
    }

    return {
      loadData,
      store,
      slide: ref(1),
      autoplay: ref(false),
      showNotif() {
        $q.notify({
          message: "Jim pinged you.",
          color: "purple",
        });
      },
    };
  },
};
</script>
