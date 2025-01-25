<template>
  <q-page id="itemapproval-page" class="absolute-full flex flex-center">
    <!-- fullscreen class hides the back button, which is what we want here since the back button just returns without aborting the job-->
    <q-img v-if="imgToApproveSrc" :src="`/media/preview/${imgToApproveSrc}`" fit="contain" style="height: 95%" />
    <!-- video approval not yet supported -->

    <q-page-sticky position="top-left" class="q-ma-lg">
      <q-btn id="layout-button-back" color="grey" rounded no-caps @click="userAbort()" class="action-button glass-effect">
        <q-icon left name="sym_o_cancel" />
        <div>{{ $t('MSG_APPROVE_COLLAGE_ITEM_CANCEL_COLLAGE') }}</div>
      </q-btn>
    </q-page-sticky>

    <q-page-sticky position="bottom" class="q-ma-lg">
      <div class="q-mb-lg action-buttons col">
        <div class="q-mb-sm row flex flex-center">
          <q-badge color="grey-8" class="q-mr-xs">
            <q-icon name="sym_o_tag" color="white" class="q-mr-xs" />
            {{
              $t('LABEL_ELEMENT_X_OF_Y', {
                no: stateStore.number_captures_taken,
                total: stateStore.total_captures_to_take,
              })
            }}
          </q-badge>
        </div>
        <div class="row">
          <q-btn
            id="item-approval-button-reject"
            stack
            rounded
            class="q-mr-lg action-button col-auto glass-effect"
            color="negative"
            no-caps
            icon="sym_o_thumb_down"
            :label="$t('MSG_APPROVE_COLLAGE_ITEM_RETRY')"
            @click="userReject()"
          />

          <q-btn
            id="item-approval-button-approve"
            stack
            rounded
            class="q-mr-sm action-button col-auto glass-effect"
            color="positive"
            no-caps
            icon="sym_o_thumb_up"
            :label="$t('MSG_APPROVE_COLLAGE_ITEM_APPROVE')"
            @click="userConfirm()"
          />
        </div>
      </div>
    </q-page-sticky>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useStateStore } from '../stores/state-store'
import { remoteProcedureCall } from '../util/fetch_api.js'
import { computed } from 'vue'

const router = useRouter()
const stateStore = useStateStore()

const imgToApproveSrc = computed(() => {
  // only check first index if multicapture in one pass currently.
  return stateStore.last_captured_mediaitem_id
})

const userConfirm = () => {
  remoteProcedureCall('/api/actions/confirm')
  router.push('/')
}
const userReject = () => {
  remoteProcedureCall('/api/actions/reject')
  router.push('/')
}
const userAbort = () => {
  // closing the window that was meant to use for approval
  // need to inform the statemachine to reset
  remoteProcedureCall('/api/actions/abort')
  router.push('/')
}
</script>
