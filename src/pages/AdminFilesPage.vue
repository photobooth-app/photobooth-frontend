<template>
  <q-page padding>
    !Work In Progress!
    <div class="q-pa-md">
      <q-breadcrumbs gutter="sm" style="cursor: pointer;">
        <q-breadcrumbs-el label="Working Directory" icon="home" @click="onBreadcrumbClick();" />
        <q-breadcrumbs-el v-for="(value, key) in breadcrumbs" v-bind:key="key">
          {{ value }}
        </q-breadcrumbs-el>
      </q-breadcrumbs>

      <q-table flat bordered title="File Browser" :pagination="pagination" :rows="folder_rows" :filter="filter"
        :columns="folder_columns" color="primary" row-key="filepath" dense :loading="folder_loading" selection="multiple"
        v-model:selected="selected" virtual-scroll style="height: 500px" :rows-per-page-options="[0]">

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
            <q-btn color="primary" :disable="folder_loading" label="New Folder" />
            <q-btn class="q-ml-sm" color="primary" :disable="folder_loading" label="Upload file" />
            <q-btn class="q-ml-sm" :disable="selected.length == 0" label="download zip" />
            <q-btn class="q-ml-sm" :disable="selected.length == 0" label="delete files" />
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

    <div class="q-mt-md">
      Selected: {{ JSON.stringify(selected) }}
    </div>

  </q-page>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { api } from "boot/axios";
import { openURL } from "quasar";

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
    folder (newFolder, oldFolder) {
      this.getFolderContent(newFolder);
    }
  },

  setup () {
    const folder = ref("");
    const folder_loading = ref(false);
    const folder_rows = ref([])
    const folder_columns = [
      { label: 'Type', name: 'type', required: true, align: 'left', field: 'is_dir', style: 'width: 25px', },
      { label: 'Name', name: 'name', required: true, align: 'left', field: 'name' },
      { label: 'Size', name: 'size', required: true, align: 'left', field: 'size', format: val => formatBytes(val, 0) },
    ]
    const selected = ref([]);
    const filter = ref('');

    const pagination = ref({
      rowsPerPage: 0 // force display all so virtual scrolling works best
    })


    const breadcrumbs = computed(() => {
      let breadcrumbs = folder.value.split("/");
      return breadcrumbs
    });

    const onNameClick = (row) => {
      if (row.is_dir) {
        folder.value = row.filepath;
      } else {
        openURL(`/admin/files/file/${row.filepath}`)
      }
    }

    const onBreadcrumbClick = (evt) => {
      console.log(evt);

      folder.value = "";
    }

    const getFolderContent = (subfolder = "") => {
      folder_loading.value = true;
      selected.value = [];

      api
        .get(`/admin/files/list/${subfolder}`)
        .then(async (response) => {
          folder_rows.value = response.data;
        })
        .catch((response) => {
          console.log(response);
          console.log("request error! check logs");
        }).finally(() => {
          folder_loading.value = false
        });
    };


    onMounted(() => {
      getFolderContent();
    });

    return {
      folder,
      folder_columns,
      folder_rows,
      folder_loading,
      pagination,
      selected,
      filter,
      onNameClick,
      onBreadcrumbClick,
      getFolderContent,
      breadcrumbs,
    };
  },
};
</script>
