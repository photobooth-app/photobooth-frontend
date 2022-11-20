<template>
  <q-page>
    <img
      src="stream.mjpg"
      style="width: 100%; height: 100%; object-fit: cover"
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
