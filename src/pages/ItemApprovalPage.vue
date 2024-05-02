<template>
  <q-page id="itemapproval-page" class="fullscreen flex flex-center">
    <q-img :src="imgToApproveSrc" fit="contain" style="height: 95%" />
    <!-- video approval not yet supported -->

    <q-page-sticky position="bottom" :offset="[0, 25]">
      <q-banner rounded inline-actions>
        <div>
          <div class="text-h5">{{ $t('TITLE_ITEM_APPROVAL') }}</div>
          <div class="text-subtitle2">
            {{ $t('MSG_APPROVE_COLLAGE_ITEM_NO_OF_TOTAL', { no: stateStore.number_captures_taken, total: stateStore.total_captures_to_take }) }}
          </div>
        </div>

        <template #action>
          <q-btn id="item-approval-button-reject" color="negative" no-caps class="" @click="userReject()">
            <q-icon left size="xl" name="thumb_down" />
            <div>{{ $t('MSG_APPROVE_COLLAGE_ITEM_RETRY') }}</div>
          </q-btn>

          <q-btn id="item-approval-button-abort" flat color="grey" no-caps class="" @click="userAbort()">
            <q-icon left size="xl" name="cancel" />
            <div>{{ $t('MSG_APPROVE_COLLAGE_ITEM_CANCEL_COLLAGE') }}</div>
          </q-btn>

          <q-btn id="item-approval-button-approve" color="positive" no-caps @click="userConfirm()">
            <q-icon left size="xl" name="thumb_up" />
            <div>
              <div>{{ $t('MSG_APPROVE_COLLAGE_ITEM_APPROVE') }}</div>
            </div>
          </q-btn>
        </template>
      </q-banner>
    </q-page-sticky>
  </q-page>
</template>

<script>
import { useMainStore } from '../stores/main-store.js';
import { useMediacollectionStore } from '../stores/mediacollection-store.js';
import { useStateStore } from '../stores/state-store.js';
import { useConfigurationStore } from '../stores/configuration-store.ts';
import GalleryImageDetail from '../components/GalleryImageDetail.vue';
import { remoteProcedureCall } from '../util/fetch_api.js';

export default {
  // name: 'PageName',
  components: {},
  setup() {
    const mainStore = useMainStore();
    const mediacollectionStore = useMediacollectionStore();
    const configurationStore = useConfigurationStore();
    const stateStore = useStateStore();

    return {
      // you can return the whole store instance to use it in the template
      mainStore,
      mediacollectionStore,
      stateStore,
      configurationStore,
      GalleryImageDetail,
      remoteProcedureCall,
    };
  },
  data() {
    return {};
  },
  computed: {
    imgToApproveSrc: {
      get() {
        return this.stateStore.last_captured_mediaitem && this.stateStore.last_captured_mediaitem['preview'];
      },
    },
  },
  mounted() {
    // string representation: console.log((this.$route.query.approval));
    // bool: console.log((this.approval));
  },

  methods: {
    userConfirm() {
      remoteProcedureCall('/api/actions/confirm');
      this.$router.push('/');
    },
    userReject() {
      remoteProcedureCall('/api/actions/reject');
      this.$router.push('/');
    },
    userAbort() {
      // closing the window that was meant to use for approval
      // need to inform the statemachine to reset
      remoteProcedureCall('/api/actions/abort');
      this.$router.push('/');
    },
  },
};
</script>
