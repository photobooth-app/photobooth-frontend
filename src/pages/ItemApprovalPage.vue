<template>
  <q-page class="flex flex-center" style="min-height: 100vh">
    <q-card style="height: 95vh">
      <q-card-section align="center" style="height: 11vh; padding: 2vh 1vw 0px 1vw">
        <div style="font-size: 4vh" v-html="$t('TITLE_ITEM_APPROVAL')"></div>
        <div style="font-size: 2vh">
          <span v-html="$t('MSG_APPROVE_COLLAGE_ITEM_XXX_COUNT_TOTAL')"></span>
          {{ this.stateStore.number_captures_taken }}
          <span v-html="$t('MSG_APPROVE_COLLAGE_ITEM_COUNT_XXX_TOTAL')"></span>
          {{ this.stateStore.total_captures_to_take }}
          <span v-html="$t('MSG_APPROVE_COLLAGE_ITEM_COUNT_TOTAL_XXX')"></span>
        </div>
      </q-card-section>

      <!--79vh remaining for this card, set width according to image aspect ratio-->
      <q-card-section class="" style="padding: 2vh 1vw 2vh 1vw; width: calc(79vh * 4 / 3)">
        <q-img class="rounded-borders" :src="imgToApproveSrc" />
        <!-- video approval not yet supported -->
      </q-card-section>

      <q-card-actions align="around" style="height: 12vh; padding: 0 1vw 2vh 1vw">
        <q-btn color="negative" no-caps @click="userReject()" class="">
          <q-icon left size="10vh" name="thumb_down" />
          <div v-html="$t('MSG_APPROVE_COLLAGE_ITEM_RETRY')"></div>
        </q-btn>

        <q-btn flat color="grey" no-caps @click="userAbort()" class="">
          <q-icon left size="10vh" name="cancel" />
          <div v-html="$t('MSG_APPROVE_COLLAGE_ITEM_CANCEL_COLLAGE')"></div>
        </q-btn>

        <q-btn color="positive" no-caps @click="userConfirm()">
          <q-icon left size="10vh" name="thumb_up" />
          <div>
            <div v-html="$t('MSG_APPROVE_COLLAGE_ITEM_APPROVE')"></div>
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
