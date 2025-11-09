<!-- eslint-disable @intlify/vue-i18n/no-missing-keys -->
<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <q-page id="multicam-page" padding>
    <q-card flat class="q-pa-md q-mb-md">
      <q-card-section>
        <div class="text-h5">Multicamera Tools</div>
      </q-card-section>
      <q-card-section>
        <p>👋 Hey, this multicamera tool is to help you creating awesome wigglegrams.</p>
        <p>
          Wigglegrams are stills captured using a camera array. Usually 4 equal cameras are required to capture sufficient perspectives of a scene.
          The stills are stitched together and replayed as a GIF/Video.
        </p>
        <p>
          Since the cameras, despite being the same model underly some tolerances in optics and alignment during assembly, to create smooth
          wigglegrams, the cameras need to be calibrated once. Please follow the steps to calibrate the cameras.
        </p>

        <div class="q-gutter-sm q-px-none">
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
      </q-card-section>
      <q-card-actions class="q-gutter-sm q-px-none" align="right">
        <!-- <q-btn no-caps :label="$t('Get stats')" @click="remoteProcedureCall('/api/admin/multicamera/calibration')" /> -->
        <q-btn
          no-caps
          outline
          color="red"
          :label="$t('Delete calibration data')"
          @click="remoteProcedureCall('/api/admin/multicamera/calibration', 'DELETE')"
        />
      </q-card-actions>
    </q-card>
    <div>
      <q-card v-if="multicamNodes.length == 0" flat class="q-pa-md q-mb-md">
        <div class="text-h5">
          {{ $t('Calibrate') }} <q-badge color="negative" align="top"><q-icon name="sym_o_error" color="white" size="15px" /> </q-badge>
        </div>

        <p>Not available, because there is no multicamera/wigglecamera enabled in the backends.</p>
      </q-card>

      <q-stepper v-else v-model="step" vertical animated flat class="q-pa-md q-mb-md">
        <div class="text-h5">{{ $t('Calibrate') }}</div>

        <q-step :name="0" title="Set your calibration target" icon="sym_o_target" :done="step > 0">
          <p>You need a ChAruCo board for the calibration routine. If you do not have one, generate it here.</p>
          <p>The board needs to be very solid and plane for good results.</p>

          <q-stepper-navigation>
            <div class="row">
              <div class="col q-gutter-sm">
                <q-btn color="green" no-caps :label="$t('Generate your ChAruCo board')" @click="dialog_charuco_generator = true" />
              </div>
              <div class="col q-gutter-sm" align="right">
                <q-btn no-caps @click="step = 1" color="green" label="Start" />
              </div>
            </div>
          </q-stepper-navigation>
        </q-step>

        <q-step :name="1" title="Preflight check before starting the calibration" icon="sym_o_verified" :done="step > 1">
          <p>
            Following nodes are configured as multicamera backend currently. Please confirm, that the backend is setup correctly as later changes
            invalidate the calibration.
          </p>
          <q-markup-table flat bordered>
            <thead>
              <tr>
                <th class="text-left">Stream</th>
                <th class="text-left">Device Description</th>
                <th class="text-left">Index/Device-Id</th>
                <th class="text-left">Address</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(node, idx) in multicamNodes" :key="idx">
                <td class="text-left">
                  <q-img style="width: 200px" fit="contain" :src="`/api/aquisition/stream.mjpg?index_subdevice=${idx}`" />
                </td>
                <td class="text-left">{{ node.description }}</td>
                <td class="text-left">{{ idx }}</td>
                <td class="text-left">{{ node.address }}</td>
              </tr>
            </tbody>
          </q-markup-table>

          <q-stepper-navigation>
            <div class="row">
              <div class="col q-gutter-sm">
                <q-btn flat no-caps color="green" label="Configure backends" icon-right="sym_o_open_in_new" to="/admin/config" />
              </div>
              <div class="col q-gutter-sm" align="right">
                <q-btn flat no-caps @click="step = 0" color="green" :label="$t('BTN_LABEL_BACK')" />
                <q-btn no-caps @click="step = 2" color="green" :label="$t('Continue')" />
              </div>
            </div>
          </q-stepper-navigation>
        </q-step>

        <q-step :name="2" title="Capture images for calibration" icon="sym_o_camera" :done="step > 2">
          <p>
            Now capture images with the CharuCo board. Please check that the images look well, the CharuCo board is about in the center of the image
            and in roughly 2m distance to the camera array. Ensure the scene is well lit and all cameras are in focus. Do not move the board during
            the capture.
          </p>

          <q-btn no-caps class="q-mb-md" @click="capture" color="green" label="Capture" :loading="capture_in_progress" />

          <div>
            <q-scroll-area class="q-mb-md" style="height: 220px; width: 100%" v-for="(node, node_idx) in multicamNodes" :key="node_idx">
              <div style="height: 100%" class="col">
                <div style="height: 20px">Camera Index/Device-Id: {{ node_idx }}</div>

                <div style="height: 200px" class="row no-wrap">
                  <!-- Live Preview -->
                  <q-card style="width: 250px; height: 100%" class="q-pa-sm" flat>
                    <q-img fit="contain" :src="`/api/aquisition/stream.mjpg?index_subdevice=${node_idx}`" />

                    <q-card-actions align="right">
                      <q-btn flat round color="primary" icon="sym_o_camera" @click="capture" :loading="capture_in_progress" />
                    </q-card-actions>
                  </q-card>

                  <!-- Captured Images -->
                  <q-card v-for="(image, image_idx) in images[node_idx]" :key="image_idx" style="width: 250px; height: 100%" class="q-pa-sm" flat>
                    <q-img loading="lazy" fit="contain" :src="`/api/aquisition/multicam/${image}`" />

                    <q-card-actions align="right">
                      <q-btn flat round color="red" icon="sym_o_delete" @click="images[node_idx].splice(image_idx, 1)" />
                      <q-btn flat round color="primary" icon="sym_o_download" :to="`/api/aquisition/multicam/${image}`" target="_blank" />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </q-scroll-area>
          </div>

          <q-stepper-navigation>
            <div class="row">
              <div class="col q-gutter-sm">
                <q-btn no-caps @click="capture" color="green" label="Capture " :loading="capture_in_progress" />
              </div>
              <div class="col q-gutter-sm" align="right">
                <q-btn flat no-caps @click="step = 1" color="green" :label="$t('BTN_LABEL_BACK')" />
                <q-btn no-caps @click="step = 3" color="green" :label="$t('Continue')" :disable="images.length == 0" />
              </div>
            </div>
          </q-stepper-navigation>
        </q-step>

        <q-step :name="3" title="Calculate the new calibration data" icon="sym_o_calculate" :done="step > 3">
          Press the button to calculate and save the new data.
          <p>Result: {{ calculation_result }}</p>

          <q-stepper-navigation>
            <div class="row">
              <div class="col q-gutter-sm">
                <q-btn
                  no-caps
                  color="green"
                  :disable="images.length == 0"
                  :label="$t('Calculate')"
                  @click="postCalibration"
                  :loading="calculation_in_progress"
                />
              </div>
              <div class="col q-gutter-sm" align="right">
                <q-btn no-caps flat @click="step = 2" color="green" :label="$t('BTN_LABEL_BACK')" />
                <q-btn no-caps @click="step = 4" color="green" :label="$t('Continue')" :disable="!calculation_successful" />
              </div>
            </div>
          </q-stepper-navigation>
        </q-step>

        <q-step :name="4" title="Confirm the result" icon="sym_o_flag">
          ok, done, here is your new wiggle

          <q-stepper-navigation class="q-gutter-sm">
            <q-btn no-caps color="green" :label="$t('Finish')" disable />
            <q-btn no-caps flat @click="step = 3" color="green" :label="$t('BTN_LABEL_BACK')" />
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
    </div>

    <q-dialog v-model="dialog_charuco_generator">
      <charuco-generator></charuco-generator>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { remoteProcedureCall, _fetch } from '../util/fetch_api'

