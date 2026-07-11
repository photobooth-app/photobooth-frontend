<template>
  <q-layout view="hhh Lpr ffr" @click="headercountdowntimer = false">
    <div v-if="currentMediaitem" class="fixed-full">
      <!-- v-if above is guard to hide all content that would fail if no currentMediaitem is avail -->
      <q-header class="bg-primary text-white">
        <HeaderCountdownTimer
          v-if="headercountdowntimer"
          :duration="configurationStore.configuration.uisettings.AUTOCLOSE_NEW_ITEM_ARRIVED"
          @trigger-timeout="$router.push({ path: '/' })"
        ></HeaderCountdownTimer>
        <HeaderProcessing v-if="displayIndeterminateProgressbar"></HeaderProcessing>
      </q-header>

      <q-dialog v-if="showFilter" v-model="openFilterDialog">
        <q-card style="min-width: 550px; min-height: 400px; max-width: 90vw; max-height: 90vh" flat>
          <!-- TOP BAR -->
          <q-card-section class="row items-center q-pb-none">
            <q-space />
            <div class="text-h6">{{ $t('Choose your filter') }}</div>
            <q-space />
            <q-btn icon="sym_o_close" flat round v-close-popup />
          </q-card-section>

          <!-- MAIN Q-CARD TO LAYOUT THE FILTER DIALOG -->
          <q-card-section>
            <!-- FILTER DIALOG CONTENT -->
            <FilterCards
              v-if="openFilterDialog"
              :id="currentMediaitem.id"
              :available-filter="available_filter"
              @trigger-apply-filter="doApplyFilter"
            ></FilterCards>
          </q-card-section>
        </q-card>
      </q-dialog>

      <q-page-container class="q-pa-none galleryimagedetail full-height">
        <q-page class="full-height">
          <template v-if="itemPresenterMode">
            <MediaItemPreviewViewer :item="currentMediaitem" style="user-select: none" />
          </template>
          <template v-else>
            <PageCarouselView
              :mediaitem-id="currentMediaitem.id"
              :sliced-images="mediacollectionStore.collection"
              @trigger-changed-item="onCarouselTransition"
            />
          </template>

          <q-page-sticky position="top-right" class="q-ma-lg" v-if="configurationStore.configuration.uisettings.gallery_show_qrcode">
            <PageQrCode
              :urls="qrShareUrls"
              :text-above="configurationStore.configuration.uisettings.qrcode_text_above"
              :text-below="configurationStore.configuration.uisettings.qrcode_text_below"
              :linkQrCodes="configurationStore.configuration.uisettings.qrcode_link_codes"
            />
          </q-page-sticky>

          <PageToolbar
            :item="currentMediaitem"
            :show-filter="configurationStore.configuration.uisettings.gallery_show_filter"
            :enable-filter="filterEnabled(currentMediaitem.media_type)"
            :show-share="
              configurationStore.configuration.uisettings.gallery_show_shareprint && configurationStore.configuration.share.sharing_enabled
            "
            :share-buttons="shareButtons"
            :show-delete="props.itemPresenterMode || configurationStore.configuration.uisettings.gallery_show_delete"
            :show-download="configurationStore.configuration.uisettings.gallery_show_download"
            :image_number="currentMediaitemNumber"
            :images_total="mediacollectionStore.collection_number_of_items"
            :last-action-trigger-button="
              itemPresenterMode && configurationStore.configuration.uisettings.itempresenter_show_trigger_last_action_again
                ? lastActionTriggerButton
                : null
            "
            @trigger-toggle-display-filter="openFilterDialog = !openFilterDialog"
            @trigger-delete-mediaitem="doDeleteItem"
            @trigger-share-action="doShareAction"
            @trigger-action="invokeAction"
          ></PageToolbar>

          <q-dialog v-model="showDialogShareActionWithParameters">
            <PageShareParameters
              :parameters="configurationStore.configuration.share.actions[shareActionWithParametersConfigIndex].processing.parameters"
              :parameters_dialog_caption="
                configurationStore.configuration.share.actions[shareActionWithParametersConfigIndex].processing.parameters_dialog_caption
              "
              :parameters_dialog_action_icon="
                configurationStore.configuration.share.actions[shareActionWithParametersConfigIndex].processing.parameters_dialog_action_icon
              "
              :parameters_dialog_action_label="
                configurationStore.configuration.share.actions[shareActionWithParametersConfigIndex].processing.parameters_dialog_action_label
              "
              :config_index="shareActionWithParametersConfigIndex"
              @trigger-share-action-with-parameters="doShareActionWithParameters"
            >
            </PageShareParameters>
          </q-dialog>
        </q-page>
      </q-page-container>
    </div>
    <div v-else>
      <!-- usually not visible but if page is called with wrong id or the page was not closed after an item is deleted -->
      <ItemNotAvailableError />
    </div>
  </q-layout>
