<template>
  <q-page id="admin-files-page" padding>
    <q-breadcrumbs gutter="sm" class="q-pa-md" style="cursor: pointer">
      <q-breadcrumbs-el :label="$t('TITLE_FILES_WORKING_DIR')" icon="sym_o_home" @click="onBreadcrumbClick(-1)" />
      <q-breadcrumbs-el v-for="(value, key) in breadcrumbs" :key="key" @click="onBreadcrumbClick(key)">
        {{ value }}
      </q-breadcrumbs-el>
    </q-breadcrumbs>

    <q-dialog v-model="dialog_create_new_folder">
      <q-card style="min-width: 350px" flat>
        <q-card-section>
          <div class="text-h6">{{ $t('TITLE_FILES_NEW_FOLDER_DIALOG') }}</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input v-model="new_folder_name" dense autofocus @keyup.enter="[createNewFolder(new_folder_name), (dialog_create_new_folder = false)]" />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
          <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_FILES_CREATE_NEW_FOLDER')" @click="createNewFolder(new_folder_name)" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="dialog_upload_files">
      <q-card style="min-width: 350px" flat>
        <q-card-section>
          <div class="text-h6">
            {{ $t('TITLE_FILES_UPLOAD_FILES_DIALOG') }}
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-uploader
            flat
            label="Upload Files"
            url="/api/admin/files/file/upload"
            :form-fields="[{ name: 'upload_target_folder', value: folder_current }]"
            :headers="[{ name: 'authorization', value: `Bearer ${getAccessToken()}` }]"
            field-name="uploaded_files"
            batch
            multiple
            @finish="getFolderContent(folder_current)"
            @uploaded="dialog_upload_files = false"
            style="width: 100%"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn no-caps v-close-popup flat label="Cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-table
      v-model:selected="selected"
      class="full-height"
      flat
      title="File Browser"
      :pagination="pagination"
      :rows="folder_rows"
      :filter="filter"
      :columns="folder_columns"
      color="primary"
      row-key="filepath"
      dense
      :loading="folder_loading"
      selection="multiple"
      virtual-scroll
      :rows-per-page-options="[0]"
    >
      <template #body-cell-type="props">
        <q-td :props="props">
          <q-icon v-if="props.value" name="sym_o_folder" />
          <q-icon v-else name="sym_o_description" />
        </q-td>
      </template>

      <template #body-cell-name="props">
        <q-td :props="props" style="cursor: pointer">
          <div @click="onNameClick(props.row)">{{ props.value }}</div>
        </q-td>
      </template>

      <template #top-left>
        <q-dialog v-model="confirm_delete">
          <q-card class="q-pa-sm" style="min-width: 350px">
            <q-card-section class="row items-center" style="flex-wrap: nowrap">
              <q-avatar icon="sym_o_delete" color="negative" text-color="white" />
              <span class="q-ml-sm">{{ $t('Are you sure you want to delete the selected files and subfolders?') }}</span>
            </q-card-section>

            <q-card-actions align="right">
              <q-btn no-caps v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" color="primary" />
              <q-btn no-caps v-close-popup :label="$t('Yes, delete')" color="negative" @click="deleteItems(selected)" />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <div>
          <q-btn no-caps :disable="folder_loading" :label="$t('BTN_LABEL_FILES_NEW_FOLDER')" @click="dialog_create_new_folder = true" />
          <q-btn no-caps class="q-ml-sm" :disable="folder_loading" :label="$t('BTN_LABEL_FILES_UPLOAD_FILE')" @click="dialog_upload_files = true" />
          <q-btn no-caps class="q-ml-sm" :disable="selected.length == 0" :label="$t('BTN_LABEL_FILES_DOWNLOAD_ZIP')" @click="getZip(selected)" />
          <q-btn
            no-caps
            class="q-ml-sm"
            color="negative"
            :disable="selected.length == 0"
            :label="$t('BTN_LABEL_FILES_DELETE_SELECTED')"
            @click="confirm_delete = true"
          />
        </div>
      </template>

      <template #top-right>
        <q-input v-model="filter" borderless dense debounce="300" :placeholder="$t('TEXT_PLACEHOLDER_SEARCH')">
          <template #append>
            <q-icon name="sym_o_search" />
          </template>
        </q-input>
      </template>
    </q-table>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { _fetch } from 'src/util/fetch_api'
import { getAccessToken } from 'src/util/auth'

const $q = useQuasar()

export declare type AlignType = 'left' | 'center' | 'right'
export interface PathListItem {
  name: string
  filepath: string
  is_dir: boolean
  size: number
}

