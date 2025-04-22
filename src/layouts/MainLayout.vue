<template>
  <q-layout id="main-layout" view="hHh lpR fFf">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { useStateStore } from '../stores/state-store'
import { useConfigurationStore } from '../stores/configuration-store'
import { useRouter, useRoute } from 'vue-router'
import { onMounted, onUnmounted } from 'vue'
import { remoteProcedureCall } from '../util/fetch_api.js'
const stateStore = useStateStore()
const router = useRouter()
const route = useRoute()
const configurationStore = useConfigurationStore()

// watch state to force router to "/" if a capture is triggered
stateStore.$subscribe((mutation, state) => {
  if (state.target == 'counting' && route.path != '/') {
    // quick fix: receive "counting" state but not on indexpage, push router to index
    console.log('counting state received, pushing to index page to countdown')

    router.push('/')
  }
  if (state.source == 'completed' && state.target == 'present') {
    // if aborted, source can by anything but completed. when source is completed, the job was successful and we have an id
    router.push({ name: 'itempresenter', params: { id: stateStore.jobmodel.present_mediaitem_id } })
  }
})

const keyUpHandler = (e: KeyboardEvent) => {
  if (!configurationStore.configuration.hardwareinputoutput.keyboard_input_enabled) {
    console.log('keyboard input is disabled, to use keyboard input enable it in the configuration and reload the page.')
    return
  }

  configurationStore.configuration.actions.image.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/actions/image/${index}`)
      return
    }
  })
  configurationStore.configuration.actions.collage.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/actions/collage/${index}`)
      return
    }
  })
  configurationStore.configuration.actions.animation.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/actions/animation/${index}`)
      return
    }
  })
  configurationStore.configuration.actions.video.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/actions/video/${index}`)
      return
    }
  })
  configurationStore.configuration.actions.multicamera.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/actions/multicamera/${index}`)
      return
    }
  })
  configurationStore.configuration.share.actions.forEach((action_config, index: number) => {
    if (action_config.trigger.keyboard_trigger.keycode == e.key) {
      remoteProcedureCall(`/api/share/actions/latest/${index}`, 'POST')
      return
    }
  })
}

// keyboard handler on main layout (so not on standalone (but random slideshow) and admin layout)
onMounted(() => {
  console.log('register listener for keyboard input (active only on main layout)')
  window.addEventListener('keyup', keyUpHandler)
})

onUnmounted(() => {
  console.log('unregister listener for keyboard input')
  window.removeEventListener('keyup', keyUpHandler)
})
</script>
