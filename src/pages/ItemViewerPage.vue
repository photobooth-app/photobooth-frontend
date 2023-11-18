<template>
  <q-page class="q-pa-none fullscreen">
    <gallery-image-detail
      @close-event="userCloseViewer()"
      :itemRepository="this.mediacollectionStore.collection"
      :indexSelected="0"
      :singleItemView="true"
      :startTimerOnOpen="!approval"
      class="full-height"
    ></gallery-image-detail>

    <q-page-sticky position="bottom" :offset="[0, 25]" v-if="approval">
      <div class="q-gutter-sm">
        <q-btn color="secondary" no-caps @click="userReject()" class="q-mr-xl">
          <q-icon left size="7em" name="thumb_down" />
          <div>Try again!</div>
        </q-btn>

        <q-btn color="primary" no-caps @click="userConfirm()">
          <q-icon left size="7em" name="thumb_up" />
          <div>
            Awesome, next!<br />{{
              this.mainStore.statemachine.current_capture_no
            }}
            / {{ this.mainStore.statemachine.total_captures_no }}
          </div>
        </q-btn>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { useMainStore } from "../stores/main-store.js";
import { useMediacollectionStore } from "../stores/mediacollection-store.js";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";
import { ref } from "vue";
import GalleryImageDetail from "../components/GalleryImageDetail";
import { remoteProcedureCall } from "boot/axios";

export default {
  // name: 'PageName',
  components: { GalleryImageDetail },
  //props: (route) => ({ approval: (route.query.approval === 'true') }),
  data() {
    return {
      intervalTimerId: null,
      remainingSeconds: 0,
      remainingSecondsNormalized: 0,
      displayLinearProgressBar: true,
      showImageDetail: true,
    };
  },
  computed: {
    approval: {
      get() {
        return this.$route.query.approval === "true";
      },
    },
  },
  setup() {
    const mainStore = useMainStore();
    const mediacollectionStore = useMediacollectionStore();
    const uiSettingsStore = useUiSettingsStore();

    return {
      // you can return the whole store instance to use it in the template
      mainStore,
      mediacollectionStore,
      uiSettingsStore,
      GalleryImageDetail,
      remoteProcedureCall,
    };
  },
  mounted() {
    // string representation: console.log((this.$route.query.approval));
    // bool: console.log((this.approval));
  },
  beforeUnmount() {},
  methods: {
    userConfirm() {
      remoteProcedureCall("/processing/cmd/confirm");
      this.$router.push("/");
    },
    userReject() {
      remoteProcedureCall("/processing/cmd/reject");
      this.$router.push("/");
    },
    userCloseViewer() {
      // closing the window that was meant to use for approval
      // need to inform the statemachine to reset
      if (this.approval) remoteProcedureCall("/processing/cmd/abort");

      this.$router.push("/");
    },
  },
};
</script>