const folder_current = ref('')
const folder_loading = ref(false)
const folder_rows = ref([] as PathListItem[])
const folder_columns = [
  {
    label: 'Type',
    name: 'type',
    required: true,
    align: 'left' as AlignType,
    field: 'is_dir',
    style: 'width: 25px',
  },
  {
    label: 'Name',
    name: 'name',
    required: true,
    align: 'left' as AlignType,
    field: 'name',
  },
  {
    label: 'Path',
    name: 'filepath',
    required: true,
    align: 'left' as AlignType,
    field: 'filepath',
  },
  {
    label: 'Size',
    name: 'size',
    required: true,
    align: 'left' as AlignType,
    field: 'size',
    format: (val: number) => formatBytes(val, 0),
  },
]
const selected = ref([])
const filter = ref('')
const dialog_create_new_folder = ref(false)
const new_folder_name = ref('')
const confirm_delete = ref(false)
const dialog_upload_files = ref(false)
const pagination = ref({ rowsPerPage: 0 }) // force display all so virtual scrolling works best

onMounted(() => {
  getFolderContent()
})

watch(folder_current, (newFolder: string) => {
  // console.log("change directory: ", newFolder);
  getFolderContent(newFolder)
})

const breadcrumbs = computed(() => {
  if (!folder_current.value) return [] // return empty array if no value.

  const breadcrumbs = trimSlashes(folder_current.value).split('/')
  return breadcrumbs
})

const onNameClick = (row: PathListItem) => {
  if (row.is_dir) {
    folder_current.value = row.filepath
  } else {
    _fetch(`/api/admin/files/file/${row.filepath}`, {})
      .then((res) => res.blob())
      .then((blob) => window.open(URL.createObjectURL(blob)))
  }
}

const onBreadcrumbClick = (navigate_to_level = -1) => {
  // level=-1->root folder, >=0 subfolders
  folder_current.value = breadcrumbs.value.slice(0, navigate_to_level + 1).join('/')
}

async function getFolderContent(folder = '') {
  folder_loading.value = true
  selected.value = []

  try {
    const response = await _fetch(`/api/admin/files/list/${folder}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    })

    const json = await response.json()

    if (response.ok) {
      // if HTTP-status is 200-299
      // get the response body (the method explained below)
      folder_rows.value = json
    } else {
      console.error(json)
      throw `Error ${response.status} getting listing. Please check logs.`
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      message: String(error),
      caption: 'Request Error!',
      color: 'negative',
    })
  }

  folder_loading.value = false
}

async function getZip(selected = []) {
  try {
    const response = await _fetch('/api/admin/files/zip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selected),
    })

    if (response.ok) {
      // if HTTP-status is 200-299
      // get the response body (the method explained below)
      $q.notify({
        message: 'Downloading ZIP file',
        caption: 'Files',
        type: 'positive',
      })

      const blob = await response.blob()
      const file = window.URL.createObjectURL(blob)
      window.location.assign(file)
    } else {
      const json = await response.json()
      console.error(json)
      throw `Error ${response.status} creating zip. Please check logs.`
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      message: String(error),
      caption: 'Request Error!',
      color: 'negative',
    })
  }
}

async function deleteItems(selected = []) {
  try {
    const response = await _fetch('/api/admin/files/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(selected),
    })

    if (response.ok) {
      // if HTTP-status is 200-299
      // get the response body (the method explained below)
      $q.notify({
        message: 'Selected items deleted.',
        caption: 'Files',
        type: 'positive',
      })
    } else {
      console.error(response)
      throw `Error ${response.status} deleting items. Please check logs.`
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      message: String(error),
      caption: 'Request Error!',
      color: 'negative',
    })
  }

  // reload in every case (also resets selected items, which is good in delete process)
  getFolderContent(folder_current.value)
}

async function createNewFolder(folder_name: string) {
  // https://javascript.info/fetch

  let newfolder_fullpath = folder_name

  if (folder_current.value) {
    // add current folder if not empty (avoid to appear like an absolute path)
    newfolder_fullpath = folder_current.value + '/' + newfolder_fullpath
  }

  console.log(newfolder_fullpath)
  try {
    const response = await _fetch('/api/admin/files/folder/new', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newfolder_fullpath),
    })

    const json = await response.json()

    if (response.ok) {
      // if HTTP-status is 200-299
      // get the response body (the method explained below)
      $q.notify({
        message: `Folder "${folder_name}" created.`,
        caption: 'Files',
        type: 'positive',
      })

      // reload
      getFolderContent(folder_current.value)
    } else {
      console.error(json)
      throw `Error ${response.status} while creating folder. Please check logs.`
    }
  } catch (error) {
    console.error(error)
    $q.notify({
      message: String(error),
      caption: 'Request Error!',
      color: 'negative',
    })
  }
}

const trimSlashes = (str: string) =>
  str
    .split('/')
    .filter((v) => v !== '')
    .join('/')

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
</script>
