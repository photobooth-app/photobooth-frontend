<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<!-- eslint-disable @intlify/vue-i18n/no-missing-keys -->
<template>
  <q-page id="multicam-page" padding>
    <q-card flat class="q-pa-md">
      <div class="text-h5">{{ $t('Multicamera Tool') }}</div>
      <div class="q-ma-none">
        <q-card-section class="q-gutter-sm q-px-none">
          <div class="text-caption">{{ $t('Single Camera Calibration') }}</div>
          <q-btn :label="$t('calibrate intrinsics')" @click="remoteProcedureCall('/api/wigglecam/xxx')" />
          <q-btn :label="$t('calibrate extrinsics')" @click="remoteProcedureCall('/api/wigglecam/xxx')" />
        </q-card-section>

        <q-card-section class="q-px-none">
          <div class="text-caption">{{ $t('Live View') }}</div>

          <div class="q-pa-md row items-start q-gutter-md">
            <q-card v-for="(node, index) in multicamNodes" :key="index" style="width: 100%; max-width: 250px">
              <q-img fit="contain" :src="`${node.base_url}api/camera/stream.mjpg`">
                <div class="absolute-bottom">
                  <div class="text-subtitle2"></div>
                  <div class="text-subtitle2">{{ index }}: {{ node.description }}</div>
                </div>
              </q-img>

              <q-card-actions>
                <q-btn flat>calibrate</q-btn>
                <q-btn flat>capture</q-btn>
              </q-card-actions>
            </q-card>
          </div>
        </q-card-section>
      </div>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { remoteProcedureCall } from '../util/fetch_api'
// import { useConfigurationStore } from '../stores/configuration-store'

// const configurationStore = useConfigurationStore()

const multicamNodes = computed(() => {
  return []
  // const group_backends = configurationStore.configuration.backends.group_backends
  // const index_backend_multicam = configurationStore.configuration.backends.index_backend_multicam
  // if (group_backends == null || index_backend_multicam == null) {
  //   console.error('cannot get multicam backend from config')
  //   return []
  // }

  // const multicam_backend = group_backends[index_backend_multicam].wigglecam.nodes

  // return multicam_backend
})
</script>
