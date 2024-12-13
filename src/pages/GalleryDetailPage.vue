<template>
  <q-layout view="hhh Lpr ffr" class="fullscreen" onclick="headercountdowntimer=false">
    <div v-if="currentMediaitem" class="full-height">
      <!-- v-if above is guard to hide all content that would fail if no currentMediaitem is avail -->
      <q-header class="bg-primary text-white">
        <HeaderToolbar
          :item="currentMediaitem"
          :show-filter="configurationStore.getConfigElement('uisettings.gallery_show_filter', false)"
          :enable-filter="getFilterAvailable(currentMediaitem.media_type)"
          :show-share="configurationStore.getConfigElement('share.sharing_enabled', false)"
          :share-direct-access-buttons="configurationStore.getConfigElement('share.number_direct_access_buttons', 1)"
          :share-buttons="shareButtons"
          :show-delete="configurationStore.getConfigElement('uisettings.gallery_show_delete', false)"
          :show-download="configurationStore.getConfigElement('uisettings.gallery_show_download', false)"
          @trigger-toggle-display-filter="rightDrawerOpen = !rightDrawerOpen"
          @trigger-delete-mediaitem="[doDeleteItem, $router.back()]"
          @trigger-share-action="doShareAction"
        ></HeaderToolbar>
        <HeaderCountdownTimer
          v-if="headercountdowntimer"
          :duration="configurationStore.getConfigElement('uisettings.AUTOCLOSE_NEW_ITEM_ARRIVED', 0)"
          @trigger-timeout="$router.push({ path: '/' })"
        ></HeaderCountdownTimer>
        <HeaderProcessing v-if="displayIndeterminateProgressbar"></HeaderProcessing>
      </q-header>

      <q-drawer v-if="showFilter" id="gallery-drawer-filters" v-model="rightDrawerOpen" class="q-pa-sm" side="right" overlay elevated>
        <DrawerFilter
          :id="currentMediaitem.id"
          :available-filter="configurationStore.getConfigElement('uisettings.gallery_filter_userselectable', [])"
          @trigger-apply-filter="doApplyFilter"
        ></DrawerFilter>
      </q-drawer>

      <q-page-container class="q-pa-none galleryimagedetail full-height">
        <q-page class="full-height">
          <PageCarouselView
            :mediaitem-id="currentMediaitem.id"
            :sliced-images="mediacollectionStore.collection"
            @trigger-changed-item="onCarouselTransition"
          />

          <q-page-sticky position="top-right" :offset="[30, 30]" v-if="configurationStore.getConfigElement('uisettings.gallery_show_qrcode', false)">
            <PageQrCode :url="currentMediaitem.share_url" />
          </q-page-sticky>
        </q-page>
      </q-page-container>
    </div>
    <div v-else>
      <!-- usually not visible but if page is called with wrong id or the page was not closed after an item is deleted -->
      <ItemNotAvailableError />
    </div>
  </q-layout>
</template>

<script setup lang="ts">
import { useConfigurationStore } from '../stores/configuration-store'
import { useMediacollectionStore } from '../stores/mediacollection-store'
import { ref, onBeforeMount, computed, onMounted, watch } from 'vue'
import { default as HeaderToolbar } from '../components/mediaviewer/HeaderToolbar.vue'
import { default as HeaderCountdownTimer } from '../components/mediaviewer/HeaderCountdownTimer.vue'
import { default as HeaderProcessing } from '../components/mediaviewer/HeaderProcessing.vue'
import { default as DrawerFilter } from '../components/mediaviewer/DrawerFilter.vue'
import { default as PageQrCode } from '../components/mediaviewer/PageQrCode.vue'
import { default as PageCarouselView } from '../components/mediaviewer/PageCarouselView.vue'
import ItemNotAvailableError from '../components/ItemNotAvailableError.vue'
import { useRoute } from 'vue-router'
import { get } from 'lodash'
import type { ShareSchema } from 'src/components/ShareTriggerButtons.vue'
import { useQuasar } from 'quasar'
import { remoteProcedureCall } from '../util/fetch_api.js'
const $q = useQuasar()
const route = useRoute()
const configurationStore = useConfigurationStore()
const mediacollectionStore = useMediacollectionStore()
const selectedMediaitemId = ref('')
const rightDrawerOpen = ref(false)
const headercountdowntimer = ref(false) // likely not used here, move to newitempresenter and approval...
const displayIndeterminateProgressbar = ref(false)

