<template>
  <q-page padding>
    <div class="q-pa-md">

      <q-breadcrumbs gutter="sm" style="cursor: pointer;">
        <q-breadcrumbs-el label="Working Directory" icon="home" @click="onBreadcrumbClick(-1);" />
        <q-breadcrumbs-el v-for="( value, key ) in  breadcrumbs " v-bind:key="key" @click="onBreadcrumbClick(key);">
          {{ value }}
        </q-breadcrumbs-el>
      </q-breadcrumbs>


      <q-dialog v-model="dialog_create_new_folder">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">New folder name</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-input dense v-model="new_folder_name" autofocus
              @keyup.enter="createNewFolder(new_folder_name); dialog_create_new_folder = false" />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup />
            <q-btn flat label="Create folder" v-close-popup @click="createNewFolder(new_folder_name)" />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <q-dialog v-model="dialog_upload_files">
        <q-card style="min-width: 350px">
          <q-card-section>
            <div class="text-h6">Upload files to current folder</div>
          </q-card-section>

          <q-card-section class="q-pt-none">
            <q-uploader label="Upload Files" url="/admin/files/file/upload"
              :form-fields="[{ name: 'upload_target_folder', value: folder_current }]" field-name="uploaded_files" batch
              multiple @finish="getFolderContent(folder_current)" @uploaded="dialog_upload_files = false;" />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="Cancel" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>


      <q-table class="full-height" flat bordered title="File Browser" :pagination="pagination" :rows="folder_rows"
        :filter="filter" :columns="folder_columns" color="primary" row-key="filepath" dense :loading="folder_loading"
        selection="multiple" v-model:selected="selected" virtual-scroll :rows-per-page-options="[0]">

        <template v-slot:body-cell-type="props">
          <q-td :props="props">
            <q-icon v-if="props.value" name="folder" />
            <q-icon v-else name="description" />
          </q-td>
        </template>


        <template v-slot:body-cell-name="props">
          <q-td :props="props" style="cursor: pointer;">
            <div @click="onNameClick(props.row)">{{ props.value }}</div>
          </q-td>
        </template>

        <template v-slot:top-left>
          <div>
            <q-btn :disable="folder_loading" @click="dialog_create_new_folder = true" label="New Folder" />
            <q-btn class="q-ml-sm" :disable="folder_loading" @click="dialog_upload_files = true;" label="Upload file" />
            <q-btn class="q-ml-sm" :disable="selected.length == 0" @click="getZip(selected)" label="download zip" />
            <q-btn class="q-ml-sm" color="negative" :disable="selected.length == 0" @click="deleteItems(selected)"
              label="delete selected" />

          </div>
        </template>

        <template v-slot:top-right>
          <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
        </template>

      </q-table>
    </div>


  </q-page>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { api } from "boot/axios";
import { openURL, useQuasar } from "quasar";

function formatBytes (bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}


export default {
  // name: 'PageName',
  watch: {
    // whenever folder changes, load new content.
    folder_current (newFolder, oldFolder) {
      // console.log("change directory: ", newFolder);
      this.getFolderContent(newFolder);
    }
  },

  setup () {
    const $q = useQuasar();

    const folder_current = ref("");
    const folder_loading = ref(false);
    const folder_rows = ref([])
    const folder_columns = [
      { label: 'Type', name: 'type', required: true, align: 'left', field: 'is_dir', style: 'width: 25px', },
      { label: 'Name', name: 'name', required: true, align: 'left', field: 'name' },
      { label: 'Size', name: 'size', required: true, align: 'left', field: 'size', format: val => formatBytes(val, 0) },
    ]
    const selected = ref([]);
    const filter = ref('');

    const dialog_create_new_folder = ref(false);
    const new_folder_name = ref("")

    const dialog_upload_files = ref(false);

    const pagination = ref({
      rowsPerPage: 0 // force display all so virtual scrolling works best
    })

    const trimSlashes = str => str.split('/').filter(v => v !== '').join('/');
    const breadcrumbs = computed(() => {
      if (!folder_current.value)
        return []; // return empty array if no value.

      let breadcrumbs = trimSlashes(folder_current.value).split("/");
      return breadcrumbs
    });

    const onNameClick = (row) => {
      if (row.is_dir) {
        folder_current.value = row.filepath;
      } else {
        openURL(`/admin/files/file/${row.filepath}`)
      }
    }

    const onBreadcrumbClick = (navigate_to_level = -1) => {
      // level=-1->root folder, >=0 subfolders
      folder_current.value = breadcrumbs.value.slice(0, navigate_to_level + 1).join("/");
    }

    async function getFolderContent (folder = "") {
      folder_loading.value = true;
      selected.value = [];

      let response = await fetch(`/admin/files/list/${folder}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", }
      });

      let json = await response.json();

      if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        folder_rows.value = json;
      } else {
        console.error(json)

        $q.notify({
          message: `Error ${response.status} getting listing. Please check logs.`,
          caption: "Files",
          type: "negative"
        });
      }

      folder_loading.value = false;
    };

    async function getZip (selected = []) {
      let response = await fetch(`/admin/files/zip`, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(selected),
      });


      if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        $q.notify({
          message: `Downloading ZIP file`,
          caption: "Files",
          type: "positive"
        });

        let blob = await response.blob();
        var file = window.URL.createObjectURL(blob);
        window.location.assign(file);


      } else {
        let json = await response.json();

        console.error(json)
        $q.notify({
          message: `Error ${response.status} creating zip. Please check logs.`,
          caption: "Files",
          type: "negative"
        });
      }

    };

    async function deleteItems (selected = []) {

      let response = await fetch(`/admin/files/delete`, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(selected),
      });



      if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        $q.notify({
          message: `Selected items deleted.`,
          caption: "Files",
          type: "positive"
        });

      } else {
        let json = await response.json();
        console.error(json)
        $q.notify({
          message: `Error ${response.status} deleting items. Please check logs.`,
          caption: "Files",
          type: "negative"
        });
      }

      // reload in every case (also resets selected items, which is good in delete process)
      getFolderContent(folder_current.value);


    };


    async function createNewFolder (folder_name) {
      // https://javascript.info/fetch

      let newfolder_fullpath = folder_name

      if (folder_current.value) {
        // add current folder if not empty (avoid to appear like an absolute path)
        newfolder_fullpath = folder_current.value + "/" + newfolder_fullpath;
      }

      console.log(newfolder_fullpath);

      let response = await fetch(`/admin/files/folder/new`, {
        method: "POST",
        headers: { "Content-Type": "application/json", },
        body: JSON.stringify(newfolder_fullpath),

      });

      let json = await response.json();

      if (response.ok) { // if HTTP-status is 200-299
        // get the response body (the method explained below)
        $q.notify({
          message: `Folder "${folder_name}" created.`,
          caption: "Files",
          type: "positive"
        });

        // reload
        getFolderContent(folder_current.value);

      } else {
        console.error(json)
        $q.notify({
          message: `Error ${response.status} while creating folder. Please check logs.`,
          caption: "Files",
          type: "negative"
        });
      }
    };


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

      dialog_upload_files,

      onNameClick,
      onBreadcrumbClick,
      getFolderContent,
      getZip,
      deleteItems,
      createNewFolder,

    };
  },
};
</script>
