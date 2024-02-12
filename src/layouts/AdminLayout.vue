<template>
  <q-layout view="hHh lpR fFf">
    <q-header elevated class="bg-secondary text-white">
      <q-toolbar class="q-pa-none">
        <q-tabs mobile-arrows shrink>
          <q-route-tab class="bg-primary" to="/" icon="arrow_back_ios_new" :label="$t('BTN_LABEL_BACK')" />
          <q-route-tab to="/admin" icon="dashboard" :label="$t('TAB_LABEL_DASHBOARD')" />

          <q-route-tab to="/admin/gallery" icon="photo_library" :label="$t('TAB_LABEL_GALLERY')" />
          <!-- name based so even if children are active, the config tab is highlighted -->
          <q-route-tab :to="{ name: 'config' }" icon="settings" :label="$t('TAB_LABEL_CONFIG')" />
          <q-route-tab to="/admin/files" icon="folder_shared" :label="$t('TAB_LABEL_FILES')" />
          <q-route-tab to="/admin/status" icon="insights" :label="$t('TAB_LABEL_STATUS')" />

          <!--<q-route-tab to="/admin/playground" icon="quiz" label="Playground" />-->
          <q-route-tab to="/admin/help" icon="help" :label="$t('TAB_LABEL_HELP')" />
        </q-tabs>

        <q-space />

        <q-toolbar-title
          ><span>{{ $t("TITLE_ADMIN_CENTER") }}</span></q-toolbar-title
        >

        <q-space />

        <a href="https://photobooth-app.org/" target="_new" class="q-mr-lg"
          ><img src="icons/logo-notext-white-transparent.png" style="max-height: 40px"
        /></a>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { ref } from "vue";

export default {
  // name: 'LayoutName',
  setup() {},
};
</script>