const props = defineProps({
  startTimer: Boolean,
})

onBeforeMount(() => {
  selectedMediaitemId.value = route.params.id as string
})
watch(route, (to) => {
  selectedMediaitemId.value = to.params.id as string
})
onMounted(() => {
  headercountdowntimer.value = props.startTimer
})
const onCarouselTransition = (newMediaitemId: string) => {
  selectedMediaitemId.value = newMediaitemId
}

const currentMediaitem = computed(() => {
  return getMediaitemById(selectedMediaitemId.value)
})
const showFilter = computed(() => {
  return configurationStore.getConfigElement('uisettings.gallery_show_filter', false) && getFilterAvailable(currentMediaitem.value.media_type)
})
const shareButtons = computed(() => {
  const result: ShareSchema[] = []

  const share_config = configurationStore.getConfigElement('share.actions', [])
  share_config.forEach((action: object, index: number) => {
    const trigger: ShareSchema = {
      config_index: index,
      handles_images_only: get(action, 'action.handles_images_only', false),
      show_button: get(action, 'trigger.ui_trigger.show_button', false),
      title: get(action, 'trigger.ui_trigger.title', ''),
      icon: get(action, 'trigger.ui_trigger.icon', ''),
    }

    result.push(trigger)
  })

  console.log(result)

  return result
})
const getMediaitemById = (id: string) => {
  return mediacollectionStore.collection.find((mediaitem) => mediaitem.id == id)
}

const getFilterAvailable = (media_type: string) => {
  return ['image', 'collageimage', 'animationimage'].includes(media_type)
}
//https://stackoverflow.com/questions/1077041/refresh-image-with-a-new-one-at-the-same-url/66312176#66312176
const reloadImg = async (url: string) => {
  // fetch to update cache on regular images, if we do not fetch, on next gallery visit old images are displayed
  await fetch(url, { cache: 'reload', mode: 'no-cors' })

  //now update also current displayed images (some are images, some are in background)
  // drawback: due to ?time file is transferred twice from server. but without there is no good way to force the browser to render new pic
  const time = new Date().getTime()
  document.body.querySelectorAll(`img[src*='${url}']`).forEach((img) => {
    ;(img as HTMLImageElement).src = url + '#' + time
  })
}
const doApplyFilter = (id: string, filter: string) => {
  displayIndeterminateProgressbar.value = true
  fetch(`/api/mediaprocessing/applyfilter/${id}/${filter}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error('Server returned ' + response.status)
      }

      const item = getMediaitemById(id)
      reloadImg(item.full)
      reloadImg(item.preview)
      reloadImg(item.thumbnail)

      displayIndeterminateProgressbar.value = false
    })
    .catch((err) => {
      console.error(err)
      displayIndeterminateProgressbar.value = false
    })
}
const doDeleteItem = (id: string) => {
  selectedMediaitemId.value = undefined
  fetch('/api/mediacollection/delete', {
    method: 'POST',
    body: JSON.stringify({ image_id: id }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error('Server returned ' + response.status)
      }
    })
    .then((response) => {
      console.log(response)
    })
    .catch((error) => {
      console.error('There was a problem with the Fetch operation:', error)

      $q.notify({
        message: 'Error deleting file! Please check logs and browser console.',
        type: 'negative',
      })
    })
}
const doShareAction = (config_index: number) => {
  console.log(selectedMediaitemId.value, config_index)
  remoteProcedureCall(`/api/share/actions/${selectedMediaitemId.value}/${config_index}`)
}
</script>

<style lang="sass" scoped>
.preview-item
  height: 400px
  width: 400px
</style>
