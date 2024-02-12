<template>
  <q-page class="flex flex-center">
    <q-card style="height: 95vh" id="item-approval-container">
      <q-card-section align="center">
        <div class="text-h6">{{ $t("TITLE_ITEM_APPROVAL") }}</div>
        <div class="text-subtitle1">
          <span>{{ $t("MSG_APPROVE_COLLAGE_ITEM_XXX_COUNT_TOTAL") }}</span>

          {{ this.stateStore.number_captures_taken }}
          <span>{{ $t("MSG_APPROVE_COLLAGE_ITEM_COUNT_XXX_TOTAL") }}</span>
          {{ this.stateStore.total_captures_to_take }}
          <span>{{ $t("MSG_APPROVE_COLLAGE_ITEM_COUNT_TOTAL_XXX") }}</span>
        </div>
      </q-card-section>

      <q-card-section style="padding: 2vh 1vw 2vh 1vw; max-height: 72vh">
        <q-img class="rounded-borders" :src="imgToApproveSrc" fit="contain" spinner-color="primary" style="max-height: 68vh" />
        <!-- video approval not yet supported -->
      </q-card-section>

      <q-card-actions align="around" id="item-approval-actions">
        <q-btn color="negative" no-caps @click="userReject()" class="" id="item-approval-button-reject">
          <q-icon left size="7em" name="thumb_down" />
          <div>{{ $t("MSG_APPROVE_COLLAGE_ITEM_RETRY") }}</div>
        </q-btn>

        <q-btn flat color="grey" no-caps @click="userAbort()" class="" id="item-approval-button-abort">
          <q-icon left size="7em" name="cancel" />
          <div>{{ $t("MSG_APPROVE_COLLAGE_ITEM_CANCEL_COLLAGE") }}</div>
        </q-btn>

        <q-btn color="positive" no-caps @click="userConfirm()" id="item-approval-button-approve">
          <q-icon left size="7em" name="thumb_up" />

          <div>
            <div>{{ $t("MSG_APPROVE_COLLAGE_ITEM_APPROVE") }}</div>
          </div>
        </q-btn>
      </q-card-actions>
    </q-card>
    <!-- auto-start slideshow after timeout -->
    <RouteAfterTimeout
      v-if="this.uiSettingsStore.uiSettings.TIMEOUT_TO_SLIDESHOW > 0"
      route="/slideshow/gallery"
      :timeout_ms="this.uiSettingsStore.uiSettings.TIMEOUT_TO_SLIDESHOW * 1000"
    ></RouteAfterTimeout>
  </q-page>
</template>

<script>
import { useMainStore } from "../stores/main-store.js";
import { useMediacollectionStore } from "../stores/mediacollection-store.js";
import { useStateStore } from "../stores/state-store.js";
import { useUiSettingsStore } from "../stores/ui-settings-store.js";
import GalleryImageDetail from "../components/GalleryImageDetail";
import RouteAfterTimeout from "src/components/RouteAfterTimeout.vue";
import { remoteProcedureCall } from "boot/axios";

export default {
  // name: 'PageName',
  components: { RouteAfterTimeout },
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
