<!-- eslint-disable @intlify/vue-i18n/no-raw-text -->
<template>
  <q-page id="multicam-page" padding>
    <q-card flat class="q-pa-md q-mb-md">
      <q-card-section>
        <div class="text-h5">{{ $t('Multicamera Tools') }}</div>
      </q-card-section>
      <q-card-section>
        <p>{{ $t('adminmulticampage.intro') }}</p>
        <p>{{ $t('adminmulticampage.paragraph1') }}</p>
        <p>{{ $t('adminmulticampage.paragraph2') }}</p>

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

        <p>{{ $t('The tool is not available, because there is no multicamera enabled in the backends.') }}</p>
      </q-card>

      <q-stepper v-else v-model="step" vertical animated flat class="q-pa-md q-mb-md">
        <div class="text-h5">{{ $t('Calibrate') }}</div>

        <q-step :name="0" title="Set your calibration target" icon="sym_o_target" :done="step > 0">
          <p>{{ $t('adminmulticampage.step0.paragraph1') }}</p>
          <p>{{ $t('adminmulticampage.step0.paragraph2') }}</p>

          <q-card flat>
            <q-card-section>
              <div class="text-h6">{{ $t('ChAruCo Board Parameter') }}</div>
            </q-card-section>

            <q-card-section class="q-pt-none">
              <div class="row no-wrap q-gutter-x-md">
                <q-input v-model="charucoBoardDefinition.squares_x" :label="$t('Squares X')" />
                <q-input v-model="charucoBoardDefinition.squares_y" :label="$t('Squares Y')" />
              </div>
              <div class="row no-wrap q-gutter-x-md">
                <q-input v-model="charucoBoardDefinition.square_length_mm" :label="$t('Square Length (mm)')" />
                <q-input v-model="charucoBoardDefinition.marker_length_mm" :label="$t('Marker Length (mm)')" />
              </div>
            </q-card-section>
          </q-card>

          <q-stepper-navigation>
            <div class="row">
              <div class="col q-gutter-sm">
                <q-btn color="accent" no-caps :label="$t('Generate your ChAruCo board')" @click="dialogCharucoGenerator = true" />
              </div>
              <div class="col q-gutter-sm" align="right">
                <q-btn no-caps @click="step = 1" color="green" label="Start" icon-right="sym_o_arrow_right" />
              </div>
            </div>
          </q-stepper-navigation>
        </q-step>

        <q-step :name="1" title="Preflight check before starting the calibration" icon="sym_o_verified" :done="step > 1">
          <p>{{ $t('adminmulticampage.step1.paragraph1') }}</p>
          <p>{{ $t('adminmulticampage.step1.paragraph2') }}</p>

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
                <q-btn flat no-caps @click="step = 0" color="green" :label="$t('BTN_LABEL_BACK')" icon="sym_o_arrow_left" />
                <q-btn no-caps @click="step = 2" color="green" :label="$t('Continue')" icon-right="sym_o_arrow_right" />
              </div>
            </div>
          </q-stepper-navigation>
        </q-step>

        <q-step :name="2" title="Capture images for calibration" icon="sym_o_camera" :done="step > 2">
          <p>{{ $t('adminmulticampage.step2.paragraph1') }}</p>
          <p>{{ $t('adminmulticampage.step2.paragraph2') }}</p>

          <q-btn no-caps class="q-mb-md" @click="capture" color="accent" label="Capture" :loading="loading" />

          <div>
            <q-scroll-area class="q-mb-md" style="height: 220px; width: 100%" v-for="(node, node_idx) in multicamNodes" :key="node_idx">
              <div style="height: 100%" class="col">
                <div style="height: 20px">Camera Index/Device-Id: {{ node_idx }}</div>

                <div style="height: 200px" class="row no-wrap">
                  <!-- Live Preview -->
                  <q-card style="width: 250px; height: 100%" class="q-pa-sm" flat>
                    <q-img fit="contain" :src="`/api/aquisition/stream.mjpg?index_subdevice=${node_idx}`" />

                    <q-card-actions align="right">
                      <q-btn flat round color="primary" icon="sym_o_camera" @click="capture" :loading="loading" />
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
                <q-btn no-caps @click="capture" color="accent" label="Capture" :loading="loading" />
              </div>
              <div class="col q-gutter-sm" align="right">
                <q-btn flat no-caps @click="step = 1" color="green" :label="$t('BTN_LABEL_BACK')" icon="sym_o_arrow_left" />
                <q-btn no-caps @click="step = 3" color="green" :label="$t('Continue')" :disable="images.length == 0" icon-right="sym_o_arrow_right" />
              </div>
            </div>
          </q-stepper-navigation>
        </q-step>

        <q-step :name="3" title="Calculate the new calibration data" icon="sym_o_calculate" :done="step > 3">
          <p>{{ $t('adminmulticampage.step3.paragraph1') }}</p>
          <p>{{ $t('adminmulticampage.step3.paragraph2') }}</p>

          <q-stepper-navigation>
            <div class="row">
              <div class="col q-gutter-sm">
                <q-btn no-caps color="accent" :disable="images.length == 0" :label="$t('Calculate')" @click="postCalibration" :loading="loading" />
              </div>
              <div class="col q-gutter-sm" align="right">
                <q-btn no-caps flat @click="step = 2" color="green" :label="$t('BTN_LABEL_BACK')" icon="sym_o_arrow_left" />
                <q-btn no-caps @click="step = 4" color="green" :label="$t('Continue')" icon-right="sym_o_arrow_right" />
              </div>
            </div>
          </q-stepper-navigation>
        </q-step>

        <q-step :name="4" title="Confirm the result" icon="sym_o_flag">
          <p>{{ $t('adminmulticampage.step4.paragraph1') }}</p>
          <p>{{ $t('adminmulticampage.step4.paragraph2') }}</p>

          <q-img v-if="wigglegramResult" :src="wigglegramResult" alt="Charuco Board" style="max-width: 600px; max-height: 400px" fit="contain" />

          <q-stepper-navigation>
            <div class="row">
              <div class="col q-gutter-sm">
                <q-btn no-caps color="accent" :label="$t('Capture and create wigglegram')" @click="captureCreateWigglegram" :loading="loading" />
              </div>
              <div class="col q-gutter-sm" align="right">
                <q-btn no-caps flat @click="step = 3" color="green" :label="$t('BTN_LABEL_BACK')" icon="sym_o_arrow_left" />
              </div>
            </div>
          </q-stepper-navigation>
        </q-step>
      </q-stepper>
    </div>

    <q-dialog v-model="dialogCharucoGenerator">
      <charuco-generator :charucoBoardDefinition="charucoBoardDefinition"></charuco-generator>
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
import { Notify } from 'quasar'