</template>

<script lang="ts">
import { useI18n } from 'vue-i18n'
</script>

<script setup lang="ts">
import type { TriggerSchema } from '@/types/trigger-schema'
import { useMainStore } from '@/stores/main-store'
import { useConfigurationStore } from '@/stores/configuration-store'
import { useMediacollectionStore } from '@/stores/mediacollection-store'
import { ref, onBeforeMount, computed, onMounted, watch } from 'vue'
import { default as PageShareParameters } from '@/components/mediaviewer/PageShareParameters.vue'
import { default as PageToolbar } from '@/components/mediaviewer/PageToolbar.vue'
import { default as HeaderCountdownTimer } from '@/components/mediaviewer/HeaderCountdownTimer.vue'
import { default as HeaderProcessing } from '@/components/mediaviewer/HeaderProcessing.vue'
import { default as FilterCards } from '@/components/mediaviewer/FilterCards.vue'
import { default as PageQrCode } from '@/components/mediaviewer/PageQrCode.vue'
import { default as PageCarouselView } from '@/components/mediaviewer/PageCarouselView.vue'
import ItemNotAvailableError from '@/components/ItemNotAvailableError.vue'
import { useRouter, useRoute } from 'vue-router'
import { useQuasar } from 'quasar'
import { type ShareSchema } from '@/components/ShareTriggerButtons.vue'
import { remoteProcedureCall, _fetch } from '@/util/fetch_api.js'
import { watchDebounced } from '@vueuse/core'
import { default as MediaItemPreviewViewer } from '@/components/MediaItemPreviewViewer.vue'

const { t } = useI18n()
const $q = useQuasar()
const route = useRoute('mediaviewer')
const router = useRouter()
const mainStore = useMainStore()
const configurationStore = useConfigurationStore()
const mediacollectionStore = useMediacollectionStore()
const selectedMediaitemId = ref<string | null>(null)
const openFilterDialog = ref(false)
const headercountdowntimer = ref(false) // likely not used here, move to newitempresenter and approval...
const displayIndeterminateProgressbar = ref(false)
const showDialogShareActionWithParameters = ref(false)
const shareActionWithParametersConfigIndex = ref(0)
const available_filter = ref([])
const qrShareUrls = ref([])
const props = defineProps<{
  startTimer: boolean
  itemPresenterMode?: boolean
}>()

onBeforeMount(() => {
  selectedMediaitemId.value = route.params.id as string
  getAvailableFilter()
})
watch(route, to => {
  selectedMediaitemId.value = to.params.id as string
})
onMounted(() => {
  headercountdowntimer.value = props.startTimer
})
const onCarouselTransition = (newMediaitemId: string | number) => {
  selectedMediaitemId.value = newMediaitemId as string
}
const currentMediaitem = computed(() => (selectedMediaitemId.value ? getMediaitemById(selectedMediaitemId.value) : null))

