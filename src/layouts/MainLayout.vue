<template>
  <q-layout id="main-layout" view="hHh lpR fFf">
    <q-page-container>
      <router-view />

      <!-- show back button on all pages except / -->
      <q-page-sticky v-if="route.path != '/'" position="top-left" class="q-ma-lg" style="/*z-index: 10000*/">
        <q-btn id="layout-button-back" color="primary" rounded no-caps @click="$router.back()" class="action-button">
          <q-icon left name="sym_o_arrow_back_ios_new" />
          <div>{{ $t('BTN_LABEL_BACK') }}</div>
        </q-btn>
      </q-page-sticky>

      <!-- auto-start slideshow after timeout -->
      <RouteAfterTimeout
        v-if="configurationStore.configuration.uisettings.enable_automatic_slideshow && mediacollectionStore.collection_number_of_items > 0"
        route="/slideshow/random"
        :timeout-ms="configurationStore.configuration.uisettings.show_automatic_slideshow_timeout * 1000"
        :warning-message="$t('MSG_WARN_BEFORE_AUTO_SLIDESHOW')"
      ></RouteAfterTimeout>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useStateStore } from '../stores/state-store'
import { useConfigurationStore } from '../stores/configuration-store'
import { useMediacollectionStore } from '../stores/mediacollection-store'
import { useRouter, useRoute } from 'vue-router'
import RouteAfterTimeout from 'src/components/RouteAfterTimeout.vue'

const stateStore = useStateStore()
const configurationStore = useConfigurationStore()
const mediacollectionStore = useMediacollectionStore()
const router = useRouter()
const route = useRoute()

// watch state to force router to "/" if a capture is triggered
stateStore.$subscribe((mutation, state) => {
  if (state.state == 'counting' && route.path != '/') {
    // quick fix: receive "counting" state but not on indexpage, push router to index
    console.log('counting state received, pushing to index page to countdown')

    router.push('/')
  }
  if (state.state == 'present_capture') {
    router.push({ name: 'itempresenter', params: { id: stateStore.last_captured_mediaitem_id } })
  }
  if (state.state == 'approve_capture' && state.ask_user_for_approval) {
    router.push({ path: '/itemapproval' })
  }
})
</script>
