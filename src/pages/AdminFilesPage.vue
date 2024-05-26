<template>
  <q-page id="admin-files-page" padding>
    <div class="q-pa-md">
      <q-breadcrumbs gutter="sm" style="cursor: pointer">
        <q-breadcrumbs-el :label="$t('TITLE_FILES_WORKING_DIR')" icon="home" @click="onBreadcrumbClick(-1)" />
        <q-breadcrumbs-el v-for="(value, key) in breadcrumbs" :key="key" @click="onBreadcrumbClick(key)">
          {{ value }}
        </q-breadcrumbs-el>
      </q-breadcrumbs>

      <q-dialog v-model="dialog_create_new_folder">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">{{ $t('TITLE_FILES_NEW_FOLDER_DIALOG') }}</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input
              v-model="new_folder_name"
              dense
              autofocus
              @keyup.enter="
                createNewFolder(new_folder_name);
                dialog_create_new_folder = false;
              "
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" />
            <q-btn v-close-popup flat :label="$t('BTN_LABEL_FILES_CREATE_NEW_FOLDER')" @click="createNewFolder(new_folder_name)" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="dialog_upload_files">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">
              {{ $t('TITLE_FILES_UPLOAD_FILES_DIALOG') }}
            </div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-uploader
              label="Upload Files"
              url="/api/admin/files/file/upload"
              :form-fields="[{ name: 'upload_target_folder', value: folder_current }]"
              :headers="[{ name: 'authorization', value: `Bearer ${getAccessToken()}` }]"
              field-name="uploaded_files"
              batch
              multiple
              @finish="getFolderContent(folder_current)"
              @uploaded="dialog_upload_files = false"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn v-close-popup flat label="Cancel" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-table
        v-model:selected="selected"
        class="full-height"
        flat
        bordered
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
            <q-icon v-if="props.value" name="folder" />
            <q-icon v-else name="description" />
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
                <q-avatar icon="delete" color="negative" text-color="white" />
                <span class="q-ml-sm">{{ $t('Are you sure you want to delete the selected files and subfolders?') }}</span>
              </q-card-section>

              <q-card-actions align="right">
                <q-btn v-close-popup flat :label="$t('BTN_LABEL_CANCEL')" color="primary" />
                <q-btn v-close-popup :label="$t('yes, delete')" color="negative" @click="deleteItems(selected)" />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <div>
            <q-btn :disable="folder_loading" :label="$t('BTN_LABEL_FILES_NEW_FOLDER')" @click="dialog_create_new_folder = true" />
            <q-btn class="q-ml-sm" :disable="folder_loading" :label="$t('BTN_LABEL_FILES_UPLOAD_FILE')" @click="dialog_upload_files = true" />
            <q-btn class="q-ml-sm" :disable="selected.length == 0" :label="$t('BTN_LABEL_FILES_DOWNLOAD_ZIP')" @click="getZip(selected)" />
            <q-btn
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
              <q-icon name="search" />
            </template>
          </q-input>
        </template>
      </q-table>
    </div>
  </q-page>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { openURL, useQuasar } from 'quasar';
import { _fetch } from 'src/util/fetch_api';
import { getAccessToken } from 'src/util/auth';

