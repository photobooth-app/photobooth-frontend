<template>
  <q-page id="itemapproval-page" class="fullscreen flex flex-center">
    <!-- fullscreen class hides the back button, which is what we want here since the back button just returns without aborting the job-->
    <q-img v-if="imgToApproveSrc" :src="`/media/preview/${imgToApproveSrc}`" fit="contain" style="height: 95%" />
    <!-- video approval not yet supported -->

    <q-page-sticky position="bottom" class="q-ma-lg">
      <q-banner rounded inline-actions>
        <div>
          <div class="text-h5">{{ $t('TITLE_ITEM_APPROVAL') }}</div>
          <div class="text-subtitle2">
            {{
              $t('MSG_APPROVE_COLLAGE_ITEM_NO_OF_TOTAL', {
                no: stateStore.number_captures_taken,
                total: stateStore.total_captures_to_take,
              })
            }}
          </div>
        </div>

        <template #action>
          <q-btn id="item-approval-button-reject" color="negative" no-caps class="" @click="userReject()">
            <q-icon left size="xl" name="sym_o_thumb_down" />
            <div>{{ $t('MSG_APPROVE_COLLAGE_ITEM_RETRY') }}</div>
          </q-btn>

          <q-btn id="item-approval-button-abort" flat color="grey" no-caps class="" @click="userAbort()">
            <q-icon left size="xl" name="sym_o_cancel" />
            <div>{{ $t('MSG_APPROVE_COLLAGE_ITEM_CANCEL_COLLAGE') }}</div>
          </q-btn>

          <q-btn id="item-approval-button-approve" color="positive" no-caps @click="userConfirm()">
            <q-icon left size="xl" name="sym_o_thumb_up" />
            <div>
              <div>{{ $t('MSG_APPROVE_COLLAGE_ITEM_APPROVE') }}</div>
            </div>
          </q-btn>
        </template>
      </q-banner>
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
