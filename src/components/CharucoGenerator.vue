<template>
  <q-card style="min-width: 450px; max-height: 80vh; max-width: 80vh" flat>
    <q-card-section>
      <div class="text-h6">{{ $t('ChAruCo Board Generator') }}</div>
    </q-card-section>

    <q-card-section class="q-pt-none">
      <div class="row no-wrap q-gutter-x-md">
        <q-input v-model="charucoBoardDefinitionModel.squares_x" :label="$t('Squares X')" />
        <q-input v-model="charucoBoardDefinitionModel.squares_y" :label="$t('Squares Y')" />
      </div>
      <div class="row no-wrap q-gutter-x-md">
        <q-input v-model="charucoBoardDefinitionModel.square_length_mm" :label="$t('Square Length (mm)')" />
        <q-input v-model="charucoBoardDefinitionModel.marker_length_mm" :label="$t('Marker Length (mm)')" />
      </div>
    </q-card-section>

    <q-card-actions align="right" class="text-primary">
      <q-btn no-caps flat label="Cancel" v-close-popup />
      <q-btn color="green" no-caps label="Generate" @click="postBoardDefinition" :loading="loading" />
    </q-card-actions>

    <q-card-section v-if="imageUrl">
      <q-img :src="imageUrl" alt="Charuco Board" style="max-width: 600px; max-height: 400px" fit="contain" />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { _fetch } from 'src/util/fetch_api'
import { ref } from 'vue'
import type { components } from '../dto/api'
import { Notify } from 'quasar'

type CharucoBoardDefinition = components['schemas']['CharucoBoardDefinition']

const props = withDefaults(defineProps<{ charucoBoardDefinition: CharucoBoardDefinition }>(), {
  charucoBoardDefinition: () => ({
    squares_x: 14,
    squares_y: 9,
    square_length_mm: 20,
    marker_length_mm: 15,
  }),
})

// Copy props once into an internal model
const charucoBoardDefinitionModel = ref<CharucoBoardDefinition>({ ...props.charucoBoardDefinition })
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
      body: JSON.stringify(charucoBoardDefinitionModel.value),
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
      caption: 'Error generating the board',
      color: 'negative',
    })
  } finally {
    // commit('setLoading', false);
  }
}
</script>
