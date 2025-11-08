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
    <div>
      <q-card v-if="multicamNodes.length == 0" flat class="q-pa-md q-mb-md">
        <div class="text-h5">
          {{ $t('Calibrate') }} <q-badge color="negative" align="top"><q-icon name="sym_o_error" color="white" size="15px" /> </q-badge>
        </div>

        <p>Not available, because there is no multicamera/wigglecamera enabled in the backends.</p>
      </q-card>

      <q-stepper v-else v-model="step" vertical animated flat class="q-pa-md q-mb-md">
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
                <th class="text-right">Index/Device-Id</th>
                <th class="text-right">Address</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(node, idx) in multicamNodes" :key="idx">
                <td class="text-left">{{ node.description }}</td>
                <td class="text-right">{{ idx }}</td>
                <td class="text-right">{{ node.address }}</td>
              </tr>
            </tbody>
          </q-markup-table>

          <q-stepper-navigation>
            <div class="row">
              <div class="col q-gutter-sm">
                <q-btn flat no-caps color="green" label="Configure backends" icon-right="sym_o_open_in_new" to="/admin/config" />
              </div>
              <div class="col q-gutter-sm" align="right">
                <q-btn no-caps @click="step = 2" color="green" label="Start" />
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

          <div v-if="images.length > 0">
            <q-scroll-area class="q-mb-md" style="height: 220px; width: 100%" v-for="(camera, camera_idx) in images" :key="camera_idx">
              <div style="height: 100%" class="col">
                <div style="height: 20px">Camera Index/Device-Id: {{ camera_idx }}</div>

                <div style="height: 200px" class="row no-wrap">
                  <q-card v-for="(image, image_idx) in camera" :key="image_idx" style="width: 250px; height: 100%" class="q-pa-sm" flat>
                    <a :href="`/api/aquisition/multicam/${image}`" target="_blank">
                      <q-img loading="lazy" fit="contain" :src="`/api/aquisition/multicam/${image}`" />
                    </a>

                    <q-card-actions align="right">
                      <q-btn flat round color="red" icon="sym_o_delete" />
                      <q-btn flat round color="primary" icon="sym_o_download" />
                    </q-card-actions>
                  </q-card>
                </div>
              </div>
            </q-scroll-area>
            <!--
            <q-card bordered flat class="q-ma-sm row items-start q-gutter-md" v-for="(camera, camera_idx) in images" :key="camera_idx">
              <q-card v-for="(image, image_idx) in camera" :key="image_idx" style="width: 100%; max-width: 300px" class="q-pa-sm" flat>
                <a :href="`/api/aquisition/multicam/${image}`" target="_blank">
                  <q-img fit="contain" :src="`/api/aquisition/multicam/${image}`" />
                </a>
                <q-list>
                  <q-item>
                    <q-item-section>
                      <q-item-label>{{ multicamNodes[camera_idx].description }}</q-item-label>
                      <q-item-label caption>Description</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label>{{ camera_idx }}</q-item-label>
                      <q-item-label caption>Index/DeviceId</q-item-label>
                    </q-item-section>
                  </q-item>

                  <q-item>
                    <q-item-section>
                      <q-item-label>{{ multicamNodes[camera_idx].address }}</q-item-label>
                      <q-item-label caption>Address</q-item-label>
                    </q-item-section>
                  </q-item>
                </q-list>
              </q-card>
            </q-card> -->
          </div>

          <q-stepper-navigation>
            <div class="row">
              <div class="col q-gutter-sm">
                <q-btn v-if="images.length > 0" no-caps @click="capture" color="green" label="Capture more" :loading="capture_in_progress" />
              </div>
              <div class="col q-gutter-sm" align="right">
                <q-btn flat no-caps @click="step = 1" color="green" label="Back" />
                <q-btn no-caps @click="step = 3" color="green" label="Continue" :disable="images.length == 0" />
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
                <q-btn no-caps flat @click="step = 2" color="green" label="Back" />
                <q-btn no-caps @click="step = 4" color="green" label="Continue" :disable="!calculation_successful" />
              </div>
            </div>
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
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { remoteProcedureCall, _fetch } from '../util/fetch_api'
import { ref } from 'vue'
import { useConfigurationStore } from '../stores/configuration-store'
import type { components } from 'src/dto/api'
// const GroupCameraWigglecam1 = components['schemas']['GroupCameraWigglecam']
type WigglecamNodes = components['schemas']['WigglecamNodes']
const configurationStore = useConfigurationStore()

const images = ref<string[][]>([])
const step = ref(1)
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
      data.forEach((img, i) => images.value[i].push(img))
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
