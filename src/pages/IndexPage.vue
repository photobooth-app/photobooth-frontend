<template>
  <q-page class="q-pa-none column items-stretch">
    <div
      id="preview-stream"
      class="col"
      style="background: no-repeat center/100% url('stream.mjpg')"
    >
      <!--<img
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
    />-->
      <q-circular-progress
        show-value
        class="text-light-blue q-ma-md"
        :value="timerCount"
        min="0"
        max="5"
        reverse
        size="150px"
        color="light-blue"
      />
      <q-page-sticky position="bottom" :offset="[0, 25]">
        <div class="q-gutter-sm">
          <q-btn color="primary" no-caps @click="takePicture()">
            <q-icon left size="5em" name="photo_camera" />
            <div>Countdown</div>
          </q-btn>
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
          <q-btn color="secondary" no-caps to="/admin">
            <q-icon left size="5em" name="admin_panel_settings" />
            <div>Admin</div>
          </q-btn>
        </div>
      </q-page-sticky>
    </div>
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
  data() {
    return {
      timerCount: 5,
    };
  },

  watch: {
    timerCount: {
      handler(value) {
        if (value > 0) {
          setTimeout(() => {
            this.timerCount--;
          }, 1000);
        }
      },
      immediate: false, // This ensures the watcher is triggered upon creation
    },
  },
  setup() {
    const $q = useQuasar();

    return { remoteProcedureCall };
  },
  methods: {
    takePicture() {
      this.timerCount = 4;
      remoteProcedureCall("/cmd/arm/countdown");

      // when countdown is 0, pic shall be taken. --> controlled by server, not client. remoteProcedureCall('/cmd/capture')
    },
  },
  computed: {},
  name: "IndexPage",
  components: {},
});
</script>
