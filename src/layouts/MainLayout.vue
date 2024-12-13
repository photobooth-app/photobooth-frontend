<template>
  <q-layout id="main-layout" view="hHh lpR fFf">
    <q-page-container>
      <router-view />

      <!-- auto-start slideshow after timeout -->
      <RouteAfterTimeout
        v-if="configurationStore.getConfigElement('uisettings.enable_automatic_slideshow', false)"
        route="/slideshow/random"
        :timeout-ms="configurationStore.getConfigElement('uisettings.show_automatic_slideshow_timeout', 300) * 1000"
        :warning-message="$t('MSG_WARN_BEFORE_AUTO_SLIDESHOW')"
      ></RouteAfterTimeout>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useStateStore } from '../stores/state-store'
import { useConfigurationStore } from '../stores/configuration-store'
import { useRouter, useRoute } from 'vue-router'
import RouteAfterTimeout from 'src/components/RouteAfterTimeout.vue'

const stateStore = useStateStore()
const configurationStore = useConfigurationStore()
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
    router.push({ name: 'itempresenter', params: { id: stateStore.last_captured_mediaitem.id } })
  }
  if (state.state == 'approve_capture' && state.ask_user_for_approval) {
    router.push({ path: '/itemapproval' })
  }
})
</script>