function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default {
  setup() {
    const $q = useQuasar();

    const folder_current = ref('');
    const folder_loading = ref(false);
    const folder_rows = ref([]);
    const folder_columns = [
      {
        label: 'Type',
        name: 'type',
        required: true,
        align: 'left',
        field: 'is_dir',
        style: 'width: 25px',
      },
      {
        label: 'Name',
        name: 'name',
        required: true,
        align: 'left',
        field: 'name',
      },
      {
        label: 'Path',
        name: 'filepath',
        required: true,
        align: 'left',
        field: 'filepath',
      },
      {
        label: 'Size',
        name: 'size',
        required: true,
        align: 'left',
        field: 'size',
        format: (val) => formatBytes(val, 0),
      },
    ];
    const selected = ref([]);
    const filter = ref('');

    const dialog_create_new_folder = ref(false);
    const new_folder_name = ref('');
    const confirm_delete = ref(false);

    const dialog_upload_files = ref(false);

    const pagination = ref({
      rowsPerPage: 0, // force display all so virtual scrolling works best
    });

    const trimSlashes = (str) =>
      str
        .split('/')
        .filter((v) => v !== '')
        .join('/');
    const breadcrumbs = computed(() => {
      if (!folder_current.value) return []; // return empty array if no value.

      let breadcrumbs = trimSlashes(folder_current.value).split('/');
      return breadcrumbs;
    });

    const onNameClick = (row) => {
      if (row.is_dir) {
        folder_current.value = row.filepath;
      } else {
        openURL(`/api/admin/files/file/${row.filepath}`);
      }
    };

    const onBreadcrumbClick = (navigate_to_level = -1) => {
      // level=-1->root folder, >=0 subfolders
      folder_current.value = breadcrumbs.value.slice(0, navigate_to_level + 1).join('/');
    };

    async function getFolderContent(folder = '') {
      folder_loading.value = true;
      selected.value = [];

      try {
        let response = await _fetch(`/api/admin/files/list/${folder}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });

        let json = await response.json();

        if (response.ok) {
          // if HTTP-status is 200-299
          // get the response body (the method explained below)
          folder_rows.value = json;
        } else {
          console.error(json);
          throw `Error ${response.status} getting listing. Please check logs.`;
        }
      } catch (error) {
        console.error(error);
        $q.notify({
          message: String(error),
          caption: 'Request Error!',
          color: 'negative',
        });
      }

      folder_loading.value = false;
    }

    async function getZip(selected = []) {
      try {
        let response = await _fetch('/api/admin/files/zip', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selected),
        });

        if (response.ok) {
          // if HTTP-status is 200-299
          // get the response body (the method explained below)
          $q.notify({
            message: 'Downloading ZIP file',
            caption: 'Files',
            type: 'positive',
          });

          let blob = await response.blob();
          var file = window.URL.createObjectURL(blob);
          window.location.assign(file);
        } else {
          let json = await response.json();
          console.error(json);
          throw `Error ${response.status} creating zip. Please check logs.`;
        }
      } catch (error) {
        console.error(error);
        $q.notify({
          message: String(error),
          caption: 'Request Error!',
          color: 'negative',
        });
      }
    }

    async function deleteItems(selected = []) {
      try {
        let response = await _fetch('/api/admin/files/delete', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(selected),
        });

        if (response.ok) {
          // if HTTP-status is 200-299
          // get the response body (the method explained below)
          $q.notify({
            message: 'Selected items deleted.',
            caption: 'Files',
            type: 'positive',
          });
        } else {
          console.error(response);
          throw `Error ${response.status} deleting items. Please check logs.`;
        }
      } catch (error) {
        console.error(error);
        $q.notify({
          message: String(error),
          caption: 'Request Error!',
          color: 'negative',
        });
      }

      // reload in every case (also resets selected items, which is good in delete process)
      getFolderContent(folder_current.value);
    }

    async function createNewFolder(folder_name) {
      // https://javascript.info/fetch

      let newfolder_fullpath = folder_name;

      if (folder_current.value) {
        // add current folder if not empty (avoid to appear like an absolute path)
        newfolder_fullpath = folder_current.value + '/' + newfolder_fullpath;
      }

      console.log(newfolder_fullpath);
      try {
        let response = await _fetch('/api/admin/files/folder/new', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newfolder_fullpath),
        });

        let json = await response.json();

        if (response.ok) {
          // if HTTP-status is 200-299
          // get the response body (the method explained below)
          $q.notify({
            message: `Folder "${folder_name}" created.`,
            caption: 'Files',
            type: 'positive',
          });

          // reload
          getFolderContent(folder_current.value);
        } else {
          console.error(json);
          throw `Error ${response.status} while creating folder. Please check logs.`;
        }
      } catch (error) {
        console.error(error);
        $q.notify({
          message: String(error),
          caption: 'Request Error!',
          color: 'negative',
        });
      }
    }

    onMounted(() => {
      getFolderContent();
    });

    return {
      breadcrumbs,

      folder_current,
      folder_columns,
      folder_rows,
      folder_loading,
      pagination,
      selected,
      filter,

      dialog_create_new_folder,
      new_folder_name,

      confirm_delete,

      dialog_upload_files,

      onNameClick,
      onBreadcrumbClick,
      getFolderContent,
      getZip,
      deleteItems,
      createNewFolder,
      getAccessToken,
    };
  },
  // name: 'PageName',
  watch: {
    // whenever folder changes, load new content.
    folder_current(newFolder) {
      // console.log("change directory: ", newFolder);
      this.getFolderContent(newFolder);
    },
  },
};
</script>
