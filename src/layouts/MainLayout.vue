<template>
  <q-layout id="main-layout" view="hHh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useStateStore } from '../stores/state-store'
import { useRouter, useRoute } from 'vue-router'

const stateStore = useStateStore()
const router = useRouter()
const route = useRoute()

// watch state to force router to "/" if a capture is triggered
stateStore.$subscribe((mutation, state) => {
  if (state.target == 'counting' && route.path != '/') {
    // quick fix: receive "counting" state but not on indexpage, push router to index
    console.log('counting state received, pushing to index page to countdown')

    router.push('/')
  }
  if (state.source == 'completed' && state.target == 'finished') {
    // if aborted, source can by anything but completed. when source is completed, the job was successful and we have an id
    router.push({ name: 'itempresenter', params: { id: stateStore.jobmodel.present_mediaitem_id } })
  }
  if (state.target == 'approval') {
    router.push({ path: '/itemapproval' })
  }
})
</script>
