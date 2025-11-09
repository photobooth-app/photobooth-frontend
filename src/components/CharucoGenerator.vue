<template>
  <q-card style="min-width: 450px; max-height: 80vh; max-width: 80vh" flat>
    <q-card-section>
      <div class="text-h6">{{ $t('ChAruCo Board Generator') }}</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="row no-wrap q-gutter-x-md">
        <q-input v-model="charucoRequest.squares_x" label="Squares X" />
        <q-input v-model="charucoRequest.squares_y" label="Squares Y" />
      </div>
      <div class="row no-wrap q-gutter-x-md">
        <q-input v-model="charucoRequest.square_length_mm" label="Square Length (mm)" />
        <q-input v-model="charucoRequest.marker_length_mm" label="Marker Length (mm)" />
      </div>
    </q-card-section>

    <q-card-actions align="right" class="text-primary">
      <q-btn no-caps flat label="Cancel" v-close-popup />
      <q-btn color="green" no-caps label="Generate" @click="postBoardDefinition" :loading="loading" />
    </q-card-actions>

    <q-card-section>
      <q-img v-if="imageUrl" :src="imageUrl" alt="Charuco Board" style="max-width: 600px; max-height: 400px" fit="contain" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { _fetch } from 'src/util/fetch_api'
import { ref } from 'vue'
import type { components } from '../dto/api'
import { Notify } from 'quasar'

type CharucoRequest = components['schemas']['CharucoRequest']

const charucoRequest = ref<CharucoRequest>({
  squares_x: 14,
  squares_y: 9,
  square_length_mm: 20,
  marker_length_mm: 15,
})
const imageUrl = ref<string | null>(null)
const loading = ref(false)

// GET the image with fetch
async function postBoardDefinition() {
  try {
    loading.value = true

    const response = await _fetch('/api/admin/multicamera/calibration/charuco', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(charucoRequest.value),
    })

    if (!response.ok) {
      const err_msg = await response.json()
      throw new Error(`Request failed: ${err_msg['detail']}`)
    }

    const blob = await response.blob()
    imageUrl.value = URL.createObjectURL(blob)
    loading.value = false
  } catch (err: unknown) {
    imageUrl.value = null
    console.warn(err)

    Notify.create({
      message: String(err),
      caption: 'Error getting configuration scheme',
      color: 'negative',
    })
  } finally {
    // commit('setLoading', false);
  }
}
</script>
