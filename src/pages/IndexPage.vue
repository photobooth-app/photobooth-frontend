<template>
  <q-page class="q-pa-none column items-stretch">
    <img
      src="stream.mjpg"
      class="col"
      style="
        min-width: 100%;
        min-height: 100%;
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
        object-position: center;
      "
    />
    <q-page-sticky position="bottom" :offset="[0, 25]">
      <div class="q-gutter-sm">
        <q-btn
          color="primary"
          no-caps
          @click="remoteProcedureCall('/cmd/capture')"
        >
          <q-icon left size="5em" name="photo_camera" />
          <div>Take<br />Picture!</div>
        </q-btn>
        <q-btn color="primary" no-caps to="/gallery">
          <q-icon left size="5em" name="photo_library" />
          <div>Gallery</div>
        </q-btn>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { defineComponent } from "vue";
import { ref } from "vue";
import { api, remoteProcedureCall } from "boot/axios";
import { useQuasar } from "quasar";

function cmdGet(url) {
  $.get(url, function (data) {
    console.log(data);
  });
}

export default defineComponent({
  setup() {
    const $q = useQuasar();

    return { remoteProcedureCall };
  },
  computed: {},
  name: "IndexPage",
  components: {},
});
</script>
