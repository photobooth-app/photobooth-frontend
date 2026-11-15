<template>
  <q-select
    v-model="model"
    dense
    outlined
    clearable
    use-input
    hide-selected
    fill-input
    input-debounce="0"
    emit-value
    map-options
    :label="label"
    :hint="hint ?? (model ? String(model) : undefined)"
    :disable="disable"
    :options="options"
    @filter="filter"
  >
    <template #option="scope">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
          <q-item-label caption>{{ scope.opt.folder }}</q-item-label>
        </q-item-section>
      </q-item>
    </template>
    <template #no-option>
      <q-item>
        <q-item-section class="text-grey-7">{{ $t('No matching files in the userdata folder.') }}</q-item-section>
      </q-item>
    </template>
  </q-select>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { _fetch } from '@/util/fetch_api'

/** Pick a file from the backend's userdata folder (images or fonts), with search. */

const EXTENSIONS = {
  image: /\.(png|jpe?g|gif|webp|bmp)$/i,
  font: /\.(ttf|otf)$/i,
}

const model = defineModel<string | null | undefined>({ default: null })
const {
  kind = 'image',
  label,
  hint,
  disable = false,
} = defineProps<{
  kind?: keyof typeof EXTENSIONS
  label?: string
  hint?: string
  disable?: boolean
}>()

// one request for all selects in the editor
let filesPromise: Promise<string[]> | null = null
const loadFiles = () => {
  filesPromise ??= _fetch('/api/admin/enumerate/userfiles?q=')
    .then(response => (response.ok ? (response.json() as Promise<string[]>) : []))
    .catch(error => {
      console.warn('cannot list userfiles', error)
      filesPromise = null
      return []
    })
  return filesPromise
}

interface FileOption {
  label: string
  folder: string
  value: string
}

// show the file name, the folder goes to the caption: full paths are too long for the field
const toOption = (path: string): FileOption => {
  const parts = path.split(/[\\/]/)
  return { label: parts.pop() ?? path, folder: parts.join('/'), value: path }
}

const files = ref<string[]>([])
const matching = computed(() => files.value.filter(f => EXTENSIONS[kind].test(f)).map(toOption))
const options = ref<FileOption[]>([])

const filter = (value: string, doneFn: (fn: () => void) => void) => {
  loadFiles().then(list => {
    files.value = list
    doneFn(() => {
      const needle = value.toLowerCase()
      options.value = matching.value.filter(f => f.value.toLowerCase().includes(needle))
    })
  })
}

onMounted(() =>
  loadFiles().then(list => {
    files.value = list
    options.value = matching.value
  })
)
</script>
