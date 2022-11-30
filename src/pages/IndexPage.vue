<template>
  <q-page class="q-pa-none column items-stretch">
    <div id="preview-stream" style="background-image: url('stream.mjpg')">
      <countdown-timer
        ref="countdowntimer"
        :duration="5"
        :countdownOffset="0.5"
      ></countdown-timer>

      <div
        style="position: absolute; width: 100%; height: 100%"
        id="frontpage_text"
        v-html="store.serverConfig['UI_FRONTPAGE_TEXT']"
      ></div>
      <q-page-sticky position="bottom" :offset="[0, 25]">
        <div class="q-gutter-sm">
          <q-btn color="primary" no-caps @click="takePicture()">
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
import { useMainStore } from "../stores/main-store.js";
import CountdownTimer from "../components/CountdownTimer";

export default defineComponent({
  components: { CountdownTimer },

  setup() {
    const $q = useQuasar();
    const store = useMainStore();
    const countdowntimer = ref(null);
    function takePicture() {
      const countdowntimerRef = countdowntimer.value;
      countdowntimerRef.startTimer();
      remoteProcedureCall("/chose/1pic");
    }
    return { store, remoteProcedureCall, countdowntimer, takePicture };
  },
  /*
  methods: {
    takePicture() {
      //this.countdownTimer.startTimer();
      //this.countdowntimer.duration = 5;
      const countdowntimerRef = countdowntimer.value;
      countdowntimerRef.startTimer();
      remoteProcedureCall("/chose/1pic");
    },
  },*/
  computed: {},
});
</script>