const lastActionTriggerButton = computed<TriggerSchema | null>(() => {
  return mainStore.lastAction
    ? {
        title: t('Take one more!'),
        show_button: true,
        icon: mainStore.lastAction.icon,
        use_custom_color: mainStore.lastAction.use_custom_color,
        custom_color: mainStore.lastAction.custom_color,
        action: mainStore.lastAction.action,
        config_index: mainStore.lastAction.config_index,
      }
    : null
})
watchDebounced(
  selectedMediaitemId,
  async () => {
    if (selectedMediaitemId.value === null) return

    try {
      const response = await _fetch(`/api/share/download/${selectedMediaitemId.value}`)
      if (!response.ok) {
        throw `Error: ${response.status} ${response.statusText}`
      }
      qrShareUrls.value = await response.json()
      console.log(qrShareUrls.value)
    } catch (error) {
      console.warn(error)
    }
  },

  { debounce: 600 }
)

const currentMediaitemNumber = computed(() => {
  return mediacollectionStore.collection.findIndex(mediaitem => mediaitem.id == selectedMediaitemId.value) + 1
})
const showFilter = computed(() => {
  if (!currentMediaitem.value) return false
  return configurationStore.configuration.uisettings.gallery_show_filter && filterEnabled(currentMediaitem.value.media_type)
})
const shareButtons = computed(() => {
  const result: ShareSchema[] = []

  const share_config = configurationStore.configuration.share.actions
  share_config.forEach((action, index: number) => {
    const trigger: ShareSchema = {
      config_index: index,
      handles_images_only: action.handles_images_only,
      show_button: action.trigger.ui_trigger.show_button,
      title: action.trigger.ui_trigger.title,
      icon: action.trigger.ui_trigger.icon,
    }

    result.push(trigger)
  })

  return result
})
const getMediaitemById = (id: string) => {
  return mediacollectionStore.collection.find(mediaitem => mediaitem.id == id)
}

const filterEnabled = (media_type: string) => {
  return ['image'].includes(media_type)
}

const getAvailableFilter = async () => {
  try {
    const response = await _fetch('/api/filter/')

    available_filter.value = await response.json()
    console.log(available_filter.value)
  } catch (error) {
    console.warn(error)
  }
}
const doApplyFilter = (id: string, filter: string) => {
  // close filter dialog
  openFilterDialog.value = false

  displayIndeterminateProgressbar.value = true
  fetch(`/api/filter/${id}?filter=${filter}`, { method: 'PATCH' })
    .then(response => {
      if (!response.ok) {
        throw new Error('Server returned ' + response.status)
      }

      displayIndeterminateProgressbar.value = false
    })
    .catch(err => {
      console.error(err)
      displayIndeterminateProgressbar.value = false
    })
}
const doDeleteItem = (id: string) => {
  selectedMediaitemId.value = null
  mediacollectionStore.deleteItem(id)
  router.back()
}
const doShareAction = (config_index: number) => {
  console.log('doShareAction', selectedMediaitemId.value, config_index)

  const askUserForInput = configurationStore.configuration.share.actions[config_index].processing.ask_user_for_parameter_input
  if (askUserForInput) {
    // advanced share, user input is requested, so show a dialog for the config_index that was already chosen by button click
    shareActionWithParametersConfigIndex.value = config_index
    showDialogShareActionWithParameters.value = true
  } else {
    // there are no parameters from user required here -> go on and use default values without further questions
    remoteProcedureCall(`/api/share/actions/${selectedMediaitemId.value}/${config_index}`, 'POST')
  }
}
const doShareActionWithParameters = async (config_index: number, input_data: unknown) => {
  console.warn(selectedMediaitemId.value, config_index, input_data)
  console.log(JSON.stringify(input_data))
  try {
    const response = await _fetch(`/api/share/actions/${selectedMediaitemId.value}/${config_index}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input_data),
    })
    console.log(response)
    if (!response.ok) {
      throw new Error(`Network error:${response.status} ${response.statusText}}`)
    }
  } catch (error) {
    console.error(error)
    const msg = error instanceof Error ? error.message : String(error)
    $q.notify({
      message: msg,
      caption: 'Request Error!',
      color: 'negative',
    })
  }
}
const invokeAction = (trigger: TriggerSchema) => {
  remoteProcedureCall(`/api/${trigger.action}/${trigger.config_index}`)
}
</script>
