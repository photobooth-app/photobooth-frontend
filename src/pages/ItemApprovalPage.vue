<template>
  <q-page class="flex flex-center">
    <q-card style="height: 95vh">
      <q-card-section align="center">
        <div class="text-h6">Nice?</div>
        <div class="text-subtitle1">
          Got
          {{ this.stateStore.number_captures_taken }}
          of
          {{ this.stateStore.total_captures_to_take }} captures total
        </div>
      </q-card-section>

      <q-card-section class="">
        <q-img class="rounded-borders" :src="imgToApproveSrc" />
        <!-- video approval not yet supported -->
      </q-card-section>

      <q-card-actions align="around">
        <q-btn color="negative" no-caps @click="userReject()" class="">
          <q-icon left size="7em" name="thumb_down" />
          <div>Try again!</div>
        </q-btn>

        <q-btn flat color="grey" no-caps @click="userAbort()" class="">
          <q-icon left size="7em" name="cancel" />
          <div>Abort</div>
        </q-btn>

        <q-btn color="positive" no-caps @click="userConfirm()">
          <q-icon left size="7em" name="thumb_up" />
          <div>
            Awesome, next!
            <br />
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import { useMainStore } from "../stores/main-store.js";
import { useMediacollectionStore } from "../stores/mediacollection-store.js";
import { useStateStore } from "../stores/state-store.js";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";
import GalleryImageDetail from "../components/GalleryImageDetail";
import { remoteProcedureCall } from "boot/axios";

export default {
  // name: 'PageName',

  data() {
    return {};
  },
  computed: {
    imgToApproveSrc: {
      get() {
        return this.stateStore.last_captured_mediaitem && this.stateStore.last_captured_mediaitem["preview"];
      },
    },
  },
  setup() {
    const mainStore = useMainStore();
    const mediacollectionStore = useMediacollectionStore();
    const uiSettingsStore = useUiSettingsStore();
    const stateStore = useStateStore();

    return {
      // you can return the whole store instance to use it in the template
      mainStore,
      mediacollectionStore,
      stateStore,
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
    userAbort() {
      // closing the window that was meant to use for approval
      // need to inform the statemachine to reset
      remoteProcedureCall("/processing/cmd/abort");
      this.$router.push("/");
    },
  },
};
</script>
