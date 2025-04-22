<template>
  <div id="itemapproval-dialog" class="absolute-full flex flex-center">
    <!-- ITEMS -->

    <q-img
      v-if="showImage"
      :draggable="false"
      loading="eager"
      :src="`/api/processing/approval/${approval_id}`"
      fit="contain"
      style="height: 95%"
      @error="showImage = false"
      loading-show-delay="800"
    />

    <!-- video approval not yet supported -->

    <ItemNotAvailableError v-else />
    <!-- ITEMS END -->

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
                no: number_captures_taken,
                total: total_captures_to_take,
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
  </div>
</template>

<script setup lang="ts">
import { remoteProcedureCall } from '../util/fetch_api.js'
import { ref, onBeforeMount } from 'vue'
import ItemNotAvailableError from '../components/ItemNotAvailableError.vue'

defineProps<{
  approval_id: string
  number_captures_taken: number
  total_captures_to_take: number
}>()

const showImage = ref(true)

onBeforeMount(() => {
  showImage.value = true
})

const userConfirm = () => {
  remoteProcedureCall('/api/processing/confirm')
}
const userReject = () => {
  remoteProcedureCall('/api/processing/reject')
}
const userAbort = () => {
  remoteProcedureCall('/api/processing/abort')
}
</script>