type WigglecamNodes = components['schemas']['WigglecamNodes']
type CharucoBoardDefinition = components['schemas']['CharucoBoardDefinition']
type CalibrationRequest = components['schemas']['CalibrationRequest']
const configurationStore = useConfigurationStore()

const dialogCharucoGenerator = ref(false)
const charucoBoardDefinition = ref<CharucoBoardDefinition>({
  squares_x: 14,
  squares_y: 9,
  square_length_mm: 20,
  marker_length_mm: 15,
})
const images = ref<string[][]>([])
const step = ref(0)
const loading = ref(false)
const wigglegramResult = ref<string | null>(null)

async function capture() {
  try {
    loading.value = true
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
    loading.value = false
  }
}

async function postCalibration() {
  try {
    loading.value = true

    const res = await _fetch('/api/admin/multicamera/calibration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filess_in: images.value,
        board_definition: charucoBoardDefinition.value,
      } satisfies CalibrationRequest),
    })
    const result = await res.json()
    console.log('Calibration result:', result)
    if (!res.ok) {
      throw new Error('Server returned code ' + res.status + ': ' + result['detail'])
    }

    Notify.create({
      message: 'Calibration finished and saved.',
      color: 'positive',
    })
  } catch (err) {
    console.error('Error posting calibration:', err)
    console.warn(err)

    Notify.create({
      message: String(err),
      caption: 'Error posting the calibration data',
      color: 'negative',
    })
  } finally {
    loading.value = false
  }
}

// GET the image with fetch
async function captureCreateWigglegram() {
  try {
    loading.value = true

    const response = await _fetch('/api/admin/multicamera/result', {
      method: 'GET',
    })

    if (!response.ok) {
      const err_msg = await response.json()
      throw new Error(`Request failed: ${err_msg['detail']}`)
    }

    const blob = await response.blob()
    wigglegramResult.value = URL.createObjectURL(blob)
    loading.value = false
  } catch (err: unknown) {
    wigglegramResult.value = null
    console.warn(err)

    Notify.create({
      message: String(err),
      caption: 'Error creating the wigglegram',
      color: 'negative',
    })
  } finally {
    // commit('setLoading', false);
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
