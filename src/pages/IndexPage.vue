<template>
  <q-page>
    <img
      src="stream.mjpg"
      style="width: 100%; height: 100%; object-fit: cover"
    />
    <q-btn>capture</q-btn>
    <q-btn>gallery</q-btn>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { ref } from "vue";
import { api } from "boot/axios";
import { useQuasar } from "quasar";

function cmdGet(url) {
  $.get(url, function (data) {
    console.log(data);
  });
}

export default defineComponent({
  setup() {
    const $q = useQuasar();
    const data = ref(null);

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

    return { data, loadData };
  },
  computed: {
    datasetsfull() {
      return {
        datasets: [
          {
            label: "Force",
            backgroundColor: "#f87979",
            data: [
              { x: 1, y: 1 },
              { x: 2, y: 2 },
            ],
          },
        ],
      };
    },
  },
  name: "IndexPage",
  components: {},
});
</script>
