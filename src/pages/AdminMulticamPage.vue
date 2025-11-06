<!-- eslint-disable @intlify/vue-i18n/no-missing-keys -->
<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <q-page id="multicam-page" padding>
    <q-card flat class="q-pa-md q-mb-md">
      <q-card-section>
        <div class="text-h5">Multicamera Tools</div>
      </q-card-section>
      <q-card-section>
        <div class="row no-wrap q-gutter-x-md">
          <div style="width: 100%; max-width: 300px" class="gt-sm">
            <q-img src="/api/aquisition/stream.mjpg" />
          </div>
          <div>
            <p>👋 Hey, this multicamera tool is to help you creating awesome wigglegrams.</p>
            <p>
              Wigglegrams are stills captured using a camera array. Usually 4 equal cameras are required to capture sufficient perspectives of a
              scene. The stills are stitched together and replayed as a GIF/Video.
            </p>
            <p>
              Since the cameras, despite being the same model underly some tolerances in optics and alignment during assembly, to create smooth
              wigglegrams, the cameras need to be calibrated once. Please follow the steps to calibrate the cameras.
            </p>

            <q-btn
              outline
              no-caps
              color="green"
              href="https://photobooth-app.org/wigglegramcamera/"
              target="_blank"
              icon-right="sym_o_open_in_new"
              label="Learn more"
            >
            </q-btn>
          </div>
        </div>
      </q-card-section>
      <q-card-actions class="q-gutter-sm q-px-none" align="right">
        <q-btn no-caps :label="$t('Get stats')" @click="remoteProcedureCall('/api/admin/multicamera/calibration')" />
        <q-btn
          no-caps
          outline
          color="red"
          :label="$t('Delete calibration data')"
          @click="remoteProcedureCall('/api/admin/multicamera/calibration', 'DELETE')"
        />
      </q-card-actions>
    </q-card>

    <q-stepper v-model="step" vertical animated flat class="q-pa-md q-mb-md">
      <div class="text-h5">{{ $t('Calibrate') }}</div>

      <q-step :name="1" title="Preflight check before starting the calibration" icon="sym_o_verified" :done="step > 1">
        <p>
          Following nodes are configured as multicamera backend currently. Please confirm, that the backend is setup correctly as later changes
          invalidate the calibration.
        </p>
        <q-markup-table flat bordered>
          <thead>
            <tr>
              <th class="text-left">Device Description</th>
              <th class="text-right">Index</th>
              <th class="text-right">Device ID</th>
              <th class="text-right">Address</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(node, idx) in multicamNodes" :key="idx">
              <td class="text-left">{{ node.description }}</td>
              <td class="text-right">{{ idx }}</td>
              <td class="text-right">{{ node.device_id }}</td>
              <td class="text-right">{{ node.address }}</td>
            </tr>
          </tbody>
        </q-markup-table>

        <q-stepper-navigation class="q-gutter-sm">
          <q-btn no-caps @click="step = 2" color="green" label="Start" />
          <q-btn flat no-caps color="green" label="Configure backends" icon-right="sym_o_open_in_new" to="/admin/config" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="2" title="Capture images for calibration" icon="sym_o_camera" :done="step > 2">
        <div class="q-pa-none row items-start q-gutter-md" v-if="images.length">
          <p>
            Here are the results from the last capture. Please check that the images look well, the CharuCo board is about in the center of the image
            and in roughly 2m distance to the camera array.
          </p>
          <q-card v-for="(node, idx) in multicamNodes" :key="idx" style="width: 100%; max-width: 300px" class="q-pa-sm" flat bordered>
            <q-card-section>
              <div class="text-h6 q-mb-xs">{{ node.description }}</div>
            </q-card-section>
            <a :href="images[idx]" target="_blank">
              <q-img fit="contain" :src="images[idx]" />
            </a>
            <q-list>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ idx }}</q-item-label>
                  <q-item-label caption>Index</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ node.device_id }}</q-item-label>
                  <q-item-label caption>Device-Id</q-item-label>
                </q-item-section>
              </q-item>
              <q-item>
                <q-item-section>
                  <q-item-label>{{ node.address }}</q-item-label>
                  <q-item-label caption>Address</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <q-stepper-navigation class="q-gutter-sm">
          <q-btn no-caps @click="capture" color="green" label="Capture" :loading="capture_in_progress" />
          <q-btn no-caps @click="step = 3" color="green" label="Continue" :disable="images.length == 0" />
          <q-btn flat no-caps @click="step = 1" color="green" label="Back" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="3" title="Calculate the new calibration data" icon="sym_o_calculate" :done="step > 3">
        Press the button to calculate and save the new data.
        <p>Result: {{ calculation_result_if_error }}</p>
        <q-stepper-navigation class="q-gutter-sm">
          <q-btn
            no-caps
            color="green"
            :disable="images.length == 0"
            :label="$t('Calculate')"
            @click="postCalibration"
            :loading="calculation_in_progress"
          />
          <q-btn no-caps @click="step = 4" color="green" label="Continue" :disable="!calculation_successful" />
          <q-btn no-caps flat @click="step = 2" color="green" label="Back" />
        </q-stepper-navigation>
      </q-step>

      <q-step :name="4" title="Confirm the result" icon="sym_o_flag">
        ok, done, here is your new wiggle

        <q-stepper-navigation class="q-gutter-sm">
          <q-btn no-caps color="green" label="Finish" disable />
          <q-btn no-caps flat @click="step = 3" color="green" label="Back" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { remoteProcedureCall, _fetch } from '../util/fetch_api'
import { ref } from 'vue'
import { useConfigurationStore } from '../stores/configuration-store'
// import type { components } from 'src/dto/api'
const configurationStore = useConfigurationStore()

const images = ref([])
const step = ref(1)
const capture_in_progress = ref(false)
const calculation_in_progress = ref(false)
const calculation_successful = ref(false)
const calculation_result_if_error = ref('')

async function capture() {
  try {
    // Step 1: trigger multicam capture and get file paths
    capture_in_progress.value = true
    const res = await _fetch('/api/aquisition/multicam')
    const data = await res.json()

    // Step 2: build URLs for each file
    // assuming backend returns list of relative paths
    images.value = data.map((path) => `/api/aquisition/multicam/${encodeURIComponent(path)}`)
  } catch (err) {
    console.error('Error capturing multicam images:', err)
  } finally {
    capture_in_progress.value = false
  }
}

async function postCalibration() {
  try {
    calculation_successful.value = false
    calculation_in_progress.value = true

    const res = await _fetch('/api/admin/multicamera/calibration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(images.value),
    })
    const result = await res.json()
    console.log('Calibration result:', result)

    calculation_successful.value = true
  } catch (err) {
    calculation_result_if_error.value = err
    console.error('Error posting calibration:', err)
  } finally {
    calculation_in_progress.value = false
  }
}
const multicamNodes = computed(() => {
  const group_backends = configurationStore.configuration.backends.group_backends
  const index_backend_multicam = configurationStore.configuration.backends.index_backend_multicam
  if (group_backends == null || index_backend_multicam == null) {
    console.error('cannot get multicam backend from config')
    return []
  }

  const multicam_backend = group_backends[index_backend_multicam].backend_config.devices
  console.log(multicam_backend)

  return multicam_backend
})
</script>