import { ref } from 'vue'
import { useConfigurationStore } from '../stores/configuration-store'
import type { components } from 'src/dto/api'
import CharucoGenerator from 'src/components/CharucoGenerator.vue'
// const GroupCameraWigglecam1 = components['schemas']['GroupCameraWigglecam']
type WigglecamNodes = components['schemas']['WigglecamNodes']
const configurationStore = useConfigurationStore()

const dialog_charuco_generator = ref(false)
const images = ref<string[][]>([])
const step = ref(0)
const capture_in_progress = ref(false)
const calculation_in_progress = ref(false)
const calculation_successful = ref(false)
const calculation_result = ref('')

async function capture() {
  try {
    capture_in_progress.value = true
    const res = await _fetch('/api/aquisition/multicam')
    const data: string[] = await res.json() // one image per camera

    if (images.value.length === 0) {
      images.value = data.map((img) => [img])
    } else {
      data.forEach((img, i) => images.value[i].unshift(img)) // add new to the beginning of the array
    }
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
    calculation_result.value = ''

    const res = await _fetch('/api/admin/multicamera/calibration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(images.value),
    })
    const result = await res.json()
    console.log('Calibration result:', result)
    if (!res.ok) {
      throw new Error('Server returned code ' + res.status + ': ' + result['detail'])
    }
    calculation_result.value = result

    calculation_successful.value = true
  } catch (err) {
    console.error('Error posting calibration:', err)
    calculation_result.value = err
  } finally {
    calculation_in_progress.value = false
  }
}
const multicamNodes = computed<WigglecamNodes[]>(() => {
  const group_backends = configurationStore.configuration.backends.group_backends
  const index_backend_multicam = configurationStore.configuration.backends.index_backend_multicam
  if (group_backends == null || index_backend_multicam == null) {
    console.error('cannot get multicam backend from config')
    return []
  }

  const backend = group_backends[index_backend_multicam].backend_config
  console.log(backend)

  if (backend.backend_type === 'Wigglecam') {
    // Now TypeScript knows this branch has `devices`
    return backend.devices
  }

  console.error('selected backend is not a Wigglecam')
  return []
})
</script>
