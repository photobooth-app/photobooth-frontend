<template>
  <q-page padding>
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

    return { loadData, store };
  },
};
</script>
